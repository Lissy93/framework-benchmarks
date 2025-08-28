#!/usr/bin/env python3
"""Main entry point for verification scripts - runs all verification tasks."""

import sys
from pathlib import Path

import click
from rich.console import Console

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import show_success

# Import verification functions
from verify.check import check
from verify.test import test
from verify.lint import lint
from verify.validate_schemas import validate_schemas

console = Console()

@click.command()
@click.option("--skip-check", is_flag=True, help="Skip project setup verification")
@click.option("--skip-schemas", is_flag=True, help="Skip schema validation")
@click.option("--skip-test", is_flag=True, help="Skip test execution") 
@click.option("--skip-lint", is_flag=True, help="Skip linting checks")
def verify_all(skip_check: bool, skip_schemas: bool, skip_test: bool, skip_lint: bool):
    """Run all verification tasks for the Weather Front project."""    
    tasks = []
    
    if not skip_check:
        tasks.append(("Project setup verification", check))
    
    if not skip_schemas:
        tasks.append(("Schema validation", validate_schemas))
    
    if not skip_test:
        tasks.append(("Test execution", test))
    
    if not skip_lint:
        tasks.append(("Linting checks", lint))
    
    for task_name, task_func in tasks:
        try:
            # Call the click command with appropriate arguments
            if task_func == validate_schemas:
                task_func.callback(verbose=False)
            else:
                task_func.callback()
        except SystemExit as e:
            if e.code != 0:
                console.print(f"❌ {task_name} failed", style="red")
                sys.exit(1)
        except Exception as e:
            console.print(f"❌ {task_name} failed: {e}", style="red")
            sys.exit(1)
    
    show_success("All verification tasks completed successfully! 🎉")
    console.print("\n💡 Your project is ready:", style="bold cyan")
    console.print("  • All checks passed")
    console.print("  • Configuration schemas are valid")
    console.print("  • All tests are working") 
    console.print("  • All code is clean")


if __name__ == "__main__":
    verify_all()
