#!/usr/bin/env python3
"""Run tests for all framework applications."""

import sys
import time
import subprocess
from pathlib import Path
from typing import List, Dict, Any

import click
from rich.console import Console
from rich.table import Table

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import get_frameworks_config, show_header, show_success, show_error, run_command

console = Console()


def run_test_with_live_output(command: List[str]) -> bool:
    """Run a test command with live output streaming."""
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Stream output in real-time
        for line in process.stdout:
            print(line, end='', flush=True)
        
        process.wait()
        return process.returncode == 0
    except Exception as e:
        console.print(f"Error running command: {e}", style="bold red")
        return False


def format_duration(milliseconds: int) -> str:
    """Format duration in a human-readable format."""
    seconds = milliseconds / 1000
    if seconds < 60:
        return f"{seconds:.1f}s"
    minutes = int(seconds // 60)
    seconds = seconds % 60
    return f"{minutes}m {seconds:.1f}s"


class TestResult:
    """Test result for a single framework."""
    
    def __init__(self, name: str, icon: str, success: bool, duration: int):
        self.name = name
        self.icon = icon
        self.success = success
        self.duration = duration


@click.command()
def test():
    """Execute all e2e + unit tests for all apps."""
    show_header("Framework Test Suite", "Running tests for all framework applications")
    
    start_time = time.time()
    
    try:
        config = get_frameworks_config()
        frameworks = config.get("frameworks", [])
        
        if not frameworks:
            show_error("No frameworks found in configuration")
            sys.exit(1)
        
        results: List[TestResult] = []
        
        for framework in frameworks:
            fw_name = framework.get("name", framework.get("id", "Unknown"))
            fw_icon = framework.get("icon", "📦")
            fw_id = framework.get("id")
            
            if not fw_id:
                continue
            
            console.print(f"\n{fw_icon} Testing {fw_name}...")
            console.print("─" * 50)
            
            framework_start = time.time()
            success = run_test_with_live_output(['npm', 'run', f'test:{fw_id}'])
            duration_ms = int((time.time() - framework_start) * 1000)
            
            status_style = "bold green" if success else "bold red"
            status_text = "✅ PASSED" if success else "❌ FAILED"
            console.print(f"{fw_name}: [{status_style}]{status_text}[/] ({format_duration(duration_ms)})")
            
            results.append(TestResult(fw_name, fw_icon, success, duration_ms))
        
        # Generate summary
        total_duration_ms = int((time.time() - start_time) * 1000)
        passed = [r for r in results if r.success]
        failed = [r for r in results if not r.success]
        success_rate = (len(passed) / len(results) * 100) if results else 0
        
        console.print(f"\n{'═' * 60}")
        console.print("📊 TEST EXECUTION SUMMARY", style="bold cyan")
        console.print("═" * 60)
        
        # Summary stats
        stats_table = Table(show_header=False, box=None, padding=(0, 2))
        stats_table.add_column("Metric", style="bold")
        stats_table.add_column("Value", style="white")
        
        stats_table.add_row("⏱️  Total execution time:", format_duration(total_duration_ms))
        stats_table.add_row("📋 Frameworks tested:", str(len(results)))
        stats_table.add_row("✅ Passed:", str(len(passed)))
        stats_table.add_row("❌ Failed:", str(len(failed)))
        stats_table.add_row("🎯 Success Rate:", f"{success_rate:.1f}% ({len(passed)}/{len(results)})")
        
        console.print(stats_table)
        
        # Detailed results
        if passed:
            console.print("\n🎉 PASSING FRAMEWORKS:", style="bold green")
            for result in passed:
                console.print(f"   {result.icon} {result.name} ({format_duration(result.duration)})")
        
        if failed:
            console.print("\n💥 FAILING FRAMEWORKS:", style="bold red")
            for result in failed:
                console.print(f"   {result.icon} {result.name} ({format_duration(result.duration)})")
        
        console.print()
        
        # Final status
        if len(failed) == len(results):
            show_error("All tests failed - this may indicate a configuration issue")
            sys.exit(1)
        elif failed:
            show_error(f"{len(failed)} test{'s' if len(failed) > 1 else ''} failed - check output above for details")
            sys.exit(1)
        else:
            show_success("All tests passed! 🎉")
            console.print("Today is a great day to be alive 😊", style="magenta")
    
    except Exception as error:
        show_error(f"Error running tests: {error}")
        sys.exit(1)


if __name__ == "__main__":
    test()
