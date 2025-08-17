"""Base classes for benchmark implementations."""

import json
import time
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import requests
from rich.console import Console
from rich.table import Table

import sys
sys.path.append(str(Path(__file__).parent.parent))
from common import get_config, get_frameworks, show_header, show_success, show_error

console = Console()


class BenchmarkResult:
    """Container for benchmark results."""
    
    def __init__(self, framework: str, benchmark_type: str, data: Dict[str, Any], 
                 timestamp: Optional[datetime] = None):
        self.framework = framework
        self.benchmark_type = benchmark_type
        self.data = data
        self.timestamp = timestamp or datetime.now()
        self.success = True
        self.error_message = None
    
    def mark_failed(self, error: str):
        """Mark this result as failed."""
        self.success = False
        self.error_message = error
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "framework": self.framework,
            "benchmark_type": self.benchmark_type,
            "timestamp": self.timestamp.isoformat(),
            "success": self.success,
            "error_message": self.error_message,
            "data": self.data
        }


class BenchmarkRunner(ABC):
    """Abstract base class for benchmark runners."""
    
    def __init__(self):
        self.config = get_config()
        self.frameworks = get_frameworks()
        self.benchmark_config = self.config.get("benchmarks", {})
        self.server_config = self.benchmark_config.get("server", {})
        self.output_config = self.benchmark_config.get("output", {})
        self.results: List[BenchmarkResult] = []
    
    @property
    @abstractmethod
    def benchmark_name(self) -> str:
        """Name of this benchmark type."""
        pass
    
    @abstractmethod
    def run_single_benchmark(self, framework: str) -> BenchmarkResult:
        """Run benchmark for a single framework."""
        pass
    
    def get_framework_url(self, framework: str) -> str:
        """Get the URL for a framework."""
        base_url = self.server_config.get("baseUrl", "http://127.0.0.1:3000")
        return f"{base_url}/{framework}/?mock=true"
    
    def check_server_health(self) -> bool:
        """Check if the benchmark server is running."""
        try:
            base_url = self.server_config.get("baseUrl", "http://127.0.0.1:3000")
            health_endpoint = self.server_config.get("healthEndpoint", "/health")
            response = requests.get(f"{base_url}{health_endpoint}", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def run_all_frameworks(self, frameworks: Optional[List[str]] = None, executions: int = 1) -> List[BenchmarkResult]:
        """Run benchmarks for all or specified frameworks."""
        if frameworks is None:
            frameworks = [fw["id"] for fw in self.frameworks]
        
        execution_text = f" ({executions} executions each)" if executions > 1 else ""
        show_header(f"{self.benchmark_name} Benchmark", 
                   f"Running {self.benchmark_name.lower()} benchmarks for {len(frameworks)} frameworks{execution_text}")
        
        # Check server is running
        if not self.check_server_health():
            show_error("Benchmark server is not running. Start it with: npm start")
            return []
        
        console.print(f"✅ Server is running at {self.server_config.get('baseUrl')}")
        
        try:
            # Run benchmarks
            for framework in frameworks:
                try:
                    if executions == 1:
                        console.print(f"\n🔄 Running {self.benchmark_name} for [bold]{framework}[/bold]...")
                        result = self.run_single_benchmark(framework)
                        self.results.append(result)
                        
                        if result.success:
                            console.print(f"✅ Completed {framework}")
                        else:
                            console.print(f"❌ Failed {framework}: {result.error_message}")
                    else:
                        console.print(f"\n🔄 Running {self.benchmark_name} for [bold]{framework}[/bold] ({executions} executions)...")
                        result = self.run_multiple_executions(framework, executions)
                        self.results.append(result)
                        
                        if result.success:
                            console.print(f"✅ Completed {framework} (averaged from {executions} runs)")
                        else:
                            console.print(f"❌ Failed {framework}: {result.error_message}")
                        
                except Exception as e:
                    error_result = BenchmarkResult(framework, self.benchmark_name, {})
                    error_result.mark_failed(str(e))
                    self.results.append(error_result)
                    console.print(f"❌ Error with {framework}: {e}")
        
        finally:
            # Cleanup if benchmark runner supports it
            if hasattr(self, 'cleanup'):
                self.cleanup()
        
        return self.results
    
    def run_multiple_executions(self, framework: str, executions: int) -> BenchmarkResult:
        """Run multiple executions of a benchmark and average the results."""
        successful_results = []
        failed_results = []
        
        for execution in range(executions):
            console.print(f"   [dim]Execution {execution + 1}/{executions}...[/dim]")
            
            # Clear browser cache between runs for accuracy
            if hasattr(self, '_clear_browser_cache'):
                self._clear_browser_cache()
            
            result = self.run_single_benchmark(framework)
            
            if result.success:
                successful_results.append(result)
                console.print(f"   [green]✓[/green] Run {execution + 1} completed")
            else:
                failed_results.append(result)
                console.print(f"   [red]✗[/red] Run {execution + 1} failed: {result.error_message}")
        
        # If we have no successful results, return the first failure
        if not successful_results:
            return failed_results[0] if failed_results else BenchmarkResult(framework, self.benchmark_name, {})
        
        # Average the successful results
        return self._average_results(framework, successful_results, len(failed_results))
    
    def _average_results(self, framework: str, results: List[BenchmarkResult], failed_count: int) -> BenchmarkResult:
        """Average multiple benchmark results with statistical analysis."""
        if not results:
            return BenchmarkResult(framework, self.benchmark_name, {})
        
        # Start with the first result as template
        averaged_data = results[0].data.copy()
        statistics = {}
        
        # Average numerical scores with statistics
        if "scores" in averaged_data:
            score_stats = {}
            for score_name in averaged_data["scores"]:
                values = [r.data["scores"][score_name] for r in results if score_name in r.data.get("scores", {})]
                if values:
                    avg_score = round(sum(values) / len(values), 1)
                    averaged_data["scores"][score_name] = avg_score
                    
                    # Calculate statistics
                    score_stats[score_name] = {
                        "min": round(min(values), 1),
                        "max": round(max(values), 1),
                        "std_dev": round(self._calculate_std_dev(values), 2) if len(values) > 1 else 0.0
                    }
            
            if score_stats:
                statistics["scores"] = score_stats
        
        # Average metrics with statistics
        if "metrics" in averaged_data:
            metric_stats = {}
            for metric_name in averaged_data["metrics"]:
                # Average numeric values
                numeric_values = []
                display_values = []
                score_values = []
                
                for result in results:
                    if metric_name in result.data.get("metrics", {}):
                        metric = result.data["metrics"][metric_name]
                        if metric.get("value") is not None:
                            numeric_values.append(metric["value"])
                        if metric.get("score") is not None:
                            score_values.append(metric["score"])
                        if metric.get("displayValue"):
                            display_values.append(metric["displayValue"])
                
                if numeric_values:
                    avg_value = sum(numeric_values) / len(numeric_values)
                    averaged_data["metrics"][metric_name]["value"] = avg_value
                    
                    # Calculate statistics for this metric
                    metric_stats[metric_name] = {
                        "min": round(min(numeric_values), 2),
                        "max": round(max(numeric_values), 2),
                        "std_dev": round(self._calculate_std_dev(numeric_values), 2) if len(numeric_values) > 1 else 0.0
                    }
                    
                    # Update display value based on averaged numeric value
                    if display_values and "s" in display_values[0]:  # Time in seconds
                        averaged_data["metrics"][metric_name]["displayValue"] = f"{avg_value / 1000:.1f}\u00a0s"
                    elif display_values and "ms" in display_values[0]:  # Time in milliseconds
                        averaged_data["metrics"][metric_name]["displayValue"] = f"{avg_value:.0f}\u00a0ms"
                    else:  # Other metrics (like CLS)
                        averaged_data["metrics"][metric_name]["displayValue"] = f"{avg_value:.3f}"
                
                if score_values:
                    avg_score = sum(score_values) / len(score_values)
                    averaged_data["metrics"][metric_name]["score"] = avg_score
                    
                    # Add score statistics to the existing metric stats
                    if metric_name in metric_stats:
                        metric_stats[metric_name]["score_min"] = round(min(score_values), 3)
                        metric_stats[metric_name]["score_max"] = round(max(score_values), 3)
                        metric_stats[metric_name]["score_std_dev"] = round(self._calculate_std_dev(score_values), 3) if len(score_values) > 1 else 0.0
            
            if metric_stats:
                statistics["metrics"] = metric_stats
        
        # Add execution metadata
        averaged_data["execution_stats"] = {
            "total_executions": len(results) + failed_count,
            "successful_executions": len(results),
            "failed_executions": failed_count,
            "averaged": True,
            "statistics": statistics
        }
        
        return BenchmarkResult(framework, self.benchmark_name, averaged_data)
    
    def _calculate_std_dev(self, values: List[float]) -> float:
        """Calculate standard deviation of a list of values."""
        if len(values) <= 1:
            return 0.0
        
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
        return variance ** 0.5
    
    def save_results(self, results: Optional[List[BenchmarkResult]] = None, run_id: Optional[str] = None) -> Path:
        """Save benchmark results to file with enhanced metadata for programmatic access."""
        if results is None:
            results = self.results
        
        # Create output directory with date-based organization
        project_root = Path(__file__).parent.parent.parent  # scripts/benchmark/ -> project root
        base_output_dir = project_root / self.output_config.get("directory", "benchmark-results")
        
        # Ensure the benchmark-results directory exists
        base_output_dir.mkdir(parents=True, exist_ok=True)
        
        # Create date-based subdirectory for better organization
        date_str = datetime.now().strftime("%Y-%m-%d")
        output_dir = base_output_dir / date_str
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate filename with timestamp
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.benchmark_name.lower().replace(' ', '_')}_{timestamp_str}.json"
        output_path = output_dir / filename
        
        # Extract framework list and success/failure counts for metadata
        frameworks_tested = [r.framework for r in results]
        successful_frameworks = [r.framework for r in results if r.success]
        failed_frameworks = [r.framework for r in results if not r.success]
        
        # Enhanced output data with metadata for programmatic access
        output_data = {
            "benchmark_type": self.benchmark_name,
            "benchmark_slug": self.benchmark_name.lower().replace(' ', '_'),
            "timestamp": datetime.now().isoformat(),
            "date": date_str,
            "run_id": run_id or f"run_{timestamp_str}",
            "metadata": {
                "frameworks_tested": frameworks_tested,
                "frameworks_count": len(frameworks_tested),
                "successful_count": len(successful_frameworks),
                "failed_count": len(failed_frameworks),
                "successful_frameworks": successful_frameworks,
                "failed_frameworks": failed_frameworks,
                "execution_time_iso": datetime.now().isoformat(),
                "file_path": str(output_path.relative_to(project_root))
            },
            "config": self.benchmark_config.get(self.benchmark_name.lower(), {}),
            "results": [result.to_dict() for result in results]
        }
        
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        # Update index files for easy discovery
        self._update_index_files(output_dir, base_output_dir, output_data, output_path)
        
        return output_path
    
    def _update_index_files(self, date_dir: Path, base_dir: Path, run_data: Dict, result_file: Path):
        """Update index files for easier programmatic discovery."""
        
        # Create daily index
        daily_index_path = date_dir / "index.json"
        daily_index = self._load_or_create_index(daily_index_path)
        
        # Add this benchmark to daily index
        benchmark_entry = {
            "benchmark_type": run_data["benchmark_slug"],
            "timestamp": run_data["timestamp"],
            "run_id": run_data["run_id"],
            "frameworks_count": run_data["metadata"]["frameworks_count"],
            "successful_count": run_data["metadata"]["successful_count"],
            "failed_count": run_data["metadata"]["failed_count"],
            "file": result_file.name
        }
        
        # Update daily index
        if "benchmarks" not in daily_index:
            daily_index["benchmarks"] = []
        
        # Remove existing entry for this benchmark type (if re-run)
        daily_index["benchmarks"] = [b for b in daily_index["benchmarks"] 
                                    if b["benchmark_type"] != run_data["benchmark_slug"]]
        daily_index["benchmarks"].append(benchmark_entry)
        daily_index["last_updated"] = run_data["timestamp"]
        daily_index["date"] = run_data["date"]
        
        with open(daily_index_path, 'w') as f:
            json.dump(daily_index, f, indent=2)
        
        # Create/update global index
        global_index_path = base_dir / "index.json"
        global_index = self._load_or_create_index(global_index_path)
        
        # Track available dates and benchmark types
        if "available_dates" not in global_index:
            global_index["available_dates"] = []
        if "available_benchmark_types" not in global_index:
            global_index["available_benchmark_types"] = []
        
        if run_data["date"] not in global_index["available_dates"]:
            global_index["available_dates"].append(run_data["date"])
            global_index["available_dates"].sort(reverse=True)  # Most recent first
        
        if run_data["benchmark_slug"] not in global_index["available_benchmark_types"]:
            global_index["available_benchmark_types"].append(run_data["benchmark_slug"])
            global_index["available_benchmark_types"].sort()
        
        # Update latest results tracking
        if "latest_results" not in global_index:
            global_index["latest_results"] = {}
        
        global_index["latest_results"][run_data["benchmark_slug"]] = {
            "date": run_data["date"],
            "timestamp": run_data["timestamp"],
            "file": str(result_file.relative_to(base_dir)),
            "frameworks_count": run_data["metadata"]["frameworks_count"],
            "successful_count": run_data["metadata"]["successful_count"]
        }
        
        global_index["last_updated"] = run_data["timestamp"]
        
        with open(global_index_path, 'w') as f:
            json.dump(global_index, f, indent=2)
    
    def _load_or_create_index(self, index_path: Path) -> Dict:
        """Load existing index or create new one."""
        if index_path.exists():
            try:
                with open(index_path, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                pass
        return {}
    
    def display_summary(self, results: Optional[List[BenchmarkResult]] = None):
        """Display a summary of benchmark results."""
        if results is None:
            results = self.results
        
        if not results:
            console.print("No results to display")
            return
        
        # Create summary table
        table = Table(title=f"{self.benchmark_name} Benchmark Summary")
        table.add_column("Framework", style="bold")
        table.add_column("Status", justify="center")
        
        # Add benchmark-specific columns
        self._add_summary_columns(table)
        
        # Add rows
        successful_results = []
        failed_results = []
        
        for result in results:
            if result.success:
                successful_results.append(result)
                row = [result.framework, "✅ Pass"]
                row.extend(self._get_summary_row_data(result))
                table.add_row(*row)
            else:
                failed_results.append(result)
                table.add_row(result.framework, "❌ Fail", *["—"] * (table.columns.__len__() - 2))
        
        console.print(table)
        
        # Show summary stats
        console.print(f"\n📊 Summary: {len(successful_results)} passed, {len(failed_results)} failed")
        
        if failed_results:
            console.print("\n❌ Failed frameworks:")
            for result in failed_results:
                console.print(f"  • {result.framework}: {result.error_message}")
    
    @abstractmethod
    def _add_summary_columns(self, table: Table):
        """Add benchmark-specific columns to summary table."""
        pass
    
    @abstractmethod
    def _get_summary_row_data(self, result: BenchmarkResult) -> List[str]:
        """Get benchmark-specific row data for summary table."""
        pass