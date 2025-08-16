#!/usr/bin/env python3
"""Bundle size analysis for all frameworks."""

import gzip
import os
from pathlib import Path
from typing import Dict, List

from rich.console import Console
from rich.table import Table

from base import BenchmarkRunner, BenchmarkResult

console = Console()


class BundleSizeRunner(BenchmarkRunner):
    """Bundle size benchmark runner."""
    
    @property
    def benchmark_name(self) -> str:
        return "Bundle Size"
    
    def __init__(self):
        super().__init__()
        self.project_root = Path(__file__).parent.parent.parent
    
    def check_server_health(self) -> bool:
        """Bundle size analysis doesn't require a server."""
        return True
    
    def run_single_benchmark(self, framework: str) -> BenchmarkResult:
        """Analyze bundle size for a single framework."""
        try:
            bundle_data = self._analyze_framework_bundle(framework)
            return BenchmarkResult(framework, self.benchmark_name, bundle_data)
        except Exception as e:
            return self._create_error_result(framework, f"Bundle analysis failed: {str(e)}")
    
    def _analyze_framework_bundle(self, framework: str) -> Dict:
        """Analyze bundle files for a framework."""
        app_dir = self.project_root / "apps" / framework
        
        # Find build directory
        build_dir = self._find_build_directory(app_dir, framework)
        if not build_dir:
            raise FileNotFoundError(f"No build directory found for {framework}")
        
        # Analyze all JavaScript and CSS files
        js_files = self._find_files(build_dir, [".js"])
        css_files = self._find_files(build_dir, [".css"])
        
        # Calculate sizes excluding shared assets
        js_data = self._analyze_files(js_files, framework)
        css_data = self._analyze_files(css_files, framework)
        
        # Calculate totals
        total_js_size = sum(f["size"] for f in js_data)
        total_js_gzipped = sum(f["gzipped_size"] for f in js_data)
        total_css_size = sum(f["size"] for f in css_data)
        total_css_gzipped = sum(f["gzipped_size"] for f in css_data)
        
        return {
            "framework": framework,
            "javascript": {
                "files": js_data,
                "total_size": total_js_size,
                "total_gzipped": total_js_gzipped,
                "file_count": len(js_data)
            },
            "css": {
                "files": css_data,
                "total_size": total_css_size,
                "total_gzipped": total_css_gzipped,
                "file_count": len(css_data)
            },
            "totals": {
                "total_size": total_js_size + total_css_size,
                "total_gzipped": total_js_gzipped + total_css_gzipped,
                "js_percentage": (total_js_size / (total_js_size + total_css_size) * 100) if (total_js_size + total_css_size) > 0 else 0,
                "compression_ratio": ((total_js_size + total_css_size) / (total_js_gzipped + total_css_gzipped)) if (total_js_gzipped + total_css_gzipped) > 0 else 1
            }
        }
    
    def _find_build_directory(self, app_dir: Path, framework: str) -> Path:
        """Find the build/dist directory for a framework."""
        # Get buildDir from frameworks.json
        framework_config = next((fw for fw in self.frameworks if fw["id"] == framework), None)
        if framework_config and "buildDir" in framework_config:
            build_dir = app_dir / framework_config["buildDir"]
            if build_dir.exists():
                return build_dir
        
        # Fallback to checking common directories
        possible_dirs = ["dist", "build", "."]
        for dir_name in possible_dirs:
            build_dir = app_dir / dir_name
            if build_dir.exists():
                # Check if it contains assets
                if dir_name == ".":
                    # For frameworks that build in place (like vanilla)
                    if any(app_dir.glob("*.js")) or any(app_dir.glob("*.css")):
                        return build_dir
                else:
                    return build_dir
        
        return None
    
    def _find_files(self, directory: Path, extensions: List[str]) -> List[Path]:
        """Find all files with given extensions, excluding shared assets."""
        files = []
        
        for ext in extensions:
            # Recursively search for files in build directory and subdirectories
            files.extend(directory.rglob(f"*{ext}"))
        
        # Filter out shared assets that are identical across frameworks
        return [f for f in files if self._is_framework_specific_file(f)]
    
    def _is_framework_specific_file(self, file_path: Path) -> bool:
        """Check if file is framework-specific (not shared assets)."""
        file_name = file_path.name.lower()
        
        # Skip development and dependency directories
        excluded_dirs = [
            "node_modules", ".git", ".vscode", "coverage", "test-results", 
            "playwright-report", ".svelte-kit", ".angular", ".next", 
            "public", "static", "mocks", "icons", "styles"
        ]
        
        # Skip if file is in excluded directories
        if any(excluded_dir in file_path.parts for excluded_dir in excluded_dirs):
            return False
        
        # Skip shared asset files that are identical across all frameworks
        shared_assets = [
            "base.css", "components.css", "design-system.css", "variables.css",
            "favicon.ico", "favicon.png", "logo.png", "screenshot.png",
            "weather-data.json", "index.html"
        ]
        
        # Skip if it's a known shared asset
        if file_name in shared_assets:
            return False
        
        return True
    
    def _analyze_files(self, files: List[Path], framework: str) -> List[Dict]:
        """Analyze size information for files."""
        file_data = []
        
        for file_path in files:
            if not file_path.exists():
                continue
            
            size = file_path.stat().st_size
            gzipped_size = self._get_gzipped_size(file_path)
            
            file_data.append({
                "name": file_path.name,
                "path": str(file_path.relative_to(file_path.parent.parent)),
                "size": size,
                "gzipped_size": gzipped_size,
                "compression_ratio": size / gzipped_size if gzipped_size > 0 else 1
            })
        
        # Sort by size descending
        return sorted(file_data, key=lambda x: x["size"], reverse=True)
    
    def _get_gzipped_size(self, file_path: Path) -> int:
        """Calculate gzipped size of a file."""
        try:
            with open(file_path, 'rb') as f:
                return len(gzip.compress(f.read()))
        except Exception:
            return 0
    
    def _create_error_result(self, framework: str, error: str) -> BenchmarkResult:
        """Create a failed benchmark result."""
        result = BenchmarkResult(framework, self.benchmark_name, {})
        result.mark_failed(error)
        return result
    
    def _add_summary_columns(self, table: Table):
        """Add bundle-specific columns to summary table."""
        table.add_column("Total Size", justify="right", style="blue")
        table.add_column("Total Gzipped", justify="right", style="green")
        table.add_column("JS Files", justify="center", style="cyan")
        table.add_column("CSS Files", justify="center", style="magenta")
        table.add_column("Compression", justify="right", style="yellow")
    
    def _get_summary_row_data(self, result: BenchmarkResult) -> List[str]:
        """Get bundle-specific row data for summary table."""
        data = result.data
        totals = data.get("totals", {})
        js_info = data.get("javascript", {})
        css_info = data.get("css", {})
        
        total_size = self._format_bytes(totals.get("total_size", 0))
        total_gzipped = self._format_bytes(totals.get("total_gzipped", 0))
        js_files = str(js_info.get("file_count", 0))
        css_files = str(css_info.get("file_count", 0))
        compression = f"{totals.get('compression_ratio', 1):.1f}x"
        
        return [total_size, total_gzipped, js_files, css_files, compression]
    
    def _format_bytes(self, bytes_value: int) -> str:
        """Format bytes in human readable format."""
        if bytes_value == 0:
            return "0 B"
        
        for unit in ['B', 'KB', 'MB']:
            if bytes_value < 1024:
                return f"{bytes_value:.1f} {unit}"
            bytes_value /= 1024
        
        return f"{bytes_value:.1f} GB"
    
    def display_detailed_results(self, framework: str = None):
        """Display detailed bundle analysis for frameworks."""
        results_to_show = self.results
        if framework:
            results_to_show = [r for r in self.results if r.framework == framework]
        
        for result in results_to_show:
            if not result.success:
                continue
            
            data = result.data
            console.print(f"\n📦 Detailed bundle analysis for {result.framework}:")
            
            # JavaScript files table
            if data.get("javascript", {}).get("files"):
                js_table = Table(title=f"{result.framework} JavaScript Files")
                js_table.add_column("File", style="bold")
                js_table.add_column("Size", justify="right")
                js_table.add_column("Gzipped", justify="right")
                js_table.add_column("Compression", justify="right")
                
                for file_info in data["javascript"]["files"]:
                    js_table.add_row(
                        file_info["name"],
                        self._format_bytes(file_info["size"]),
                        self._format_bytes(file_info["gzipped_size"]),
                        f"{file_info['compression_ratio']:.1f}x"
                    )
                
                console.print(js_table)
            
            # CSS files table
            if data.get("css", {}).get("files"):
                css_table = Table(title=f"{result.framework} CSS Files")
                css_table.add_column("File", style="bold")
                css_table.add_column("Size", justify="right")
                css_table.add_column("Gzipped", justify="right")
                css_table.add_column("Compression", justify="right")
                
                for file_info in data["css"]["files"]:
                    css_table.add_row(
                        file_info["name"],
                        self._format_bytes(file_info["size"]),
                        self._format_bytes(file_info["gzipped_size"]),
                        f"{file_info['compression_ratio']:.1f}x"
                    )
                
                console.print(css_table)