#!/usr/bin/env python3
"""
HTML generation utilities for the frontend framework comparison website.
Provides both dynamic (serve.py) and static (build) HTML generation using Jinja2 templates.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from urllib.parse import urljoin

from jinja2 import Environment, FileSystemLoader, select_autoescape
import markdown
import sys

# Add parent directory to path for imports  
sys.path.append(str(Path(__file__).parent.parent))
from common import get_config, get_frameworks


class WebsiteGenerator:
    """Generates HTML pages for the framework comparison website."""
    
    def __init__(self, base_url: str = "", is_static: bool = False):
        """
        Initialize the website generator.
        
        Args:
            base_url: Base URL for the website (empty for relative paths)
            is_static: Whether generating static files (affects asset URLs)
        """
        self.config = get_config()
        self.frameworks_list = get_frameworks()
        self.base_url = base_url.rstrip('/')
        self.is_static = is_static
        
        # Setup paths
        self.root_dir = Path(__file__).parent.parent.parent
        self.templates_dir = self.root_dir / self.config["directories"]["templatesDir"]
        self.static_dir = self.root_dir / self.config["directories"]["staticDir"]
        
        # Setup Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Add custom filters and functions
        self._setup_template_functions()
    
    def _setup_template_functions(self):
        """Setup custom Jinja2 filters and global functions."""
        
        def url_for_static(filename: str) -> str:
            """Generate URL for static assets."""
            prefix = f"{self.base_url}/static/" if self.is_static and self.base_url else ("static/" if self.is_static else "/static/")
            return f"{prefix}{filename}"
        
        def url_for_framework(framework_id: str, path: str = "") -> str:
            """Generate URL for framework pages."""
            path = path.strip('/')
            if path:
                return f"{self.base_url}/{framework_id}/{path}"
            return f"{self.base_url}/{framework_id}"
        
        def filesizeformat(num_bytes: Union[int, float]) -> str:
            """Format file size in human readable format."""
            if not isinstance(num_bytes, (int, float)):
                return str(num_bytes)
            
            for unit in ['B', 'KB', 'MB', 'GB']:
                if num_bytes < 1024.0:
                    if unit == 'B':
                        return f"{int(num_bytes)} {unit}"
                    return f"{num_bytes:.1f} {unit}"
                num_bytes /= 1024.0
            return f"{num_bytes:.1f} TB"
        
        # Add functions to global context
        self.env.globals['url_for_static'] = url_for_static
        self.env.globals['url_for_framework'] = url_for_framework
        self.env.filters['filesizeformat'] = filesizeformat
    
    def get_framework_by_id(self, framework_id: str) -> Optional[Dict[str, Any]]:
        """Get framework data by ID."""
        for framework in self.frameworks_list:
            if framework.get('id') == framework_id:
                return framework
        return None
    
    def get_framework_navigation(self, current_id: str) -> Dict[str, Optional[Dict]]:
        """Get previous and next framework for navigation."""
        current_index = None
        for i, framework in enumerate(self.frameworks_list):
            if framework.get('id') == current_id:
                current_index = i
                break
        
        if current_index is None:
            return {'prev': None, 'next': None}
        
        prev_framework = None
        next_framework = None
        
        if current_index > 0:
            prev_framework = self.frameworks_list[current_index - 1]
        
        if current_index < len(self.frameworks_list) - 1:
            next_framework = self.frameworks_list[current_index + 1]
        
        return {
            'prev': prev_framework,
            'next': next_framework
        }
    
    def load_framework_stats(self, framework_id: str) -> Optional[Dict[str, Any]]:
        """Load latest benchmark statistics for a framework."""
        benchmark_dir = self.root_dir / "benchmark-results"
        if not benchmark_dir.exists():
            return None
        
        # Look for latest results
        stats = {}
        
        # Find latest benchmark files for this framework
        for result_file in benchmark_dir.rglob("*.json"):
            try:
                with open(result_file, 'r') as f:
                    data = json.load(f)
                
                # Check if this file contains results for our framework
                if 'results' in data:
                    for result in data['results']:
                        if result.get('framework') == framework_id and result.get('success'):
                            benchmark_type = data.get('benchmark_slug', '')
                            if benchmark_type and benchmark_type not in stats:
                                stats[benchmark_type] = result.get('data', {})
            except (json.JSONDecodeError, IOError):
                continue
        
        return stats if stats else None
    
    def load_framework_commentary(self, framework_id: str) -> Dict[str, Optional[str]]:
        """Load and convert framework commentary from markdown to HTML."""
        commentary_file = self.static_dir / "framework-commentary.json"
        if not commentary_file.exists():
            return {"implementation": None, "about": None}
        
        try:
            with open(commentary_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Find commentary for this framework
            for item in data.get('items', []):
                if item.get('id') == framework_id:
                    result = {"implementation": None, "about": None}
                    
                    # Convert implementation markdown to HTML
                    implementation_md = item.get('implementation')
                    if implementation_md:
                        md = markdown.Markdown(extensions=['extra', 'codehilite'])
                        result["implementation"] = md.convert(implementation_md)
                    
                    # Convert about markdown to HTML
                    about_md = item.get('about')
                    if about_md:
                        md = markdown.Markdown(extensions=['extra', 'codehilite'])
                        result["about"] = md.convert(about_md)
                    
                    return result
            
            return {"implementation": None, "about": None}
        except (json.JSONDecodeError, IOError):
            return {"implementation": None, "about": None}
    
    def load_framework_results_summary(self, framework_id: str) -> Optional[Dict[str, Any]]:
        """Load framework results summary data."""
        results_file = self.static_dir / "results-summary.json"
        if not results_file.exists():
            return None
        
        try:
            with open(results_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Get results for this framework
            frameworks = data.get('frameworks', {})
            return frameworks.get(framework_id)
        except (json.JSONDecodeError, IOError):
            return None
    
    def load_chart_configs(self) -> Dict[str, Any]:
        """Load chart configurations for homepage display."""
        chart_configs_file = self.static_dir / "chart-configs.json"
        if not chart_configs_file.exists():
            return {}
        
        try:
            with open(chart_configs_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data.get('charts', {})
        except (json.JSONDecodeError, IOError):
            return {}
    
    def render_homepage(self) -> str:
        """Render the homepage template."""
        # Load chart configurations
        chart_configs = self.load_chart_configs()
        
        template = self.env.get_template('homepage.html')
        return template.render(
            config=self.config,
            frameworks=self.frameworks_list,
            chart_configs=chart_configs,
            page_type='homepage'
        )
    
    def render_framework_page(self, framework_id: str) -> str:
        """Render a framework landing page."""
        framework = self.get_framework_by_id(framework_id)
        if not framework:
            return self.render_404()
        
        navigation = self.get_framework_navigation(framework_id)
        framework_stats = self.load_framework_stats(framework_id)
        framework_commentary = self.load_framework_commentary(framework_id)
        framework_results = self.load_framework_results_summary(framework_id)
        
        template = self.env.get_template('framework.html')
        return template.render(
            config=self.config,
            framework=framework,
            framework_stats=framework_stats,
            framework_commentary=framework_commentary,
            framework_results=framework_results,
            prev_framework=navigation['prev'],
            next_framework=navigation['next'],
            page_type='framework'
        )
    
    def render_404(self) -> str:
        """Render the 404 error page."""
        template = self.env.get_template('404.html')
        return template.render(
            config=self.config,
            page_type='error'
        )
    
    def render_framework_error(self, framework_id: str, framework_name: str, 
                             available_frameworks: List[Dict[str, Any]], 
                             build_dir: str = 'dist') -> str:
        """Render the framework error page when an app isn't built."""
        template = self.env.get_template('framework-error.html')
        return template.render(
            config=self.config,
            framework_id=framework_id,
            framework_name=framework_name,
            available_frameworks=available_frameworks,
            build_dir=build_dir,
            page_type='framework-error'
        )
    
    def get_all_static_pages(self) -> Dict[str, str]:
        """
        Generate all static pages for deployment.
        Returns a dictionary mapping URL paths to HTML content.
        """
        pages = {}
        
        # Homepage
        pages['/'] = self.render_homepage()
        
        # Framework pages
        for framework in self.frameworks_list:
            framework_id = framework.get('id')
            if framework_id:
                pages[f'/{framework_id}/'] = self.render_framework_page(framework_id)
        
        # 404 page
        pages['/404/'] = self.render_404()
        
        return pages
    
    def create_static_website(self, output_dir: Path) -> None:
        """
        Generate a complete static website in the specified directory.
        
        Args:
            output_dir: Directory to create the static website in
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate all pages
        pages = self.get_all_static_pages()
        
        # Write HTML files
        for url_path, html_content in pages.items():
            # Convert URL path to file path
            if url_path == '/':
                file_path = output_dir / 'index.html'
            else:
                # Remove leading/trailing slashes and create directory structure
                clean_path = url_path.strip('/')
                file_path = output_dir / clean_path / 'index.html'
            
            # Create directory if needed
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write HTML
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
        
        # Copy static assets if configured
        if self.config.get("website", {}).get("deployment", {}).get("copyAssets", True):
            self._copy_static_assets(output_dir)
    
    def _copy_static_assets(self, output_dir: Path) -> None:
        """Copy static assets to the output directory."""
        import shutil
        
        static_output = output_dir / 'static'
        
        if self.static_dir.exists():
            if static_output.exists():
                shutil.rmtree(static_output)
            shutil.copytree(self.static_dir, static_output)
