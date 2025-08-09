"""Generate package.json scripts from frameworks configuration."""

import json
from pathlib import Path
from typing import Dict, Any

import click

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from common import (
    get_project_root, get_frameworks_config,
    show_header, show_success, show_error, show_info
)


class ScriptGenerator:
    """Generate npm scripts for framework apps."""
    
    def __init__(self, frameworks_config: Dict[str, Any]):
        """Initialize with frameworks configuration."""
        self.frameworks_config = frameworks_config
        
    def generate_framework_scripts(self) -> Dict[str, str]:
        """Generate scripts for all frameworks."""
        scripts = {}
        frameworks = self.frameworks_config.get("frameworks", [])
        
        for framework in frameworks:
            framework_id = framework.get("id")
            if not framework_id:
                continue
                
            # Development scripts
            if "devCommand" in framework:
                dev_command = framework['devCommand']
                # Use npx for common tools that might not be globally available
                if dev_command.startswith(('vite', 'ng serve')):
                    dev_command = f"npx {dev_command}"
                scripts[f"dev:{framework_id}"] = f"cd apps/{framework_id} && {dev_command}"
            
            # Build scripts
            if "buildCommand" in framework:
                build_command = framework['buildCommand']
                # Use npx for common build tools
                if build_command.startswith(('vite', 'ng')):
                    build_command = f"npx {build_command}"
                scripts[f"build:{framework_id}"] = f"cd apps/{framework_id} && {build_command}"
            
            # Test scripts
            if "testCommand" in framework:
                scripts[f"test:{framework_id}"] = f"npx playwright test --config=tests/config/playwright-{framework_id}.config.js --reporter=list"
            
            # Lint scripts
            if "lintCommand" in framework:
                scripts[f"lint:{framework_id}"] = f"cd apps/{framework_id} && {framework['lintCommand']}"
        
        # Meta scripts
        framework_ids = [fw["id"] for fw in frameworks if "id" in fw]
        scripts.update({
            "dev:all": " && ".join([f"npm run dev:{name}" for name in framework_ids]),
            "build:all": " && ".join([f"npm run build:{name}" for name in framework_ids]),
            "test:all": " && ".join([f"npm run test:{name}" for name in framework_ids]),
            "lint:all": " && ".join([f"npm run lint:{name}" for name in framework_ids if f"lint:{name}" in scripts])
        })
        
        return scripts
    
    def update_package_json(self, new_scripts: Dict[str, str]) -> bool:
        """Update the root package.json with generated scripts."""
        project_root = get_project_root()
        package_json_path = project_root / "package.json"
        
        try:
            # Read existing package.json
            with open(package_json_path, "r") as f:
                package_data = json.load(f)
            
            # Update scripts section
            existing_scripts = package_data.get("scripts", {})
            
            # Keep non-generated scripts (those not matching our patterns)
            preserved_scripts = {
                key: value for key, value in existing_scripts.items()
                if not self._is_generated_script(key)
            }
            
            # Merge with new scripts
            package_data["scripts"] = {**preserved_scripts, **new_scripts}
            
            # Write back to file
            with open(package_json_path, "w") as f:
                json.dump(package_data, f, indent=2)
                f.write("\n")  # Add trailing newline
            
            return True
            
        except Exception as e:
            show_error(f"Failed to update package.json: {e}")
            return False
    
    def _is_generated_script(self, script_name: str) -> bool:
        """Check if a script name appears to be auto-generated."""
        patterns = [
            "dev:", "build:", "test:", "lint:",
            ":all", "serve:production", "sync-assets", 
            "generate-scripts", "generate-mocks", "check", "verify"
        ]
        # Exact matches for verify scripts
        if script_name in ["check", "test", "lint", "verify"]:
            return True
        return any(pattern in script_name for pattern in patterns)


@click.command()
def generate_scripts():
    """Generate npm scripts based on frameworks configuration."""
    show_header("Script Generator", "Creating npm scripts from frameworks.json")
    
    frameworks_config = get_frameworks_config()
    generator = ScriptGenerator(frameworks_config)
    
    # Generate new scripts
    show_info("Generating scripts for all frameworks...")
    new_scripts = generator.generate_framework_scripts()
    
    # Add setup and utility scripts
    new_scripts.update({
        "sync-assets": "cd scripts && python setup/sync_assets.py",
        "generate-mocks": "cd scripts && python setup/generate_mocks.py", 
        "generate-scripts": "cd scripts && python setup/generate_scripts.py",
        "install-deps": "cd scripts && python setup/install_deps.py",
        "setup:all": "cd scripts && python setup/main.py",
        "serve:production": "node scripts/performance/production-server.js",
        
        # Verification scripts
        "check": "cd scripts && python verify/check.py",
        "test": "cd scripts && python verify/test.py", 
        "lint": "cd scripts && python verify/lint.py",
        "verify": "cd scripts && python verify/main.py"
    })
    
    # Update package.json
    show_info("Updating package.json...")
    success = generator.update_package_json(new_scripts)
    
    if success:
        show_success(f"Generated {len(new_scripts)} scripts in package.json")
    else:
        show_error("Failed to update package.json")


if __name__ == "__main__":
    generate_scripts()
