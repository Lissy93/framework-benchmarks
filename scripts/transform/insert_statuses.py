import json
import re
from pathlib import Path
from typing import Dict, List
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

# Constants
REPO_URL = "https://github.com/Lissy93/weather-front"
BADGES_BRANCH = "badges"
README_PATH = Path(".github/README.md")
FRAMEWORKS_JSON = "frameworks.json"

console = Console()

def load_frameworks(file_path: str) -> List[Dict]:
    """Load frameworks data from JSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f).get('frameworks', [])
    except Exception as e:
        console.print(f"[red]Error loading {file_path}: {e}[/red]")
        return []

def generate_status_table(frameworks: List[Dict]) -> str:
    """Generate Markdown table with build, test, and lint statuses for all frameworks."""
    table = """<!-- start_all_status -->

| App | Build | Test | Lint |
|---|---|---|---|
"""
    for fw in frameworks:
        fw_id = fw['id']
        fw_name = fw.get('displayName', fw['name'])
        fw_dir = fw['dir']
        meta = fw['meta']
        
        # Use logo if available, otherwise emoji
        icon = f'<img src="{meta["logo"]}" width="16" />' if meta.get('logo') else meta.get('emoji', '')
        app_link = f'<a href="{REPO_URL}/tree/main/apps/{fw_dir}">{icon} {fw_name}</a>'
        
        # Badge URLs
        build_badge = f"![{fw_name} Build Status](https://raw.githubusercontent.com/Lissy93/weather-front/{BADGES_BRANCH}/build-{fw_id}.svg)"
        test_badge = f"![{fw_name} Test Status](https://raw.githubusercontent.com/Lissy93/weather-front/{BADGES_BRANCH}/test-{fw_id}.svg)"
        lint_badge = f"![{fw_name} Lint Status](https://raw.githubusercontent.com/Lissy93/weather-front/{BADGES_BRANCH}/lint-{fw_id}.svg)"
        
        table += f"| {app_link} | {build_badge} | {test_badge} | {lint_badge} |\n"
    
    table += "<!-- end_all_status -->"
    return table

def update_readme(content: str) -> None:
    """Update README with status table, preserving other content."""
    try:
        if not README_PATH.exists():
            console.print(f"[yellow]Creating {README_PATH} with status table[/yellow]")
            README_PATH.parent.mkdir(parents=True, exist_ok=True)
            with README_PATH.open('w') as f:
                f.write(content)
        else:
            with README_PATH.open('r') as f:
                existing_content = f.read()
            pattern = r"<!-- start_all_status -->.*?<!-- end_all_status -->"
            updated_content = re.sub(pattern, content, existing_content, flags=re.DOTALL)
            with README_PATH.open('w') as f:
                f.write(updated_content)
            console.print(f"[green]Updated {README_PATH} with status table[/green]")
    except Exception as e:
        console.print(f"[red]Error updating {README_PATH}: {e}[/red]")

def main() -> None:
    """Generate and insert status table into .github/README.md."""
    frameworks = load_frameworks(FRAMEWORKS_JSON)
    if not frameworks:
        console.print("[red]No frameworks found. Exiting.[/red]")
        return

    with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console) as progress:
        task = progress.add_task("Generating status table...", total=1)
        status_table = generate_status_table(frameworks)
        update_readme(status_table)
        progress.advance(task)

    console.print("[bold green]Status table generated and inserted successfully![/bold green]")

if __name__ == "__main__":
    main()
