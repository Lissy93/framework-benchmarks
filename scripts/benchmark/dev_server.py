#!/usr/bin/env python3
"""Dev server startup and HMR speed benchmarking for web application frameworks."""

import json
import os
import re
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests
from rich.console import Console
from rich.table import Table

from base import BenchmarkRunner, BenchmarkResult

console = Console()


class DevServerRunner(BenchmarkRunner):
    """Dev server startup and HMR speed benchmark runner."""
    
    @property
    def benchmark_name(self) -> str:
        return "Dev Server"
    
    def __init__(self):
        super().__init__()
        self.frameworks_config = self._load_frameworks_config()
    
    def check_server_health(self) -> bool:
        """Dev server measurement doesn't require the main benchmark server."""
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
    
    def _find_framework_dir(self, framework_config: Dict) -> Optional[Path]:
        """Find the framework directory."""
        script_dir = Path(__file__).parent
        project_root = script_dir.parent.parent  # Go up from scripts/benchmark/ to project root
        
        for possible_path in [
            project_root / "apps",    # From project root
            Path("../../apps"),       # Relative from scripts/benchmark/
            Path("apps"),             # From current working directory
            Path("./apps")            # Alternative current directory
        ]:
            if possible_path.exists():
                framework_dir = possible_path / framework_config["dir"]
                if framework_dir.exists():
                    return framework_dir.resolve()  # Get absolute path
        return None
    
    def _extract_port_from_command(self, dev_command: str) -> int:
        """Extract port number from dev command, use framework-specific defaults."""
        port_patterns = [
            r'--port[= ](\d+)',
            r'-p[= ](\d+)', 
            r':\s*(\d+)',
            r'(\d+)$'  # Port at end of command
        ]
        
        for pattern in port_patterns:
            match = re.search(pattern, dev_command)
            if match:
                return int(match.group(1))
        
        # Framework-specific default ports to avoid conflicts
        if "vite" in dev_command.lower():
            return 5173  # Vite's default port
        elif "ng serve" in dev_command.lower():
            return 4200  # Angular's default port
        elif "python" in dev_command.lower():
            return 3000  # Static server
        else:
            return 3001  # Generic dev server, avoid 3000 conflict
    
    def _wait_for_server_ready(self, port: int, process: subprocess.Popen, timeout: int = 30) -> Tuple[float, int]:
        """Wait for dev server to become responsive and return startup time and actual port."""
        start_time = time.time()
        
        # Only try the expected port - if it's occupied, the dev server should pick another
        ports_to_try = [port]
        
        # For frameworks that might conflict with main server (port 3000), use alternative ports
        if port == 3000:
            # Force these frameworks to use non-conflicting ports
            ports_to_try = [3030, 3031, 8000, 8080]
        
        # Wait a brief moment for the process to start
        time.sleep(1.0)  # Increased wait time
        
        for try_port in ports_to_try:
            url = f"http://localhost:{try_port}"
            
            # Check if process is still running
            if process.poll() is not None:
                # Process died, check output
                try:
                    stdout, stderr = process.communicate(timeout=1)
                    error_details = ""
                    if stderr:
                        error_details += f"stderr: {stderr[:200]}"
                    if stdout:
                        error_details += f"stdout: {stdout[:200]}"
                    raise TimeoutError(f"Dev server process exited. {error_details}")
                except subprocess.TimeoutExpired:
                    raise TimeoutError("Dev server process exited unexpectedly")
            
            # Try to connect to this port
            elapsed = 0
            while elapsed < timeout:
                try:
                    response = requests.get(url, timeout=2)
                    if response.status_code == 200:
                        # Check if this is actually our dev server by looking at response
                        content = response.text.lower()
                        
                        # Skip if this looks like the main benchmark server
                        if "benchmark" in content and "frameworks" in content:
                            console.print(f"[dim]⚠️  Port {try_port} has main benchmark server, skipping[/dim]")
                            continue
                            
                        # Accept if it looks like a development app
                        if any(keyword in content for keyword in ["weather", "vite", "<!doctype html", "webpack", "hmr", "hot"]):
                            total_time = time.time() - start_time
                            console.print(f"[dim]✅ Dev server ready on port {try_port} in {total_time:.2f}s[/dim]")
                            return total_time, try_port
                except requests.RequestException:
                    pass
                
                time.sleep(0.2)
                elapsed = time.time() - start_time
                
                # Check if process died during startup
                if process.poll() is not None:
                    try:
                        stdout, stderr = process.communicate(timeout=1)
                        error_details = ""
                        if stderr:
                            error_details += f" stderr: {stderr[:200]}"
                        raise TimeoutError(f"Dev server process exited during startup.{error_details}")
                    except subprocess.TimeoutExpired:
                        raise TimeoutError("Dev server process exited during startup")
        
        raise TimeoutError(f"Dev server did not become ready on any port within {timeout}s")
    
    def _measure_hmr_speed(self, framework_dir: Path, port: int) -> Tuple[float, float]:
        """Measure HMR speed by modifying a source file and timing the response."""
        # Find a source file to modify
        src_patterns = ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx", 
                       "src/**/*.vue", "src/**/*.svelte", "js/**/*.js"]
        
        target_file = None
        for pattern in src_patterns:
            files = list(framework_dir.glob(pattern))
            if files:
                # Pick first file that exists and is not too large
                for file in files:
                    if file.is_file() and file.stat().st_size < 10000:  # < 10KB
                        target_file = file
                        break
                if target_file:
                    break
        
        if not target_file:
            console.print(f"[yellow]No suitable source file found for HMR test in {framework_dir}[/yellow]")
            return 0.0, 0.0
        
        # Read original content
        try:
            original_content = target_file.read_text()
        except Exception as e:
            console.print(f"[yellow]Failed to read {target_file}: {e}[/yellow]")
            return 0.0, 0.0
        
        # Measure file change detection
        hmr_times = []
        for i in range(3):  # Test HMR 3 times for average
            try:
                # Add a comment to trigger HMR
                modified_content = original_content + f"\n// HMR test {i + 1} - {time.time()}"
                
                # Measure time to detect file change (file system -> HMR trigger)
                file_change_start = time.time()
                target_file.write_text(modified_content)
                
                # Wait a bit for file system events to propagate
                time.sleep(0.1)
                
                # Measure time for HMR to complete (basic estimation via HTTP check)
                hmr_start = time.time()
                
                # Check server response time as proxy for HMR completion
                url = f"http://localhost:{port}"
                try:
                    response = requests.get(url, timeout=3)
                    if response.status_code == 200:
                        hmr_end = time.time()
                        
                        file_detection_time = hmr_start - file_change_start
                        hmr_response_time = hmr_end - hmr_start
                        total_hmr_time = hmr_end - file_change_start
                        
                        hmr_times.append(total_hmr_time)
                        console.print(f"[dim]🔥 HMR test {i+1}: {total_hmr_time*1000:.0f}ms[/dim]")
                        
                except requests.RequestException:
                    console.print(f"[yellow]HMR test {i+1} failed - server not responsive[/yellow]")
                
                # Brief pause between tests
                time.sleep(0.5)
                
            except Exception as e:
                console.print(f"[yellow]HMR test {i+1} failed: {e}[/yellow]")
        
        # Restore original content
        try:
            target_file.write_text(original_content)
        except Exception as e:
            console.print(f"[yellow]Failed to restore {target_file}: {e}[/yellow]")
        
        if hmr_times:
            avg_hmr = sum(hmr_times) / len(hmr_times)
            min_hmr = min(hmr_times)
            return avg_hmr, min_hmr
        
        return 0.0, 0.0
    
    def run_single_benchmark(self, framework: str) -> BenchmarkResult:
        """Measure dev server startup and HMR speed for a single framework."""
        try:
            framework_config = self._get_framework_config(framework)
            if not framework_config:
                return self._create_error_result(framework, f"Framework {framework} not found in config")
            
            framework_dir = self._find_framework_dir(framework_config)
            if not framework_dir:
                return self._create_error_result(framework, f"Framework directory not found")
            
            dev_command = framework_config["build"]["devCommand"]
            
            # Force non-conflicting ports for dev commands that default to 3000
            if "python" not in dev_command.lower():  # Skip static servers
                original_port = self._extract_port_from_command(dev_command)
                
                # Assign framework-specific ports to avoid conflicts
                framework_ports = {
                    "react": 5173,      # Vite default
                    "angular": 4200,    # Angular default  
                    "svelte": 5174,     # Vite + 1
                    "preact": 5175,     # Vite + 2
                    "solid": 5176,      # Vite + 3
                    "qwik": 5177,       # Vite + 4
                    "vue": 5178,        # Vite + 5
                    "jquery": 5179,     # Vite + 6
                    "lit": 5180,        # Vite + 7
                    "vanjs": 5181,      # Vite + 8
                }
                
                assigned_port = framework_ports.get(framework, 5190)
                
                # Always replace port 3000 to avoid main server conflicts
                if original_port == 3000 or original_port == 3001:
                    # Replace existing port specification with assigned port
                    if "--port 3000" in dev_command:
                        dev_command = dev_command.replace("--port 3000", f"--port {assigned_port}")
                    elif "--port=3000" in dev_command:
                        dev_command = dev_command.replace("--port=3000", f"--port={assigned_port}")
                    elif "--port 3001" in dev_command:
                        dev_command = dev_command.replace("--port 3001", f"--port {assigned_port}")
                    elif "--port=3001" in dev_command:
                        dev_command = dev_command.replace("--port=3001", f"--port={assigned_port}")
                elif "--port" not in dev_command:
                    # Add port specification if none exists
                    if "vite" in dev_command:
                        dev_command = dev_command.replace("vite", f"vite --port {assigned_port}")
                    elif "ng serve" in dev_command:
                        dev_command = dev_command.replace("ng serve", f"ng serve --port {assigned_port}")
            
            # Use npx for vite and ng commands if they're not prefixed
            if dev_command == "vite" or dev_command.startswith("vite "):
                dev_command = "npx " + dev_command
            elif dev_command.startswith("ng "):
                dev_command = "npx " + dev_command
            
            # Handle frameworks without dev servers
            if "python" in dev_command.lower() and "http.server" in dev_command.lower():
                return BenchmarkResult(framework, self.benchmark_name, {
                    "framework": framework,
                    "dev_command": dev_command,
                    "startup_time_seconds": 0,
                    "startup_time_ms": 0,
                    "hmr_avg_time_ms": 0,
                    "hmr_min_time_ms": 0,
                    "status": "no_dev_server",
                    "port": self._extract_port_from_command(dev_command)
                })
            
            port = self._extract_port_from_command(dev_command)
            console.print(f"[dim]🚀 {framework}: Starting dev server with command: {dev_command}[/dim]")
            console.print(f"[dim]🚀 {framework}: Expected port: {port}[/dim]")
            
            # Start dev server
            console.print(f"[dim]🔧 {framework}: Running command: {dev_command}[/dim]")
            process = subprocess.Popen(
                dev_command,
                shell=True,
                cwd=framework_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            try:
                # Measure startup time
                startup_time, actual_port = self._wait_for_server_ready(port, process, timeout=30)
                console.print(f"[dim]✅ {framework}: Dev server ready in {startup_time:.2f}s[/dim]")
                
                # Brief pause before HMR testing
                time.sleep(1)
                
                # Measure HMR speed
                console.print(f"[dim]🔥 {framework}: Testing HMR speed...[/dim]")
                hmr_avg, hmr_min = self._measure_hmr_speed(framework_dir, actual_port)
                
                return BenchmarkResult(framework, self.benchmark_name, {
                    "framework": framework,
                    "dev_command": dev_command,
                    "startup_time_seconds": round(startup_time, 2),
                    "startup_time_ms": int(startup_time * 1000),
                    "hmr_avg_time_ms": int(hmr_avg * 1000) if hmr_avg > 0 else 0,
                    "hmr_min_time_ms": int(hmr_min * 1000) if hmr_min > 0 else 0,
                    "status": "success",
                    "port": actual_port
                })
                
            finally:
                # Always cleanup the dev server
                try:
                    process.terminate()
                    process.wait(timeout=5)
                    console.print(f"[dim]🛑 {framework}: Dev server stopped[/dim]")
                except Exception:
                    try:
                        process.kill()
                        process.wait(timeout=2)
                    except Exception:
                        pass
                
        except subprocess.TimeoutExpired:
            return self._create_error_result(framework, "Dev server startup timed out")
        except TimeoutError as e:
            # Try to get process output for debugging
            try:
                stdout, stderr = process.communicate(timeout=1)
                error_msg = str(e)
                if stderr:
                    error_msg += f" (stderr: {stderr.strip()[:200]})"
                if stdout:
                    error_msg += f" (stdout: {stdout.strip()[:200]})"
                return self._create_error_result(framework, error_msg)
            except:
                return self._create_error_result(framework, str(e))
        except Exception as e:
            return self._create_error_result(framework, f"Dev server measurement failed: {str(e)}")
    
    def _create_error_result(self, framework: str, error: str) -> BenchmarkResult:
        """Create a failed benchmark result."""
        result = BenchmarkResult(framework, self.benchmark_name, {
            "framework": framework,
            "dev_command": "unknown",
            "startup_time_seconds": 0,
            "startup_time_ms": 0,
            "hmr_avg_time_ms": 0,
            "hmr_min_time_ms": 0,
            "status": "error",
            "error": error,
            "port": 0
        })
        result.mark_failed(error)
        return result
    
    def _add_summary_columns(self, table: Table):
        """Add dev server columns to summary table."""
        table.add_column("Startup Time", justify="right", style="blue")
        table.add_column("HMR Speed", justify="right", style="green")
        table.add_column("Port", justify="right", style="dim")
        table.add_column("Status", justify="center", style="magenta")
    
    def _get_summary_row_data(self, result: BenchmarkResult) -> List[str]:
        """Get dev server row data for summary table."""
        if not result.success:
            return ["—", "—", "—", "❌ Failed"]
        
        data = result.data
        startup_time = data.get("startup_time_seconds", 0)
        hmr_avg = data.get("hmr_avg_time_ms", 0)
        port = data.get("port", 0)
        status = data.get("status", "unknown")
        
        # Format startup time
        if startup_time == 0 and status == "no_dev_server":
            startup_str = "N/A"
        else:
            startup_str = f"{startup_time:.2f}s"
        
        # Format HMR speed
        if hmr_avg == 0:
            hmr_str = "N/A" if status == "no_dev_server" else "—"
        else:
            hmr_str = f"{hmr_avg}ms"
        
        # Format port
        port_str = str(port) if port > 0 else "—"
        
        # Format status
        status_icons = {
            "success": "✅ Ready",
            "no_dev_server": "➖ Static",
            "error": "❌ Failed"
        }
        status_str = status_icons.get(status, f"❓ {status}")
        
        return [startup_str, hmr_str, port_str, status_str]
    
    def display_detailed_results(self, framework: str = None):
        """Display detailed dev server analysis."""
        results_to_show = self.results
        if framework:
            results_to_show = [r for r in self.results if r.framework == framework]
        
        for result in results_to_show:
            data = result.data
            console.print(f"\n🚀 Detailed dev server analysis for {result.framework}:")
            
            # Dev server details table
            details_table = Table(title=f"{result.framework} Dev Server Performance")
            details_table.add_column("Metric", style="bold")
            details_table.add_column("Value", justify="right")
            
            details_table.add_row("Dev Command", data.get("dev_command", "Unknown"))
            details_table.add_row("Startup Time", f"{data.get('startup_time_seconds', 0):.2f} seconds")
            details_table.add_row("Startup Time (ms)", f"{data.get('startup_time_ms', 0):,} ms")
            details_table.add_row("HMR Average Speed", f"{data.get('hmr_avg_time_ms', 0)} ms")
            details_table.add_row("HMR Best Speed", f"{data.get('hmr_min_time_ms', 0)} ms")
            details_table.add_row("Port", str(data.get("port", "Unknown")))
            details_table.add_row("Status", data.get("status", "Unknown"))
            
            if not result.success:
                details_table.add_row("Error", data.get("error", "Unknown error"))
            
            console.print(details_table)
