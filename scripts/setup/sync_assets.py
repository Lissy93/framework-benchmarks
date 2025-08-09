"""
Sync assets across all framework apps.
All shared assets (styles, images, fonts, etc) are stored in ./assets
This script then copies them to each framework's source.
This is usually within ./apps/[app-name]/public
but can be customized with the `assetsDir` config option in frameworks.json
"""

import shutil
from pathlib import Path
from typing import Dict, Any

import click
from rich.progress import Progress, SpinnerColumn, TextColumn

import sys
from pathlib import Path
import time
sys.path.append(str(Path(__file__).parent.parent))

from common import (
    console, get_project_root, get_config, get_frameworks,
    show_header, show_success, show_error, get_framework_asset_dir
)


def sync_app_assets(app_name: str, app_path: Path, assets_dir: Path, frameworks: list) -> bool:
    """Sync assets for a single app."""
    try:
        # Get framework-specific asset directory
        asset_dir_name = get_framework_asset_dir(app_name, {"frameworks": frameworks})
        app_asset_path = app_path / asset_dir_name
        
        # Create asset directory if it doesn't exist
        app_asset_path.mkdir(exist_ok=True)
        
        # Copy all assets
        for item in assets_dir.iterdir():
            if item.is_file():
                target = app_asset_path / item.name
                shutil.copy2(item, target)
            elif item.is_dir():
                target = app_asset_path / item.name
                if target.exists():
                    shutil.rmtree(target)
                shutil.copytree(item, target)
        
        return True
    except Exception as e:
        show_error(f"Failed to sync assets for {app_name}: {e}")
        return False


@click.command()
def sync_assets():
    """Sync assets from the global assets directory to all framework apps."""
    show_header("Asset Sync", "Copying shared assets to all framework applications")
    
    project_root = get_project_root()
    config = get_config()
    frameworks = get_frameworks()
    
    # Get directory configuration
    directories = config.get("directories", {})
    assets_dir_name = directories.get("assetsDir", "assets")
    apps_dir_name = directories.get("appDir", "apps")
    
    assets_dir = project_root / assets_dir_name
    apps_dir = project_root / apps_dir_name
    
    # Get UI configuration
    ui_config = config.get("ui", {})
    progress_delay = ui_config.get("progressDelay", 0.25)
    
    if not assets_dir.exists():
        show_error(f"Assets directory not found: {assets_dir}")
        return
    
    framework_ids = [fw["id"] for fw in frameworks]
    failed_apps = []
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        tasks = {}
        for framework in framework_ids:
            task = progress.add_task(f"🔄️ Syncing {framework}...", total=1)
            tasks[framework] = task
            time.sleep(progress_delay)
            app_path = apps_dir / framework
            if not app_path.exists():
                show_error(f"App directory not found: {app_path}")
                failed_apps.append(framework)
                progress.update(task, description=f"❌ {framework} (failed)", completed=1)
                continue

            success = sync_app_assets(framework, app_path, assets_dir, frameworks)
            if not success:
                failed_apps.append(framework)
                progress.update(task, description=f"❌ {framework} (failed)", completed=1)
            else:
                progress.update(task, description=f"✔️ Synced {framework}", completed=1)
    
    # Summary
    success_count = len(frameworks) - len(failed_apps)
    show_success(f"Successfully synced assets for {success_count}/{len(frameworks)} apps")
    
    if failed_apps:
        show_error(f"Failed to sync: {', '.join(failed_apps)}")


if __name__ == "__main__":
    sync_assets()
