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
    
    def run_all_frameworks(self, frameworks: Optional[List[str]] = None) -> List[BenchmarkResult]:
        """Run benchmarks for all or specified frameworks."""
        if frameworks is None:
            frameworks = [fw["id"] for fw in self.frameworks]
        
        show_header(f"{self.benchmark_name} Benchmark", 
                   f"Running {self.benchmark_name.lower()} benchmarks for {len(frameworks)} frameworks")
        
        # Check server is running
        if not self.check_server_health():
            show_error("Benchmark server is not running. Start it with: npm start")
            return []
        
        console.print(f"✅ Server is running at {self.server_config.get('baseUrl')}")
        
        try:
            # Run benchmarks
            for framework in frameworks:
                try:
                    console.print(f"\n🔄 Running {self.benchmark_name} for [bold]{framework}[/bold]...")
                    result = self.run_single_benchmark(framework)
                    self.results.append(result)
                    
                    if result.success:
                        console.print(f"✅ Completed {framework}")
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
    
    def save_results(self, results: Optional[List[BenchmarkResult]] = None) -> Path:
        """Save benchmark results to file."""
        if results is None:
            results = self.results
        
        # Create output directory
        project_root = Path(__file__).parent.parent.parent
        output_dir = project_root / self.output_config.get("directory", "benchmark-results")
        output_dir.mkdir(exist_ok=True)
        
        # Generate filename with timestamp
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.benchmark_name.lower().replace(' ', '_')}_{timestamp_str}.json"
        output_path = output_dir / filename
        
        # Save results
        output_data = {
            "benchmark_type": self.benchmark_name,
            "timestamp": datetime.now().isoformat(),
            "config": self.benchmark_config.get(self.benchmark_name.lower(), {}),
            "results": [result.to_dict() for result in results]
        }
        
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        return output_path
    
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