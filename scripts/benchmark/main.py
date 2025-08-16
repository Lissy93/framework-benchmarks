#!/usr/bin/env python3
"""Main entrypoint for all benchmark operations."""

import sys
from pathlib import Path

import click
from rich.console import Console
from rich.progress import Progress, TaskID
from rich.live import Live
from rich.layout import Layout

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import show_header, show_success, show_error, show_subheader

console = Console()
global_progress = None
global_task = None
suppress_output = False

def setup_progress_bar(total_steps: int, description: str = "Running benchmarks"):
    """Setup global progress bar."""
    global global_progress, global_task
    from rich.progress import Progress, BarColumn, TextColumn, TimeRemainingColumn, SpinnerColumn
    
    global_progress = Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.fields[framework]}", justify="left"),
        TextColumn("[dim]{task.fields[stage]}", justify="left"),
        BarColumn(bar_width=50),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeRemainingColumn(),
        console=console,
        transient=False,  # Keep progress bar visible
        refresh_per_second=10
    )
    global_progress.start()
    global_task = global_progress.add_task(
        description, 
        total=total_steps,
        framework="Starting...",
        stage=""
    )

def update_progress(framework: str = "", stage: str = ""):
    """Advance progress by one step with optional status update."""
    if global_progress and global_task is not None:
        global_progress.advance(global_task)
        if framework or stage:
            global_progress.update(global_task, framework=framework, stage=stage)
        # Debug: Print current progress
        current = global_progress.tasks[global_task].completed
        total = global_progress.tasks[global_task].total
        # print(f"DEBUG: Progress {current}/{total}")
    # else:
        # print(f"DEBUG: Progress bar not initialized - global_progress={global_progress}, global_task={global_task}")

def update_progress_status(framework: str = "", stage: str = ""):
    """Update progress status without advancing."""
    if global_progress and global_task is not None:
        global_progress.update(global_task, framework=framework, stage=stage)

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
    
    # Bundle size and source analysis don't need multiple executions (always same result)
    # Build time, lighthouse, and resource usage can benefit from multiple executions for averaging
    actual_executions = 1 if runner.benchmark_name in ["Bundle Size", "Source Analysis"] else executions
    
    # All benchmarks use 1 step per framework for simple progress
    sub_steps_per_framework = 1
    total_steps = len(framework_list) * actual_executions * sub_steps_per_framework
    
    # Setup progress bar
    setup_progress_bar(total_steps, "Benchmarking frameworks")
    
    try:
        # Store original console methods to selectively suppress output during progress
        original_print = console.print
        global suppress_output
        
        def selective_print(*args, **kwargs):
            # Only suppress if flag is set and not an important message
            global suppress_output
            if suppress_output and args and isinstance(args[0], str):
                msg = str(args[0]).lower()
                # Suppress resource monitoring console output during progress
                if any(keyword in msg for keyword in [
                    '📊 establishing resource baseline',
                    'devtools memory access failed',
                    '✓ react:', '✓ vue:', '✓ svelte:', '✓ angular:', '✓ lit:', '✓ vanjs:',
                    '⚠ react:', '⚠ vue:', '⚠ svelte:', '⚠ angular:', '⚠ lit:', '⚠ vanjs:',
                    '⚡ react:', '⚡ vue:', '⚡ svelte:', '⚡ angular:', '⚡ lit:', '⚡ vanjs:',
                    '📊 react:', '📊 vue:', '📊 svelte:', '📊 angular:', '📊 lit:', '📊 vanjs:',
                    'baseline', 'devtools', 'loading', 'running', 'completed', 'final measurements'
                ]):
                    return
                # Allow all other messages through (errors, final summary, etc.)
            return original_print(*args, **kwargs)
        
        # Replace console.print with selective version
        console.print = selective_print
        
        # Enhanced progress tracking based on benchmark type
        global suppress_output
        suppress_output = True  # Enable output suppression during benchmarks
        
        # Standard progress tracking for all benchmarks (including resource usage)
        original_run = runner.run_single_benchmark
        
        def enhanced_run(fw):
            update_progress_status(fw, "Processing...")
            result = original_run(fw)
            update_progress(fw, "Completed")
            return result
        
        runner.run_single_benchmark = enhanced_run
        results = runner.run_all_frameworks(framework_list, executions=actual_executions)
        
        # Disable output suppression for results display
        suppress_output = False
        
        # Restore original console.print
        console.print = original_print
        
        if not results:
            show_error("No benchmark results generated")
            return None
        
        # Clear the progress bar before showing results
        cleanup_progress()
        
        # Ensure all output is displayed normally
        console.print = original_print
        suppress_output = False
        
        # Display and save results
        console.print("\n")  # Add clear spacing after progress bar
        runner.display_summary()
        if detailed:
            runner.display_detailed_results()
        if save:
            output_path = runner.save_results()
            console.print(f"💾 Results saved to: {output_path}")
        
        return results
    finally:
        # Restore console.print in case of exception
        console.print = original_print
        if global_progress:  # Only cleanup if not already done
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
@click.option('--frameworks', '-f', help='Comma-separated list of frameworks to benchmark')
@click.option('--detailed', '-d', is_flag=True, help='Show detailed results')
@click.option('--save', '-s', is_flag=True, default=True, help='Save results to file')
def bundle_size(frameworks: str, detailed: bool, save: bool):
    """Analyze bundle sizes for frameworks."""
    from bundle_size import BundleSizeRunner
    
    results = run_with_progress(BundleSizeRunner(), frameworks, 1, detailed, save)
    if not results:
        return
    
    # Show final summary
    successful, failed = [r for r in results if r.success], [r for r in results if not r.success]
    if failed:
        show_error(f"{len(failed)} frameworks failed bundle size analysis")
    else:
        show_success(f"Bundle size analysis completed for {len(successful)} frameworks")


@cli.command()
@click.option('--frameworks', '-f', help='Comma-separated list of frameworks to benchmark')
@click.option('--detailed', '-d', is_flag=True, help='Show detailed results')
@click.option('--save', '-s', is_flag=True, default=True, help='Save results to file')
def source_analysis(frameworks: str, detailed: bool, save: bool):
    """Analyze source code complexity and maintainability."""
    from source_analysis import SourceAnalysisRunner
    
    results = run_with_progress(SourceAnalysisRunner(), frameworks, 1, detailed, save)
    if not results:
        return
    
    # Show final summary
    successful, failed = [r for r in results if r.success], [r for r in results if not r.success]
    if failed:
        show_error(f"{len(failed)} frameworks failed source code analysis")
    else:
        show_success(f"Source code analysis completed for {len(successful)} frameworks")


@cli.command()
@click.option('--frameworks', '-f', help='Comma-separated list of frameworks to benchmark')
@click.option('--detailed', '-d', is_flag=True, help='Show detailed results')
@click.option('--save', '-s', is_flag=True, default=True, help='Save results to file')
@click.option('--executions', '-e', default=1, type=int, help='Number of times to run each benchmark (for averaging)')
def build_time(frameworks: str, detailed: bool, save: bool, executions: int):
    """Measure build time and output size for frameworks."""
    from build_time import BuildTimeRunner
    
    results = run_with_progress(BuildTimeRunner(clean_build=True), frameworks, executions, detailed, save)
    if not results:
        return
    
    # Show final summary
    successful, failed = [r for r in results if r.success], [r for r in results if not r.success]
    if failed:
        show_error(f"{len(failed)} frameworks failed build time measurement")
    else:
        show_success(f"Build time measurement completed for {len(successful)} frameworks")


@cli.command()
@click.option('--frameworks', '-f', help='Comma-separated list of frameworks to benchmark')
@click.option('--detailed', '-d', is_flag=True, help='Show detailed results')
@click.option('--save', '-s', is_flag=True, default=True, help='Save results to file')
@click.option('--executions', '-e', default=1, type=int, help='Number of times to run each benchmark (for averaging)')
def dev_server(frameworks: str, detailed: bool, save: bool, executions: int):
    """Measure dev server startup time and HMR speed."""
    from dev_server import DevServerRunner
    
    results = run_with_progress(DevServerRunner(), frameworks, executions, detailed, save)
    if not results:
        return
    
    # Show final summary
    successful, failed = [r for r in results if r.success], [r for r in results if not r.success]
    if failed:
        show_error(f"{len(failed)} frameworks failed dev server measurement")
    else:
        show_success(f"Dev server measurement completed for {len(successful)} frameworks")


@cli.command()
@click.option('--frameworks', '-f', help='Comma-separated list of frameworks to benchmark')
@click.option('--detailed', '-d', is_flag=True, help='Show detailed results')
@click.option('--save', '-s', is_flag=True, default=True, help='Save results to file')
@click.option('--executions', '-e', default=1, type=int, help='Number of times to run each benchmark (for averaging)')
def resource_usage(frameworks: str, detailed: bool, save: bool, executions: int):
    """Monitor system resource usage (memory, CPU, browser metrics)."""
    from resource_monitor import ResourceUsageRunner
    
    results = run_with_progress(ResourceUsageRunner(), frameworks, executions, detailed, save)
    if not results:
        return
    
    # Show final summary
    successful, failed = [r for r in results if r.success], [r for r in results if not r.success]
    if failed:
        show_error(f"{len(failed)} frameworks failed resource usage monitoring")
    else:
        show_success(f"Resource usage monitoring completed for {len(successful)} frameworks")


@cli.command()
@click.option('--type', '-t', help='Benchmark types to run (comma-separated: lighthouse,bundle-size,source-analysis,build-time,dev-server,resource-usage)')
@click.option('--frameworks', '-f', help='Comma-separated list of frameworks to benchmark')
@click.option('--detailed', '-d', is_flag=True, help='Show detailed results')
@click.option('--save', '-s', is_flag=True, default=True, help='Save results to file')
@click.option('--executions', '-e', default=1, type=int, help='Number of times to run each benchmark (for averaging)')
def all(type: str, frameworks: str, detailed: bool, save: bool, executions: int):
    """Run all available benchmarks."""
    from lighthouse import LighthouseRunner
    from bundle_size import BundleSizeRunner
    from source_analysis import SourceAnalysisRunner
    from build_time import BuildTimeRunner
    from dev_server import DevServerRunner
    from resource_monitor import ResourceUsageRunner
    
    # Parse and validate benchmark types
    available_types = ['lighthouse', 'bundle-size', 'source-analysis', 'build-time', 'dev-server', 'resource-usage']
    
    if type:
        # Parse comma-separated types and validate
        benchmark_types = [t.strip().lower() for t in type.split(',')]
        invalid_types = [t for t in benchmark_types if t not in available_types]
        if invalid_types:
            console.print(f"❌ Invalid benchmark types: {', '.join(invalid_types)}")
            console.print(f"Available types: {', '.join(available_types)}")
            return
    else:
        benchmark_types = available_types
    
    console.print(f"🚀 Running benchmarks: {', '.join(benchmark_types)}")
    
    all_results = {}
    for benchmark_type in benchmark_types:
        show_subheader(f"Running {benchmark_type.replace('-', ' ').title()} Benchmark")
        
        if benchmark_type == 'lighthouse':
            results = run_with_progress(LighthouseRunner(), frameworks, executions, detailed, save)
        elif benchmark_type == 'bundle-size':
            results = run_with_progress(BundleSizeRunner(), frameworks, 1, detailed, save)
        elif benchmark_type == 'source-analysis':
            results = run_with_progress(SourceAnalysisRunner(), frameworks, 1, detailed, save)
        elif benchmark_type == 'build-time':
            results = run_with_progress(BuildTimeRunner(), frameworks, executions, detailed, save)
        elif benchmark_type == 'dev-server':
            results = run_with_progress(DevServerRunner(), frameworks, executions, detailed, save)
        elif benchmark_type == 'resource-usage':
            results = run_with_progress(ResourceUsageRunner(), frameworks, 1, detailed, save)
        else:
            results = []
        
        all_results[benchmark_type] = results or []
    
    # Final summary
    show_subheader("📊 Overall Benchmark Summary")
    for benchmark_type, results in all_results.items():
        if results:
            successful, failed = [r for r in results if r.success], [r for r in results if not r.success]
            console.print(f"{benchmark_type.replace('-', ' ').title()}: {len(successful)} passed, {len(failed)} failed")
    
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
    console.print()
    console.print("  • [bold]bundle-size[/bold] - Bundle size analysis")
    console.print("    Measures: JavaScript/CSS file sizes, compression ratios")
    console.print("    Metrics: Total size, gzipped size, file counts")
    console.print()
    console.print("  • [bold]source-analysis[/bold] - Source code complexity analysis")
    console.print("    Measures: Code complexity, maintainability, lines of code")
    console.print("    Metrics: Cyclomatic complexity, Halstead metrics, maintainability index")
    console.print()
    console.print("  • [bold]build-time[/bold] - Build time and output size measurement")
    console.print("    Measures: Build execution time, output bundle size")
    console.print("    Metrics: Build duration, output size, build status")
    console.print()
    console.print("  • [bold]dev-server[/bold] - Dev server startup and HMR speed measurement")
    console.print("    Measures: Dev server startup time, hot module reload speed")
    console.print("    Metrics: Startup duration, HMR response time")
    console.print()
    console.print("  • [bold]resource-usage[/bold] - System resource monitoring")
    console.print("    Measures: Memory usage, CPU utilization, browser heap metrics")
    console.print("    Metrics: Memory efficiency, CPU peaks, interaction resource deltas")
    
    console.print("\n💡 Usage examples:")
    console.print("  python benchmark/main.py lighthouse")
    console.print("  python benchmark/main.py bundle-size")
    console.print("  python benchmark/main.py source-analysis")
    console.print("  python benchmark/main.py build-time")
    console.print("  python benchmark/main.py dev-server")
    console.print("  python benchmark/main.py resource-usage")
    console.print("  python benchmark/main.py all")
    console.print("  python benchmark/main.py all --type lighthouse,bundle-size,build-time")
    console.print("  python benchmark/main.py all --type dev-server,build-time")
    console.print("  python benchmark/main.py lighthouse -f react,vue,svelte")
    console.print("  python benchmark/main.py dev-server -e 3 -f react,vue")
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