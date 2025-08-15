#!/usr/bin/env python3
"""Main entrypoint for all benchmark operations."""

import sys
from pathlib import Path

import click
from rich.console import Console

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import show_header, show_success, show_error, show_subheader

console = Console()


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
def lighthouse(frameworks: str, detailed: bool, save: bool):
    """Run Lighthouse performance audits."""
    from lighthouse import LighthouseRunner
    
    runner = LighthouseRunner()
    
    # Parse frameworks
    framework_list = None
    if frameworks:
        framework_list = [f.strip() for f in frameworks.split(',')]
    
    # Run benchmarks
    results = runner.run_all_frameworks(framework_list)
    
    if not results:
        show_error("No benchmark results generated")
        return
    
    # Display summary
    runner.display_summary()
    
    # Display detailed results if requested
    if detailed:
        runner.display_detailed_results()
    
    # Save results
    if save:
        output_path = runner.save_results()
        console.print(f"💾 Results saved to: {output_path}")
    
    # Show final summary
    successful = [r for r in results if r.success]
    failed = [r for r in results if not r.success]
    
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
def all(type: str, frameworks: str, detailed: bool, save: bool):
    """Run all available benchmarks."""
    
    # For now, only lighthouse is available
    benchmark_types = ['lighthouse']
    if type:
        benchmark_types = [type]
    
    console.print(f"🚀 Running benchmarks: {', '.join(benchmark_types)}")
    
    all_results = {}
    
    for benchmark_type in benchmark_types:
        show_subheader(f"Running {benchmark_type.title()} Benchmark")
        
        if benchmark_type == 'lighthouse':
            from lighthouse import LighthouseRunner
            
            runner = LighthouseRunner()
            
            # Parse frameworks
            framework_list = None
            if frameworks:
                framework_list = [f.strip() for f in frameworks.split(',')]
            
            # Run benchmarks
            results = runner.run_all_frameworks(framework_list)
            all_results[benchmark_type] = results
            
            if results:
                # Display summary
                runner.display_summary()
                
                # Display detailed results if requested
                if detailed:
                    runner.display_detailed_results()
                
                # Save results
                if save:
                    output_path = runner.save_results()
                    console.print(f"💾 {benchmark_type.title()} results saved to: {output_path}")
    
    # Final summary across all benchmarks
    show_subheader("📊 Overall Benchmark Summary")
    
    for benchmark_type, results in all_results.items():
        if results:
            successful = [r for r in results if r.success]
            failed = [r for r in results if not r.success]
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