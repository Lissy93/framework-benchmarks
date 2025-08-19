#!/usr/bin/env python3
from __future__ import annotations
import json, os, re
from datetime import datetime, timezone
from pathlib import Path
import click
from rich.console import Console

C = Console()

# ---------- tiny helpers ----------

def find_root() -> Path:
    """find project root by locating frameworks.json upwards"""
    p = Path(__file__).resolve()
    for up in [p.parent, *p.parents]:
        if (up / "frameworks.json").exists(): return up
    return p.parents[2]

def read_json(p: Path) -> dict | list:
    """read JSON file"""
    with open(p, "r", encoding="utf-8") as f: return json.load(f)

def ensure_files(*paths: Path) -> None:
    """ensure files exist or raise"""
    missing = [str(p) for p in paths if not p.exists()]
    if missing: raise FileNotFoundError("Missing required file(s): " + ", ".join(missing))

def parse_iso(s: str | None) -> datetime | None:
    """parse ISO8601 into aware datetime"""
    if not s: return None
    try: return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception: return None

def time_ago(dt: datetime | None, now: datetime | None = None) -> str:
    """humanize time delta like '2 days ago'"""
    if not dt: return "—"
    now = now or datetime.now(timezone.utc)
    sec = int((now - dt).total_seconds())
    if sec < 0: return "just now"
    for unit, size in [("year", 365*24*3600), ("month", 30*24*3600),
                       ("week", 7*24*3600), ("day", 24*3600), ("hour", 3600),
                       ("minute", 60)]:
        if sec >= size:
            n = sec // size
            return f"{n} {unit}{'' if n==1 else 's'} ago"
    return "just now"

def years_since(dt: datetime | None, now: datetime | None = None) -> str:
    """years since date with 1dp"""
    if not dt: return "—"
    now = now or datetime.now(timezone.utc)
    years = (now - dt).days / 365.25
    return f"{years:.1f}y"

def fmt_num(n: int | float | None) -> str:
  """format number with k/M/B suffix"""
  if n is None: return "—"
  n = float(n)
  for s, v in [("B", 1e9), ("M", 1e6), ("k", 1e3)]:
    if n >= v:
      val = f"{n/v:.1f}".rstrip("0").rstrip(".")
      return f"{val}{s}"
  return str(int(n)) if n.is_integer() else f"{n:.1f}".rstrip("0").rstrip(".")

def fmt_size_mb(mb: float | None) -> str:
    """format MB with 1dp"""
    return "—" if mb is None else f"{mb:.1f} MB"

def md_first_cell(name: str, logo: str | None, gh: str | None, emoji: str | None) -> str:
    """build first cell with small logo + linked name to GitHub"""
    if not gh: gh = "#"
    img = f'<a href="{gh}"><img src="{logo}" alt="{emoji}" width="16"></a>' if logo else ""
    return f'{img} [**{name}**]({gh})'

def build_table(frws: list[dict], stats_by_id: dict[str, dict]) -> str:
    """build markdown table from frameworks + stats"""
    lines = [
        "| Framework | Stars | Downloads | Size | Contributors | Age | Last updated | License |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for f in frws:
        if f.get("id") == "vanilla": continue
        fid, name = f.get("id"), f.get("displayName") or f.get("name") or ""
        meta = f.get("meta") or {}
        emoji = meta.get("emoji") or ""
        gh, logo = meta.get("github"), meta.get("logo")
        s = stats_by_id.get(fid, {}) if fid else {}
        lic = (s.get("license") or "Unknown")
        lic = "Unknown" if str(lic).upper() == "NOASSERTION" else lic
        first = parse_iso(s.get("first_commit")); last = parse_iso(s.get("last_commit"))
        row = [
            md_first_cell(name, logo, gh, emoji),
            fmt_num(s.get("stars")),
            fmt_num(s.get("downloads")),
            fmt_size_mb(s.get("size_mb")),
            fmt_num(s.get("contributors")),
            years_since(first),
            time_ago(last),
            str(lic),
        ]
        lines.append("| " + " | ".join(row) + " |")
    return "\n".join(lines)

def build_logo_links(frws: list[dict], base_url: str = "https://framework-benchmarks.as93.net") -> str:
    """generate framework logo links block"""
    links = [f'<a href="{base_url}/{f["id"]}/"><img width="48" src="{f.get("meta",{}).get("logo","")}" /></a>' 
             for f in frws if f.get("id") and f.get("meta",{}).get("logo")]
    note = "<br><sub>Click a framework to view info, test/lint/build/etc statuses, and to preview the demo app</sub>"
    return f'<p align="center">\n    {chr(10).join(f"    {link}" for link in links)}\n{note}</p>'

def replace_between(text: str, start: str, end: str, block: str) -> str:
    """replace text between markers (markers preserved)"""
    pattern = re.compile(rf"({re.escape(start)})(.*)({re.escape(end)})", re.DOTALL)
    if not pattern.search(text): raise ValueError("Markers not found in README")
    return pattern.sub(rf"\1\n{block}\n\3", text)

# ---------- CLI ----------

@click.command()
@click.option("--readme", "readme_path", default=None, help="Path to README.md (default: project root README.md)")
def main(readme_path: str | None):
    """generate and insert framework stats table into README"""
    root = find_root()
    results_p = root / "results" / "framework-stats.json"
    frames_p = root / "frameworks.json"
    readme_p = Path(readme_path) if readme_path else (root / ".github/README.md")

    ensure_files(results_p, frames_p, readme_p)
    C.rule("[bold]Inserting framework stats[/bold]")

    data = read_json(results_p)
    items = data.get("items", []) if isinstance(data, dict) else []
    stats_by_id = {i.get("id"): i for i in items if isinstance(i, dict)}

    frws = read_json(frames_p).get("frameworks", [])
    table = build_table(frws, stats_by_id)
    logos = build_logo_links(frws)

    with open(readme_p, "r", encoding="utf-8") as f:
        readme_txt = f.read()

    new_txt = replace_between(
        readme_txt,
        "<!-- start_framework_stats -->",
        "<!-- end_framework_stats -->",
        table,
    )
    new_txt = replace_between(
        new_txt,
        "<!-- start_framework_list -->",
        "<!-- end_framework_list -->",
        logos,
    )

    with open(readme_p, "w", encoding="utf-8") as f:
        f.write(new_txt)

    C.print("[green]Updated:[/] ", readme_p)

if __name__ == "__main__":
    main()
