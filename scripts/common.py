"""Common utilities for weather scripts."""

import json
import subprocess
from pathlib import Path
from typing import Any, Dict, List

from rich.console import Console
from rich.panel import Panel
from rich.text import Text

console = Console()


def get_project_root() -> Path:
    """Get the project root directory (parent of scripts)."""
    return Path(__file__).parent.parent


def get_frameworks_config() -> Dict[str, Any]:
    """Load and return the frameworks configuration."""
    config_path = get_project_root() / "frameworks.json"
    with open(config_path, "r") as f:
        return json.load(f)


def show_header(title: str, description: str) -> None:
    """Display a formatted header for scripts."""
    header = Text()
    
    header.append(title, style="bold cyan")
    
    panel = Panel(
        Text(description, style="white"),
        title=header,
        title_align="left",
        border_style="blue",
        padding=(0, 2),
        expand=False
    )
    console.print()
    console.print(panel)
    console.print()


def show_success(message: str) -> None:
    """Show a success message."""
    console.print(f"\n✅ {message}", style="bold green")


def show_error(message: str) -> None:
    """Show an error message."""
    console.print(f"\n❌ {message}", style="bold red")


def show_info(message: str) -> None:
    """Show an info message."""
    console.print(f"\nℹ️  {message}", style="blue")


def print_bold(text: str, style: str = "bold") -> None:
    """Print text in bold using Rich formatting."""
    console.print(text, style=style)


def get_bold_text(text: str) -> str:
    """Return text formatted for bold display using Rich markup."""
    return f"[bold]{text}[/]"


def run_command(command: List[str], cwd: Path = None) -> tuple[bool, str]:
    """Run a shell command and return success status and output."""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=False
        )
        return result.returncode == 0, result.stdout + result.stderr
    except Exception as e:
        return False, str(e)


def get_framework_asset_dir(framework_id: str, frameworks_config: Dict[str, Any]) -> str:
    """Get the asset directory name for a specific framework."""
    frameworks = frameworks_config.get("frameworks", [])
    for framework in frameworks:
        if framework.get("id") == framework_id:
            return framework.get("assetsDir", "public")
    return "public"
