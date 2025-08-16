#!/usr/bin/env python3
"""Source code analysis for complexity and maintainability metrics."""

import math
import os
import re
from pathlib import Path
from typing import Dict, List

from rich.console import Console
from rich.table import Table

from base import BenchmarkRunner, BenchmarkResult

console = Console()


class SourceAnalysisRunner(BenchmarkRunner):
    """Source code analysis benchmark runner."""
    
    @property
    def benchmark_name(self) -> str:
        return "Source Analysis"
    
    def __init__(self):
        super().__init__()
        self.project_root = Path(__file__).parent.parent.parent
        
        # File extensions to analyze
        self.extensions = {
            ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".gjs", ".gts",
            ".vue", ".svelte", ".astro", ".html", ".htm", ".mdx"
        }
        
        # Directories to exclude from analysis
        self.excluded_dirs = {
            "node_modules", "dist", "build", "target", "__tests__", "test", 
            "spec", "mock", "coverage", ".git", ".vscode", "public", "static"
        }
    
    def check_server_health(self) -> bool:
        """Source analysis doesn't require a server."""
        return True
    
    def run_single_benchmark(self, framework: str) -> BenchmarkResult:
        """Analyze source code complexity for a single framework."""
        try:
            analysis_data = self._analyze_framework_source(framework)
            return BenchmarkResult(framework, self.benchmark_name, analysis_data)
        except Exception as e:
            return self._create_error_result(framework, f"Source analysis failed: {str(e)}")
    
    def _analyze_framework_source(self, framework: str) -> Dict:
        """Analyze source code files for a framework."""
        app_dir = self.project_root / "apps" / framework / "src"
        
        # Fallback to app root if src doesn't exist
        if not app_dir.exists():
            app_dir = self.project_root / "apps" / framework
        
        if not app_dir.exists():
            raise FileNotFoundError(f"No source directory found for {framework}")
        
        # Get all source files
        source_files = self._get_source_files(app_dir)
        if not source_files:
            raise FileNotFoundError(f"No source files found for {framework}")
        
        # Analyze each file
        file_results = []
        for file_path in source_files:
            result = self._analyze_file(file_path, app_dir)
            if result:
                file_results.append(result)
        
        if not file_results:
            raise ValueError(f"No analyzable files found for {framework}")
        
        # Calculate totals and averages
        totals = self._calculate_totals(file_results)
        averages = self._calculate_averages(file_results)
        
        return {
            "framework": framework,
            "summary": {
                "total_files": len(file_results),
                "totals": totals,
                "averages": averages
            },
            "files": file_results
        }
    
    def _get_source_files(self, directory: Path) -> List[Path]:
        """Get all source files from directory recursively."""
        files = []
        
        for root, dirs, filenames in os.walk(directory):
            # Skip excluded directories
            if any(excluded in Path(root).parts for excluded in self.excluded_dirs):
                continue
            
            for filename in filenames:
                file_path = Path(root) / filename
                if file_path.suffix.lower() in self.extensions:
                    files.append(file_path)
        
        return files
    
    def _analyze_file(self, file_path: Path, base_dir: Path) -> Dict:
        """Analyze a single file for complexity metrics."""
        try:
            raw_content = self._safe_read_file(file_path)
            if not raw_content.strip():
                return None
            
            # Extract script content for template files
            script_content = self._extract_script_content(raw_content, file_path.suffix)
            if not script_content.strip():
                return None
            
            # Calculate metrics
            physical_lines = self._count_physical_lines(raw_content)
            logical_lines = self._count_logical_lines(script_content)
            cyclomatic_complexity = self._calculate_cyclomatic_complexity(script_content)
            halstead_metrics = self._calculate_halstead_metrics(script_content)
            maintainability_index = self._calculate_maintainability_index(
                halstead_metrics["volume"], cyclomatic_complexity, logical_lines
            )
            
            return {
                "file": str(file_path.relative_to(base_dir)),
                "lines": {
                    "physical": physical_lines,
                    "logical": logical_lines
                },
                "cyclomatic_complexity": cyclomatic_complexity,
                "halstead": halstead_metrics,
                "maintainability_index": round(maintainability_index, 2)
            }
            
        except Exception:
            return None
    
    def _safe_read_file(self, file_path: Path) -> str:
        """Read file content safely, handling encoding issues."""
        try:
            return file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return ""
    
    def _extract_script_content(self, content: str, extension: str) -> str:
        """Extract script content from template files."""
        ext = extension.lower()
        
        if ext in {".html", ".htm", ".vue", ".svelte", ".astro"}:
            # Extract content from <script> tags
            script_parts = re.findall(r"<script[^>]*>(.*?)</script>", content, re.DOTALL | re.IGNORECASE)
            return "\n".join(script_parts) if script_parts else ""
        elif ext == ".mdx":
            # Remove code blocks from MDX files
            return re.sub(r"```[\s\S]*?```", "", content)
        else:
            # For pure JS/TS files, return as-is
            return content
    
    def _count_physical_lines(self, content: str) -> int:
        """Count non-empty physical lines."""
        return sum(1 for line in content.splitlines() if line.strip())
    
    def _count_logical_lines(self, content: str) -> int:
        """Count logical lines (approximate executable statements)."""
        # Count statements ending with semicolons, braces, etc.
        return len(re.findall(r"[;{}]\s*$", content, re.MULTILINE))
    
    def _calculate_cyclomatic_complexity(self, content: str) -> int:
        """Calculate cyclomatic complexity (decision points + 1)."""
        decision_points = len(re.findall(
            r"\b(if|for|while|case|catch)\b|\? *:|&&|\|\|", content
        ))
        return decision_points + 1
    
    def _calculate_halstead_metrics(self, content: str) -> Dict:
        """Calculate Halstead complexity metrics."""
        # Find operators
        operators = re.findall(
            r"\b(if|else|for|while|case|break|function|return|throw|new|delete|typeof|in|instanceof)\b"
            r"|[+\-*/%=&|^!<>?:]", content
        )
        
        # Find operands (identifiers)
        operands = re.findall(r"\b[A-Za-z_]\w*\b", content)
        
        # Calculate unique counts
        unique_operators = len(set(map(str.strip, operators)))
        unique_operands = len(set(map(str.strip, operands)))
        total_operators = len(operators)
        total_operands = len(operands)
        
        # Halstead metrics
        length = total_operators + total_operands
        vocabulary = unique_operators + unique_operands
        volume = length * math.log2(max(vocabulary, 2))
        
        return {
            "length": length,
            "vocabulary": vocabulary,
            "volume": round(volume, 2),
            "operators": {
                "total": total_operators,
                "unique": unique_operators
            },
            "operands": {
                "total": total_operands,
                "unique": unique_operands
            }
        }
    
    def _calculate_maintainability_index(self, halstead_volume: float, 
                                       cyclomatic_complexity: int, logical_lines: int) -> float:
        """Calculate maintainability index (0-100, higher is better)."""
        try:
            # Microsoft's maintainability index formula
            mi = (
                171
                - 5.2 * math.log(max(halstead_volume, 1))
                - 0.23 * cyclomatic_complexity
                - 16.2 * math.log(max(logical_lines, 1))
            ) * 100 / 171
            
            # Clamp to 0-100 range
            return max(0, min(100, mi))
        except (ValueError, ZeroDivisionError):
            return 0
    
    def _calculate_totals(self, file_results: List[Dict]) -> Dict:
        """Calculate total metrics across all files."""
        return {
            "physical_lines": sum(f["lines"]["physical"] for f in file_results),
            "logical_lines": sum(f["lines"]["logical"] for f in file_results),
            "cyclomatic_complexity": sum(f["cyclomatic_complexity"] for f in file_results),
            "maintainability_index": sum(f["maintainability_index"] for f in file_results),
            "halstead_volume": sum(f["halstead"]["volume"] for f in file_results)
        }
    
    def _calculate_averages(self, file_results: List[Dict]) -> Dict:
        """Calculate average metrics per file."""
        if not file_results:
            return {}
        
        count = len(file_results)
        return {
            "physical_lines": round(sum(f["lines"]["physical"] for f in file_results) / count, 1),
            "logical_lines": round(sum(f["lines"]["logical"] for f in file_results) / count, 1),
            "cyclomatic_complexity": round(sum(f["cyclomatic_complexity"] for f in file_results) / count, 1),
            "maintainability_index": round(sum(f["maintainability_index"] for f in file_results) / count, 1),
            "halstead_volume": round(sum(f["halstead"]["volume"] for f in file_results) / count, 1)
        }
    
    def _create_error_result(self, framework: str, error: str) -> BenchmarkResult:
        """Create a failed benchmark result."""
        result = BenchmarkResult(framework, self.benchmark_name, {})
        result.mark_failed(error)
        return result
    
    def _add_summary_columns(self, table: Table):
        """Add source analysis columns to summary table."""
        table.add_column("Files", justify="center", style="cyan")
        table.add_column("Physical LOC", justify="right", style="blue")
        table.add_column("Logical LOC", justify="right", style="green")
        table.add_column("Complexity", justify="right", style="yellow")
        table.add_column("Maintainability", justify="right", style="magenta")
    
    def _get_summary_row_data(self, result: BenchmarkResult) -> List[str]:
        """Get source analysis row data for summary table."""
        data = result.data.get("summary", {})
        
        file_count = str(data.get("total_files", 0))
        physical_lines = str(data.get("totals", {}).get("physical_lines", 0))
        logical_lines = str(data.get("totals", {}).get("logical_lines", 0))
        complexity = f"{data.get('averages', {}).get('cyclomatic_complexity', 0):.1f}"
        maintainability = f"{data.get('averages', {}).get('maintainability_index', 0):.1f}"
        
        # Color code maintainability (green > 70, yellow 40-70, red < 40)
        mi_value = data.get("averages", {}).get("maintainability_index", 0)
        if mi_value >= 70:
            maintainability = f"[green]{maintainability}[/green]"
        elif mi_value >= 40:
            maintainability = f"[yellow]{maintainability}[/yellow]"
        else:
            maintainability = f"[red]{maintainability}[/red]"
        
        return [file_count, physical_lines, logical_lines, complexity, maintainability]
    
    def display_detailed_results(self, framework: str = None):
        """Display detailed source analysis for frameworks."""
        results_to_show = self.results
        if framework:
            results_to_show = [r for r in self.results if r.framework == framework]
        
        for result in results_to_show:
            if not result.success:
                continue
            
            data = result.data
            summary = data.get("summary", {})
            
            console.print(f"\n📊 Detailed source analysis for {result.framework}:")
            
            # Summary table
            summary_table = Table(title=f"{result.framework} Source Code Summary")
            summary_table.add_column("Metric", style="bold")
            summary_table.add_column("Total", justify="right")
            summary_table.add_column("Average", justify="right")
            
            totals = summary.get("totals", {})
            averages = summary.get("averages", {})
            
            summary_table.add_row("Files", str(summary.get("total_files", 0)), "—")
            summary_table.add_row("Physical Lines", str(totals.get("physical_lines", 0)), f"{averages.get('physical_lines', 0):.1f}")
            summary_table.add_row("Logical Lines", str(totals.get("logical_lines", 0)), f"{averages.get('logical_lines', 0):.1f}")
            summary_table.add_row("Cyclomatic Complexity", str(totals.get("cyclomatic_complexity", 0)), f"{averages.get('cyclomatic_complexity', 0):.1f}")
            summary_table.add_row("Maintainability Index", f"{totals.get('maintainability_index', 0):.1f}", f"{averages.get('maintainability_index', 0):.1f}")
            
            console.print(summary_table)
            
            # Top complex files table
            files = data.get("files", [])
            if files:
                # Sort by cyclomatic complexity descending
                complex_files = sorted(files, key=lambda f: f.get("cyclomatic_complexity", 0), reverse=True)[:5]
                
                files_table = Table(title=f"Most Complex Files in {result.framework}")
                files_table.add_column("File", style="bold")
                files_table.add_column("Lines", justify="right")
                files_table.add_column("Complexity", justify="right")
                files_table.add_column("Maintainability", justify="right")
                
                for file_info in complex_files:
                    physical = file_info.get("lines", {}).get("physical", 0)
                    complexity = file_info.get("cyclomatic_complexity", 0)
                    maintainability = file_info.get("maintainability_index", 0)
                    
                    # Color code maintainability
                    if maintainability >= 70:
                        mi_display = f"[green]{maintainability:.1f}[/green]"
                    elif maintainability >= 40:
                        mi_display = f"[yellow]{maintainability:.1f}[/yellow]"
                    else:
                        mi_display = f"[red]{maintainability:.1f}[/red]"
                    
                    files_table.add_row(
                        file_info.get("file", ""),
                        str(physical),
                        str(complexity),
                        mi_display
                    )
                
                console.print(files_table)