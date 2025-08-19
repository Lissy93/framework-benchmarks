#!/usr/bin/env python3
"""Transform benchmark results into TSV format for analysis."""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from collections import defaultdict
import csv

def extract_build_time_data(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract build time metrics from benchmark result."""
    data = result.get("data", {})
    return {
        "build_time_success": result.get("success", False),
        "build_time_ms": data.get("build_time_ms", 0),
        "output_size_mb": data.get("output_size_mb", 0)
    }

def extract_bundle_size_data(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract bundle size metrics from benchmark result."""
    data = result.get("data", {})
    totals = data.get("totals", {})
    js_data = data.get("javascript", {})
    return {
        "total_size": totals.get("total_size", 0),
        "total_gzipped": totals.get("total_gzipped", 0),
        "file_count": js_data.get("file_count", 0),
        "js_percentage": round(totals.get("js_percentage", 0), 2),
        "compression_ratio": round(totals.get("compression_ratio", 0), 2)
    }

def extract_dev_server_data(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract dev server metrics from benchmark result."""
    data = result.get("data", {})
    return {
        "startup_time_ms": data.get("startup_time_ms", 0),
        "hmr_avg_time_ms": data.get("hmr_avg_time_ms", 0)
    }

def extract_lighthouse_data(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract lighthouse metrics from benchmark result."""
    data = result.get("data", {})
    scores = data.get("scores", {})
    metrics = data.get("metrics", {})
    
    return {
        "fcp": metrics.get("first-contentful-paint", {}).get("value", 0),
        "lcp": metrics.get("largest-contentful-paint", {}).get("value", 0),
        "speed_index": metrics.get("speed-index", {}).get("value", 0),
        "cls": metrics.get("cumulative-layout-shift", {}).get("value", 0),
        "tbt": metrics.get("total-blocking-time", {}).get("value", 0),
        "performance": scores.get("performance", 0),
        "accessibility": scores.get("accessibility", 0),
        "best_practices": scores.get("best-practices", 0),
        "seo": scores.get("seo", 0)
    }

def extract_resource_usage_data(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract resource usage metrics from benchmark result."""
    data = result.get("data", {})
    baseline = data.get("baseline", {})
    final_usage = data.get("final_usage", {})
    interactions = data.get("interactions", [])
    
    # Calculate aggregated metrics from interactions
    total_memory_delta = sum(interaction.get("memory_delta_mb", 0) for interaction in interactions)
    peak_cpu = max((interaction.get("cpu_peak_percent", 0) for interaction in interactions), default=0)
    avg_cpu_values = [interaction.get("cpu_average_percent", 0) for interaction in interactions if interaction.get("cpu_average_percent", 0) > 0]
    average_cpu = sum(avg_cpu_values) / len(avg_cpu_values) if avg_cpu_values else 0
    total_heap_delta = sum(interaction.get("heap_delta_mb", 0) for interaction in interactions)
    
    return {
        "memory_delta": round(total_memory_delta, 2),
        "peak_cpu": round(peak_cpu, 2),
        "average_cpu": round(average_cpu, 2),
        "heap_delta": round(total_heap_delta, 2),
        "memory": round(final_usage.get("total_memory_mb", 0), 2),
        "cpu": round(final_usage.get("total_cpu_percent", 0), 2),
        "mem_efficiency": round((final_usage.get("total_memory_mb", 0) - baseline.get("memory_mb", 0)) / baseline.get("memory_mb", 1) if baseline.get("memory_mb", 0) > 0 else 0, 3)
    }

def extract_source_analysis_data(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract source analysis metrics from benchmark result."""
    data = result.get("data", {})
    summary = data.get("summary", {})
    totals = summary.get("totals", {})
    return {
        "files_count": summary.get("total_files", 0),
        "physical_lines": totals.get("physical_lines", 0),
        "logical_lines": totals.get("logical_lines", 0),
        "cyclomatic_complexity": totals.get("cyclomatic_complexity", 0),
        "maintainability_index": round(totals.get("maintainability_index", 0), 2),
        "halstead_volume": round(totals.get("halstead_volume", 0), 2)
    }

def get_latest_file_by_type(directory: Path, benchmark_type: str) -> Optional[Path]:
    """Get the most recent file for a specific benchmark type."""
    pattern = f"{benchmark_type}_*.json"
    files = list(directory.glob(pattern))
    if not files:
        return None
    # Sort by timestamp in filename (YYYYMMDD_HHMMSS)
    return max(files, key=lambda f: f.stem.split('_')[-1])

def get_all_files_by_type(directory: Path, benchmark_type: str) -> List[Path]:
    """Get all files for a specific benchmark type, sorted by timestamp."""
    pattern = f"{benchmark_type}_*.json"
    files = list(directory.glob(pattern))
    # Sort by timestamp in filename (YYYYMMDD_HHMMSS)
    return sorted(files, key=lambda f: f.stem.split('_')[-1])

def safe_average(values: List[float], ignore_zeros: bool = True) -> float:
    """Calculate average of values, optionally ignoring zeros and None values."""
    if ignore_zeros:
        valid_values = [v for v in values if v is not None and v != 0]
    else:
        valid_values = [v for v in values if v is not None]
    
    if not valid_values:
        return 0
    
    return sum(valid_values) / len(valid_values)

def safe_round(value: float, decimals: int = 2) -> float:
    """Safely round a value, handling None and invalid values."""
    if value is None or not isinstance(value, (int, float)):
        return 0
    rounded = round(value, decimals)
    # Convert to int if it's a whole number to avoid .0
    return int(rounded) if rounded == int(rounded) else rounded

def average_benchmark_results(results_list: List[Dict[str, Any]], benchmark_type: str) -> Dict[str, Dict[str, Any]]:
    """Average multiple benchmark results by framework, ignoring missing/zero values."""
    framework_data = defaultdict(list)
    
    # Group results by framework
    for result_data in results_list:
        for result in result_data.get("results", []):
            framework = result.get("framework")
            if framework:
                framework_data[framework].append(result)
    
    # Average the results for each framework
    averaged_results = {}
    
    for framework, results in framework_data.items():
        if benchmark_type == "build_time":
            averaged_results[framework] = average_build_time_results(results)
        elif benchmark_type == "bundle_size":
            averaged_results[framework] = average_bundle_size_results(results)
        elif benchmark_type == "dev_server":
            averaged_results[framework] = average_dev_server_results(results)
        elif benchmark_type == "lighthouse":
            averaged_results[framework] = average_lighthouse_results(results)
        elif benchmark_type == "resource_usage":
            averaged_results[framework] = average_resource_usage_results(results)
        elif benchmark_type == "source_analysis":
            averaged_results[framework] = average_source_analysis_results(results)
    
    return averaged_results

def average_build_time_results(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Average build time results."""
    extracted_data = [extract_build_time_data(result) for result in results]
    
    return {
        "build_time_success": any(d.get("build_time_success", False) for d in extracted_data),
        "success": any(d.get("build_time_success", False) for d in extracted_data),  # For JSON compatibility
        "build_time_ms": safe_round(safe_average([d.get("build_time_ms", 0) for d in extracted_data])),
        "output_size_mb": safe_round(safe_average([d.get("output_size_mb", 0) for d in extracted_data]))
    }

def average_bundle_size_results(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Average bundle size results."""
    extracted_data = [extract_bundle_size_data(result) for result in results]
    
    return {
        "total_size": safe_round(safe_average([d.get("total_size", 0) for d in extracted_data])),
        "total_gzipped": safe_round(safe_average([d.get("total_gzipped", 0) for d in extracted_data])),
        "file_count": safe_round(safe_average([d.get("file_count", 0) for d in extracted_data])),
        "js_percentage": safe_round(safe_average([d.get("js_percentage", 0) for d in extracted_data])),
        "compression_ratio": safe_round(safe_average([d.get("compression_ratio", 0) for d in extracted_data]))
    }

def average_dev_server_results(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Average dev server results."""
    extracted_data = [extract_dev_server_data(result) for result in results]
    
    return {
        "startup_time_ms": safe_round(safe_average([d.get("startup_time_ms", 0) for d in extracted_data])),
        "hmr_avg_time_ms": safe_round(safe_average([d.get("hmr_avg_time_ms", 0) for d in extracted_data]))
    }

def average_lighthouse_results(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Average lighthouse results."""
    extracted_data = [extract_lighthouse_data(result) for result in results]
    
    return {
        "fcp": safe_round(safe_average([d.get("fcp", 0) for d in extracted_data])),
        "lcp": safe_round(safe_average([d.get("lcp", 0) for d in extracted_data])),
        "speed_index": safe_round(safe_average([d.get("speed_index", 0) for d in extracted_data])),
        "cls": safe_round(safe_average([d.get("cls", 0) for d in extracted_data]), 4),
        "tbt": safe_round(safe_average([d.get("tbt", 0) for d in extracted_data])),
        "performance": safe_round(safe_average([d.get("performance", 0) for d in extracted_data])),
        "accessibility": safe_round(safe_average([d.get("accessibility", 0) for d in extracted_data])),
        "best_practices": safe_round(safe_average([d.get("best_practices", 0) for d in extracted_data])),
        "seo": safe_round(safe_average([d.get("seo", 0) for d in extracted_data]))
    }

def average_resource_usage_results(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Average resource usage results."""
    extracted_data = [extract_resource_usage_data(result) for result in results]
    
    return {
        "memory_delta": safe_round(safe_average([d.get("memory_delta", 0) for d in extracted_data])),
        "peak_cpu": safe_round(safe_average([d.get("peak_cpu", 0) for d in extracted_data])),
        "average_cpu": safe_round(safe_average([d.get("average_cpu", 0) for d in extracted_data])),
        "heap_delta": safe_round(safe_average([d.get("heap_delta", 0) for d in extracted_data])),
        "memory": safe_round(safe_average([d.get("memory", 0) for d in extracted_data])),
        "cpu": safe_round(safe_average([d.get("cpu", 0) for d in extracted_data])),
        "mem_efficiency": safe_round(safe_average([d.get("mem_efficiency", 0) for d in extracted_data]), 3)
    }

def average_source_analysis_results(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Average source analysis results (most metrics should be the same, but take latest)."""
    # Source analysis should be consistent, so just take the last result
    if results:
        return extract_source_analysis_data(results[-1])
    return {
        "files_count": 0,
        "physical_lines": 0,
        "logical_lines": 0,
        "cyclomatic_complexity": 0,
        "maintainability_index": 0,
        "halstead_volume": 0
    }

def create_tsv_from_results(results_dir: Path, output_file: Path, use_average: bool = False) -> None:
    """Create TSV file from latest benchmark results."""
    # Get latest results by finding the most recent date directory
    date_dirs = [d for d in results_dir.iterdir() if d.is_dir() and d.name.count('-') == 2]
    if not date_dirs:
        raise ValueError("No benchmark result directories found")
    
    latest_dir = max(date_dirs, key=lambda d: d.name)
    
    # Group results by framework
    framework_data = defaultdict(dict)
    
    # Define benchmark types to process
    benchmark_types = ["build_time", "bundle_size", "dev_server", "lighthouse", "resource_usage", "source_analysis"]
    
    # Process each benchmark type
    for benchmark_type in benchmark_types:
        if use_average:
            # Get all files for averaging
            all_files = get_all_files_by_type(latest_dir, benchmark_type)
            if not all_files:
                continue
            
            # Load all benchmark data files
            results_list = []
            for file_path in all_files:
                try:
                    with open(file_path) as f:
                        results_list.append(json.load(f))
                except (json.JSONDecodeError, IOError):
                    # Skip corrupted/unreadable files
                    continue
            
            if not results_list:
                continue
            
            # Average the results
            averaged_results = average_benchmark_results(results_list, benchmark_type)
            
            # Update framework data with averaged results
            for framework, avg_data in averaged_results.items():
                framework_data[framework].update(avg_data)
                
        else:
            # Use latest file only
            latest_file = get_latest_file_by_type(latest_dir, benchmark_type)
            if not latest_file:
                continue
                
            with open(latest_file) as f:
                benchmark_data = json.load(f)
            
            for result in benchmark_data.get("results", []):
                framework = result.get("framework")
                if not framework:
                    continue
                
                # Extract data based on benchmark type
                if benchmark_type == "build_time":
                    framework_data[framework].update(extract_build_time_data(result))
                elif benchmark_type == "bundle_size":
                    framework_data[framework].update(extract_bundle_size_data(result))
                elif benchmark_type == "dev_server":
                    framework_data[framework].update(extract_dev_server_data(result))
                elif benchmark_type == "lighthouse":
                    framework_data[framework].update(extract_lighthouse_data(result))
                elif benchmark_type == "resource_usage":
                    framework_data[framework].update(extract_resource_usage_data(result))
                elif benchmark_type == "source_analysis":
                    framework_data[framework].update(extract_source_analysis_data(result))
    
    # Define column order
    columns = [
        "framework",
        # Build time
        "build_time_success", "build_time_ms", "output_size_mb",
        # Bundle size
        "total_size", "total_gzipped", "file_count", "js_percentage", "compression_ratio",
        # Dev server
        "startup_time_ms", "hmr_avg_time_ms",
        # Lighthouse
        "fcp", "lcp", "speed_index", "cls", "tbt", "performance", "accessibility", "best_practices", "seo",
        # Resource usage
        "memory_delta", "peak_cpu", "average_cpu", "heap_delta", "memory", "cpu", "mem_efficiency",
        # Source analysis
        "files_count", "physical_lines", "logical_lines", "cyclomatic_complexity", "maintainability_index", "halstead_volume"
    ]
    
    # Write TSV file
    with open(output_file, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=columns, delimiter='\t')
        writer.writeheader()
        
        for framework, data in sorted(framework_data.items()):
            row = {"framework": framework}
            row.update({col: data.get(col, "") for col in columns[1:]})
            writer.writerow(row)