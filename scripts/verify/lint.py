#!/usr/bin/env python3
"""Run linting checks for all framework applications."""

import json
import re
import sys
import time
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional

import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.table import Table

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import get_frameworks_config, get_project_root, show_header, show_success, show_error, show_info, run_command, print_bold, get_bold_text

console = Console()


def format_duration(milliseconds: int) -> str:
    """Format duration in a human-readable format."""
    seconds = milliseconds / 1000
    if seconds < 60:
        return f"{seconds:.1f}s"
    minutes = int(seconds // 60)
    seconds = seconds % 60
    return f"{minutes}m {seconds:.1f}s"


def check_lint_command_exists(framework_id: str) -> bool:
    """
    **Check if a lint command exists for the given framework.**
    
    Reads the root package.json and checks if a `lint:{framework_id}` 
    script is defined.
    
    Args:
        framework_id: The framework identifier (e.g., 'react', 'vue')
        
    Returns:
        bool: True if the lint command exists, False otherwise
    """
    try:
        package_json_path = get_project_root() / "package.json"
        if not package_json_path.exists():
            return False
            
        with open(package_json_path, "r") as f:
            package_data = json.load(f)
            
        scripts = package_data.get("scripts", {})
        lint_command = f"lint:{framework_id}"
        return lint_command in scripts
        
    except (FileNotFoundError, json.JSONDecodeError, Exception):
        # **Graceful fallback**: If we can't read package.json, assume command exists
        # to avoid false negatives
        return True


def parse_lint_output(output: str) -> Tuple[int, int, List[str]]:
    """
    **Parse linting output to extract error and warning counts and messages.**
    
    Analyzes ESLint output to count errors/warnings and extract key messages
    for succinct display to the user.
    
    Args:
        output: Raw linting output from ESLint
        
    Returns:
        Tuple containing (errors, warnings, key_messages)
    """
    errors = 0
    warnings = 0
    key_messages = []
    
    # **Enhanced patterns** for better ESLint output parsing
    error_patterns = [
        r'(\d+)\s+errors?\b',
        r'✖\s+(\d+)\s+problems?.*?(\d+)\s+errors?',
        r'❌\s*(\d+)\s*errors?'
    ]
    
    warning_patterns = [
        r'(\d+)\s+warnings?\b',
        r'⚠️?\s*(\d+)\s*warnings?',
        r'\b(\d+)\s+warnings?\s+'
    ]
    
    # **Extract all error and warning lines** for comprehensive reporting
    lines = output.split('\n')
    for line in lines:
        line = line.strip()
        if any(indicator in line.lower() for indicator in ['error', 'warning', '✖', '⚠']):
            if len(line) < 200 and line and not line.startswith('npm'):  # **Filter out npm noise**
                # **Clean up ESLint formatting** for better readability
                cleaned_line = re.sub(r'\s{2,}', ' ', line)  # Remove excessive whitespace
                if cleaned_line not in key_messages:  # **Avoid duplicates**
                    key_messages.append(cleaned_line)
    
    # **Count errors and warnings**
    for pattern in error_patterns:
        matches = re.findall(pattern, output, re.IGNORECASE)
        for match in matches:
            if isinstance(match, tuple):
                # **Handle tuple matches** from complex patterns
                errors += int(match[1] if len(match) > 1 else match[0])
            else:
                errors += int(match)
    
    for pattern in warning_patterns:
        matches = re.findall(pattern, output, re.IGNORECASE)
        for match in matches:
            if isinstance(match, tuple):
                warnings += int(match[0])
            else:
                warnings += int(match)
    
    return errors, warnings, key_messages


class LintResult:
    """
    **Comprehensive lint result for a single framework.**
    
    Stores all linting information including status, timing, issue counts,
    and diagnostic messages for detailed reporting.
    """
    
    def __init__(self, name: str, icon: str, success: bool, duration: int, 
                 errors: int, warnings: int, has_lint_command: bool = True, 
                 key_messages: Optional[List[str]] = None):
        self.name = name
        self.icon = icon
        self.success = success
        self.duration = duration
        self.errors = errors
        self.warnings = warnings
        self.has_lint_command = has_lint_command
        self.key_messages = key_messages or []
        
    @property
    def has_issues(self) -> bool:
        """**Returns True if this framework has linting issues.**"""
        return self.errors > 0 or self.warnings > 0 or not self.has_lint_command
        
    @property
    def status_summary(self) -> str:
        """**Generate a human-readable status summary.**"""
        if not self.has_lint_command:
            return "No lint command"
        if self.success and self.errors == 0 and self.warnings == 0:
            return "Clean"
        
        parts = []
        if self.errors > 0:
            parts.append(f"{self.errors} error{'s' if self.errors != 1 else ''}")
        if self.warnings > 0:
            parts.append(f"{self.warnings} warning{'s' if self.warnings != 1 else ''}")
            
        return " and ".join(parts) if parts else "Issues found"


@click.command()
def lint():
    """
    **Lint all framework applications with comprehensive reporting.**
    
    Performs linting checks on all configured frameworks, validates lint
    command availability, and provides detailed progress tracking and 
    issue reporting.
    """
    show_header("Framework Lint Checks", "Running linting for all framework applications")
    
    start_time = time.time()
    
    try:
        # **Load and validate configuration**
        config = get_frameworks_config()
        all_frameworks = config.get("frameworks", [])
        
        if not all_frameworks:
            show_error("No frameworks found in configuration")
            sys.exit(1)
        
        # **Filter frameworks** that are configured for linting
        frameworks = [fw for fw in all_frameworks if fw.get("lintFiles")]
        
        if not frameworks:
            show_info("No frameworks are configured with 'lintFiles' property")
            show_error("Please configure frameworks for linting in frameworks.json")
            sys.exit(1)
        
        results: List[LintResult] = []
        
        # **Progress tracking** for better user experience
        with Progress(
            SpinnerColumn(),
            TextColumn("[bold blue]Linting..."),
            BarColumn(bar_width=None),
            "[progress.percentage]{task.percentage:>3.1f}%",
            "•",
            TaskProgressColumn(),
            console=console,
        ) as progress:
            
            task = progress.add_task("Processing frameworks...", total=len(frameworks))
            
            for framework in frameworks:
                fw_name = framework.get("name", framework.get("id", "Unknown"))
                fw_icon = framework.get("icon", "📦")
                fw_id = framework.get("id")
                
                if not fw_id:
                    continue
                
                progress.update(task, description=f"[bold blue]Linting {fw_name}...")
                
                # **Check if lint command exists**
                has_lint_command = check_lint_command_exists(fw_id)
                
                if not has_lint_command:
                    console.print(f"\n{fw_icon} Linting {fw_name}...")
                    console.print("─" * 50)
                    console.print(f"[bold yellow]⚠️  No lint command[/]")
                    console.print(f"   [dim]Missing 'lint:{fw_id}' script in package.json[/]")
                    console.print(f"   [dim]Add script: \"lint:{fw_id}\": \"eslint 'apps/{fw_id}/**/*.js'\"[/]")
                    
                    results.append(LintResult(
                        fw_name, fw_icon, False, 0, 0, 0, 
                        has_lint_command=False
                    ))
                    progress.advance(task)
                    continue
                
                console.print(f"\n{fw_icon} Linting {fw_name}...")
                console.print("─" * 50)
                
                framework_start = time.time()
                
                try:
                    success, output = run_command(['npm', 'run', f'lint:{fw_id}'])
                    duration_ms = int((time.time() - framework_start) * 1000)
                    
                    errors, warnings, key_messages = parse_lint_output(output)
                    
                    # **Determine and display status**
                    if success and errors == 0 and warnings == 0:
                        status_text = "✅ Clean"
                        status_style = "bold green"
                    elif errors > 0:
                        status_text = f"❌ {errors} Error{'s' if errors != 1 else ''}"
                        status_style = "bold red"
                        if warnings > 0:
                            status_text += f", {warnings} Warning{'s' if warnings != 1 else ''}"
                    else:
                        status_text = f"⚠️  {warnings} Warning{'s' if warnings != 1 else ''}"
                        status_style = "bold yellow"
                    
                    console.print(f"[{status_style}]{status_text}[/] ({format_duration(duration_ms)})")
                    
                    # **Show all messages** if there are issues
                    if key_messages and (errors > 0 or warnings > 0):
                        if len(key_messages) <= 10:
                            console.print("   [dim]Issues found:[/]")
                            for msg in key_messages:
                                console.print(f"   [dim]• {msg.strip()}[/]")
                        else:
                            console.print(f"   [dim]Issues found ({len(key_messages)} total):[/]")
                            for msg in key_messages[:8]:  # Show first 8 to avoid overwhelming output
                                console.print(f"   [dim]• {msg.strip()}[/]")
                            console.print(f"   [dim]... and {len(key_messages) - 8} more issues[/]")
                    
                    results.append(LintResult(
                        fw_name, fw_icon, success, duration_ms, errors, warnings,
                        has_lint_command=True, key_messages=key_messages
                    ))
                    
                except Exception as e:
                    # **Graceful error handling** for individual framework failures
                    console.print(f"   [bold red]Error running lint:[/] {str(e)}")
                    results.append(LintResult(
                        fw_name, fw_icon, False, 0, 0, 0,
                        has_lint_command=True, key_messages=[f"Lint command failed: {str(e)}"]
                    ))
                
                progress.advance(task)
        
        # **Generate comprehensive summary**
        total_duration_ms = int((time.time() - start_time) * 1000)
        clean = [r for r in results if not r.has_issues]
        with_issues = [r for r in results if r.has_issues]
        missing_commands = [r for r in results if not r.has_lint_command]
        with_errors = [r for r in results if r.errors > 0]
        with_warnings = [r for r in results if r.warnings > 0 and r.errors == 0]
        
        total_errors = sum(r.errors for r in results)
        total_warnings = sum(r.warnings for r in results)
        clean_rate = (len(clean) / len(results) * 100) if results else 0
        
        console.print(f"\n{'═' * 60}")
        console.print("📊 LINTING EXECUTION SUMMARY", style="bold cyan")
        console.print("═" * 60)
        
        # **Enhanced summary stats table**
        stats_table = Table(show_header=False, box=None, padding=(0, 2))
        stats_table.add_column("Metric", style="bold")
        stats_table.add_column("Value", style="white")
        
        stats_table.add_row("⏱️  Total execution time:", format_duration(total_duration_ms))
        stats_table.add_row("📋 Frameworks processed:", str(len(results)))
        stats_table.add_row("✅ Clean frameworks:", str(len(clean)))
        stats_table.add_row("⚠️  Frameworks with issues:", str(len(with_issues)))
        stats_table.add_row("🚨 Total errors:", f"[red]{total_errors}[/]" if total_errors > 0 else "0")
        stats_table.add_row("⚠️  Total warnings:", f"[yellow]{total_warnings}[/]" if total_warnings > 0 else "0")
        if missing_commands:
            stats_table.add_row("❌ Missing lint commands:", f"[red]{len(missing_commands)}[/]")
        stats_table.add_row("🎯 Clean rate:", f"{clean_rate:.1f}% ({len(clean)}/{len(results)})")
        
        console.print(stats_table)
        
        # **Create detailed results table**
        if results:
            console.print()
            print_bold("📋 DETAILED RESULTS", style="bold cyan")
            
            results_table = Table(show_header=True, header_style="bold cyan")
            results_table.add_column("Framework", style="white", min_width=12)
            results_table.add_column("Status", min_width=12)
            results_table.add_column("Errors", justify="center", min_width=8)
            results_table.add_column("Warnings", justify="center", min_width=8) 
            results_table.add_column("Duration", justify="right", min_width=8)
            
            for result in results:
                # **Determine status display**
                if not result.has_lint_command:
                    status_display = "[yellow]🚫 Not Configured[/]"
                elif result.errors == 0 and result.warnings == 0:
                    status_display = "[green]✅ Passing[/]"
                elif result.errors > 0:
                    status_display = "[red]❌ Failing[/]"
                else:
                    status_display = "[yellow]⚠️ Issues[/]"
                
                # **Format counts with colors**
                errors_display = f"[red]{result.errors}[/]" if result.errors > 0 else "0"
                warnings_display = f"[yellow]{result.warnings}[/]" if result.warnings > 0 else "0"
                duration_display = format_duration(result.duration) if result.duration > 0 else "-"
                
                results_table.add_row(
                    f"{result.name}",
                    status_display,
                    errors_display,
                    warnings_display,
                    duration_display
                )
            
            console.print(results_table)
        
        console.print()
        
        # **Enhanced final status with specific guidance**
        if missing_commands:
            show_error(f"Missing lint commands for {len(missing_commands)} framework(s)")
            console.print("   [dim]Add the missing lint scripts to package.json[/]")
            
        if total_errors > 0:
            show_error(f"Found {total_errors} linting error{'s' if total_errors != 1 else ''} that must be fixed")
            sys.exit(1)
        elif total_warnings > 0:
            console.print(
                f"⚠️  Found {total_warnings} linting warning{'s' if total_warnings != 1 else ''} - "
                "consider addressing them for better code quality", 
                style="yellow"
            )
        elif missing_commands:
            console.print("⚠️  Some frameworks are missing lint commands", style="yellow")
        else:
            show_success("All lint checks passed! ✨")
            console.print("   [dim]Your code is clean and follows best practices[/]")
    
    except KeyboardInterrupt:
        console.print("\n[yellow]Linting interrupted by user[/]")
        sys.exit(1)
    except Exception as error:
        show_error(f"Unexpected error during linting: {error}")
        console.print(f"   [dim]Error details: {type(error).__name__}[/]")
        sys.exit(1)


if __name__ == "__main__":
    lint()
