#!/usr/bin/env python3
"""System resource monitoring for web applications."""

import asyncio
import json
import psutil
import requests
import subprocess
import shutil
import tempfile
import time
import websockets
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from pathlib import Path

from rich.console import Console
from rich.table import Table

from base import BenchmarkRunner, BenchmarkResult

console = Console()


def _get_wsl_windows_host_ip() -> Optional[str]:
    """Get Windows host IP from WSL for DevTools connection."""
    try:
        # nameserver in resolv.conf points at the Windows host (WSL2)
        with open("/etc/resolv.conf") as f:
            for line in f:
                if line.startswith("nameserver"):
                    return line.split()[1].strip()
    except Exception:
        return None


@dataclass
class ResourceSnapshot:
    """Single point-in-time resource measurement."""
    timestamp: float
    memory_mb: float
    cpu_percent: float
    process_count: int
    browser_memory_mb: float = 0
    browser_heap_mb: float = 0
    browser_heap_limit_mb: float = 0


@dataclass
class InteractionMetrics:
    """Resource usage during a specific interaction."""
    name: str
    duration: float
    memory_delta_mb: float
    cpu_peak_percent: float
    cpu_average_percent: float
    heap_delta_mb: float
    samples: List[ResourceSnapshot]
    
    def to_dict(self) -> Dict:
        """Convert to JSON-serializable dictionary."""
        return {
            "name": self.name,
            "duration": self.duration,
            "memory_delta_mb": self.memory_delta_mb,
            "cpu_peak_percent": self.cpu_peak_percent,
            "cpu_average_percent": self.cpu_average_percent,
            "heap_delta_mb": self.heap_delta_mb,
            "sample_count": len(self.samples),
            "samples": [
                {
                    "timestamp": s.timestamp,
                    "memory_mb": s.memory_mb,
                    "cpu_percent": s.cpu_percent,
                    "process_count": s.process_count,
                    "browser_memory_mb": s.browser_memory_mb,
                    "browser_heap_mb": s.browser_heap_mb,
                    "browser_heap_limit_mb": s.browser_heap_limit_mb
                } for s in self.samples
            ]
        }


def launch_isolated_chrome(port=0, url="about:blank"):
    """Launch an isolated Chrome instance with its own user data directory."""
    chrome = shutil.which("google-chrome") or shutil.which("chromium-browser") or shutil.which("chromium")
    if not chrome:
        raise RuntimeError("Chrome/Chromium not found")

    udir = tempfile.mkdtemp(prefix="chrome-fw-")
    args = [
        chrome, "--headless=new",
        f"--remote-debugging-port={port or 0}",  # 0 lets Chrome pick a free port
        f"--user-data-dir={udir}",
        "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
        "--disable-extensions", "--disable-plugins",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--window-size=1920,1080",
        url
    ]
    proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return proc, udir


class SystemResourceMonitor:
    """Monitor system-level resource usage for browser processes."""
    
    def __init__(self, browser_name: str = "chrome", root_pid: Optional[int] = None):
        self.browser_name = browser_name.lower()
        self.baseline: Optional[ResourceSnapshot] = None
        self.monitoring = False
        self.samples: List[ResourceSnapshot] = []
        self.root_pid = root_pid
        
        # Browser process names by platform (expanded for WSL/Linux)
        self.browser_processes = {
            'chrome': ['chrome', 'chromium', 'chrome.exe', 'Google Chrome', 
                      'google-chrome', 'google-chrome-stable', 'chromium-browser'],
            'firefox': ['firefox', 'firefox.exe'],
            'edge': ['msedge', 'msedge.exe'],
            'safari': ['safari', 'Safari']
        }
    
    def _descendant_procs(self) -> List[psutil.Process]:
        """Get descendant processes from root PID or all browser processes."""
        if not self.root_pid:
            return self.find_browser_processes()
        try:
            root = psutil.Process(self.root_pid)
            return [root] + root.children(recursive=True)
        except psutil.Error:
            return []
    
    def find_browser_processes(self) -> List[psutil.Process]:
        """Find all browser-related processes (improved detection)."""
        process_names = self.browser_processes.get(self.browser_name, [self.browser_name])
        processes = []
        
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'create_time']):
                # Check both process name and command line
                proc_name = (proc.info.get('name') or '').lower()
                cmdline = ' '.join(proc.info.get('cmdline') or []).lower()
                
                # Match against both name and command line for better detection
                name_match = any(name.lower() in proc_name for name in process_names)
                cmdline_match = any(name.lower() in cmdline for name in process_names)
                
                if name_match or cmdline_match:
                    processes.append(psutil.Process(proc.info['pid']))
                
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
        
        return processes
    
    def get_resource_snapshot(self) -> ResourceSnapshot:
        """Get current system resource usage."""
        processes = self._descendant_procs() if self.root_pid else self.find_browser_processes()
        
        total_memory = 0
        total_cpu = 0
        process_count = len(processes)
        
        if process_count == 0:
            # Debug: print why no processes found
            if not self.root_pid:
                console.print(f"[dim red]No browser processes found for {self.browser_name}[/dim red]")
            return ResourceSnapshot(
                timestamp=time.time(),
                memory_mb=0,
                cpu_percent=0,
                process_count=0
            )
        
        # Prime CPU measurement for all processes first
        for proc in processes:
            try:
                proc.cpu_percent(None)  # Prime CPU measurement
            except psutil.Error:
                pass
        
        # Wait a short interval
        time.sleep(0.2)
        
        # Collect actual measurements
        cpu_samples = []
        for proc in processes:
            try:
                cpu = proc.cpu_percent(None)  # Get actual measurement
                memory = proc.memory_info().rss / 1024 / 1024  # MB
                
                cpu_samples.append(cpu)
                total_memory += memory
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                process_count -= 1
                continue
        
        total_cpu = sum(cpu_samples)
        
        snapshot = ResourceSnapshot(
            timestamp=time.time(),
            memory_mb=total_memory,
            cpu_percent=total_cpu,
            process_count=process_count
        )
        
        return snapshot
    
    def establish_baseline(self, quiet: bool = False) -> ResourceSnapshot:
        """Establish baseline resource usage (empty browser)."""
        if not quiet:
            console.print("📊 Establishing resource baseline...")
        
        # Take multiple samples for stability (optimized)
        samples = []
        for i in range(3):  # Increased back to 3 for more stable baseline
            sample = self.get_resource_snapshot()
            samples.append(sample)
            if not quiet:
                console.print(f"[dim]Sample {i+1}: {sample.memory_mb:.1f}MB memory, {sample.cpu_percent:.1f}% CPU, {sample.process_count} processes[/dim]")
            if i < 2:  # Don't sleep after last sample
                time.sleep(0.5)  # Increased wait time for more accurate CPU measurement
        
        # Average the samples
        avg_memory = sum(s.memory_mb for s in samples) / len(samples)
        avg_cpu = sum(s.cpu_percent for s in samples) / len(samples)
        avg_processes = sum(s.process_count for s in samples) / len(samples)
        
        self.baseline = ResourceSnapshot(
            timestamp=time.time(),
            memory_mb=avg_memory,
            cpu_percent=avg_cpu,
            process_count=int(avg_processes)
        )
        
        if not quiet:
            console.print(f"✅ Baseline: {avg_memory:.1f} MB memory, {avg_cpu:.1f}% CPU, {int(avg_processes)} processes")
        return self.baseline
    
    def calculate_app_usage(self, current: ResourceSnapshot) -> ResourceSnapshot:
        """Calculate app-specific usage by subtracting baseline."""
        if not self.baseline:
            return current
        
        # Calculate pure deltas (no artificial floors)
        memory_delta = max(0.0, current.memory_mb - self.baseline.memory_mb)
        cpu_delta = max(0.0, current.cpu_percent - self.baseline.cpu_percent)
        
        return ResourceSnapshot(
            timestamp=current.timestamp,
            memory_mb=memory_delta,
            cpu_percent=cpu_delta,
            process_count=max(0, current.process_count - self.baseline.process_count),
            browser_memory_mb=current.browser_memory_mb,
            browser_heap_mb=current.browser_heap_mb,
            browser_heap_limit_mb=current.browser_heap_limit_mb
        )


class BrowserResourceMonitor:
    """Monitor browser-internal resource usage via Chrome DevTools Protocol."""
    
    def __init__(self, debug_host: str = "localhost", debug_port: int = 9222):
        self.debug_host = debug_host
        self.debug_port = debug_port
        self.websocket_url = None
        self.websocket = None
        self.session_id = 1
    
    async def connect(self) -> bool:
        """Connect to Chrome DevTools Protocol with resilient target creation."""
        base = f"http://{self.debug_host}:{self.debug_port}"
        try:
            # 1) Try browser-level WebSocket first (works even if there are no pages)
            version_response = requests.get(f"{base}/json/version", timeout=5)
            version_response.raise_for_status()
            browser_ws = version_response.json().get("webSocketDebuggerUrl")

            # 2) Ensure there is at least one page target
            tabs_response = requests.get(f"{base}/json/list", timeout=5)
            tabs_response.raise_for_status()
            tabs = tabs_response.json()
            
            if not tabs:
                # Create about:blank page
                requests.get(f"{base}/json/new?about:blank", timeout=5)
                tabs_response = requests.get(f"{base}/json/list", timeout=5)
                tabs = tabs_response.json()

            # 3) Pick a page target, else fall back to browser target
            target_ws = None
            for tab in tabs:
                if tab.get("type") == "page" and tab.get("webSocketDebuggerUrl"):
                    target_ws = tab["webSocketDebuggerUrl"]
                    break
            
            if not target_ws:
                # Fall back to browser session
                target_ws = browser_ws

            if not target_ws:
                return False

            self.websocket_url = target_ws
            self.websocket = await websockets.connect(
                self.websocket_url, 
                timeout=10, 
                ping_interval=None
            )
            return True
            
        except Exception:
            return False
    
    async def navigate_to_url(self, url: str) -> bool:
        """Navigate to a specific URL and wait for load."""
        if not self.websocket:
            return False
        
        try:
            # Enable required domains
            await self.send_command("Page.enable")
            await self.send_command("Runtime.enable")
            
            # Navigate to the URL
            await self.send_command("Page.navigate", {"url": url})
            
            # Wait for load event (or timeout)
            timeout_count = 0
            while timeout_count < 30:  # 3 second timeout
                try:
                    response = await asyncio.wait_for(self.websocket.recv(), timeout=0.1)
                    data = json.loads(response)
                    if data.get("method") == "Page.loadEventFired":
                        return True
                except asyncio.TimeoutError:
                    timeout_count += 1
                    continue
                except Exception:
                    break
            
            # If no load event received, still consider successful if no error
            return True
            
        except Exception:
            return False
    
    async def send_command(self, method: str, params: Dict = None) -> Dict:
        """Send command to Chrome DevTools Protocol."""
        if not self.websocket:
            return {}
        
        command = {
            "id": self.session_id,
            "method": method,
            "params": params or {}
        }
        
        try:
            await self.websocket.send(json.dumps(command))
            response = await self.websocket.recv()
            self.session_id += 1
            
            return json.loads(response)
        except Exception:
            return {}
    
    async def get_memory_usage(self) -> Dict:
        """Get browser memory usage via DevTools using Performance.getMetrics."""
        if not self.websocket:
            return {"connection_working": False}

        try:
            # Enable domains
            await self.send_command("Page.enable")
            await self.send_command("Runtime.enable")
            await self.send_command("Performance.enable")

            # Optional: trigger GC for a tighter snapshot
            await self.send_command("HeapProfiler.enable")
            await self.send_command("HeapProfiler.collectGarbage")

            # Get performance metrics (more robust than Runtime.getHeapUsage)
            perf_response = await self.send_command("Performance.getMetrics")
            
            if "result" in perf_response and "metrics" in perf_response["result"]:
                metrics = {m["name"]: m["value"] for m in perf_response["result"]["metrics"]}
                
                used = float(metrics.get("JSHeapUsedSize", 0.0))
                total = float(metrics.get("JSHeapTotalSize", 0.0))
                
                return {
                    "heap_used_mb": used / (1024 * 1024),
                    "heap_total_mb": total / (1024 * 1024),
                    "connection_working": True
                }
            else:
                return {
                    "heap_used_mb": 0,
                    "heap_total_mb": 0,
                    "connection_working": True,
                    "no_heap_data": True
                }
        except Exception:
            return {
                "heap_used_mb": 0,
                "heap_total_mb": 0,
                "connection_working": False
            }
    
    async def close(self):
        """Close WebSocket connection."""
        if self.websocket:
            await self.websocket.close()


class ResourceUsageRunner(BenchmarkRunner):
    """Resource usage benchmark runner."""
    
    @property
    def benchmark_name(self) -> str:
        return "Resource Usage"
    
    def __init__(self):
        super().__init__()
        self.system_monitor = SystemResourceMonitor()  # Will be replaced per framework
        self.browser_monitor = None
        
        # Set up candidate hosts for DevTools (WSL-friendly)
        self.browser_hosts = ["localhost"]
        win_ip = _get_wsl_windows_host_ip()
        if win_ip:
            self.browser_hosts.append(win_ip)
        
        self.interaction_scenarios = [
            ("Initial Load", self._measure_initial_load),
            ("Weather Search", self._measure_weather_search),
            ("UI Interactions", self._measure_ui_interactions),
            ("Memory Stress", self._measure_memory_stress)
        ]
    
    async def _try_connect_browser(self) -> Optional[BrowserResourceMonitor]:
        """Try connecting to Chrome DevTools on multiple hosts."""
        for host in self.browser_hosts:
            browser = BrowserResourceMonitor(debug_host=host, debug_port=9222)
            if await browser.connect():
                return browser
        return None

    def check_server_health(self) -> bool:
        """Resource monitoring requires a running server."""
        if not super().check_server_health():
            return False
        
        # Check if Chrome DevTools is available on any host
        devtools_available = False
        for host in self.browser_hosts:
            try:
                response = requests.get(f"http://{host}:9222/json/version", timeout=3)
                if response.status_code == 200:
                    console.print(f"[green]✓ Chrome DevTools Protocol available at {host}:9222 - heap monitoring enabled[/green]")
                    devtools_available = True
                    break
            except requests.RequestException:
                continue
        
        if not devtools_available:
            self._show_devtools_setup_instructions()
        
        return True  # Always allow resource monitoring, with or without DevTools
    
    def _show_devtools_setup_instructions(self):
        """Show instructions for enabling Chrome DevTools."""
        console.print("\n[yellow]⚠ Chrome DevTools not available - heap monitoring disabled[/yellow]")
        console.print("[dim]To enable heap monitoring, restart Chrome with debugging enabled:[/dim]")
        console.print("[dim]1. Close all Chrome windows[/dim]")
        console.print("[dim]2. Start Chrome with debugging:[/dim]")
        console.print("[dim]   • WSL/Linux: google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug[/dim]")
        console.print("[dim]   • Windows: chrome.exe --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0[/dim]")
        console.print("[dim]   • macOS: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222[/dim]")
        console.print("[dim]3. Navigate to: http://127.0.0.1:3000/[/dim]")
        console.print("[dim]4. If using Windows Chrome from WSL, check /etc/resolv.conf for Windows host IP[/dim]")
        console.print("[dim]Note: System-level memory and CPU monitoring will still work without DevTools[/dim]\n")
    
    def run_single_benchmark(self, framework: str) -> BenchmarkResult:
        """Measure resource usage for a single framework."""
        try:
            # Run synchronous resource measurement without internal progress updates
            resource_data = self._measure_framework_resources_simple(framework)
            
            return BenchmarkResult(framework, self.benchmark_name, resource_data)
            
        except Exception as e:
            return self._create_error_result(framework, f"Resource monitoring failed: {str(e)}")
    
    def _measure_framework_resources_sync(self, framework: str, update_progress_status, update_progress) -> Dict:
        """Measure comprehensive resource usage for a framework (synchronous version)."""
        
        # Step 1: Establishing baseline
        update_progress_status(framework, "Establishing baseline...")
        baseline = self.system_monitor.establish_baseline(quiet=True)
        update_progress(framework, "Baseline established")
        
        # Step 2: Connecting to browser
        update_progress_status(framework, "Connecting to browser...")
        # For now, we'll skip async browser monitoring and focus on system monitoring
        console.print(f"[dim]⚠ {framework}: DevTools unavailable, using system monitoring only[/dim]")
        update_progress(framework, "Browser connection attempted")
        
        # Step 3: Loading application
        update_progress_status(framework, "Loading application...")
        framework_url = self.get_framework_url(framework)
        console.print(f"[dim]✓ {framework}: Loading {framework_url}[/dim]")
        
        # Allow time for page load and JavaScript execution to stabilize heap
        time.sleep(2)  # Increased wait time for page load and heap stabilization
        update_progress(framework, "Application loaded")
        
        # Steps 4-7: Run interaction scenarios (4 scenarios = 4 steps)
        interaction_results = []
        scenarios = [
            ("Initial Load", self._measure_initial_load_sync),
            ("Weather Search", self._measure_weather_search_sync),
            ("UI Interactions", self._measure_ui_interactions_sync),
            ("Memory Stress", self._measure_memory_stress_sync)
        ]
        
        for i, (scenario_name, scenario_func) in enumerate(scenarios):
            update_progress_status(framework, f"Testing {scenario_name}...")
            console.print(f"[dim]⚡ {framework}: Running {scenario_name} test[/dim]")
            
            try:
                interaction_data = scenario_func(framework_url)
                interaction_results.append(interaction_data)
                console.print(f"[dim]✓ {framework}: {scenario_name} completed[/dim]")
            except Exception as e:
                console.print(f"[dim]⚠ {framework}: {scenario_name} failed: {str(e)}[/dim]")
            
            update_progress(framework, f"{scenario_name} completed")  # Progress after each scenario
        
        # Step 8: Finalizing measurements
        update_progress_status(framework, "Finalizing measurements...")
        final_snapshot = self.system_monitor.get_resource_snapshot()
        app_usage = self.system_monitor.calculate_app_usage(final_snapshot)
        console.print(f"[dim]📊 {framework}: Final measurements - {app_usage.memory_mb:.1f}MB memory, {app_usage.cpu_percent:.1f}% CPU[/dim]")
        update_progress(framework, "Completed")  # Complete the 8th step
        
        return {
            "framework": framework,
            "baseline": {
                "memory_mb": baseline.memory_mb,
                "cpu_percent": baseline.cpu_percent,
                "process_count": baseline.process_count
            },
            "final_usage": {
                "total_memory_mb": final_snapshot.memory_mb,
                "total_cpu_percent": final_snapshot.cpu_percent,
                "app_memory_mb": app_usage.memory_mb,
                "app_cpu_percent": app_usage.cpu_percent,
                "process_count": final_snapshot.process_count
            },
            "interactions": [interaction.to_dict() for interaction in interaction_results],
            "summary": self._calculate_summary_metrics(interaction_results, app_usage)
        }
    
    async def _measure_framework_resources(self, framework: str) -> Dict:
        """Measure comprehensive resource usage for a framework."""
        
        # Import progress functions to access globals directly
        import main
        
        def update_progress_status(fw, stage):
            print(f"DEBUG: update_progress_status called: {fw}, {stage}")
            if main.global_progress and main.global_task is not None:
                main.global_progress.update(main.global_task, framework=fw, stage=stage)
                
        def update_progress(fw="", stage=""):
            print(f"DEBUG: update_progress called: {fw}, {stage}")
            print(f"DEBUG: main.global_progress={main.global_progress is not None}, main.global_task={main.global_task}")
            if main.global_progress and main.global_task is not None:
                try:
                    main.global_progress.advance(main.global_task)
                    current = main.global_progress.tasks[main.global_task].completed
                    total = main.global_progress.tasks[main.global_task].total
                    print(f"DEBUG: Progress advanced to {current}/{total}")
                except Exception as e:
                    print(f"DEBUG: Error advancing progress: {e}")
                if fw or stage:
                    main.global_progress.update(main.global_task, framework=fw, stage=stage)
            else:
                print(f"DEBUG: Cannot advance progress - global_progress or global_task is None")
        
        # Step 1: Establishing baseline
        update_progress_status(framework, "Establishing baseline...")
        baseline = self.system_monitor.establish_baseline(quiet=True)
        console.print(f"[dim]✓ {framework}: Baseline {baseline.memory_mb:.0f}MB memory, {baseline.process_count} processes[/dim]")
        update_progress(framework, "Baseline established")
        
        # Step 2: Connecting to browser
        update_progress_status(framework, "Connecting to browser...")
        browser_connected = await self.browser_monitor.connect()
        if browser_connected:
            console.print(f"[dim]✓ {framework}: Browser DevTools connected[/dim]")
            # Test heap monitoring capability
            test_heap = await self.browser_monitor.get_memory_usage()
            if test_heap.get("connection_working") and test_heap.get("heap_total_mb", 0) > 0:
                console.print(f"[dim]✓ {framework}: Heap monitoring active ({test_heap['heap_total_mb']:.1f}MB total)[/dim]")
            elif test_heap.get("no_heap_data"):
                console.print(f"[dim]⚠ {framework}: DevTools connected but no heap data available[/dim]")
            else:
                console.print(f"[dim]⚠ {framework}: DevTools connected but heap monitoring failed[/dim]")
        else:
            console.print(f"[dim]⚠ {framework}: DevTools unavailable, using system monitoring only[/dim]")
        update_progress(framework, "Browser connection attempted")
        
        # Step 3: Loading application
        update_progress_status(framework, "Loading application...")
        framework_url = self.get_framework_url(framework)
        console.print(f"[dim]✓ {framework}: Loading {framework_url}[/dim]")
        
        # Allow time for page load and JavaScript execution to stabilize heap
        await asyncio.sleep(2)  # Increased wait time for page load and heap stabilization
        update_progress(framework, "Application loaded")
        
        # Steps 4-7: Run interaction scenarios (4 scenarios = 4 steps)
        interaction_results = []
        for i, (scenario_name, scenario_func) in enumerate(self.interaction_scenarios):
            update_progress_status(framework, f"Testing {scenario_name}...")
            console.print(f"[dim]⚡ {framework}: Running {scenario_name} test[/dim]")
            
            try:
                interaction_data = await scenario_func(framework_url)
                interaction_results.append(interaction_data)
                console.print(f"[dim]✓ {framework}: {scenario_name} completed[/dim]")
            except Exception as e:
                console.print(f"[dim]⚠ {framework}: {scenario_name} failed: {str(e)}[/dim]")
            
            update_progress(framework, f"{scenario_name} completed")  # Progress after each scenario
        
        # Step 8: Finalizing measurements
        update_progress_status(framework, "Finalizing measurements...")
        final_snapshot = self.system_monitor.get_resource_snapshot()
        app_usage = self.system_monitor.calculate_app_usage(final_snapshot)
        console.print(f"[dim]📊 {framework}: Final measurements - {app_usage.memory_mb:.1f}MB memory, {app_usage.cpu_percent:.1f}% CPU[/dim]")
        await self.browser_monitor.close()
        update_progress(framework, "Completed")  # Complete the 8th step
        
        return {
            "framework": framework,
            "baseline": {
                "memory_mb": baseline.memory_mb,
                "cpu_percent": baseline.cpu_percent,
                "process_count": baseline.process_count
            },
            "final_usage": {
                "total_memory_mb": final_snapshot.memory_mb,
                "total_cpu_percent": final_snapshot.cpu_percent,
                "app_memory_mb": app_usage.memory_mb,
                "app_cpu_percent": app_usage.cpu_percent,
                "process_count": final_snapshot.process_count
            },
            "interactions": [interaction.to_dict() for interaction in interaction_results],
            "summary": self._calculate_summary_metrics(interaction_results, app_usage)
        }
    
    async def _measure_initial_load(self, url: str) -> InteractionMetrics:
        """Measure resources during initial page load."""
        start_time = time.time()
        samples = []
        
        # Optimized: Fewer samples with shorter intervals
        measurement_intervals = [0.3, 0.5, 0.8]  # Faster measurements
        
        for i, interval in enumerate(measurement_intervals):
            sample = self.system_monitor.get_resource_snapshot()
            
            # Add browser memory if available
            if self.browser_monitor.websocket:
                browser_memory = await self.browser_monitor.get_memory_usage()
                sample.browser_heap_mb = browser_memory.get("heap_used_mb", 0)
                sample.browser_heap_limit_mb = browser_memory.get("heap_limit_mb", 0)
            
            samples.append(sample)
            
            if i < len(measurement_intervals) - 1:  # Don't sleep after last measurement
                await asyncio.sleep(interval)
        
        return self._create_interaction_metrics("Initial Load", start_time, samples)
    
    async def _measure_weather_search(self, url: str) -> InteractionMetrics:
        """Measure resources during weather search simulation."""
        start_time = time.time()
        samples = []
        
        # Optimized: Fewer searches, faster execution
        search_phases = ["Initial", "Peak", "Sustained"]  # 3 phases instead of 8 cities
        
        for i, phase in enumerate(search_phases):
            sample = self.system_monitor.get_resource_snapshot()
            
            if self.browser_monitor.websocket:
                browser_memory = await self.browser_monitor.get_memory_usage()
                sample.browser_heap_mb = browser_memory.get("heap_used_mb", 0)
            
            samples.append(sample)
            
            # Shorter delays
            if i < len(search_phases) - 1:
                await asyncio.sleep(0.4)
        
        return self._create_interaction_metrics("Weather Search", start_time, samples)
    
    async def _measure_ui_interactions(self, url: str) -> InteractionMetrics:
        """Measure resources during UI interactions."""
        start_time = time.time()
        samples = []
        
        # Optimized: Fewer samples, faster execution
        for i in range(3):  # Reduced from 8 to 3 samples
            sample = self.system_monitor.get_resource_snapshot()
            
            if self.browser_monitor.websocket:
                browser_memory = await self.browser_monitor.get_memory_usage()
                sample.browser_heap_mb = browser_memory.get("heap_used_mb", 0)
            
            samples.append(sample)
            if i < 2:  # Don't sleep after last sample
                await asyncio.sleep(0.5)  # Reduced from 0.8s
        
        return self._create_interaction_metrics("UI Interactions", start_time, samples)
    
    async def _measure_memory_stress(self, url: str) -> InteractionMetrics:
        """Measure resources under memory stress conditions."""
        start_time = time.time()
        samples = []
        
        # Optimized: Fewer samples with shorter intervals
        for i in range(3):  # Reduced from 10 to 3 samples
            sample = self.system_monitor.get_resource_snapshot()
            
            if self.browser_monitor.websocket:
                browser_memory = await self.browser_monitor.get_memory_usage()
                sample.browser_heap_mb = browser_memory.get("heap_used_mb", 0)
            
            samples.append(sample)
            if i < 2:  # Don't sleep after last sample
                await asyncio.sleep(1)  # Reduced from 2s
        
        return self._create_interaction_metrics("Memory Stress", start_time, samples)
    
    def _measure_initial_load_sync(self, url: str, browser_monitor=None) -> InteractionMetrics:
        """Measure resources during initial page load (synchronous version)."""
        start_time = time.time()
        samples = []
        
        # Simulate some page interaction if DevTools available
        if browser_monitor:
            try:
                # Trigger some JavaScript execution to create measurable load
                asyncio.run(browser_monitor.send_command("Runtime.evaluate", {
                    "expression": "for(let i=0; i<100000; i++) { Math.random(); }"
                }))
            except Exception:
                pass
        
        # Take 3 measurements with intervals
        for i in range(3):
            sample = self.system_monitor.get_resource_snapshot()
            
            # Get browser heap data if available
            if browser_monitor:
                try:
                    heap_data = asyncio.run(browser_monitor.get_memory_usage())
                    if heap_data.get("connection_working", False):
                        sample.browser_memory_mb = heap_data.get("heap_total_mb", 0)
                        sample.browser_heap_mb = heap_data.get("heap_used_mb", 0)
                        sample.browser_heap_limit_mb = heap_data.get("heap_total_mb", 0)
                except Exception:
                    pass
            
            samples.append(sample)
            
            if i < 2:  # Don't sleep after last measurement
                time.sleep(0.5)
        
        return self._create_interaction_metrics("Initial Load", start_time, samples)
    
    def _measure_weather_search_sync(self, url: str, browser_monitor=None) -> InteractionMetrics:
        """Measure resources during weather search simulation (synchronous version)."""
        start_time = time.time()
        samples = []
        
        # Simulate search interactions
        search_phases = ["Initial", "Peak", "Sustained"]
        
        for i, phase in enumerate(search_phases):
            # Simulate search activity if DevTools available
            if browser_monitor:
                try:
                    # Simulate typing in search field and DOM manipulation
                    asyncio.run(browser_monitor.send_command("Runtime.evaluate", {
                        "expression": f"document.body.innerHTML += '<div>Search {phase}</div>'; for(let i=0; i<50000; i++) {{ Math.sin(i); }}"
                    }))
                except Exception:
                    pass
            
            sample = self.system_monitor.get_resource_snapshot()
            
            # Get heap data if available
            if browser_monitor:
                try:
                    heap_data = asyncio.run(browser_monitor.get_memory_usage())
                    if heap_data.get("connection_working", False):
                        sample.browser_heap_mb = heap_data.get("heap_used_mb", 0)
                except Exception:
                    pass
            
            samples.append(sample)
            
            if i < len(search_phases) - 1:
                time.sleep(0.4)
        
        return self._create_interaction_metrics("Weather Search", start_time, samples)
    
    def _measure_ui_interactions_sync(self, url: str, browser_monitor=None) -> InteractionMetrics:
        """Measure resources during UI interactions (synchronous version)."""
        start_time = time.time()
        samples = []
        
        # Simulate UI interactions
        for i in range(3):
            # Simulate clicks and UI updates if DevTools available
            if browser_monitor:
                try:
                    # Simulate UI interactions and DOM updates
                    asyncio.run(browser_monitor.send_command("Runtime.evaluate", {
                        "expression": f"document.body.style.backgroundColor = 'hsl({i*120}, 50%, 95%)'; for(let j=0; j<30000; j++) {{ document.createElement('span'); }}"
                    }))
                except Exception:
                    pass
            
            sample = self.system_monitor.get_resource_snapshot()
            
            # Get heap data if available
            if browser_monitor:
                try:
                    heap_data = asyncio.run(browser_monitor.get_memory_usage())
                    if heap_data.get("connection_working", False):
                        sample.browser_heap_mb = heap_data.get("heap_used_mb", 0)
                except Exception:
                    pass
            
            samples.append(sample)
            if i < 2:
                time.sleep(0.5)
        
        return self._create_interaction_metrics("UI Interactions", start_time, samples)
    
    def _measure_memory_stress_sync(self, url: str, browser_monitor=None) -> InteractionMetrics:
        """Measure resources under memory stress conditions (synchronous version)."""
        start_time = time.time()
        samples = []
        
        # Simulate memory-intensive operations
        for i in range(3):
            # Create memory pressure if DevTools available
            if browser_monitor:
                try:
                    # Simulate memory allocation and heavy computation
                    asyncio.run(browser_monitor.send_command("Runtime.evaluate", {
                        "expression": f"let arr{i} = new Array(100000).fill(0).map((_, idx) => Math.random() * idx); arr{i}.sort();"
                    }))
                except Exception:
                    pass
            
            sample = self.system_monitor.get_resource_snapshot()
            
            # Get heap data if available
            if browser_monitor:
                try:
                    heap_data = asyncio.run(browser_monitor.get_memory_usage())
                    if heap_data.get("connection_working", False):
                        sample.browser_heap_mb = heap_data.get("heap_used_mb", 0)
                except Exception:
                    pass
            
            samples.append(sample)
            if i < 2:
                time.sleep(1)
        
        return self._create_interaction_metrics("Memory Stress", start_time, samples)
    
    def _measure_framework_resources_simple(self, framework: str) -> Dict:
        """Measure comprehensive resource usage for a framework with isolated Chrome."""
        
        framework_url = self.get_framework_url(framework)
        chrome_proc = None
        chrome_user_dir = None
        browser_monitor = None
        
        try:
            # Step 1: Launch isolated Chrome instance for this framework
            console.print(f"[dim]🚀 {framework}: Launching isolated Chrome...[/dim]")
            chrome_proc, chrome_user_dir = launch_isolated_chrome(port=9223, url=framework_url)
            
            # Set up monitoring for this specific Chrome instance
            self.system_monitor = SystemResourceMonitor(root_pid=chrome_proc.pid)
            
            # Wait for Chrome to start and load the page
            time.sleep(3)
            
            # Step 2: Establish baseline with the isolated Chrome
            baseline = self.system_monitor.establish_baseline(quiet=True)
            console.print(f"[dim]📊 {framework}: Baseline established - {baseline.memory_mb:.1f}MB[/dim]")
            
            # Step 3: Try to connect DevTools to the isolated Chrome
            try:
                browser_monitor = BrowserResourceMonitor(debug_host="localhost", debug_port=9223)
                connected = asyncio.run(browser_monitor.connect())
                if connected:
                    # Navigate to the framework URL and wait for load
                    navigation_success = asyncio.run(browser_monitor.navigate_to_url(framework_url))
                    if navigation_success:
                        console.print(f"[dim]✓ {framework}: DevTools connected and navigated[/dim]")
                    else:
                        console.print(f"[dim]⚠ {framework}: DevTools connected but navigation failed[/dim]")
                else:
                    console.print(f"[dim]⚠ {framework}: DevTools connection failed[/dim]")
                    browser_monitor = None
            except Exception:
                console.print(f"[dim]⚠ {framework}: DevTools unavailable[/dim]")
                browser_monitor = None
            
            # Allow additional time for JavaScript to initialize
            time.sleep(2)
            
            # Step 4: Run interaction scenarios
            interaction_results = []
            scenarios = [
                ("Initial Load", self._measure_initial_load_sync),
                ("Weather Search", self._measure_weather_search_sync),
                ("UI Interactions", self._measure_ui_interactions_sync),
                ("Memory Stress", self._measure_memory_stress_sync)
            ]
            
            for scenario_name, scenario_func in scenarios:
                try:
                    console.print(f"[dim]⚡ {framework}: Running {scenario_name}...[/dim]")
                    interaction_data = scenario_func(framework_url, browser_monitor)
                    interaction_results.append(interaction_data)
                except Exception as e:
                    console.print(f"[dim]⚠ {framework}: {scenario_name} failed: {str(e)}[/dim]")
            
            # Step 5: Final measurements
            final_snapshot = self.system_monitor.get_resource_snapshot()
            app_usage = self.system_monitor.calculate_app_usage(final_snapshot)
            console.print(f"[dim]📊 {framework}: Final usage - {app_usage.memory_mb:.1f}MB, {app_usage.cpu_percent:.1f}% CPU[/dim]")
            
            return {
                "framework": framework,
                "baseline": {
                    "memory_mb": baseline.memory_mb,
                    "cpu_percent": baseline.cpu_percent,
                    "process_count": baseline.process_count
                },
                "final_usage": {
                    "total_memory_mb": final_snapshot.memory_mb,
                    "total_cpu_percent": final_snapshot.cpu_percent,
                    "app_memory_mb": app_usage.memory_mb,
                    "app_cpu_percent": app_usage.cpu_percent,
                    "process_count": final_snapshot.process_count
                },
                "interactions": [interaction.to_dict() for interaction in interaction_results],
                "summary": self._calculate_summary_metrics(interaction_results, app_usage)
            }
            
        except Exception as e:
            console.print(f"[red]✗ {framework}: Measurement failed: {str(e)}[/red]")
            return {
                "framework": framework,
                "error": str(e),
                "baseline": {"memory_mb": 0, "cpu_percent": 0, "process_count": 0},
                "final_usage": {"total_memory_mb": 0, "total_cpu_percent": 0, "app_memory_mb": 0, "app_cpu_percent": 0, "process_count": 0},
                "interactions": [],
                "summary": {}
            }
            
        finally:
            # Clean up browser and DevTools
            if browser_monitor:
                try:
                    asyncio.run(browser_monitor.close())
                except Exception:
                    pass
            
            if chrome_proc:
                try:
                    chrome_proc.terminate()
                    chrome_proc.wait(timeout=5)
                    console.print(f"[dim]🗑️ {framework}: Chrome process terminated[/dim]")
                except Exception:
                    try:
                        chrome_proc.kill()
                        chrome_proc.wait(timeout=2)
                    except Exception:
                        pass
            
            if chrome_user_dir:
                try:
                    shutil.rmtree(chrome_user_dir, ignore_errors=True)
                    console.print(f"[dim]🗑️ {framework}: Cleaned up user directory[/dim]")
                except Exception:
                    pass
    
    def _create_interaction_metrics(self, name: str, start_time: float, samples: List[ResourceSnapshot]) -> InteractionMetrics:
        """Create interaction metrics from samples."""
        if not samples:
            return InteractionMetrics(name, 0, 0, 0, 0, 0, [])
        
        duration = time.time() - start_time
        
        # Calculate memory delta
        memory_values = [s.memory_mb for s in samples]
        memory_delta = max(memory_values) - min(memory_values) if memory_values else 0
        
        # If delta is very small, use average usage above baseline
        if memory_delta < 1.0 and self.system_monitor.baseline and memory_values:
            avg_memory = sum(memory_values) / len(memory_values)
            baseline_memory = self.system_monitor.baseline.memory_mb
            memory_delta = max(0, avg_memory - baseline_memory)
        
        # Calculate CPU metrics (report actual values)
        cpu_values = [s.cpu_percent for s in samples]
        cpu_peak = max(cpu_values) if cpu_values else 0
        cpu_average = sum(cpu_values) / len(cpu_values) if cpu_values else 0
        
        # Calculate heap delta
        heap_values = [s.browser_heap_mb for s in samples if s.browser_heap_mb > 0]
        if heap_values:
            heap_delta = max(heap_values) - min(heap_values)
            # If delta is very small but we have heap data, report average usage
            if heap_delta < 0.1 and heap_values:
                heap_delta = sum(heap_values) / len(heap_values)
        else:
            heap_delta = 0
        
        return InteractionMetrics(
            name=name,
            duration=duration,
            memory_delta_mb=memory_delta,
            cpu_peak_percent=cpu_peak,
            cpu_average_percent=cpu_average,
            heap_delta_mb=heap_delta,
            samples=samples
        )
    
    def _calculate_summary_metrics(self, interactions: List[InteractionMetrics], final_usage: ResourceSnapshot) -> Dict:
        """Calculate summary metrics from all interactions."""
        if not interactions:
            return {}
        
        total_memory_delta = sum(i.memory_delta_mb for i in interactions)
        peak_cpu = max(i.cpu_peak_percent for i in interactions)
        average_cpu = sum(i.cpu_average_percent for i in interactions) / len(interactions)
        total_heap_delta = sum(i.heap_delta_mb for i in interactions)
        
        return {
            "total_memory_delta_mb": total_memory_delta,
            "peak_cpu_percent": peak_cpu,
            "average_cpu_percent": average_cpu,
            "total_heap_delta_mb": total_heap_delta,
            "final_app_memory_mb": final_usage.memory_mb,
            "final_app_cpu_percent": final_usage.cpu_percent,
            "memory_efficiency_score": self._calculate_efficiency_score(final_usage.memory_mb, total_memory_delta),
            "cpu_efficiency_score": self._calculate_efficiency_score(average_cpu, peak_cpu)
        }
    
    def _calculate_efficiency_score(self, base_value: float, delta_value: float) -> float:
        """Calculate efficiency score (0-100, higher is better)."""
        # If no base usage, efficiency depends on whether there were any deltas
        if base_value <= 0:
            return 95 if delta_value <= 0 else 70  # High but not perfect efficiency
        
        # Lower deltas relative to base value = higher efficiency
        ratio = delta_value / base_value
        score = max(0, 100 - (ratio * 30))  # Less harsh scaling
        return min(100, score)
    
    def _create_error_result(self, framework: str, error: str) -> BenchmarkResult:
        """Create a failed benchmark result."""
        result = BenchmarkResult(framework, self.benchmark_name, {})
        result.mark_failed(error)
        return result
    
    def _add_summary_columns(self, table: Table):
        """Add resource usage columns to summary table."""
        table.add_column("Memory (MB)", justify="right", style="blue")
        table.add_column("CPU Peak (%)", justify="right", style="red")
        table.add_column("CPU Avg (%)", justify="right", style="yellow")
        table.add_column("Heap (MB)", justify="right", style="green")
        table.add_column("Efficiency", justify="right", style="magenta")
    
    def _get_summary_row_data(self, result: BenchmarkResult) -> List[str]:
        """Get resource usage row data for summary table."""
        if not result.success:
            return ["—", "—", "—", "—", "—"]
        
        summary = result.data.get("summary", {})
        final_usage = result.data.get("final_usage", {})
        
        memory = f"{final_usage.get('app_memory_mb', 0):.1f}"
        cpu_peak = f"{summary.get('peak_cpu_percent', 0):.1f}"
        cpu_avg = f"{summary.get('average_cpu_percent', 0):.1f}"
        heap = f"{summary.get('total_heap_delta_mb', 0):.1f}"
        
        # Color-coded efficiency score
        efficiency = summary.get('memory_efficiency_score', 0)
        if efficiency >= 80:
            efficiency_display = f"[green]{efficiency:.0f}[/green]"
        elif efficiency >= 60:
            efficiency_display = f"[yellow]{efficiency:.0f}[/yellow]"
        else:
            efficiency_display = f"[red]{efficiency:.0f}[/red]"
        
        return [memory, cpu_peak, cpu_avg, heap, efficiency_display]
    
    def display_detailed_results(self, framework: str = None):
        """Display detailed resource usage analysis."""
        results_to_show = self.results
        if framework:
            results_to_show = [r for r in self.results if r.framework == framework]
        
        for result in results_to_show:
            if not result.success:
                continue
            
            data = result.data
            console.print(f"\n📊 Detailed resource analysis for {result.framework}:")
            
            # Summary table
            summary_table = Table(title=f"{result.framework} Resource Usage Summary")
            summary_table.add_column("Metric", style="bold")
            summary_table.add_column("Value", justify="right")
            
            final_usage = data.get("final_usage", {})
            summary = data.get("summary", {})
            
            summary_table.add_row("App Memory Usage", f"{final_usage.get('app_memory_mb', 0):.1f} MB")
            summary_table.add_row("Peak CPU Usage", f"{summary.get('peak_cpu_percent', 0):.1f}%")
            summary_table.add_row("Average CPU Usage", f"{summary.get('average_cpu_percent', 0):.1f}%")
            summary_table.add_row("Browser Heap Delta", f"{summary.get('total_heap_delta_mb', 0):.1f} MB")
            summary_table.add_row("Memory Efficiency", f"{summary.get('memory_efficiency_score', 0):.0f}/100")
            summary_table.add_row("CPU Efficiency", f"{summary.get('cpu_efficiency_score', 0):.0f}/100")
            
            console.print(summary_table)
            
            # Interaction details
            interactions = data.get("interactions", [])
            if interactions:
                interaction_table = Table(title=f"{result.framework} Interaction Analysis")
                interaction_table.add_column("Interaction", style="bold")
                interaction_table.add_column("Duration", justify="right")
                interaction_table.add_column("Memory Δ", justify="right")
                interaction_table.add_column("CPU Peak", justify="right")
                interaction_table.add_column("CPU Avg", justify="right")
                
                for interaction in interactions:
                    interaction_table.add_row(
                        interaction.get("name", "Unknown"),
                        f"{interaction.get('duration', 0):.1f}s",
                        f"{interaction.get('memory_delta_mb', 0):.1f} MB",
                        f"{interaction.get('cpu_peak_percent', 0):.1f}%",
                        f"{interaction.get('cpu_average_percent', 0):.1f}%"
                    )
                
                console.print(interaction_table)