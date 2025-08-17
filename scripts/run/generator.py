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
    
    def render_homepage(self) -> str:
        """Render the homepage template."""
        template = self.env.get_template('homepage.html')
        return template.render(
            config=self.config,
            frameworks=self.frameworks_list,
            page_type='homepage'
        )
    
    def render_framework_page(self, framework_id: str) -> str:
        """Render a framework landing page."""
        framework = self.get_framework_by_id(framework_id)
        if not framework:
            return self.render_404()
        
        navigation = self.get_framework_navigation(framework_id)
        framework_stats = self.load_framework_stats(framework_id)
        
        template = self.env.get_template('framework.html')
        return template.render(
            config=self.config,
            framework=framework,
            framework_stats=framework_stats,
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
