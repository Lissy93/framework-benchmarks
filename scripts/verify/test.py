#!/usr/bin/env python3
"""Run tests for all framework applications."""

import os
import re
import signal
import sys
import time
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.table import Table

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import (
    get_frameworks_config, show_header, show_success, show_error, 
    print_bold, get_pass_rate_color, format_test_counts, format_test_result_simple
)

console = Console()


def run_test_with_timeout_and_parsing(command: List[str], timeout: int = 300) -> Tuple[bool, int, int, int, List[str]]:
    """
    Run test command with timeout and parse results.
    
    Uses longer timeout and preserves Playwright's native retry mechanisms.
    
    Args:
        command: Command to run
        timeout: Timeout in seconds (default 300 = 5 minutes for full test suite)
        
    Returns:
        Tuple of (success, passed_tests, failed_tests, timeout_tests, output_lines)
    """
    passed_tests = 0
    failed_tests = 0
    timeout_tests = 0
    output_lines = []
    
    def strip_ansi_codes(text: str) -> str:
        """Remove ANSI escape sequences from text."""
        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        return ansi_escape.sub('', text)
    
    try:
        # **Use same environment as standalone commands**
        env = dict(os.environ)
        env['FORCE_COLOR'] = '0'  # **Disable colors in subprocess to avoid ANSI issues**
        
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True,
            env=env
        )
        
        start_time = time.time()
        
        # **Stream output with minimal, colored display**
        for line in process.stdout:
            if not line.strip():
                continue
                
            # **Clean ANSI codes and store original**
            clean_line = strip_ansi_codes(line.strip())
            output_lines.append(clean_line)
            
            # **Show minimal output - only important lines**
            if any(indicator in clean_line.lower() for indicator in ['✓', 'passed', 'running']):
                if not any(skip in clean_line.lower() for skip in ['skipped', 'ignored']):
                    console.print(f"  [green]✓[/] [dim]{clean_line[:60]}...[/]" if len(clean_line) > 60 else f"  [green]✓[/] [dim]{clean_line}[/]")
            
            elif any(indicator in clean_line.lower() for indicator in ['✖', 'failed', 'error', 'timeout']):
                # **Only show concise error info**
                error_summary = clean_line[:80] + "..." if len(clean_line) > 80 else clean_line
                console.print(f"  [red]✖[/] {error_summary}")
            
            # **Check for suite timeout (much longer than individual test timeouts)**
            if time.time() - start_time > timeout:
                try:
                    process.terminate()
                    process.wait(timeout=5)
                except:
                    process.kill()
                timeout_tests = 1
                console.print(f"  [yellow]⏱️  Test suite timed out after {timeout//60}m[/]")
                break
        
        # **Wait for process completion**
        if timeout_tests == 0:
            process.wait(timeout=10)
            
        success = process.returncode == 0 and timeout_tests == 0
        
        # **Parse final summary from Playwright output**
        summary_lines = [line for line in output_lines if 'passed' in line.lower() or 'failed' in line.lower()]
        
        for line in summary_lines:
            # **Look for patterns like "21 passed", "1 failed", etc.**
            passed_match = re.search(r'(\d+)\s+passed', line.lower())
            failed_match = re.search(r'(\d+)\s+failed', line.lower())
            
            if passed_match:
                passed_tests = max(passed_tests, int(passed_match.group(1)))
            if failed_match:
                failed_tests = max(failed_tests, int(failed_match.group(1)))
        
        return success, passed_tests, failed_tests, timeout_tests, output_lines
        
    except subprocess.TimeoutExpired:
        timeout_tests = 1
        console.print(f"  [yellow]⏱️  Test suite timed out[/]")
        try:
            process.terminate()
            process.wait(timeout=5)
        except:
            process.kill()
        return False, passed_tests, failed_tests, timeout_tests, output_lines
    except Exception as e:
        console.print(f"  [red]Error running test: {e}[/]")
        return False, 0, 0, 0, [str(e)]


def format_duration(milliseconds: int) -> str:
    """Format duration in a human-readable format."""
    seconds = milliseconds / 1000
    if seconds < 60:
        return f"{seconds:.1f}s"
    minutes = int(seconds // 60)
    seconds = seconds % 60
    return f"{minutes}m {seconds:.1f}s"


class TestResult:
    """
    Comprehensive test result for a single framework.
    
    Stores detailed test execution information including pass/fail counts,
    timing, and status for rich reporting.
    """
    
    def __init__(self, name: str, icon: str, fw_id: str, success: bool, duration: int,
                 passed: int = 0, failed: int = 0, timeout: int = 0):
        self.name = name
        self.icon = icon
        self.fw_id = fw_id
        self.success = success
        self.duration = duration
        self.passed = passed
        self.failed = failed
        self.timeout = timeout
        
    @property
    def total_tests(self) -> int:
        """Total number of tests run."""
        return self.passed + self.failed + self.timeout
        
    @property
    def pass_rate(self) -> float:
        """Calculate pass rate as percentage."""
        if self.total_tests == 0:
            return 0.0
        return (self.passed / self.total_tests) * 100
        
    @property
    def status_color(self) -> str:
        """Get color for status display based on results."""
        return get_pass_rate_color(self.passed, self.total_tests)
        
    @property
    def status_display(self) -> str:
        """Get formatted status display."""
        if self.total_tests == 0:
            return "[dim]No tests[/]"
        elif self.pass_rate == 100:
            return "[green]✅ All passed[/]"
        elif self.pass_rate >= 50:
            return f"[yellow]⚠️  {self.pass_rate:.0f}% passed[/]"
        else:
            return f"[red]❌ {self.pass_rate:.0f}% passed[/]"


@click.command()
def test():
    """
    Execute comprehensive test suite for all framework applications.
    
    Features:
    - Progress tracking with Rich progress bars
    - Timeout handling for long-running tests
    - Minimal, colored test output
    - Detailed summary table with pass rates
    - Retry guidance for failed suites
    """
    show_header("Framework Test Suite", "Running tests for all framework applications")
    
    start_time = time.time()
    
    try:
        # **Load and validate configuration**
        config = get_frameworks_config()
        frameworks = config.get("frameworks", [])
        
        # **Get testing configuration**
        testing_config = config.get("config", {}).get("testing", {})
        default_timeout = testing_config.get("defaultTimeout", 300)
        max_retries = testing_config.get("maxRetries", 3)
        
        if not frameworks:
            show_error("No frameworks found in configuration")
            sys.exit(1)
        
        results: List[TestResult] = []
        failed_suites = []
        
        # **Progress tracking for better UX**
        with Progress(
            SpinnerColumn(),
            TextColumn("[bold blue]Testing..."),
            BarColumn(bar_width=None),
            "[progress.percentage]{task.percentage:>3.1f}%",
            "•",
            TaskProgressColumn(),
            console=console,
        ) as progress:
            
            task = progress.add_task("Processing frameworks...", total=len(frameworks))
            
            for framework in frameworks:
                fw_name = framework.get("name", framework.get("id", "Unknown"))
                fw_icon = framework.get("meta", {}).get("emoji", "📦")
                fw_id = framework.get("id")
                
                if not fw_id:
                    progress.advance(task)
                    continue
                
                progress.update(task, description=f"[bold blue]Testing {fw_name}...")
                
                console.print(f"\n{fw_icon} Testing {fw_name}...")
                console.print("─" * 50)
                
                framework_start = time.time()
                
                try:
                    # **Run tests with configurable timeout to preserve Playwright's retry mechanisms**
                    success, passed, failed, timeout, output = run_test_with_timeout_and_parsing(
                        ['npm', 'run', f'test:{fw_id}'], timeout=default_timeout
                    )
                    duration_ms = int((time.time() - framework_start) * 1000)
                    
                    # **Display framework status**
                    if success:
                        status_text = f"✅ PASSED ({passed} tests)"
                        status_style = "bold green"
                    else:
                        status_text = f"❌ FAILED ({failed} failed, {passed} passed)"
                        status_style = "bold red"
                        failed_suites.append(fw_id)
                    
                    if timeout > 0:
                        status_text += f" ⏱️  {timeout} timed out"
                    
                    console.print(f"{fw_name}: [{status_style}]{status_text}[/] ({format_duration(duration_ms)})")
                    
                    results.append(TestResult(
                        fw_name, fw_icon, fw_id, success, duration_ms, passed, failed, timeout
                    ))
                    
                except Exception as e:
                    # **Graceful error handling**
                    console.print(f"   [bold red]Error running tests:[/] {str(e)}")
                    failed_suites.append(fw_id)
                    results.append(TestResult(
                        fw_name, fw_icon, fw_id, False, 0, 0, 1, 0
                    ))
                
                progress.advance(task)
        
        # **Generate comprehensive summary**
        total_duration_ms = int((time.time() - start_time) * 1000)
        passed_frameworks = [r for r in results if r.success]
        failed_frameworks = [r for r in results if not r.success]
        total_tests_passed = sum(r.passed for r in results)
        total_tests_failed = sum(r.failed for r in results)
        total_tests_timeout = sum(r.timeout for r in results)
        framework_success_rate = (len(passed_frameworks) / len(results) * 100) if results else 0
        
        console.print(f"\n{'═' * 60}")
        console.print("📊 TEST EXECUTION SUMMARY", style="bold cyan")
        console.print("═" * 60)
        
        # **Enhanced summary stats**
        stats_table = Table(show_header=False, box=None, padding=(0, 2))
        stats_table.add_column("Metric", style="bold")
        stats_table.add_column("Value", style="white")
        
        stats_table.add_row("⏱️  Total execution time:", format_duration(total_duration_ms))
        stats_table.add_row("📋 Frameworks tested:", str(len(results)))
        stats_table.add_row("✅ Framework success rate:", f"{framework_success_rate:.1f}% ({len(passed_frameworks)}/{len(results)})")
        stats_table.add_row("📊 Total tests run:", str(total_tests_passed + total_tests_failed + total_tests_timeout))
        stats_table.add_row("✅ Tests passed:", f"[green]{total_tests_passed}[/]" if total_tests_passed > 0 else "0")
        stats_table.add_row("❌ Tests failed:", f"[red]{total_tests_failed}[/]" if total_tests_failed > 0 else "0")
        if total_tests_timeout > 0:
            stats_table.add_row("⏱️  Tests timed out:", f"[yellow]{total_tests_timeout}[/]")
        
        console.print(stats_table)
        
        # **Detailed results table**
        if results:
            console.print()
            print_bold("📋 DETAILED TEST RESULTS", style="bold cyan")
            
            results_table = Table(show_header=True, header_style="bold cyan")
            results_table.add_column("Framework", style="white", min_width=15)
            results_table.add_column("Pass Rate", justify="center", min_width=10)
            results_table.add_column("Tests", min_width=15)
            results_table.add_column("Duration", justify="right", min_width=8)
            
            for result in results:
                # **Format pass rate with color**
                if result.total_tests > 0:
                    pass_rate_text = f"[{result.status_color}]{result.pass_rate:.0f}%[/]"
                else:
                    pass_rate_text = "[dim]-[/]"
                
                # **Format test results in simple form**
                test_result = format_test_result_simple(result.passed, result.failed, result.timeout)
                
                results_table.add_row(
                    result.name,  # **No emoji to avoid alignment issues**
                    pass_rate_text,
                    test_result,
                    format_duration(result.duration)
                )
            
            console.print(results_table)
        
        console.print()
        
        # **Enhanced final status with retry guidance**
        if failed_suites:
            show_error(f"{len(failed_suites)} test suite{'s' if len(failed_suites) > 1 else ''} failed")
            console.print("\n[bold yellow]Retry individual suites with detailed output:[/]")
            for suite_id in failed_suites[:5]:  # **Limit to first 5 to avoid overwhelming output**
                console.print(f"   [dim]npm run test:{suite_id}[/]")
            if len(failed_suites) > 5:
                console.print(f"   [dim]... and {len(failed_suites) - 5} more[/]")
            sys.exit(1)
        elif total_tests_failed > 0:
            show_error(f"{total_tests_failed} individual test{'s' if total_tests_failed > 1 else ''} failed")
            sys.exit(1)
        else:
            show_success("All tests passed! 🎉")
            if total_tests_passed > 0:
                console.print(f"   [dim]{total_tests_passed} tests completed successfully[/]")
            else:
                console.print("   [dim]All framework test suites executed without errors[/]")
    
    except KeyboardInterrupt:
        console.print("\n[yellow]Testing interrupted by user[/]")
        sys.exit(1)
    except Exception as error:
        show_error(f"Unexpected error during testing: {error}")
        console.print(f"   [dim]Error details: {type(error).__name__}[/]")
        sys.exit(1)


if __name__ == "__main__":
    test()
