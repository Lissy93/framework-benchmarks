#!/usr/bin/env python3
"""Install dependencies for all framework applications."""

import sys
import time
from pathlib import Path
from typing import List

import click
from rich.progress import Progress, SpinnerColumn, TextColumn

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import (
    get_project_root, get_frameworks_config,
    show_header, show_success, show_error, show_info, run_command
)


@click.command()
@click.option("--force", is_flag=True, help="Force reinstall even if node_modules exists")
def install_deps(force: bool):
    """Install dependencies for all framework applications."""
    show_header("Framework Dependencies", "Install framework-specific dependencies for each app")
    
    project_root = get_project_root()
    config = get_frameworks_config()
    frameworks = [fw for fw in config.get("frameworks", [])]
    
    if not frameworks:
        show_info("No frameworks require node dependencies")
        return
    
    failed_installs = []
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
    ) as progress:
        tasks = {}
        for framework in frameworks:
            fw_name = framework.get("name", framework.get("id"))
            fw_id = framework.get("id")
            time.sleep(0.25)
            
            if not fw_id:
                continue
            
            app_path = project_root / "apps" / fw_id
            task = progress.add_task(f"Installing {fw_name} dependencies...", total=1)
            tasks[fw_name] = task

            build_config = framework.get("build", {})
            if not build_config.get("hasNodeModules", False):
                progress.update(task, description=f"⏭️ {fw_name} (skipping, no dependencies)", completed=1)
                continue

            if not app_path.exists():
                show_error(f"App directory not found: {app_path}")
                failed_installs.append(fw_name)
                progress.update(task, description=f"❌ {fw_name} (app not found)", completed=1)
                continue
            
            node_modules = app_path / "node_modules"
            package_json = app_path / "package.json"
            
            if not package_json.exists():
                show_error(f"No package.json found in {fw_name}")
                failed_installs.append(fw_name)
                progress.update(task, description=f"❌ {fw_name} (no package.json)", completed=1)
                continue
            
            # Skip if node_modules exists and not forcing
            if node_modules.exists() and not force:
                progress.update(task, description=f"⏭️ {fw_name} (already installed)", completed=1)
                continue
            
            # Install dependencies
            success, output = run_command(['npm', 'install'], cwd=app_path)
            
            if success:
                progress.update(task, description=f"✔️ {fw_name} dependencies installed", completed=1)
            else:
                show_error(f"❌ Failed to install {fw_name} dependencies")
                if output:
                    show_error(f"Error: {output[:200]}...")
                failed_installs.append(fw_name)
                progress.update(task, description=f"❌ {fw_name} (install failed)", completed=1)
    
    # Summary
    success_count = len(frameworks) - len(failed_installs)
    show_info(f"Dependencies installed for {success_count}/{len(frameworks)} frameworks")
    
    if failed_installs:
        show_error(f"Failed to install dependencies for: {', '.join(failed_installs)}")
        sys.exit(1)
    else:
        show_success("All framework dependencies installed successfully! 🎉")


if __name__ == "__main__":
    install_deps()
