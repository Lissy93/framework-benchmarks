"""Common utilities for weather scripts."""

import json
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Tuple

from rich.console import Console
from rich.panel import Panel
from rich.text import Text

console = Console()


def get_project_root() -> Path:
    """Get the project root directory (parent of scripts)."""
    return Path(__file__).parent.parent


def get_config() -> Dict[str, Any]:
    """Load and return the project configuration."""
    config_path = get_project_root() / "config.json"
    with open(config_path, "r") as f:
        return json.load(f)


def get_frameworks() -> List[Dict[str, Any]]:
    """Load and return the frameworks array."""
    frameworks_path = get_project_root() / "frameworks.json"
    with open(frameworks_path, "r") as f:
        data = json.load(f)
        return data.get("frameworks", [])


def get_frameworks_config() -> Dict[str, Any]:
    """Load and return the combined frameworks and config (for backward compatibility)."""
    config = get_config()
    frameworks = get_frameworks()
    return {
        "config": config,
        "frameworks": frameworks
    }


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


def get_pass_rate_color(passed: int, total: int, config: Dict[str, Any] = None) -> str:
    """
    Get color code for pass rate display using configurable thresholds.
    
    Returns:
        green: excellent pass rate
        yellow: good pass rate  
        red: warning pass rate
    """
    if total == 0:
        return "dim"
    
    if config is None:
        config = get_frameworks_config()
    
    thresholds = config.get("config", {}).get("ui", {}).get("passRateThresholds", {
        "excellent": 100,
        "good": 75,
        "warning": 50
    })
    
    pass_rate = (passed / total) * 100
    if pass_rate >= thresholds.get("excellent", 100):
        return "green"
    elif pass_rate >= thresholds.get("good", 75):
        return "yellow"
    else:
        return "red"


def format_test_counts(passed: int, failed: int, timeout: int = 0) -> str:
    """Format test counts with appropriate colors."""
    parts = []
    
    if passed > 0:
        parts.append(f"[green]{passed} passed[/]")
    if failed > 0:
        parts.append(f"[red]{failed} failed[/]")
    if timeout > 0:
        parts.append(f"[yellow]{timeout} timeout[/]")
    
    return ", ".join(parts) if parts else "[dim]No tests[/]"


def format_test_result_simple(passed: int, failed: int, timeout: int = 0) -> str:
    """Format test results in simple, concise form."""
    total = passed + failed + timeout
    
    if total == 0:
        return "[dim]No tests[/]"
    elif failed == 0 and timeout == 0:
        return "[green]All tests passed[/]"
    elif failed == total:
        return "[red]All failed[/]"
    elif failed > 0:
        return f"[red]{failed} failed[/]"
    elif timeout > 0:
        return f"[yellow]{timeout} timeout[/]"
    else:
        return "[green]All tests passed[/]"


def run_command(command: List[str], cwd: Path = None) -> Tuple[bool, str]:
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
