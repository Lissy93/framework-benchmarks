#!/usr/bin/env python3
"""Generate organized package.json scripts from frameworks configuration."""

import json
import sys
import time
from collections import OrderedDict
from pathlib import Path
from typing import Dict, Any, List

import click
from rich.console import Console
from rich.table import Table

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import (
    get_project_root, get_frameworks_config,
    show_header, show_success, show_error, show_info
)

console = Console()

ESSENTIAL_COMMANDS = OrderedDict([
    ("help", "node scripts"),
    ("setup", "cd scripts && python setup/main.py"),
    ("test", "cd scripts && python verify/test.py"),
    ("lint", "cd scripts && python verify/lint.py"), 
    ("build", "npm run build:all"),
    ("start", "npm run dev:all")
])

SECTION_HEADERS = [
    ("// DEV COMMANDS", "-------------------------------------------------------"),
    ("// BUILD COMMANDS", "-----------------------------------------------------"),
    ("// TEST COMMANDS", "------------------------------------------------------"),
    ("// LINT COMMANDS", "------------------------------------------------------"),
    ("// MISC SCRIPTS", "--------------------------------------------------------")
]

class ScriptOrganizer:
    def __init__(self, config: Dict[str, Any]):
        self.frameworks = config.get("frameworks", [])
        self.framework_ids = sorted([fw["id"] for fw in self.frameworks if "id" in fw])
        cfg = config.get("config", {})
        self.app_dir = cfg.get("appDir", "apps")
        self.test_config_dir = cfg.get("testConfigDir", "tests/config")
        self.test_reporter = cfg.get("testReporter", "list")
        self.misc_scripts = cfg.get("miscScripts", [])
    
    def _build_command(self, fw_id: str, base_cmd: str, use_npx: bool = True) -> str:
        """Build command with proper directory and npx prefix."""
        prefix = f"cd {self.app_dir}/{fw_id} && "
        if use_npx and base_cmd.startswith(('vite', 'ng')):
            return f"{prefix}npx {base_cmd}"
        return f"{prefix}{base_cmd}"
    
    def _get_lint_pattern(self, lint_files: List[str]) -> str:
        """Generate eslint file pattern from lint file extensions."""
        return f"**/*.{{{','.join(lint_files)}}}" if len(lint_files) > 1 else f"**/*.{lint_files[0]}"
    
    def generate_framework_commands(self, command_type: str) -> OrderedDict[str, str]:
        """Generate commands for all frameworks of a specific type."""
        commands = OrderedDict()
        valid_frameworks = [fw for fw in self.frameworks if fw.get("id")]
        
        # Add :all command first
        if command_type == "lint":
            frameworks_with_lint = [fw["id"] for fw in valid_frameworks if fw.get("lintFiles")]
            commands["lint:all"] = " && ".join([f"npm run lint:{fw_id}" for fw_id in sorted(frameworks_with_lint)])
        else:
            commands[f"{command_type}:all"] = " && ".join([f"npm run {command_type}:{fw_id}" for fw_id in self.framework_ids])
        
        # Add individual framework commands
        for framework in sorted(valid_frameworks, key=lambda x: x["id"]):
            fw_id = framework["id"]
            
            if command_type == "dev" and framework.get("devCommand"):
                commands[f"dev:{fw_id}"] = self._build_command(fw_id, framework["devCommand"], "python" not in framework["devCommand"])
            elif command_type == "build" and framework.get("buildCommand"):
                commands[f"build:{fw_id}"] = self._build_command(fw_id, framework["buildCommand"])
            elif command_type == "test":
                commands[f"test:{fw_id}"] = f"npx playwright test --config={self.test_config_dir}/playwright-{fw_id}.config.js --reporter={self.test_reporter}"
            elif command_type == "lint" and framework.get("lintFiles"):
                pattern = self._get_lint_pattern(framework["lintFiles"])
                commands[f"lint:{fw_id}"] = f"eslint '{self.app_dir}/{fw_id}/{pattern}'"
        
        return commands
    
    def build_all_scripts(self) -> OrderedDict[str, str]:
        """Build complete organized scripts section."""
        scripts = OrderedDict(ESSENTIAL_COMMANDS)
        
        command_sections = [
            self.generate_framework_commands("dev"),
            self.generate_framework_commands("build"),
            self.generate_framework_commands("test"),
            self.generate_framework_commands("lint"),
            OrderedDict((script["name"], script["command"]) for script in self.misc_scripts)
        ]
        
        for i, commands in enumerate(command_sections):
            scripts[SECTION_HEADERS[i][0]] = SECTION_HEADERS[i][1]
            scripts.update(commands)
        
        return scripts
    
    def calculate_counts(self, scripts: OrderedDict[str, str]) -> List[int]:
        """Calculate actual counts for each script category."""
        counts = [len(ESSENTIAL_COMMANDS)]
        current_count = 0
        in_section = False
        
        for key in scripts.keys():
            if key.startswith("//"):
                if in_section:
                    counts.append(current_count)
                current_count = 0
                in_section = True
            elif in_section:
                current_count += 1
        
        if in_section:
            counts.append(current_count)
        
        return counts
    
    def update_package_json(self, scripts: OrderedDict[str, str]) -> bool:
        """Update package.json with organized scripts."""
        try:
            package_path = get_project_root() / "package.json"
            with open(package_path, "r") as f:
                data = json.load(f)
            
            data["scripts"] = scripts
            
            with open(package_path, "w") as f:
                json.dump(data, f, indent=2)
                f.write("\n")
            return True
        except Exception as e:
            show_error(f"Failed to update package.json: {e}")
            return False


@click.command()
@click.option("--dry-run", is_flag=True, help="Show what would be generated without writing")
@click.option("--verbose", is_flag=True, help="Show detailed progress")
def generate_scripts(dry_run: bool, verbose: bool):
    """Generate organized package.json scripts from frameworks configuration."""
    show_header("Package.json Script Generator", "Creating organized scripts from frameworks.json")
    
    start_time = time.time()
    
    try:
        show_info("Loading frameworks configuration...")
        config = get_frameworks_config()
        framework_count = len(config.get("frameworks", []))
        
        if verbose:
            console.print(f"   [dim]Found {framework_count} frameworks[/]")
        
        organizer = ScriptOrganizer(config)
        show_info("Generating scripts...")
        scripts = organizer.build_all_scripts()
        
        # Show summary
        script_count = len([k for k in scripts.keys() if not k.startswith('//')])
        console.print()
        
        table = Table(show_header=True, header_style="bold cyan")
        table.add_column("Category", style="bold")
        table.add_column("Count", justify="center")
        
        categories = ["Essential", "Dev", "Build", "Test", "Lint", "Misc"]
        counts = organizer.calculate_counts(scripts)
        
        for cat, count in zip(categories, counts):
            table.add_row(f"{cat} Commands", str(count))
        
        console.print(table)
        
        if dry_run:
            console.print(f"\n[yellow]DRY RUN[/] - Generated {script_count} scripts (not saved)")
        else:
            show_info("Updating package.json...")
            success = organizer.update_package_json(scripts)
            
            if success:
                duration = time.time() - start_time
                show_success(f"Organized {script_count} scripts in package.json ({duration:.1f}s)")
            else:
                show_error("Failed to update package.json")
                
    except KeyboardInterrupt:
        console.print("\n[yellow]Interrupted[/]")
        sys.exit(1)
    except Exception as e:
        show_error(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    generate_scripts()