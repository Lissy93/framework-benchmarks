#!/usr/bin/env python3
"""Project setup verification checks."""

import json
import sys
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Tuple

import click
from rich.console import Console
from rich.table import Table

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import get_project_root, get_frameworks_config, show_header, show_success, show_error

console = Console()


class Check:
    """A single verification check."""
    
    def __init__(self, name: str, check_func, fix_suggestion: str):
        self.name = name
        self.check_func = check_func
        self.fix_suggestion = fix_suggestion
    
    def run(self) -> Tuple[bool, str]:
        """Run the check and return success status and fix suggestion."""
        try:
            return self.check_func(), self.fix_suggestion
        except Exception:
            return False, self.fix_suggestion


def check_node_version() -> bool:
    """Check if Node.js version is 16+."""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version_str = result.stdout.strip().lstrip('v')
            major = int(version_str.split('.')[0])
            return major >= 16
    except (subprocess.SubprocessError, ValueError):
        pass
    return False


def check_root_node_modules() -> bool:
    """Check if root node_modules exists."""
    return (get_project_root() / "node_modules").exists()


def check_frameworks_config() -> bool:
    """Check if frameworks.json exists and has valid structure."""
    try:
        config = get_frameworks_config()
        return len(config.get("frameworks", [])) > 0
    except Exception:
        return False


def check_eslint_config() -> bool:
    """Check if ESLint configuration exists."""
    project_root = get_project_root()
    return (project_root / "eslint.config.js").exists() or (project_root / "eslint.config.mjs").exists()


def check_mock_data() -> bool:
    """Check if mock data exists in assets directory."""
    return (get_project_root() / "assets" / "mocks" / "weather-data.json").exists()


def check_framework_apps_synced() -> bool:
    """Check if all framework apps have synced assets."""
    try:
        config = get_frameworks_config()
        project_root = get_project_root()
        
        for framework in config.get("frameworks", []):
            fw_id = framework.get("id")
            if not fw_id:
                continue
                
            app_path = project_root / "apps" / fw_id
            asset_dir = framework.get("assetsDir", "public")
            
            # Check for mock data in the appropriate location
            mock_path = app_path / asset_dir / "mocks" / "weather-data.json"
            if not mock_path.exists():
                return False
        return True
    except Exception:
        return False


def check_framework_dependencies() -> bool:
    """Check if framework apps with node_modules have dependencies installed."""
    try:
        config = get_frameworks_config()
        project_root = get_project_root()
        
        for framework in config.get("frameworks", []):
            if framework.get("hasNodeModules", False):
                fw_id = framework.get("id")
                if fw_id and not (project_root / "apps" / fw_id / "node_modules").exists():
                    return False
        return True
    except Exception:
        return False


def check_playwright_installed() -> bool:
    """Check if Playwright is available."""
    try:
        subprocess.run(['npx', 'playwright', '--version'], capture_output=True, check=True)
        return True
    except (subprocess.SubprocessError, FileNotFoundError):
        return False


def check_test_configurations() -> bool:
    """Check if test configuration files exist."""
    project_root = get_project_root()
    configs = [
        project_root / "playwright.config.js",
        project_root / "tests" / "config" / "playwright.config.base.js"
    ]
    return any(config.exists() for config in configs)


def check_assets_structure() -> bool:
    """Check if assets directory has required structure."""
    project_root = get_project_root()
    required_dirs = [
        project_root / "assets" / "icons",
        project_root / "assets" / "styles", 
        project_root / "assets" / "mocks"
    ]
    return all(dir_path.exists() for dir_path in required_dirs)


def check_package_json_scripts() -> bool:
    """Check if package.json has required scripts."""
    try:
        package_json = get_project_root() / "package.json"
        with open(package_json) as f:
            data = json.load(f)
        
        scripts = data.get("scripts", {})
        required = ["setup:all", "sync-assets", "generate-mocks"]
        return all(script in scripts for script in required)
    except Exception:
        return False


def get_all_checks() -> List[Check]:
    """Get all verification checks."""
    return [
        Check("Node.js version (16+)", check_node_version, "Update to Node.js 16+"),
        Check("Root node_modules", check_root_node_modules, "npm install"),
        Check("Framework configuration", check_frameworks_config, "Check frameworks.json exists and has valid structure"),
        Check("ESLint configuration", check_eslint_config, "Check eslint.config.js exists"),
        Check("Mock data present", check_mock_data, "npm run generate-mocks"),
        Check("Framework apps synced", check_framework_apps_synced, "npm run sync-assets"),
        Check("Framework dependencies", check_framework_dependencies, "npm run setup:all"),
        Check("Playwright installed", check_playwright_installed, "npm run install:playwright"),
        Check("Test configurations", check_test_configurations, "Test configuration files missing"),
        Check("Assets directory structure", check_assets_structure, "npm run sync-assets"),
        Check("Package.json scripts", check_package_json_scripts, "npm run generate-scripts")
    ]


@click.command()
def check():
    """Verify project setup and configuration."""
    show_header("Project Setup Verification", "Checking project configuration and dependencies")
    
    checks = get_all_checks()
    results = []
    
    table = Table(show_header=False, box=None, padding=(0, 2))
    table.add_column("Status", style="bold")
    table.add_column("Check", style="white")
    table.add_column("Fix", style="dim blue")
    
    for check_item in checks:
        passed, fix_suggestion = check_item.run()
        status_icon = "✅" if passed else "❌"
        fix_text = "" if passed else f"💡 {fix_suggestion}"
        
        table.add_row(status_icon, check_item.name, fix_text)
        results.append((check_item.name, passed))
    
    console.print(table)
    
    failed_count = sum(1 for _, passed in results if not passed)
    
    console.print()
    if failed_count == 0:
        show_success("All checks passed! Project is ready to go 🌞")
    else:
        show_error(f"{failed_count} check{'s' if failed_count > 1 else ''} failed")
        console.print("💡 Run suggested commands to fix issues", style="blue")
        sys.exit(1)


if __name__ == "__main__":
    check()