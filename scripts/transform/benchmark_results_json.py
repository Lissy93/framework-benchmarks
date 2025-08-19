#!/usr/bin/env python3
"""Transform benchmark results into structured JSON format."""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from collections import defaultdict

# Import averaging functions from TSV module to stay DRY
from benchmark_results_tsv import (
    get_all_files_by_type, average_benchmark_results, 
    safe_average, safe_round
)

def convert_tsv_to_json_format(tsv_data: Dict[str, Any], benchmark_type: str) -> Dict[str, Any]:
    """Convert flat TSV format to nested JSON format."""
    if benchmark_type == "lighthouse":
        return {
            "raw_metrics": {k: tsv_data[k] for k in ["fcp", "lcp", "speed_index", "cls", "tbt"] if k in tsv_data},
            "scores": {k: tsv_data[k] for k in ["performance", "accessibility", "best_practices", "seo"] if k in tsv_data}
        }
    return tsv_data  # Return flat structure for other types

def extract_build_time_metrics(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract build time metrics with proper structure."""
    data = result.get("data", {})
    return {
        "success": result.get("success", False),
        "build_time_ms": data.get("build_time_ms", 0),
        "output_size_mb": data.get("output_size_mb", 0)
    }

def extract_bundle_size_metrics(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract bundle size metrics with proper structure."""
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

def extract_dev_server_metrics(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract dev server metrics with proper structure."""
    data = result.get("data", {})
    return {
        "startup_time_ms": data.get("startup_time_ms", 0),
        "hmr_avg_time_ms": data.get("hmr_avg_time_ms", 0)
    }

def extract_lighthouse_metrics(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract lighthouse metrics with proper structure."""
    data = result.get("data", {})
    scores = data.get("scores", {})
    metrics = data.get("metrics", {})
    
    return {
        "raw_metrics": {
            "fcp": metrics.get("first-contentful-paint", {}).get("value", 0),
            "lcp": metrics.get("largest-contentful-paint", {}).get("value", 0),
            "speed_index": metrics.get("speed-index", {}).get("value", 0),
            "cls": metrics.get("cumulative-layout-shift", {}).get("value", 0),
            "tbt": metrics.get("total-blocking-time", {}).get("value", 0)
        },
        "scores": {
            "performance": scores.get("performance", 0),
            "accessibility": scores.get("accessibility", 0),
            "best_practices": scores.get("best-practices", 0),
            "seo": scores.get("seo", 0)
        }
    }

def extract_resource_usage_metrics(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract resource usage metrics with proper structure."""
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

def extract_source_analysis_metrics(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract source analysis metrics with proper structure."""
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

def create_json_from_results(results_dir: Path, output_file: Path, use_average: bool = False) -> None:
    """Create structured JSON file from latest benchmark results."""
    # Get latest results by finding the most recent date directory
    date_dirs = [d for d in results_dir.iterdir() if d.is_dir() and d.name.count('-') == 2]
    if not date_dirs:
        raise ValueError("No benchmark result directories found")
    
    latest_dir = max(date_dirs, key=lambda d: d.name)
    
    # Initialize framework data structure
    frameworks_data = {}
    metadata = {
        "generated_at": latest_dir.name,
        "source_directory": str(latest_dir.relative_to(results_dir.parent)),
        "benchmarks_included": []
    }
    
    # Define benchmark types to process
    benchmark_types = ["build_time", "bundle_size", "dev_server", "lighthouse", "resource_usage", "source_analysis"]
    
    # Process each benchmark type
    for benchmark_type in benchmark_types:
        metadata["benchmarks_included"].append(benchmark_type)
        
        if use_average:
            # Get all files and average results
            all_files = get_all_files_by_type(latest_dir, benchmark_type)
            if not all_files:
                continue
            
            results_list = []
            for file_path in all_files:
                try:
                    with open(file_path) as f:
                        results_list.append(json.load(f))
                except (json.JSONDecodeError, IOError):
                    continue
            
            if not results_list:
                continue
            
            # Reuse TSV averaging logic and convert to JSON format
            averaged_results = average_benchmark_results(results_list, benchmark_type)
            
            for framework, avg_data in averaged_results.items():
                if framework not in frameworks_data:
                    frameworks_data[framework] = {}
                
                # Convert flat TSV format to nested JSON format
                frameworks_data[framework][benchmark_type] = convert_tsv_to_json_format(avg_data, benchmark_type)
                
        else:
            # Use latest file only (existing logic)
            latest_file = get_latest_file_by_type(latest_dir, benchmark_type)
            if not latest_file:
                continue
                
            with open(latest_file) as f:
                benchmark_data = json.load(f)
            
            for result in benchmark_data.get("results", []):
                framework = result.get("framework")
                if not framework:
                    continue
                
                if framework not in frameworks_data:
                    frameworks_data[framework] = {}
                
                # Extract data based on benchmark type
                if benchmark_type == "build_time":
                    frameworks_data[framework]["build_time"] = extract_build_time_metrics(result)
                elif benchmark_type == "bundle_size":
                    frameworks_data[framework]["bundle_size"] = extract_bundle_size_metrics(result)
                elif benchmark_type == "dev_server":
                    frameworks_data[framework]["dev_server"] = extract_dev_server_metrics(result)
                elif benchmark_type == "lighthouse":
                    frameworks_data[framework]["lighthouse"] = extract_lighthouse_metrics(result)
                elif benchmark_type == "resource_usage":
                    frameworks_data[framework]["resource_usage"] = extract_resource_usage_metrics(result)
                elif benchmark_type == "source_analysis":
                    frameworks_data[framework]["source_analysis"] = extract_source_analysis_metrics(result)
    
    # Create final output structure
    output_data = {
        "metadata": metadata,
        "frameworks": frameworks_data
    }
    
    # Write JSON file with proper formatting
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2, sort_keys=True)