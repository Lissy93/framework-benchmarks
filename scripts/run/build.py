#!/usr/bin/env python3
"""Build all framework applications with progress tracking."""

import subprocess
import sys
from pathlib import Path
from typing import Tuple
import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

sys.path.append(str(Path(__file__).parent.parent))
from common import get_config, get_frameworks, show_header

console = Console()

def build_framework(framework_id: str, framework_data: dict, app_dir: Path) -> Tuple[bool, str]:
    """Build a single framework application."""
    build_config = framework_data.get("build", {})
    command = build_config.get("buildCommand")
    
    if not command or "echo" in command:
        return True, "No build step required"
    
    framework_path = app_dir / framework_id
    if not framework_path.exists():
        return False, f"Directory not found"
    
    try:
        # Use npm run build for most frameworks
        cmd = ["npm", "run", "build"] if command in ["vite build", "ng build"] else command
        result = subprocess.run(
            cmd,
            shell=isinstance(cmd, str),
            cwd=framework_path,
            capture_output=True, 
            text=True, 
            timeout=120
        )
        if result.returncode == 0:
            return True, "Build successful"
        else:
            error = result.stderr.strip()[:50] + "..." if result.stderr else "Unknown error"
            return False, f"Build failed: {error}"
    except subprocess.TimeoutExpired:
        return False, "Build timeout (>2min)"
    except Exception:
        return False, "Build command failed"

@click.command()
@click.option('--parallel', '-p', is_flag=True, help='Build frameworks in parallel (not implemented)')
@click.option('--framework', '-f', help='Build a single framework by ID')
@click.option('--ci', is_flag=True, help='CI mode: exit 1 on build failure, minimal output')
@click.option('--skip-website', is_flag=True, help='Skip building the website after frameworks')
@click.option('--for-comparison', is_flag=True, help='Build frameworks with absolute paths for comparison website')
def build_all(parallel: bool, framework: str, ci: bool, skip_website: bool, for_comparison: bool):
    """Build framework applications."""
    show_header("Build Apps", "Compile all framework applications to generate static dist")

    # Use comparison build script if requested
    if for_comparison:
        console.print("[bold]Building frameworks for comparison website...[/bold]")
        try:
            comparison_script = Path(__file__).parent / "set-base-hrefs.js"
            if comparison_script.exists():
                result = subprocess.run(["node", str(comparison_script)])
                if result.returncode == 0:
                    console.print("[green]✓ All frameworks built for comparison[/green]")
                    if not skip_website:
                        console.print(f"\n[bold]Building website...[/bold]")
                        build_website_script = Path(__file__).parent / "build_website.py"
                        if build_website_script.exists():
                            result = subprocess.run([sys.executable, str(build_website_script), "--verbose"])
                            if result.returncode == 0:
                                console.print("[green]✓ Website built successfully[/green]")
                            else:
                                console.print("[red]✗ Website build failed[/red]")
                    return
                else:
                    console.print("[red]✗ Comparison build failed[/red]")
                    if ci:
                        sys.exit(1)
                    return
            else:
                console.print("[red]✗ Comparison build script not found[/red]")
                if ci:
                    sys.exit(1)
                return
        except Exception as e:
            console.print(f"[red]✗ Comparison build error: {str(e)[:100]}[/red]")
            if ci:
                sys.exit(1)
            return

    config = get_config()
    frameworks = get_frameworks()
    app_dir = Path(config.get("directories", {}).get("appDir", "apps"))
    
    # Filter to single framework if specified
    if framework:
        frameworks = [fw for fw in frameworks if fw.get("id") == framework]
        if not frameworks:
            console.print(f"[red]Framework '{framework}' not found[/red]")
            sys.exit(1)
    
    if not ci:
        console.print(f"[bold]Building {len(frameworks)} framework{'s' if len(frameworks) != 1 else ''}...[/bold]")
    
    results = {}
    
    if ci and len(frameworks) == 1:
        # CI mode for single framework - simple output
        framework_data = frameworks[0]
        framework_id = framework_data.get("id")
        success, message = build_framework(framework_id, framework_data, app_dir)
        console.print(f"Build {framework_id}: {message}")
        sys.exit(0 if success else 1)
    else:
        # Normal mode with progress
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            
            for framework_data in frameworks:
                framework_id = framework_data.get("id")
                if not framework_id:
                    continue
                    
                task = progress.add_task(f"Building {framework_id}...", total=None)
                success, message = build_framework(framework_id, framework_data, app_dir)
                results[framework_id] = (success, message)
                
                status = "[green]✓[/green]" if success else "[red]✗[/red]"
                progress.update(task, description=f"{status} {framework_id} - {message}")
        
        # Summary
        successful = sum(1 for success, _ in results.values() if success)
        total = len(results)
        
        if successful == total:
            console.print(f"[bold green]All {total} frameworks built successfully![/bold green]")
        else:
            console.print(f"[bold yellow]{successful}/{total} frameworks built successfully[/bold yellow]")
            for fw, (success, message) in results.items():
                if not success:
                    console.print(f"[red]Failed: {fw} - {message}[/red]")
        
        if ci and successful != total:
            sys.exit(1)
    
    # Build website if not skipped and frameworks built successfully
    if not skip_website and not framework:  # Only build website when building all frameworks
        if successful == total:
            console.print(f"\n[bold]Building website...[/bold]")
            try:
                build_website_script = Path(__file__).parent / "build_website.py"
                if build_website_script.exists():
                    result = subprocess.run([sys.executable, str(build_website_script), "--verbose"])
                    if result.returncode == 0:
                        console.print("[green]✓ Website built successfully[/green]")
                    else:
                        console.print("[red]✗ Website build failed[/red]")
                else:
                    console.print("[yellow]⚠ build_website.py not found, skipping website build[/yellow]")
            except Exception as e:
                console.print(f"[red]✗ Website build error: {str(e)[:100]}[/red]")
                if ci:
                    sys.exit(1)
        else:
            console.print("[yellow]⚠ Skipping website build due to framework build failures[/yellow]")

if __name__ == '__main__':
    build_all()
