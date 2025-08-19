#!/usr/bin/env python3
"""Transform benchmark results into manageable formats (TSV and JSON)."""

import sys
from pathlib import Path
from typing import Optional

import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.panel import Panel

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from common import show_header, show_success, show_error

# Import our format modules
from benchmark_results_tsv import create_tsv_from_results
from benchmark_results_json import create_json_from_results

console = Console()

def validate_results_directory(results_dir: Path) -> bool:
    """Validate that benchmark results directory exists and has data."""
    if not results_dir.exists():
        return False
    
    # Check for date directories
    date_dirs = [d for d in results_dir.iterdir() if d.is_dir() and d.name.count('-') == 2]
    return len(date_dirs) > 0

def get_latest_results_info(results_dir: Path) -> dict:
    """Get information about the latest benchmark results."""
    date_dirs = [d for d in results_dir.iterdir() if d.is_dir() and d.name.count('-') == 2]
    if not date_dirs:
        return {}
    
    latest_dir = max(date_dirs, key=lambda d: d.name)
    benchmark_files = [f for f in latest_dir.glob("*.json") if f.name != "index.json"]
    
    return {
        "date": latest_dir.name,
        "total_files": len(benchmark_files),
        "benchmark_types": [f.stem.split('_')[0] for f in benchmark_files],
        "directory": latest_dir
    }

@click.command()
@click.option('--output-dir', '-o', type=click.Path(path_type=Path), 
              help='Output directory (default: benchmark-results/transformed)')
@click.option('--format', '-f', type=click.Choice(['tsv', 'json', 'both']), 
              default='both', help='Output format(s)')
@click.option('--results-dir', '-r', type=click.Path(exists=True, path_type=Path),
              help='Benchmark results directory (default: benchmark-results)')
def main(output_dir: Optional[Path], format: str, results_dir: Optional[Path]):
    """Transform benchmark results into manageable TSV and JSON formats."""
    
    show_header("Benchmark Results Transformer", "Converting raw benchmark data to analysis-ready formats")
    
    # Set default paths
    project_root = Path(__file__).parent.parent.parent
    if results_dir is None:
        results_dir = project_root / "benchmark-results"
    if output_dir is None:
        output_dir = results_dir / "transformed"
    
    # Validate input directory
    if not validate_results_directory(results_dir):
        show_error(f"No valid benchmark results found in {results_dir}")
        console.print("💡 Run benchmarks first: [bold]python scripts/benchmark/main.py all[/bold]")
        sys.exit(1)
    
    # Get latest results info
    latest_info = get_latest_results_info(results_dir)
    
    # Display summary
    info_panel = Panel.fit(
        f"📊 [bold]Latest Results:[/bold] {latest_info['date']}\n"
        f"📁 [bold]Files Found:[/bold] {latest_info['total_files']}\n"
        f"🔧 [bold]Benchmarks:[/bold] {', '.join(set(latest_info['benchmark_types']))}\n"
        f"📂 [bold]Output:[/bold] {output_dir}",
        title="[bold green]Transformation Summary[/bold green]",
        border_style="green"
    )
    console.print(info_panel)
    
    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Transform data with progress tracking
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        
        success_count = 0
        
        if format in ['tsv', 'both']:
            task = progress.add_task("🔄 Generating TSV format...", total=None)
            try:
                tsv_file = output_dir / f"benchmark_results_{latest_info['date']}.tsv"
                create_tsv_from_results(results_dir, tsv_file)
                progress.update(task, description="✅ TSV format generated")
                console.print(f"📄 TSV file: [bold]{tsv_file}[/bold]")
                success_count += 1
            except Exception as e:
                progress.update(task, description="❌ TSV generation failed")
                show_error(f"TSV generation failed: {e}")
        
        if format in ['json', 'both']:
            task = progress.add_task("🔄 Generating JSON format...", total=None)
            try:
                json_file = output_dir / f"benchmark_results_{latest_info['date']}.json"
                create_json_from_results(results_dir, json_file)
                progress.update(task, description="✅ JSON format generated")
                console.print(f"📄 JSON file: [bold]{json_file}[/bold]")
                success_count += 1
            except Exception as e:
                progress.update(task, description="❌ JSON generation failed")
                show_error(f"JSON generation failed: {e}")
    
    # Summary
    if success_count > 0:
        show_success(f"Successfully generated {success_count} format(s)")
        console.print("\n💡 [bold]Next steps:[/bold]")
        console.print("  • Import TSV into spreadsheet software for analysis")
        console.print("  • Use JSON for programmatic data processing")
        console.print("  • Compare framework performance metrics")
    else:
        show_error("No formats were successfully generated")
        sys.exit(1)

if __name__ == "__main__":
    main()