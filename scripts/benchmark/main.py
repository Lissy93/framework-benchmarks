#!/usr/bin/env python3
"""Main entrypoint for all benchmark operations."""

import sys
from pathlib import Path

import click
from rich.console import Console
from rich.progress import Progress, TaskID

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import show_header, show_success, show_error, show_subheader

console = Console()
global_progress = None
global_task = None

def setup_progress_bar(total_steps: int, description: str = "Running benchmarks"):
    """Setup global progress bar."""
    global global_progress, global_task
    global_progress = Progress(console=console)
    global_progress.start()
    global_task = global_progress.add_task(f"[cyan]{description}", total=total_steps)

def update_progress():
    """Advance progress by one step."""
    if global_progress and global_task is not None:
        global_progress.advance(global_task)

def cleanup_progress():
    """Clean up progress bar."""
    global global_progress, global_task
    if global_progress:
        global_progress.stop()
        global_progress = None
        global_task = None

def run_with_progress(runner, frameworks_str, executions, detailed, save):
    """Run benchmarks with progress tracking and return results."""
    # Parse frameworks
    framework_list = [f.strip() for f in frameworks_str.split(',')] if frameworks_str else [fw["id"] for fw in runner.frameworks]
    
    # Setup progress bar
    setup_progress_bar(len(framework_list) * executions, "Benchmarking frameworks")
    
    try:
        # Patch runner to update progress
        original_run = runner.run_single_benchmark
        runner.run_single_benchmark = lambda fw: (lambda r: (update_progress(), r)[1])(original_run(fw))
        
        # Run benchmarks
        results = runner.run_all_frameworks(framework_list, executions=executions)
        if not results:
            show_error("No benchmark results generated")
            return None
        
        # Display and save results
        runner.display_summary()
        if detailed:
            runner.display_detailed_results()
        if save:
            output_path = runner.save_results()
            console.print(f"💾 Results saved to: {output_path}")
        
        return results
    finally:
        cleanup_progress()


@click.group()
@click.pass_context
def cli(ctx):
    """Benchmark suite for weather app frameworks.
    
    Run performance benchmarks across all frontend frameworks
    to measure and compare their real-world performance characteristics.
    """
    show_header("Benchmark Suite", "Performance testing for weather app frameworks")


@cli.command()
@click.option('--frameworks', '-f', help='Comma-separated list of frameworks to benchmark')
@click.option('--detailed', '-d', is_flag=True, help='Show detailed results')
@click.option('--save', '-s', is_flag=True, default=True, help='Save results to file')
@click.option('--executions', '-e', default=1, type=int, help='Number of times to run each benchmark (for averaging)')
def lighthouse(frameworks: str, detailed: bool, save: bool, executions: int):
    """Run Lighthouse performance audits."""
    from lighthouse import LighthouseRunner
    
    results = run_with_progress(LighthouseRunner(), frameworks, executions, detailed, save)
    if not results:
        return
    
    # Show final summary
    successful, failed = [r for r in results if r.success], [r for r in results if not r.success]
    if failed:
        show_error(f"{len(failed)} frameworks failed Lighthouse benchmarks")
    else:
        show_success(f"All {len(successful)} frameworks passed Lighthouse benchmarks")


@cli.command()
@click.option('--type', '-t', type=click.Choice(['lighthouse'], case_sensitive=False), 
              help='Benchmark type to run')
@click.option('--frameworks', '-f', help='Comma-separated list of frameworks to benchmark')
@click.option('--detailed', '-d', is_flag=True, help='Show detailed results')
@click.option('--save', '-s', is_flag=True, default=True, help='Save results to file')
@click.option('--executions', '-e', default=1, type=int, help='Number of times to run each benchmark (for averaging)')
def all(type: str, frameworks: str, detailed: bool, save: bool, executions: int):
    """Run all available benchmarks."""
    from lighthouse import LighthouseRunner
    
    benchmark_types = [type] if type else ['lighthouse']
    console.print(f"🚀 Running benchmarks: {', '.join(benchmark_types)}")
    
    all_results = {}
    for benchmark_type in benchmark_types:
        show_subheader(f"Running {benchmark_type.title()} Benchmark")
        
        if benchmark_type == 'lighthouse':
            results = run_with_progress(LighthouseRunner(), frameworks, executions, detailed, save)
            all_results[benchmark_type] = results or []
    
    # Final summary
    show_subheader("📊 Overall Benchmark Summary")
    for benchmark_type, results in all_results.items():
        if results:
            successful, failed = [r for r in results if r.success], [r for r in results if not r.success]
            console.print(f"{benchmark_type.title()}: {len(successful)} passed, {len(failed)} failed")
    
    total_failed = sum(len([r for r in results if not r.success]) for results in all_results.values())
    if total_failed == 0:
        show_success("All benchmarks completed successfully! 🎉")
    else:
        show_error(f"{total_failed} benchmark(s) failed")


@cli.command()
def list():
    """List available benchmark types."""
    console.print("Available benchmark types:")
    console.print("  • [bold]lighthouse[/bold] - Google Lighthouse performance audits")
    console.print("    Measures: Performance, Accessibility, Best Practices, SEO")
    console.print("    Metrics: FCP, LCP, Speed Index, CLS, TBT")
    
    console.print("\n💡 Usage examples:")
    console.print("  python benchmark/main.py lighthouse")
    console.print("  python benchmark/main.py lighthouse -f react,vue,svelte")
    console.print("  python benchmark/main.py all --detailed")


@cli.command()
def server_check():
    """Check if benchmark server is running."""
    from lighthouse import LighthouseRunner
    
    runner = LighthouseRunner()
    
    if runner.check_server_health():
        base_url = runner.server_config.get("baseUrl", "http://127.0.0.1:3000")
        show_success(f"✅ Benchmark server is running at {base_url}")
        
        # Test a few framework URLs
        console.print("\n🔗 Sample framework URLs:")
        sample_frameworks = ["react", "vue", "svelte"]
        for fw in sample_frameworks:
            url = runner.get_framework_url(fw)
            console.print(f"  • {fw}: {url}")
    else:
        show_error("❌ Benchmark server is not running")
        console.print("💡 Start the server with: [bold]npm start[/bold]")


if __name__ == "__main__":
    cli()