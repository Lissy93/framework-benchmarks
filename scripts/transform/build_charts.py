#!/usr/bin/env python3
"""
Chart.js configuration generator for framework comparison data.
Generates interactive charts for website and QuickChart.io embedding.
"""

import json
import math
import os
from pathlib import Path
from typing import Dict, List, Any, Optional

# =============================================================================
# GLOBAL CHART CONFIGURATION CONSTANTS
# =============================================================================

# Color palette for frameworks (vibrant and accessible)
FRAMEWORK_COLORS = {
    'react': '#61DAFB',
    'angular': '#DD0031', 
    'vue': '#4FC08D',
    'svelte': '#FF3E00',
    'solid': '#2C4F7C',
    'preact': '#673AB8',
    'qwik': '#AC7EF4',
    'alpine': '#8BC34A',
    'lit': '#324FFF',
    'vanilla': '#F7DF1E',
    'jquery': '#0769AD',
    'vanjs': '#FF6B35'
}

# Transparency levels
ALPHA_SOLID = 1.0
ALPHA_SEMI = 0.8
ALPHA_LIGHT = 0.6
ALPHA_FAINT = 0.3

# Chart styling constants
GRID_COLOR = 'rgba(0, 0, 0, 0.1)'
GRID_COLOR_DARK = 'rgba(255, 255, 255, 0.1)'
TEXT_COLOR = '#374151'
TEXT_COLOR_DARK = '#F3F4F6'
BACKGROUND_COLOR = '#FFFFFF'
BACKGROUND_COLOR_DARK = '#1F2937'

# Font configuration
FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
FONT_SIZE_TITLE = 16
FONT_SIZE_LABEL = 12
FONT_SIZE_LEGEND = 11

# Chart dimensions
CHART_WIDTH = 800
CHART_HEIGHT = 600
CHART_HEIGHT_SMALL = 400

# Performance thresholds for color coding
PERFORMANCE_THRESHOLDS = {
    'good': 90,
    'needs_improvement': 50,
    'poor': 0
}

# Bundle size categories (KB)
BUNDLE_SIZE_THRESHOLDS = {
    'small': 50,
    'medium': 200,
    'large': 500
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_framework_color(framework_id: str, alpha: float = ALPHA_SOLID) -> str:
    """Convert framework color to RGBA format with specified alpha."""
    base_color = FRAMEWORK_COLORS.get(framework_id, '#666666')
    # Convert hex to RGB
    hex_color = base_color.lstrip('#')
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return f'rgba({r}, {g}, {b}, {alpha})'

def kb_to_mb(kb_value: float) -> float:
    """Convert kilobytes to megabytes."""
    return kb_value / 1024

def ms_to_seconds(ms_value: float) -> float:
    """Convert milliseconds to seconds."""
    return ms_value / 1000

def safe_divide(numerator: float, denominator: float, default: float = 0) -> float:
    """Safely divide two numbers, return default if denominator is zero."""
    return numerator / denominator if denominator != 0 else default

def normalize_score(value: float, max_value: float = 100) -> float:
    """Normalize a score to 0-100 range."""
    return min(max(value, 0), max_value)

# =============================================================================
# BASE CHART CONFIG BUILDERS
# =============================================================================

def get_base_chart_config(chart_type: str = 'bar') -> Dict[str, Any]:
    """Generate base Chart.js configuration."""
    return {
        'type': chart_type,
        'data': {},
        'options': {
            'responsive': True,
            'maintainAspectRatio': False,
            'interaction': {
                'intersect': False,
                'mode': 'index'
            },
            'plugins': {
                'legend': {
                    'display': True,
                    'position': 'top',
                    'labels': {
                        'font': {
                            'family': FONT_FAMILY,
                            'size': FONT_SIZE_LEGEND
                        },
                        'padding': 20,
                        'usePointStyle': True,
                    }
                },
                'tooltip': {
                    'backgroundColor': 'rgba(0, 0, 0, 0.8)',
                    'titleFont': {
                        'family': FONT_FAMILY,
                        'size': FONT_SIZE_LABEL
                    },
                    'bodyFont': {
                        'family': FONT_FAMILY,
                        'size': FONT_SIZE_LABEL
                    },
                    'cornerRadius': 8,
                    'displayColors': True
                }
            },
            'scales': {},
            'layout': {
                'padding': {
                    'top': 10,
                    'right': 10,
                    'bottom': 10,
                    'left': 10
                }
            }
        }
    }

def get_xy_scales_config() -> Dict[str, Any]:
    """Generate X-Y axis scales configuration."""
    return {
        'x': {
            'type': 'linear',
            'position': 'bottom',
            'grid': {
                'color': GRID_COLOR,
                'drawOnChartArea': True
            },
            'title': {
                'display': True,
                'font': {
                    'family': FONT_FAMILY,
                    'size': FONT_SIZE_LABEL,
                    'weight': 'bold'
                }
            }
        },
        'y': {
            'type': 'linear',
            'grid': {
                'color': GRID_COLOR,
                'drawOnChartArea': True
            },
            'title': {
                'display': True,
                'font': {
                    'family': FONT_FAMILY,
                    'size': FONT_SIZE_LABEL,
                    'weight': 'bold'
                }
            }
        }
    }

def get_categorical_scales_config() -> Dict[str, Any]:
    """Generate categorical axis scales configuration."""
    return {
        'x': {
            'type': 'category',
            'grid': {
                'display': False
            },
            'ticks': {
                'font': {
                    'family': FONT_FAMILY,
                    'size': FONT_SIZE_LABEL
                }
            }
        },
        'y': {
            'type': 'linear',
            'beginAtZero': True,
            'grid': {
                'color': GRID_COLOR,
                'drawOnChartArea': True
            },
            'ticks': {
                'font': {
                    'family': FONT_FAMILY,
                    'size': FONT_SIZE_LABEL
                }
            }
        }
    }

# =============================================================================
# CHART GENERATORS
# =============================================================================

def create_build_efficiency_scatter(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate build efficiency scatter plot: build time vs bundle size with compression as dot size."""
    config = get_base_chart_config('scatter')
    config['options']['scales'] = get_xy_scales_config()
    
    # Override interaction mode for scatter plot
    config['options']['interaction']['mode'] = 'point'
    
    # Configure axes
    config['options']['scales']['x']['title']['text'] = 'Build Time (seconds)'
    config['options']['scales']['y']['title']['text'] = 'Bundle Size (KB, gzipped)'
    
    datasets = []
    for framework_id, framework_data in data['frameworks'].items():
        build_time = ms_to_seconds(framework_data['build_time']['build_time_ms'])
        bundle_size = framework_data['bundle_size']['total_gzipped'] / 1024
        compression = framework_data['bundle_size']['compression_ratio']
        
        datasets.append({
            'label': framework_id.title(),
            'data': [{
                'x': build_time,
                'y': bundle_size,
                'r': max(compression * 3, 5),  # Scale dot size
                'buildTime': build_time,
                'bundleSize': bundle_size,
                'compression': compression
            }],
            'backgroundColor': get_framework_color(framework_id, ALPHA_SEMI),
            'borderColor': get_framework_color(framework_id, ALPHA_SOLID),
            'borderWidth': 2
        })
    
    config['data']['datasets'] = datasets
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Build Efficiency: Time vs Bundle Size',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    
    # Override legend point style for scatter plot
    config['options']['plugins']['legend']['labels']['pointStyle'] = 'circle'
    config['options']['plugins']['legend']['labels']['boxWidth'] = 8
    config['options']['plugins']['legend']['labels']['boxHeight'] = 8
    
    return config

def create_performance_radar(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate performance radar chart showing key metrics."""
    config = get_base_chart_config('radar')
    
    # Define radar axes
    labels = ['Performance', 'Bundle Efficiency', 'Build Speed', 'FCP Speed', 'Maintainability', 'Memory Usage']
    
    datasets = []
    
    # First pass: collect all maintainability values to find the range for normalization
    maintainability_values = [fw_data['source_analysis']['maintainability_index'] for fw_data in data['frameworks'].values()]
    max_maintainability = max(maintainability_values)
    min_maintainability = min(maintainability_values)
    
    for framework_id, framework_data in data['frameworks'].items():
        # Calculate normalized scores (0-100)
        performance_score = framework_data['lighthouse']['scores']['performance']
        bundle_efficiency = min(100, (100 / max(framework_data['bundle_size']['total_gzipped'] / 1024, 1)) * 10)
        build_speed = min(100, max(0, 100 - (framework_data['build_time']['build_time_ms'] / 1000)))
        fcp_speed = min(100, max(0, 100 - (framework_data['lighthouse']['raw_metrics']['fcp'] / 50)))
        
        # Normalize maintainability to 0-100 scale based on the range of values
        raw_maintainability = framework_data['source_analysis']['maintainability_index']
        maintainability = ((raw_maintainability - min_maintainability) / (max_maintainability - min_maintainability)) * 100
        
        memory_efficiency = min(100, max(0, 100 - (framework_data['resource_usage']['memory'] / 20)))
        
        datasets.append({
            'label': framework_id.title(),
            'data': [performance_score, bundle_efficiency, build_speed, fcp_speed, maintainability, memory_efficiency],
            'backgroundColor': get_framework_color(framework_id, ALPHA_FAINT),
            'borderColor': get_framework_color(framework_id, ALPHA_SOLID),
            'borderWidth': 2,
            'pointBackgroundColor': get_framework_color(framework_id, ALPHA_SOLID),
            'pointBorderColor': '#fff',
            'pointBorderWidth': 2,
            'pointRadius': 5
        })
    
    config['data']['labels'] = labels
    config['data']['datasets'] = datasets
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Performance Overview',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    config['options']['scales'] = {
        'r': {
            'beginAtZero': True,
            'max': 100,
            'ticks': {
                'stepSize': 20
            }
        }
    }
    
    return config

def create_load_timeline_chart(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate loading timeline chart with CLS, FCP, LCP, Speed Index."""
    config = get_base_chart_config('line')
    config['options']['scales'] = get_categorical_scales_config()
    
    # Metrics to display
    metrics = [
        ('FCP', 'fcp', 'First Contentful Paint (ms)'),
        ('LCP', 'lcp', 'Largest Contentful Paint (ms)'),
        ('Speed Index', 'speed_index', 'Speed Index (ms)'),
        ('CLS', 'cls', 'Cumulative Layout Shift (x1000)')
    ]
    
    framework_names = list(data['frameworks'].keys())
    datasets = []
    
    for metric_name, metric_key, description in metrics:
        metric_data = []
        for framework_id in framework_names:
            value = data['frameworks'][framework_id]['lighthouse']['raw_metrics'][metric_key]
            # Scale CLS for visibility
            if metric_key == 'cls':
                value *= 1000
            metric_data.append(value)
        
        datasets.append({
            'label': metric_name,
            'data': metric_data,
            'borderColor': get_framework_color('react' if metric_name == 'FCP' else 
                                             'angular' if metric_name == 'LCP' else
                                             'vue' if metric_name == 'Speed Index' else 'svelte'),
            'backgroundColor': get_framework_color('react' if metric_name == 'FCP' else 
                                                 'angular' if metric_name == 'LCP' else
                                                 'vue' if metric_name == 'Speed Index' else 'svelte', ALPHA_FAINT),
            'borderWidth': 3,
            'fill': False,
            'tension': 0.1
        })
    
    config['data']['labels'] = [fw.title() for fw in framework_names]
    config['data']['datasets'] = datasets
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Loading Performance',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    config['options']['scales']['y']['title'] = {
        'display': True,
        'text': 'Time (ms) / CLS (x1000)',
        'font': {
            'family': FONT_FAMILY,
            'size': FONT_SIZE_LABEL,
            'weight': 'bold'
        }
    }
    
    return config

def create_resource_consumption_chart(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate resource consumption chart showing CPU and memory usage."""
    config = get_base_chart_config('bar')
    config['options']['scales'] = get_categorical_scales_config()
    
    framework_names = []
    cpu_data = []
    memory_data = []
    
    for framework_id, framework_data in data['frameworks'].items():
        framework_names.append(framework_id.title())
        cpu_data.append(framework_data['resource_usage']['average_cpu'])
        memory_data.append(framework_data['resource_usage']['memory'])
    
    config['data']['labels'] = framework_names
    config['data']['datasets'] = [
        {
            'label': 'Average CPU Usage (%)',
            'data': cpu_data,
            'backgroundColor': [get_framework_color(fw, ALPHA_SEMI) for fw in data['frameworks'].keys()],
            'borderColor': [get_framework_color(fw, ALPHA_SOLID) for fw in data['frameworks'].keys()],
            'borderWidth': 2,
            'yAxisID': 'y'
        },
        {
            'label': 'Memory Usage (MB)',
            'data': memory_data,
            'backgroundColor': [get_framework_color(fw, ALPHA_LIGHT) for fw in data['frameworks'].keys()],
            'borderColor': [get_framework_color(fw, ALPHA_SOLID) for fw in data['frameworks'].keys()],
            'borderWidth': 2,
            'yAxisID': 'y1'
        }
    ]
    
    config['options']['scales']['y1'] = {
        'type': 'linear',
        'position': 'right',
        'grid': {
            'drawOnChartArea': False
        },
        'title': {
            'display': True,
            'text': 'Memory (MB)',
            'font': {
                'family': FONT_FAMILY,
                'size': FONT_SIZE_LABEL,
                'weight': 'bold'
            }
        }
    }
    config['options']['scales']['y']['title'] = {
        'display': True,
        'text': 'CPU Usage (%)',
        'font': {
            'family': FONT_FAMILY,
            'size': FONT_SIZE_LABEL,
            'weight': 'bold'
        }
    }
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Resource Consumption',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    
    return config

def create_lighthouse_radial_chart(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate radial bar chart for Lighthouse scores."""
    config = get_base_chart_config('doughnut')
    
    # We'll create a chart for each framework, but for now let's aggregate
    framework_names = []
    performance_scores = []
    accessibility_scores = []
    best_practices_scores = []
    seo_scores = []
    
    for framework_id, framework_data in data['frameworks'].items():
        framework_names.append(framework_id.title())
        scores = framework_data['lighthouse']['scores']
        performance_scores.append(scores['performance'])
        accessibility_scores.append(scores['accessibility'])
        best_practices_scores.append(scores['best_practices'])
        seo_scores.append(scores['seo'])
    
    # Create polar area chart instead for better multi-framework comparison
    config['type'] = 'polarArea'
    config['data'] = {
        'labels': framework_names,
        'datasets': [
            {
                'label': 'Performance',
                'data': performance_scores,
                'backgroundColor': [get_framework_color(fw, ALPHA_SEMI) for fw in data['frameworks'].keys()],
                'borderColor': [get_framework_color(fw, ALPHA_SOLID) for fw in data['frameworks'].keys()],
                'borderWidth': 2
            }
        ]
    }
    
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Lighthouse Performance Scores',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    config['options']['scales'] = {
        'r': {
            'beginAtZero': False,
            'min': 80,
            'max': 100,
            'ticks': {
                'stepSize': 5
            }
        }
    }
    
    return config

def create_source_analysis_chart(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate stacked bar chart for source analysis metrics."""
    config = get_base_chart_config('bar')
    config['options']['scales'] = get_categorical_scales_config()
    config['options']['scales']['x']['stacked'] = True
    config['options']['scales']['y']['stacked'] = True
    
    # Collect and sort frameworks by total size (logical lines + files*10 + complexity)
    framework_data_list = []
    for framework_id, framework_data in data['frameworks'].items():
        source = framework_data['source_analysis']
        logical_lines_val = source['logical_lines']
        files_count_val = source['files_count']
        complexity_val = source['cyclomatic_complexity']
        total_size = logical_lines_val + (files_count_val * 10) + complexity_val
        
        framework_data_list.append({
            'name': framework_id.title(),
            'logical_lines': logical_lines_val,
            'files_count': files_count_val,
            'complexity': complexity_val,
            'total_size': total_size
        })
    
    # Sort by total size (largest to smallest)
    framework_data_list.sort(key=lambda x: x['total_size'], reverse=True)
    
    # Extract sorted data
    framework_names = [item['name'] for item in framework_data_list]
    logical_lines = [item['logical_lines'] for item in framework_data_list]
    files_count = [item['files_count'] for item in framework_data_list]
    complexity = [item['complexity'] for item in framework_data_list]
    
    config['data']['labels'] = framework_names
    config['data']['datasets'] = [
        {
            'label': 'Logical Lines',
            'data': logical_lines,
            'backgroundColor': 'rgba(59, 130, 246, 0.8)',
            'borderColor': 'rgba(59, 130, 246, 1)',
            'borderWidth': 1
        },
        {
            'label': 'Files Count (�10)',
            'data': [x * 10 for x in files_count],
            'backgroundColor': 'rgba(16, 185, 129, 0.8)',
            'borderColor': 'rgba(16, 185, 129, 1)',
            'borderWidth': 1
        },
        {
            'label': 'Cyclomatic Complexity',
            'data': complexity,
            'backgroundColor': 'rgba(245, 101, 101, 0.8)',
            'borderColor': 'rgba(245, 101, 101, 1)',
            'borderWidth': 1
        }
    ]
    
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Source Code Analysis',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    config['options']['scales']['y']['title'] = {
        'display': True,
        'text': 'Count',
        'font': {
            'family': FONT_FAMILY,
            'size': FONT_SIZE_LABEL,
            'weight': 'bold'
        }
    }
    
    return config

def create_bundle_size_comparison(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate bar chart with bundle sizes and compression ratio line."""
    config = get_base_chart_config('bar')
    config['options']['scales'] = get_categorical_scales_config()
    
    framework_names = []
    total_size = []
    gzipped_size = []
    compression_ratios = []
    
    for framework_id, framework_data in data['frameworks'].items():
        framework_names.append(framework_id.title())
        bundle = framework_data['bundle_size']
        total_size.append(bundle['total_size'] / 1024)  # Convert to KB
        gzipped_size.append(bundle['total_gzipped'] / 1024)
        compression_ratios.append(bundle['compression_ratio'])
    
    config['data']['labels'] = framework_names
    config['data']['datasets'] = [
        {
            'label': 'Total Size (KB)',
            'data': total_size,
            'backgroundColor': [get_framework_color(fw, ALPHA_LIGHT) for fw in data['frameworks'].keys()],
            'borderColor': [get_framework_color(fw, ALPHA_SOLID) for fw in data['frameworks'].keys()],
            'borderWidth': 2,
            'yAxisID': 'y'
        },
        {
            'label': 'Gzipped Size (KB)',
            'data': gzipped_size,
            'backgroundColor': [get_framework_color(fw, ALPHA_SEMI) for fw in data['frameworks'].keys()],
            'borderColor': [get_framework_color(fw, ALPHA_SOLID) for fw in data['frameworks'].keys()],
            'borderWidth': 2,
            'yAxisID': 'y'
        },
        {
            'label': 'Compression Ratio',
            'data': compression_ratios,
            'type': 'line',
            'backgroundColor': 'rgba(99, 102, 241, 0.1)',
            'borderColor': 'rgba(99, 102, 241, 1)',
            'borderWidth': 3,
            'fill': False,
            'yAxisID': 'y1',
            'tension': 0.1
        }
    ]
    
    config['options']['scales']['y1'] = {
        'type': 'linear',
        'position': 'right',
        'grid': {
            'drawOnChartArea': False
        },
        'title': {
            'display': True,
            'text': 'Compression Ratio',
            'font': {
                'family': FONT_FAMILY,
                'size': FONT_SIZE_LABEL,
                'weight': 'bold'
            }
        }
    }
    config['options']['scales']['y']['title'] = {
        'display': True,
        'text': 'Bundle Size (KB)',
        'font': {
            'family': FONT_FAMILY,
            'size': FONT_SIZE_LABEL,
            'weight': 'bold'
        }
    }
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Bundle Size and Comparison',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    
    return config

def create_project_size_pie(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate pie chart showing total project size breakdown by framework."""
    config = get_base_chart_config('pie')
    
    framework_names = []
    sizes = []
    colors = []
    
    for framework_id, framework_data in data['frameworks'].items():
        framework_names.append(framework_id.title())
        sizes.append(framework_data['bundle_size']['total_gzipped'] / 1024)
        colors.append(get_framework_color(framework_id, ALPHA_SEMI))
    
    config['data'] = {
        'labels': framework_names,
        'datasets': [{
            'data': sizes,
            'backgroundColor': colors,
            'borderColor': [get_framework_color(fw, ALPHA_SOLID) for fw in data['frameworks'].keys()],
            'borderWidth': 2
        }]
    }
    
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Project Size Distribution (Gzipped KB)',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    
    return config

def create_performance_quadrant_chart(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate quadrant chart showing performance vs bundle size."""
    config = get_base_chart_config('scatter')
    config['options']['scales'] = get_xy_scales_config()
    
    # Override interaction mode for scatter plot
    config['options']['interaction']['mode'] = 'point'
    
    config['options']['scales']['x']['title']['text'] = 'Bundle Size (KB, gzipped)'
    config['options']['scales']['y']['title']['text'] = 'Performance Score'
    
    datasets = []
    for framework_id, framework_data in data['frameworks'].items():
        bundle_size = framework_data['bundle_size']['total_gzipped'] / 1024
        performance = framework_data['lighthouse']['scores']['performance']
        
        datasets.append({
            'label': framework_id.title(),
            'data': [{
                'x': bundle_size,
                'y': performance,
                'bundleSize': bundle_size,
                'performance': performance
            }],
            'backgroundColor': get_framework_color(framework_id, ALPHA_SEMI),
            'borderColor': get_framework_color(framework_id, ALPHA_SOLID),
            'borderWidth': 2,
            'pointRadius': 8
        })
    
    config['data']['datasets'] = datasets
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Performance vs Bundle Size',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    
    # Override legend point style for scatter plot
    config['options']['plugins']['legend']['labels']['pointStyle'] = 'circle'
    config['options']['plugins']['legend']['labels']['boxWidth'] = 8
    config['options']['plugins']['legend']['labels']['boxHeight'] = 8
    
    # Add quadrant lines
    config['options']['plugins']['annotation'] = {
        'annotations': {
            'vline': {
                'type': 'line',
                'xMin': 100,  # 100KB threshold
                'xMax': 100,
                'borderColor': 'rgba(0, 0, 0, 0.3)',
                'borderWidth': 2,
                'borderDash': [5, 5]
            },
            'hline': {
                'type': 'line',
                'yMin': 80,  # 80 performance threshold
                'yMax': 80,
                'borderColor': 'rgba(0, 0, 0, 0.3)',
                'borderWidth': 2,
                'borderDash': [5, 5]
            }
        }
    }
    
    return config

def create_maintainability_treemap(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate treemap showing maintainability metrics."""
    config = get_base_chart_config('treemap')
    
    tree_data = []
    colors = []
    for framework_id, framework_data in data['frameworks'].items():
        source = framework_data['source_analysis']
        tree_data.append({
            'value': source['logical_lines'],  # Use logical lines as the primary value
            'maintainability': source['maintainability_index'],
            'label': framework_id.title(),
            'framework': framework_id
        })
        colors.append(get_framework_color(framework_id, ALPHA_SEMI))
    
    config['data'] = {
        'datasets': [{
            'label': 'Maintainability',
            'tree': tree_data,  # Use 'tree' property instead of 'data'
            'key': 'value',     # Specify which property contains the numeric value
            'backgroundColor': colors,
            'borderColor': [get_framework_color(fw, ALPHA_SOLID) for fw in data['frameworks'].keys()],
            'borderWidth': 2,
            'spacing': 0.5
        }]
    }
    
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Code Maintainability Treemap (size = lines of code)',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    
    return config

def create_build_time_donut(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate donut chart for build times."""
    config = get_base_chart_config('doughnut')
    
    framework_names = []
    build_times = []
    colors = []
    
    for framework_id, framework_data in data['frameworks'].items():
        build_time = framework_data['build_time']['build_time_ms']
        if build_time > 0:  # Only include frameworks with actual build times
            framework_names.append(framework_id.title())
            build_times.append(build_time / 1000)  # Convert to seconds
            colors.append(get_framework_color(framework_id, ALPHA_SEMI))
    
    config['data'] = {
        'labels': framework_names,
        'datasets': [{
            'data': build_times,
            'backgroundColor': colors,
            'borderColor': [get_framework_color(fw, ALPHA_SOLID) for fw in data['frameworks'].keys() if data['frameworks'][fw]['build_time']['build_time_ms'] > 0],
            'borderWidth': 2,
            'cutout': '50%'
        }]
    }
    
    config['options']['plugins']['title'] = {
        'display': True,
        'text': 'Build Time Distribution (seconds)',
        'font': {'size': FONT_SIZE_TITLE, 'family': FONT_FAMILY}
    }
    
    return config

# =============================================================================
# MAIN CHART BUILDER
# =============================================================================

def load_results_data(results_dir: Path) -> Dict[str, Any]:
    """Load benchmark results from JSON file."""
    results_files = list(results_dir.glob('benchmark_results_*.json'))
    if not results_files:
        raise FileNotFoundError("No benchmark results found")
    
    # Use the most recent results file
    latest_file = max(results_files, key=lambda x: x.stat().st_mtime)
    
    with open(latest_file, 'r') as f:
        return json.load(f)

def generate_all_charts(results_dir: Path) -> Dict[str, Dict[str, Any]]:
    """Generate all chart configurations."""
    data = load_results_data(results_dir)
    
    charts = {
        'build_efficiency_scatter': create_build_efficiency_scatter(data),
        'performance_radar': create_performance_radar(data),
        'load_timeline': create_load_timeline_chart(data),
        'resource_consumption': create_resource_consumption_chart(data),
        'lighthouse_radial': create_lighthouse_radial_chart(data),
        'source_analysis': create_source_analysis_chart(data),
        'bundle_size_comparison': create_bundle_size_comparison(data),
        'project_size_pie': create_project_size_pie(data),
        'performance_quadrant': create_performance_quadrant_chart(data),
        'maintainability_treemap': create_maintainability_treemap(data),
        'build_time_donut': create_build_time_donut(data)
    }
    
    return charts

def main():
    """Main function to generate and save chart configurations."""
    script_dir = Path(__file__).parent
    results_dir = script_dir.parent.parent / 'results'
    output_dir = script_dir.parent.parent / 'website' / 'static'
    
    if not results_dir.exists():
        raise FileNotFoundError(f"Results directory not found: {results_dir}")
    
    print("= Generating Chart.js configurations...")
    charts = generate_all_charts(results_dir)
    
    # Save individual chart configs
    charts_dir = output_dir / 'charts'
    charts_dir.mkdir(exist_ok=True)
    
    for chart_name, chart_config in charts.items():
        output_file = charts_dir / f'{chart_name}.json'
        with open(output_file, 'w') as f:
            json.dump(chart_config, f, indent=2)
        print(f" Generated: {chart_name}.json")
    
    # Save combined config
    combined_file = output_dir / 'chart-configs.json'
    combined_config = {
        'generated_at': '2025-08-19T23:55:00Z',
        'charts': charts
    }
    
    with open(combined_file, 'w') as f:
        json.dump(combined_config, f, indent=2)
    
    print(f" All chart configurations saved to {output_dir}")
    print(f"=� Generated {len(charts)} chart types")

if __name__ == '__main__':
    main()
