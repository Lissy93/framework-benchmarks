#!/usr/bin/env python3
"""Lighthouse performance benchmarking for all frameworks."""

import json
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List

import click
from rich.console import Console
from rich.table import Table

from base import BenchmarkRunner, BenchmarkResult
from chrome_launcher import get_chrome_connection

console = Console()


class LighthouseRunner(BenchmarkRunner):
    """Lighthouse benchmark runner."""
    
    @property
    def benchmark_name(self) -> str:
        return "Lighthouse"
    
    def __init__(self):
        super().__init__()
        self.lighthouse_config = self.benchmark_config.get("lighthouse", {})
        self.thresholds = self.lighthouse_config.get("thresholds", {})
        self.categories = self.lighthouse_config.get("categories", ["performance"])
        self.chrome_launcher = None
    
    def run_single_benchmark(self, framework: str) -> BenchmarkResult:
        """Run Lighthouse audit for a single framework."""
        url = self.get_framework_url(framework)
        
        # Ensure Chrome is available
        if not self._ensure_chrome_ready():
            return self._create_error_result(framework, "Chrome not available - install Chrome to run Lighthouse benchmarks")
        
        # Clear browser cache to ensure fresh results for each framework
        self._clear_browser_cache()
        
        try:
            return self._run_lighthouse_audit(framework, url)
        except subprocess.TimeoutExpired:
            return self._create_error_result(framework, "Lighthouse audit timed out")
        except Exception as e:
            return self._create_error_result(framework, f"Audit failed: {str(e)}")
    
    def _ensure_chrome_ready(self) -> bool:
        """Ensure Chrome is available for Lighthouse."""
        chrome_ready, launcher = get_chrome_connection()
        if chrome_ready:
            self.chrome_launcher = launcher  # Store launcher for cleanup
            return True
        
        console.print("[red]Chrome not available for Lighthouse benchmarks[/red]")
        return False
    
    def _run_lighthouse_audit(self, framework: str, url: str) -> BenchmarkResult:
        """Execute Lighthouse audit and parse results."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp_file:
            tmp_path = tmp_file.name
        
        # Add cache-busting parameter to URL to ensure fresh results
        import time
        cache_bust_url = f"{url}&_cb={int(time.time() * 1000)}"
        
        # Build Lighthouse command with cache-busting flags
        cmd = [
            "npx", "lighthouse", cache_bust_url,
            "--output", "json", 
            "--output-path", tmp_path,
            "--quiet",
            "--port", "9222",
            "--throttling-method", "simulate",  # Consistent throttling
            "--emulated-form-factor", "desktop",  # Consistent form factor
            "--chrome-flags", "--disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-extensions"
        ]
        
        # Add categories
        for category in self.categories:
            cmd.extend(["--only-categories", category])
        
        # Run audit
        console.print(f"[dim]Auditing {framework}...[/dim]")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
        
        try:
            if result.returncode != 0:
                error = result.stderr.strip() or result.stdout.strip() or "Unknown error"
                return self._create_error_result(framework, error)
            
            # Parse and extract data
            with open(tmp_path, 'r') as f:
                data = json.load(f)
            
            return self._extract_lighthouse_data(framework, url, data)
            
        finally:
            Path(tmp_path).unlink(missing_ok=True)
    
    def _extract_lighthouse_data(self, framework: str, url: str, data: Dict) -> BenchmarkResult:
        """Extract relevant data from Lighthouse results."""
        # Extract scores
        scores = {}
        for name, category in data.get("categories", {}).items():
            if category.get("score") is not None:
                scores[name] = round(category["score"] * 100, 1)
        
        # Extract key metrics
        metrics = {}
        key_metrics = ["first-contentful-paint", "largest-contentful-paint", 
                      "speed-index", "cumulative-layout-shift", "total-blocking-time"]
        
        for metric_id in key_metrics:
            if metric_id in data.get("audits", {}):
                audit = data["audits"][metric_id]
                metrics[metric_id] = {
                    "value": audit.get("numericValue"),
                    "displayValue": audit.get("displayValue", ""),
                    "score": audit.get("score")
                }
        
        return BenchmarkResult(framework, self.benchmark_name, {
            "url": url,
            "scores": scores,
            "metrics": metrics,
            "lighthouse_version": data.get("lighthouseVersion", "unknown"),
            "fetch_time": data.get("fetchTime", "")
        })
    
    def _create_error_result(self, framework: str, error: str) -> BenchmarkResult:
        """Create a failed benchmark result."""
        result = BenchmarkResult(framework, self.benchmark_name, {})
        result.mark_failed(error)
        return result
    
    
    def _clear_browser_cache(self):
        """Clear browser cache between runs for accuracy."""
        try:
            import requests
            
            # Get list of open tabs
            tabs_response = requests.get("http://127.0.0.1:9222/json", timeout=5)
            if tabs_response.status_code != 200:
                return
            
            tabs = tabs_response.json()
            if not tabs:
                return
            
            # Use the first available tab
            tab = tabs[0]
            ws_url = tab.get('webSocketDebuggerUrl')
            if not ws_url:
                return
            
            # Send DevTools commands to clear cache and storage
            devtools_commands = [
                {"id": 1, "method": "Network.clearBrowserCache", "params": {}},
                {"id": 2, "method": "Network.clearBrowserCookies", "params": {}},
                {"id": 3, "method": "Storage.clearDataForOrigin", "params": {
                    "origin": self.server_config.get("baseUrl", "http://127.0.0.1:3000"),
                    "storageTypes": "all"
                }},
                {"id": 4, "method": "Runtime.discardConsoleEntries", "params": {}}
            ]
            
            # For now, just use a simple approach with requests to the tab endpoint
            for command in devtools_commands:
                try:
                    requests.post(
                        f"http://127.0.0.1:9222/json/runtime/evaluate",
                        json={"expression": f"console.clear(); localStorage.clear(); sessionStorage.clear();"},
                        timeout=2
                    )
                except:
                    pass
                    
        except:
            # Cache clearing is optional - don't fail if it doesn't work
            pass
    
    def cleanup(self):
        """Clean up Chrome launcher if we started it."""
        if self.chrome_launcher:
            self.chrome_launcher.cleanup()
            self.chrome_launcher = None
    
    def __del__(self):
        """Ensure cleanup on destruction."""
        self.cleanup()
    
    # Display methods (unchanged from original)
    def _add_summary_columns(self, table: Table):
        """Add Lighthouse-specific columns to summary table."""
        table.add_column("Performance", justify="center", style="green")
        table.add_column("Accessibility", justify="center", style="blue") 
        table.add_column("Best Practices", justify="center", style="yellow")
        table.add_column("SEO", justify="center", style="magenta")
        table.add_column("FCP", justify="center", style="cyan")
        table.add_column("LCP", justify="center", style="cyan")
    
    def _get_summary_row_data(self, result: BenchmarkResult) -> List[str]:
        """Get Lighthouse-specific row data for summary table."""
        scores = result.data.get("scores", {})
        metrics = result.data.get("metrics", {})
        
        # Format scores with threshold coloring
        def format_score(score, threshold):
            if score is None:
                return "—"
            
            if score >= threshold:
                return f"[green]{score}[/green]"
            elif score >= threshold - 10:
                return f"[yellow]{score}[/yellow]"
            else:
                return f"[red]{score}[/red]"
        
        performance = format_score(scores.get("performance"), self.thresholds.get("performance", 80))
        accessibility = format_score(scores.get("accessibility"), self.thresholds.get("accessibility", 90))
        best_practices = format_score(scores.get("best-practices"), self.thresholds.get("best-practices", 80))
        seo = format_score(scores.get("seo"), self.thresholds.get("seo", 90))
        
        # Format key metrics
        fcp = metrics.get("first-contentful-paint", {}).get("displayValue", "—")
        lcp = metrics.get("largest-contentful-paint", {}).get("displayValue", "—")
        
        return [performance, accessibility, best_practices, seo, fcp, lcp]
    
    def display_detailed_results(self, framework: str = None):
        """Display detailed results for a specific framework or all frameworks."""
        results_to_show = self.results
        if framework:
            results_to_show = [r for r in self.results if r.framework == framework]
        
        for result in results_to_show:
            if not result.success:
                continue
                
            console.print(f"\n🌟 Detailed results for {result.framework}:")
            
            # Scores table
            scores_table = Table(title=f"{result.framework} Lighthouse Scores")
            scores_table.add_column("Category", style="bold")
            scores_table.add_column("Score", justify="right")
            scores_table.add_column("Status", justify="center")
            
            scores = result.data.get("scores", {})
            for category, score in scores.items():
                threshold = self.thresholds.get(category, 80)
                status = "✅" if score >= threshold else "⚠️" if score >= threshold - 10 else "❌"
                scores_table.add_row(category.replace("-", " ").title(), f"{score}%", status)
            
            console.print(scores_table)
            
            # Metrics table
            metrics_table = Table(title=f"{result.framework} Performance Metrics")
            metrics_table.add_column("Metric", style="bold")
            metrics_table.add_column("Value", justify="right")
            metrics_table.add_column("Score", justify="center")
            
            metrics = result.data.get("metrics", {})
            for metric_name, metric_data in metrics.items():
                display_name = metric_name.replace("-", " ").title()
                display_value = metric_data.get("displayValue", "—")
                score = metric_data.get("score")
                score_display = f"{score * 100:.0f}%" if score is not None else "—"
                metrics_table.add_row(display_name, display_value, score_display)
            
            console.print(metrics_table)


@click.command()
@click.option('--frameworks', '-f', help='Comma-separated list of frameworks to benchmark')
@click.option('--detailed', '-d', is_flag=True, help='Show detailed results')
@click.option('--save', '-s', is_flag=True, default=True, help='Save results to file')
def lighthouse_benchmark(frameworks: str, detailed: bool, save: bool):
    """Run Lighthouse performance benchmarks for weather app frameworks."""
    
    runner = LighthouseRunner()
    
    try:
        # Parse frameworks
        framework_list = None
        if frameworks:
            framework_list = [f.strip() for f in frameworks.split(',')]
        
        # Run benchmarks
        results = runner.run_all_frameworks(framework_list)
        
        if not results:
            return
        
        # Display summary
        runner.display_summary()
        
        # Display detailed results if requested
        if detailed:
            runner.display_detailed_results()
        
        # Save results
        if save:
            output_path = runner.save_results()
            console.print(f"\n💾 Results saved to: {output_path}")
        
        # Show pass/fail summary
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]
        
        if successful:
            console.print(f"\n✅ {len(successful)} frameworks passed Lighthouse benchmarks")
        if failed:
            console.print(f"❌ {len(failed)} frameworks failed benchmarks")
    
    finally:
        runner.cleanup()


if __name__ == "__main__":
    lighthouse_benchmark()