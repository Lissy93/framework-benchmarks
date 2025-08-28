"""Main entry point for setup scripts - runs all setup tasks."""

import click
from rich.console import Console

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from common import show_header, show_success
from setup.sync_assets import sync_assets
from setup.generate_mocks import generate_mocks  
from setup.generate_scripts import generate_scripts
from setup.install_deps import install_deps
from run.build import build_all

console = Console()


@click.command()
@click.option("--skip-assets", is_flag=True, help="Skip asset synchronization")
@click.option("--skip-mocks", is_flag=True, help="Skip mock data generation")
@click.option("--skip-scripts", is_flag=True, help="Skip script generation")
@click.option("--skip-deps", is_flag=True, help="Skip dependency installation")
@click.option("--skip-build", is_flag=True, help="Skip building frameworks")
def setup_all(skip_assets: bool, skip_mocks: bool, skip_scripts: bool, skip_deps: bool, skip_build: bool):
    """Run all setup tasks for the Weather Front project."""
    show_header("Weather Front Setup", "Running all project setup and management tasks")
    
    tasks = []
    
    if not skip_scripts:
        tasks.append(("Generating npm scripts", generate_scripts))
    
    if not skip_mocks:
        tasks.append(("Generating mock data", generate_mocks))
    
    if not skip_assets:
        tasks.append(("Syncing assets", sync_assets))
    
    if not skip_deps:
        tasks.append(("Installing framework dependencies", install_deps))
    
    if not skip_build:
        tasks.append(("Building all frameworks", build_all))
    
    for task_name, task_func in tasks:
        console.print(f"\n🔧 {task_name}...")
        try:
            # Call the click command with appropriate arguments
            if task_func == install_deps:
                task_func.callback(force=False)
            elif task_func == generate_scripts:
                task_func.callback(dry_run=False, verbose=False)
            elif task_func == build_all:
                task_func.callback(parallel=False, framework=None, ci=False, skip_website=False, static_site=False)
            else:
                task_func.callback()
        except Exception as e:
            console.print(f"❌ Failed: {e}", style="red")
            continue
    
    show_success("All setup tasks completed!")
    console.print("\n💡 Next steps:", style="bold cyan")
    console.print("  • Run `npm run verify` to check everything is working")
    console.print("  • Run `npm start` to serve all frameworks")
    console.print("  • Run performance tests with your built applications")


if __name__ == "__main__":
    setup_all()
