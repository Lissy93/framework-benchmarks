#!/usr/bin/env python3
"""Build time benchmarking for web application frameworks."""

import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Dict, List, Optional

from rich.console import Console
from rich.table import Table

from base import BenchmarkRunner, BenchmarkResult

console = Console()


class BuildTimeRunner(BenchmarkRunner):
    """Build time benchmark runner."""
    
    @property
    def benchmark_name(self) -> str:
        return "Build Time"
    
    def __init__(self, clean_build: bool = True):
        super().__init__()
        self.frameworks_config = self._load_frameworks_config()
        # Always use clean builds for accurate results
        self.clean_build = True
    
    def check_server_health(self) -> bool:
        """Build time measurement doesn't require a running server."""
        return True
    
    def _load_frameworks_config(self) -> Dict:
        """Load frameworks configuration."""
        config_path = Path(__file__).parent.parent.parent / "frameworks.json"
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            console.print(f"[red]Failed to load frameworks.json: {e}[/red]")
            return {"frameworks": []}
    
    def _get_framework_config(self, framework_id: str) -> Optional[Dict]:
        """Get configuration for a specific framework."""
        for fw in self.frameworks_config.get("frameworks", []):
            if fw["id"] == framework_id:
                return fw
        return None
    
    def _backup_build_output(self, framework_dir: Path, build_dir: str) -> Optional[Path]:
        """Backup existing build output if it exists."""
        build_path = framework_dir / build_dir
        if not build_path.exists():
            return None
        
        # Create temporary backup
        backup_dir = tempfile.mkdtemp(prefix=f"build-backup-{framework_dir.name}-")
        backup_path = Path(backup_dir)
        
        try:
            shutil.copytree(build_path, backup_path / build_dir)
            return backup_path
        except Exception as e:
            console.print(f"[yellow]Warning: Failed to backup {build_path}: {e}[/yellow]")
            shutil.rmtree(backup_dir, ignore_errors=True)
            return None
    
    def _restore_build_output(self, framework_dir: Path, build_dir: str, backup_path: Optional[Path]):
        """Restore build output from backup."""
        if not backup_path:
            return
        
        build_path = framework_dir / build_dir
        backup_build_path = backup_path / build_dir
        
        try:
            # Remove current build output
            if build_path.exists():
                shutil.rmtree(build_path)
            
            # Restore from backup
            if backup_build_path.exists():
                shutil.copytree(backup_build_path, build_path)
            
            # Clean up backup
            shutil.rmtree(backup_path, ignore_errors=True)
        except Exception as e:
            console.print(f"[yellow]Warning: Failed to restore {build_path}: {e}[/yellow]")
    
    def _clean_build_output(self, framework_dir: Path, build_dir: str):
        """Clean existing build output and caches to ensure fresh build."""
        # Clean main build directory
        build_path = framework_dir / build_dir
        if build_path.exists():
            try:
                shutil.rmtree(build_path)
                console.print(f"[dim]🧹 {framework_dir.name}: Cleaned {build_dir}/ directory[/dim]")
            except Exception as e:
                console.print(f"[yellow]Warning: Failed to clean {build_path}: {e}[/yellow]")
        
        # Clean common cache directories to force complete rebuild
        cache_dirs = [
            "node_modules/.vite",      # Vite cache
            "node_modules/.cache",     # General build cache
            ".angular",                # Angular cache
            "dist/.cache",             # Some build caches
            ".svelte-kit",             # SvelteKit cache
        ]
        
        for cache_dir in cache_dirs:
            cache_path = framework_dir / cache_dir
            if cache_path.exists():
                try:
                    shutil.rmtree(cache_path)
                    console.print(f"[dim]🧹 {framework_dir.name}: Cleaned {cache_dir}/ cache[/dim]")
                except Exception as e:
                    # Cache cleaning failures are not critical
                    pass
    
    def run_single_benchmark(self, framework: str) -> BenchmarkResult:
        """Measure build time for a single framework."""
        try:
            framework_config = self._get_framework_config(framework)
            if not framework_config:
                return self._create_error_result(framework, f"Framework {framework} not found in config")
            
            build_command = framework_config["build"]["buildCommand"]
            
            # Use npx for vite and ng commands if they're not prefixed
            if build_command == "vite build":
                build_command = "npx vite build"
            elif build_command == "ng build":
                build_command = "npx ng build"
            # Find apps directory - look from project root
            apps_dir = None
            script_dir = Path(__file__).parent
            project_root = script_dir.parent.parent  # Go up from scripts/benchmark/ to project root
            
            for possible_path in [
                project_root / "apps",    # From project root
                Path("../../apps"),       # Relative from scripts/benchmark/
                Path("apps"),             # From current working directory
                Path("./apps")            # Alternative current directory
            ]:
                if possible_path.exists():
                    apps_dir = possible_path.resolve()  # Get absolute path
                    break
            
            if not apps_dir:
                return self._create_error_result(framework, "Could not find apps directory")
            
            framework_dir = apps_dir / framework_config["dir"]
            build_dir = framework_config.get("buildDir", "dist")
            
            if not framework_dir.exists():
                return self._create_error_result(framework, f"Framework directory {framework_dir} not found")
            
            # Handle frameworks with no build step
            if "no build step required" in build_command.lower() or build_command.strip() == "echo 'No build step required'":
                return BenchmarkResult(framework, self.benchmark_name, {
                    "framework": framework,
                    "build_command": build_command,
                    "build_time_ms": 0,
                    "build_time_seconds": 0,
                    "status": "no_build_required",
                    "output_size_mb": 0,
                    "has_node_modules": framework_config["build"].get("hasNodeModules", False)
                })
            
            # Backup existing build output
            backup_path = self._backup_build_output(framework_dir, build_dir)
            
            try:
                # Always clean for accurate results  
                self._clean_build_output(framework_dir, build_dir)
                
                # Measure build time
                console.print(f"[dim]🔨 {framework}: Running build command...[/dim]")
                start_time = time.time()
                
                result = subprocess.run(
                    build_command,
                    shell=True,
                    cwd=framework_dir,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minute timeout
                )
                
                end_time = time.time()
                build_time = end_time - start_time
                
                # Check if build was successful
                if result.returncode != 0:
                    error_msg = f"Build failed with code {result.returncode}"
                    if result.stderr:
                        error_msg += f": {result.stderr.strip()[:200]}"
                    return self._create_error_result(framework, error_msg)
                
                # Calculate output size
                output_size = self._calculate_output_size(framework_dir, build_dir)
                
                console.print(f"[dim]✅ {framework}: Build completed in {build_time:.2f}s[/dim]")
                
                return BenchmarkResult(framework, self.benchmark_name, {
                    "framework": framework,
                    "build_command": build_command,
                    "build_time_ms": int(build_time * 1000),
                    "build_time_seconds": round(build_time, 2),
                    "status": "success",
                    "output_size_mb": round(output_size / (1024 * 1024), 2),
                    "has_node_modules": framework_config["build"].get("hasNodeModules", False),
                    "stdout_lines": len(result.stdout.splitlines()) if result.stdout else 0,
                    "stderr_lines": len(result.stderr.splitlines()) if result.stderr else 0
                })
                
            finally:
                # Restore original build output
                self._restore_build_output(framework_dir, build_dir, backup_path)
                
        except subprocess.TimeoutExpired:
            return self._create_error_result(framework, "Build timed out after 5 minutes")
        except Exception as e:
            return self._create_error_result(framework, f"Build measurement failed: {str(e)}")
    
    def _calculate_output_size(self, framework_dir: Path, build_dir: str) -> int:
        """Calculate total size of build output in bytes."""
        build_path = framework_dir / build_dir
        if not build_path.exists():
            return 0
        
        total_size = 0
        try:
            for root, dirs, files in os.walk(build_path):
                for file in files:
                    file_path = Path(root) / file
                    if file_path.exists():
                        total_size += file_path.stat().st_size
        except Exception:
            pass
        
        return total_size
    
    def _create_error_result(self, framework: str, error: str) -> BenchmarkResult:
        """Create a failed benchmark result."""
        result = BenchmarkResult(framework, self.benchmark_name, {
            "framework": framework,
            "build_command": "unknown",
            "build_time_ms": 0,
            "build_time_seconds": 0,
            "status": "error",
            "error": error,
            "output_size_mb": 0,
            "has_node_modules": False
        })
        result.mark_failed(error)
        return result
    
    def _add_summary_columns(self, table: Table):
        """Add build time columns to summary table."""
        table.add_column("Build Time", justify="right", style="blue")
        table.add_column("Output Size", justify="right", style="green")
        table.add_column("Command", justify="left", style="dim")
        table.add_column("Status", justify="center", style="magenta")
    
    def _get_summary_row_data(self, result: BenchmarkResult) -> List[str]:
        """Get build time row data for summary table."""
        if not result.success:
            return ["—", "—", "Error", "❌ Failed"]
        
        data = result.data
        build_time = data.get("build_time_seconds", 0)
        output_size = data.get("output_size_mb", 0)
        command = data.get("build_command", "")
        status = data.get("status", "unknown")
        
        # Format build time
        if build_time == 0 and status == "no_build_required":
            build_time_str = "N/A"
        else:
            build_time_str = f"{build_time:.2f}s"
        
        # Format output size
        if output_size == 0:
            output_size_str = "—" if status == "no_build_required" else "0 MB"
        else:
            output_size_str = f"{output_size:.1f} MB"
        
        # Format command (truncate if too long)
        command_str = command[:30] + "..." if len(command) > 33 else command
        
        # Format status
        status_icons = {
            "success": "✅ Built",
            "no_build_required": "➖ No Build",
            "error": "❌ Failed"
        }
        status_str = status_icons.get(status, f"❓ {status}")
        
        return [build_time_str, output_size_str, command_str, status_str]
    
    def display_detailed_results(self, framework: str = None):
        """Display detailed build time analysis."""
        results_to_show = self.results
        if framework:
            results_to_show = [r for r in self.results if r.framework == framework]
        
        for result in results_to_show:
            data = result.data
            console.print(f"\n🔨 Detailed build analysis for {result.framework}:")
            
            # Build details table
            details_table = Table(title=f"{result.framework} Build Details")
            details_table.add_column("Metric", style="bold")
            details_table.add_column("Value", justify="right")
            
            details_table.add_row("Build Command", data.get("build_command", "Unknown"))
            details_table.add_row("Build Time", f"{data.get('build_time_seconds', 0):.2f} seconds")
            details_table.add_row("Build Time (ms)", f"{data.get('build_time_ms', 0):,} ms")
            details_table.add_row("Output Size", f"{data.get('output_size_mb', 0):.2f} MB")
            details_table.add_row("Has Node Modules", "Yes" if data.get("has_node_modules", False) else "No")
            details_table.add_row("Status", data.get("status", "Unknown"))
            
            if data.get("stdout_lines"):
                details_table.add_row("Stdout Lines", str(data.get("stdout_lines", 0)))
            if data.get("stderr_lines"):
                details_table.add_row("Stderr Lines", str(data.get("stderr_lines", 0)))
            
            if not result.success:
                details_table.add_row("Error", data.get("error", "Unknown error"))
            
            console.print(details_table)
