#!/usr/bin/env python3
from __future__ import annotations
import os, re, json, time
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import click, requests
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn

C = Console()
GH_TOK = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
HEAD = {"Accept":"application/vnd.github+json"}
if GH_TOK: HEAD["Authorization"]=f"Bearer {GH_TOK}"
SESS = requests.Session(); SESS.headers.update(HEAD)

def find_root() -> Path:
    """find project root by locating frameworks.json upwards"""
    p = Path(__file__).resolve()
    for up in [p.parent, *p.parents]:
        f = up / "frameworks.json"
        if f.exists(): return up
    return p.parents[2]

def read_frameworks(root: Path) -> list[dict]:
    """load frameworks.json"""
    with open(root / "frameworks.json","r",encoding="utf-8") as f:
        return (json.load(f) or {}).get("frameworks",[])

def repo_from_url(u: str|None) -> tuple[str,str]|None:
    """parse owner/repo from GitHub URL"""
    if not u: return None
    m = re.search(r"github\.com[:/]+([^/]+)/([^/#?]+)", u)
    return (m.group(1), m.group(2).removesuffix(".git")) if m else None

def get(url: str, params: dict|None=None) -> requests.Response|None:
    """GET with retries and brief rate-limit backoff"""
    for _ in range(3):
        try:
            r = SESS.get(url, params=params, timeout=30)
            if r.status_code==403 and "rate limit" in r.text.lower():
                reset=r.headers.get("x-ratelimit-reset"); wait=max(0,int(reset)-int(time.time())) if reset else 30
                C.print(f"[yellow]Rate limited. Sleeping {min(wait,60)}s[/]"); time.sleep(min(wait,60)); continue
            return r if r.ok else (C.print(f"[red]HTTP {r.status_code}[/] {url}") or None)
        except requests.RequestException as e:
            C.print(f"[red]Request error:[/] {e}"); time.sleep(1)
    return None

def gh_api(path: str, params: dict|None=None) -> dict|list|None:
    """call GitHub API and return JSON"""
    r = get(f"https://api.github.com{path}", params)
    if not r: return None
    return r.json() if "application/json" in r.headers.get("content-type","") else None

def last_page(link: str|None) -> int:
    """extract last page number from Link header"""
    if not link: return 1
    m = re.search(r'<([^>]+)>;\s*rel="last"', link)
    if not m: return 1
    return int(parse_qs(urlparse(m.group(1)).query).get("page",["1"])[0])

def kb_to_mb(kb: int|None) -> float|None:
    """convert KB to MB (1dp)"""
    return None if kb is None else round(kb/1024,1)

# ---------- data fetchers ----------

def fetch_repo(owner: str, repo: str) -> dict|None:
    """get core repo info (incl. watchers/subscribers & open issues/PRs)"""
    d = gh_api(f"/repos/{owner}/{repo}")
    if not isinstance(d,dict): return None
    lic = (d.get("license") or {}).get("spdx_id") or (d.get("license") or {}).get("name")
    return {
        "stars": d.get("stargazers_count"),
        "size_mb": kb_to_mb(d.get("size")),
        "license": lic,
        "default_branch": d.get("default_branch") or "main",
        "repo_created": d.get("created_at"),
        "repo_pushed": d.get("pushed_at"),
        "subscribers": d.get("subscribers_count"),
        "open_issues_prs": d.get("open_issues_count"),
        "forks": d.get("forks_count"),
    }

def fetch_release_downloads(owner: str, repo: str) -> tuple[int|None,int|None]:
    """sum GitHub release asset downloads and count releases"""
    rels = gh_api(f"/repos/{owner}/{repo}/releases", {"per_page":100})
    if not isinstance(rels,list): return None, None
    return sum(sum(a.get("download_count",0) for a in r.get("assets",[])) for r in rels), len(rels)

def fetch_npm_downloads(pkg: str) -> int|None:
    """get NPM last-month downloads"""
    r = get(f"https://api.npmjs.org/downloads/point/last-month/{pkg}")
    try: return (r.json() or {}).get("downloads") if r else None
    except Exception: return None

def fetch_npm_meta(pkg: str) -> tuple[str|None,str|None]:
    """get NPM latest version and publish date"""
    r = get(f"https://registry.npmjs.org/{pkg}")
    if not r: return None, None
    try:
        j=r.json(); ver=(j.get("dist-tags") or {}).get("latest")
        t=(j.get("time") or {}).get(ver) if ver else None
        return ver, t
    except Exception:
        return None, None

def fetch_contributors(owner: str, repo: str) -> dict|None:
    """get contributors and top author share"""
    items, page = [], 1
    while True:
        r = get(f"https://api.github.com/repos/{owner}/{repo}/contributors",
                {"per_page":100,"anon":"1","page":page})
        if not r: break
        arr = r.json() if "json" in r.headers.get("content-type","") else []
        if not isinstance(arr,list) or not arr: break
        items += arr
        if page >= last_page(r.headers.get("Link")): break
        page += 1
    if not items: return None
    commits = [int(c.get("contributions",0)) for c in items if isinstance(c,dict)]
    total = sum(commits) or 0; top = max(commits) if commits else 0
    return {"contributors": len(items), "commits": total, "top_author_pct": round((top/total)*100,1) if total else None}

def fetch_first_last_commit(owner: str, repo: str, branch: str) -> tuple[str|None,str|None]:
    """get first and last commit dates on branch"""
    r1 = get(f"https://api.github.com/repos/{owner}/{repo}/commits", {"sha":branch,"per_page":1})
    last = r1.json()[0].get("commit",{}).get("author",{}).get("date") if (r1 and r1.ok and isinstance(r1.json(),list) and r1.json()) else None
    lp = last_page(r1.headers.get("Link") if r1 else None)
    rN = get(f"https://api.github.com/repos/{owner}/{repo}/commits", {"sha":branch,"per_page":1,"page":lp})
    first = rN.json()[0].get("commit",{}).get("author",{}).get("date") if (rN and rN.ok and isinstance(rN.json(),list) and rN.json()) else None
    return first, last

def downloads_for(fr: dict, repo_pair: tuple[str,str]|None) -> tuple[int|None,int|None,str|None,str|None]:
    """choose best downloads source + npm meta"""
    pkg = (fr.get("meta") or {}).get("npmPackage")
    npm_d = fetch_npm_downloads(pkg) if pkg else None
    npm_ver, npm_ver_date = (fetch_npm_meta(pkg) if pkg else (None,None))
    if npm_d is not None: return npm_d, None, npm_ver, npm_ver_date
    if repo_pair:
        gh_d, rels = fetch_release_downloads(*repo_pair)
        return gh_d, rels, npm_ver, npm_ver_date
    return None, None, npm_ver, npm_ver_date

def collect_for(fr: dict, prog: Progress|None=None, task_id: int|None=None) -> dict:
    """collect all stats for one framework (with optional progress updates)"""
    def step(msg: str): 
        if prog and task_id is not None: prog.update(task_id, description=msg); prog.advance(task_id, 1)
    meta = fr.get("meta") or {}; rep = repo_from_url(meta.get("github"))
    if not rep:
        step(f"{fr.get('name','?')}: no repo")
        return {"id": fr.get("id"), "name": fr.get("name")}
    o, r = rep
    info = fetch_repo(o,r) or {}; step(f"{fr.get('name')}: repo")
    dls, rels, npm_ver, npm_ver_date = downloads_for(fr, rep); step(f"{fr.get('name')}: downloads")
    contrib = fetch_contributors(o,r) or {}; step(f"{fr.get('name')}: contributors")
    first, last = fetch_first_last_commit(o,r, info.get("default_branch") or "main"); step(f"{fr.get('name')}: commits")
    return {
        "id": fr.get("id"), "name": fr.get("name"), "repo": f"{o}/{r}",
        "stars": info.get("stars"), "downloads": dls, "size_mb": info.get("size_mb"),
        "license": info.get("license"), "contributors": contrib.get("contributors"),
        "top_author_pct": contrib.get("top_author_pct"), "first_commit": first, "last_commit": last,
        "forks": info.get("forks"), "subscribers": info.get("subscribers"),
        "open_issues_prs": info.get("open_issues_prs"), "release_count": rels,
        "npm_latest": npm_ver, "npm_latest_date": npm_ver_date
    }

# ---------- CLI ----------

@click.command()
@click.option("-o","--output","out_path", default=None, help="Output JSON path (default: ./results/framework-stats.json)")
def main(out_path: str|None):

    """CLI entrypoint"""
    root = find_root()
    try:
        fw = read_frameworks(root)
    except Exception as e:
        C.print(f"[red]Failed to read frameworks.json:[/] {e}"); raise SystemExit(1)
    if not fw: C.print("[yellow]No frameworks found[/]"); raise SystemExit(0)
    if not GH_TOK:
        C.print(
            "[yellow]⚠️ No GITHUB_TOKEN set; using unauthenticated requests.\n"
            "You might hit rate limits or get a 403 from some requests, "
            "possibly resulting in incomplete or inaccurate results[/]"
        )
    C.rule("[bold]Fetching framework stats[/bold]")

    rows=[]
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("{task.completed}/{task.total}"),
        TimeElapsedColumn(),
        transient=True,
    ) as prog:
        for f in fw:
            tid = prog.add_task(f"{f.get('name','(unknown)')}", total=4)
            try:
                rows.append(collect_for(f, prog, tid))
            except Exception as e:
                C.print(f"[red]Error processing {f.get('id')}:[/] {e}")
                prog.update(tid, description=f"{f.get('name')}: error"); prog.stop_task(tid)

    out = Path(out_path) if out_path else (root / "results" / "framework-stats.json")
    try:
        out.parent.mkdir(parents=True, exist_ok=True)
        with open(out,"w",encoding="utf-8") as f:
            json.dump({"generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "items": rows}, f, indent=2)
        C.print(f"[green]Saved:[/] {out}")
    except Exception as e:
        C.print(f"[red]Failed to write output:[/] {e}")

    t = Table(title="Framework Stats", show_lines=False)
    for col in ("ID","Repo","Stars","DLs","MB","License","Contribs","#1 %","Open","Subs","NPM v","First Commit","Last Commit"):
        t.add_column(col, overflow="fold")
    for r in rows:
        t.add_row(
            str(r.get("id") or ""),
            str(r.get("repo") or ""),
            str(r.get("stars") or "—"),
            str(r.get("downloads") if r.get("downloads") is not None else "—"),
            str(r.get("size_mb") or "—"),
            str(r.get("license") or "—"),
            str(r.get("contributors") or "—"),
            (f"{r.get('top_author_pct')}%" if r.get("top_author_pct") is not None else "—"),
            str(r.get("open_issues_prs") if r.get("open_issues_prs") is not None else "—"),
            str(r.get("subscribers") if r.get("subscribers") is not None else "—"),
            str(r.get("npm_latest") or "—"),
            str(r.get("first_commit") or "—"),
            str(r.get("last_commit") or "—"),
        )
    C.print(t)

if __name__ == "__main__":
    main()
