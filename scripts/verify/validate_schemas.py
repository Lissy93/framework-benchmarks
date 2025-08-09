#!/usr/bin/env python3
"""Validate frameworks.json and config.json against their schemas."""

import json
import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple

import click
try:
    import jsonschema
except ImportError:
    print("❌ jsonschema package required. Install with: pip install jsonschema")
    sys.exit(1)

from rich.console import Console
from rich.table import Table
from rich.panel import Panel

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from common import get_project_root, show_header, show_success, show_error

console = Console()

def load_json_file(file_path: Path) -> Tuple[bool, Dict[str, Any], str]:
    """Load and parse JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return True, data, ""
    except json.JSONDecodeError as e:
        return False, {}, f"JSON parsing error: {e}"
    except FileNotFoundError:
        return False, {}, f"File not found: {file_path}"
    except Exception as e:
        return False, {}, f"Error reading file: {e}"

def validate_against_schema(data: Dict[str, Any], schema: Dict[str, Any], name: str) -> Tuple[bool, List[str]]:
    """Validate data against JSON schema."""
    try:
        jsonschema.validate(instance=data, schema=schema)
        return True, []
    except jsonschema.ValidationError as e:
        # Format error message nicely
        path = " → ".join(str(p) for p in e.absolute_path) if e.absolute_path else "root"
        error_msg = f"[bold red]Path:[/bold red] {path}\n[bold red]Error:[/bold red] {e.message}"
        if e.validator_value and e.validator != 'required':
            error_msg += f"\n[dim]Expected: {e.validator_value}[/dim]"
        return False, [error_msg]
    except jsonschema.SchemaError as e:
        return False, [f"Schema error: {e}"]

@click.command()
@click.option('--verbose', '-v', is_flag=True, help='Show detailed validation information')
def validate_schemas(verbose: bool):
    """Validate frameworks.json and config.json against their schemas."""
    show_header("Schema Validation", "Validating configuration files against JSON schemas")
    
    project_root = get_project_root()
    verify_dir = Path(__file__).parent
    
    # Files to validate
    validations = [
        {
            'name': 'frameworks.json',
            'data_file': project_root / 'frameworks.json',
            'schema_file': verify_dir / 'frameworks-schema.json',
            'description': 'Frontend framework configurations'
        },
        {
            'name': 'config.json', 
            'data_file': project_root / 'config.json',
            'schema_file': verify_dir / 'config-schema.json',
            'description': 'Project configuration settings'
        }
    ]
    
    results = []
    
    for validation in validations:
        name = validation['name']
        data_file = validation['data_file']
        schema_file = validation['schema_file']
        description = validation['description']
        
        if verbose:
            console.print(f"\n[cyan]Validating {name}[/cyan] ({description})")
        
        # Load schema
        schema_ok, schema_data, schema_error = load_json_file(schema_file)
        if not schema_ok:
            results.append({
                'name': name,
                'status': 'error',
                'message': f"Schema error: {schema_error}"
            })
            continue
        
        # Load data file
        data_ok, file_data, data_error = load_json_file(data_file)
        if not data_ok:
            results.append({
                'name': name,
                'status': 'error', 
                'message': f"File error: {data_error}"
            })
            continue
        
        # Validate against schema
        valid, errors = validate_against_schema(file_data, schema_data, name)
        
        if valid:
            results.append({
                'name': name,
                'status': 'valid',
                'message': 'Valid ✓'
            })
        else:
            results.append({
                'name': name,
                'status': 'invalid',
                'message': errors[0]  # Show first error
            })
    
    # Display results
    table = Table(title="Validation Results")
    table.add_column("File", style="bold")
    table.add_column("Status", justify="center")
    table.add_column("Details")
    
    valid_count = 0
    for result in results:
        name = result['name']
        status = result['status']
        message = result['message']
        
        if status == 'valid':
            table.add_row(name, "[green]✓ VALID[/green]", message)
            valid_count += 1
        elif status == 'invalid':
            table.add_row(name, "[red]✗ INVALID[/red]", message)
        else:
            table.add_row(name, "[yellow]⚠ ERROR[/yellow]", message)
    
    console.print()
    console.print(table)
    
    # Summary
    total = len(results)
    if valid_count == total:
        show_success(f"All {total} configuration files are valid!")
    else:
        failed = total - valid_count
        show_error(f"{failed} of {total} files have validation issues")
        
        # Show tips
        console.print("\n[bold yellow]💡 Tips:[/bold yellow]")
        console.print("  • Check JSON syntax with: [dim]json_pp < file.json[/dim]")
        console.print("  • Validate online at: [dim]https://jsonschema.net/[/dim]")
        console.print("  • Review schema files in: [dim]scripts/verify/[/dim]")
        
        sys.exit(1)

if __name__ == '__main__':
    validate_schemas()