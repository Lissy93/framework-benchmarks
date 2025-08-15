#!/usr/bin/env python3
"""
Code Complexity Scanner
=======================
This is a very rudimentary script to calculate approximate code quality based on
SLOC, cyclomatic complexity and halstead metrics to build a maintainability index

Core Definitions:
- SLOC (source lines of code):
  - Physical: Non-empty lines in the files
  - Logical: Approximate count of executable statements
- Cyclomatic Complexity:
  - Number of independent paths through the code (aka decision points + 1)
- Halstead Metrics:
  - length: Total occurrences of operators and operands.
  - vocab: Unique operators + unique operands
  - volume: length x log2(vocab), measures implementation size.
- Maintainability Index (MI, 0-100):
  - Scaled 0-100 based on halstead volume, cyclomatic complexity and logical SLOC

How it works:
- Recursively scans source files in within --dir for supported extensions
- Extracts any <script> content for mixed files (e.g. vue, svelte, .html, etc).
- Counts physical/logical lines, decisions, operators/operands.
- Calculates Halstead metrics & Maintainability Index
- Builds final results, totals and averages, and
  - Includes per-file metrics when --per-file flag set
  - Writes results to file, when --output-file is set

Usage
  python measure-complexity.py
    --dir [app-directory-to-analyse]
    --output-file [path-to-json-to-save-results]
    --per-file # if set, will include breakdown for each file

Licensed under MIT, © Alicia Sykes <https://github.com/lissy93> 2025
"""

import os, re, sys, math, json
from pathlib import Path

# File extensions to include
EXTS = {
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".gjs", ".gts",
    ".vue", ".svelte", ".astro", ".html", ".htm", ".mdx"
}
# Directories to exclude
EXCLUDES = {"node_modules", "dist", "target", "__tests__", "test", "spec", "mock"}

# Man docs / usage instructions (if --help is specified, or params are missing)
HELP_TEXT = """Usage:
  python measure-complexity.py --dir <directory> [options]

Description:
  Calculates code complexity and readability based on SLOC, cyclomatic complexity
  Halstead metrics, and generates a final maintainability index.

Options:
  --dir <path>        Directory to scan.
  --per-file          Show per-file metrics in output.
  --output-file <path> Write results to specified JSON file instead of printing full JSON.
  --help              Show this help message.
"""

# Cancel and show help if flags not set
if len(sys.argv) == 1 or "--help" in sys.argv:
    print(HELP_TEXT)
    sys.exit(0)

# Parse the CLI input flags
try:
    DIR_INDEX = sys.argv.index("--dir") + 1
    DIR = Path(sys.argv[DIR_INDEX]).resolve()
except (ValueError, IndexError):
    print("❌ Missing required --dir argument.\n")
    print(HELP_TEXT)
    sys.exit(1)

SHOW_PER_FILE = "--per-file" in sys.argv

OUTPUT_FILE = None
if "--output-file" in sys.argv:
    try:
        OUTPUT_FILE = Path(sys.argv[sys.argv.index("--output-file") + 1]).resolve()
    except (IndexError, ValueError):
        print("❌ Missing path after --output-file.")
        sys.exit(1)

# --- File collection ---
def get_files(d: Path):
    """Yield matching source files recursively."""
    for root, dirs, files in os.walk(d):
        if any(ex in root.lower() for ex in EXCLUDES):
            continue
        for f in files:
            if Path(f).suffix.lower() in EXTS:
                yield Path(root) / f

# --- File content processing ---
def extract_script(src: str, ext: str) -> str:
    """Extract <script> content for mixed template/component files."""
    ext = ext.lower()
    if ext in {".html", ".htm", ".vue", ".svelte", ".astro"}:
        parts = re.findall(r"<script[^>]*>(.*?)</script>", src, re.S | re.I)
        return "\n".join(parts) if parts else ""
    if ext == ".mdx":
        return re.sub(r"```[\s\S]*?```", "", src)
    return src

def safe_read(file: Path) -> str:
    """Read file content safely, ignoring bad encodings."""
    try:
        return file.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

# --- Analysis ---
def analyze(file: Path, base_dir: Path):
    """Analyze a single file for complexity metrics."""
    raw_src = safe_read(file)
    src = extract_script(raw_src, file.suffix)
    if not src.strip():
        return None

    # Count physical lines (including markup)
    sloc_phys = sum(1 for line in raw_src.splitlines() if line.strip())

    # Count logical lines (approx.)
    sloc_log = len(re.findall(r"[;{}]\s*$", src, re.M))

    # Cyclomatic complexity: decision points + 1
    cyclomatic = len(re.findall(r"\b(if|for|while|case|catch)\b|\? *:|&&|\|\|", src)) + 1

    # Halstead approximation
    ops = re.findall(
        r"\b(if|else|for|while|case|break|function|return|throw|new|delete|typeof|in|instanceof)\b"
        r"|[+\-*/%=&|^!<>?:]", src
    )
    opr = re.findall(r"\b[A-Za-z_]\w*\b", src)
    uops, uopr = len(set(map(str.strip, ops))), len(set(map(str.strip, opr)))
    to_ops, to_opr = len(ops), len(opr)
    h_len, h_vocab = to_ops + to_opr, uops + uopr
    h_vol = h_len * math.log2(max(h_vocab, 2))

    # Maintainability Index
    try:
        mi = (
            171
            - 5.2 * math.log(max(h_vol, 1))
            - 0.23 * cyclomatic
            - 16.2 * math.log(max(sloc_log, 1))
        ) * 100 / 171
    except ValueError:
        mi = 0
    mi = max(0, min(100, mi))

    return {
        "file": str(file.relative_to(base_dir)),
        "sloc": {"physical": sloc_phys, "logical": sloc_log},
        "cyclomatic": cyclomatic,
        "halstead": {
            "length": h_len,
            "vocab": h_vocab,
            "volume": round(h_vol, 2)
        },
        "maintainability": round(mi, 2)
    }

# --- Run ---
files = list(get_files(DIR))
results = [r for f in files if (r := analyze(f, DIR))]

total_files = len(results)
if total_files > 0:
    avg_phys = round(sum(r["sloc"]["physical"] for r in results) / total_files, 2)
    avg_log = round(sum(r["sloc"]["logical"] for r in results) / total_files, 2)
    avg_cyc = round(sum(r["cyclomatic"] for r in results) / total_files, 2)
    avg_maint = round(sum(r["maintainability"] for r in results) / total_files, 2)
else:
    avg_phys = avg_log = avg_cyc = avg_maint = 0

summary = {
    "totalFiles": total_files,
    "total": {
        "slocPhysical": sum(r["sloc"]["physical"] for r in results),
        "slocLogical": sum(r["sloc"]["logical"] for r in results),
        "cyclomatic": sum(r["cyclomatic"] for r in results),
        "maintainability": round(sum(r["maintainability"] for r in results), 2)
    },
    "average": {
        "slocPhysical": avg_phys,
        "slocLogical": avg_log,
        "cyclomatic": avg_cyc,
        "maintainability": avg_maint
    }
}

output = {"summary": summary}
if SHOW_PER_FILE:
    output["files"] = results

# --- Output ---
if OUTPUT_FILE:
    try:
        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2)
        print(f"✅ Scan complete.\nResults were written to {OUTPUT_FILE}\n\n"
              f"ℹ️ Summary:\n"
              f"- Total files: {summary['totalFiles']}\n"
              f"- Avg cyclomatic: {summary['average']['cyclomatic']}\n"
              f"- Avg maintainability: {summary['average']['maintainability']}\n"
              f"- Avg physical SLOC: {summary['average']['slocPhysical']}")
    except Exception as e:
        print(f"❌ Failed to write output file: {e}")
else:
    print(json.dumps(output, indent=2))

"""
python probably wasn't a good choice, because it's a javascript project
but at this point, I hate javascript more than anything else in the world
"""

