#!/usr/bin/env python3
"""
Static website builder for deployment.
Generates a complete static website from the framework comparison templates.
"""

import json
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional
import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskID

import sys
sys.path.append(str(Path(__file__).parent.parent))

from common import get_config, get_frameworks, show_header
from generator import WebsiteGenerator

console = Console()


class StaticWebsiteBuilder:
    """Builds a static version of the framework comparison website."""
    
    def __init__(self, base_url: str = ""):
        self.config = get_config()
        self.base_url = base_url.rstrip('/')
        self.root_dir = Path(__file__).parent.parent.parent
        self.frameworks_list = get_frameworks()
        
        # Get output directory from config
        output_config = self.config.get("website", {}).get("deployment", {})
        self.output_dir = self.root_dir / output_config.get("outputDir", "dist-website")
        
        # Initialize website generator for static mode
        self.generator = WebsiteGenerator(base_url=self.base_url, is_static=True)
    
    def build(self, clean: bool = True) -> None:
        """
        Build the complete static website.
        
        Args:
            clean: Whether to clean the output directory first
        """
        show_header("Build Website", "Generating static site which serves up each framework app")
        
        if clean and self.output_dir.exists():
            console.print("🧹 Cleaning output directory...")
            shutil.rmtree(self.output_dir)
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            console=console
        ) as progress:
            
            # Build HTML pages
            pages_task = progress.add_task("Generating HTML pages...", total=None)
            pages = self._build_html_pages()
            progress.update(pages_task, completed=len(pages), total=len(pages))
            
            # Copy static assets
            assets_task = progress.add_task("Copying static assets...", total=None)
            self._copy_static_assets()
            progress.update(assets_task, completed=1, total=1)
            
            # Copy framework apps for deployment
            apps_task = progress.add_task("Copying framework apps...", total=None)
            copied_apps = self._copy_framework_apps()
            progress.update(apps_task, completed=copied_apps, total=len(self.frameworks_list))
            
            # Generate additional files
            extras_task = progress.add_task("Generating additional files...", total=None)
            self._generate_additional_files()
            progress.update(extras_task, completed=1, total=1)
        
        console.print(f"✅ Static website built successfully!")
        console.print(f"📁 Output directory: {self.output_dir}")
        console.print(f"📄 Generated {len(pages)} HTML pages")
        console.print(f"📱 Copied {copied_apps} framework apps")
    
    def _build_html_pages(self) -> Dict[str, str]:
        """Generate all HTML pages and write them to files."""
        pages = self.generator.get_all_static_pages()
        
        for url_path, html_content in pages.items():
            # Convert URL path to file path
            if url_path == '/':
                file_path = self.output_dir / 'index.html'
            else:
                # Remove leading/trailing slashes and create directory structure
                clean_path = url_path.strip('/')
                file_path = self.output_dir / clean_path / 'index.html'
            
            # Create directory if needed
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write HTML
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
        
        return pages
    
    def _copy_static_assets(self) -> None:
        """Copy static assets (CSS, JS, images) to output directory."""
        static_dir = self.root_dir / self.config["directories"]["staticDir"]
        static_output = self.output_dir / 'static'
        
        if static_dir.exists():
            if static_output.exists():
                shutil.rmtree(static_output)
            shutil.copytree(static_dir, static_output)
    
    def _copy_framework_apps(self) -> int:
        """Copy built framework apps to the output directory."""
        copied_count = 0
        app_dir = self.config.get("directories", {}).get("appDir", "apps")
        
        for framework_data in self.frameworks_list:
            framework_id = framework_data.get("id")
            build_config = framework_data.get("build", {})
            build_dir = build_config.get("dir", "dist")
            
            # Handle special cases for build directories (same as serve.py)
            if framework_id == "svelte":
                build_dir = "build"
            elif framework_id == "angular":
                build_dir = "dist/weather-app-angular"
            elif framework_id in ["vanilla", "alpine"]:
                # Check if dist directory exists (for comparison builds)
                dist_path = self.root_dir / app_dir / framework_id / "dist"
                if dist_path.exists() and (dist_path / "index.html").exists():
                    build_dir = "dist"
                else:
                    build_dir = None
            
            # Construct source path
            if build_dir:
                source_path = self.root_dir / app_dir / framework_id / build_dir
            else:
                source_path = self.root_dir / app_dir / framework_id
            
            # Skip if not built
            if not source_path.exists() or not (source_path / "index.html").exists():
                console.print(f"⚠️  Skipping {framework_id} - not built")
                continue
            
            # Copy to output directory
            output_app_dir = self.output_dir / framework_id / "app"
            
            if output_app_dir.exists():
                shutil.rmtree(output_app_dir)
            
            output_app_dir.parent.mkdir(parents=True, exist_ok=True)
            shutil.copytree(source_path, output_app_dir)
            copied_count += 1
        
        return copied_count
    
    def _generate_additional_files(self) -> None:
        """Generate additional files for deployment (robots.txt, sitemap, etc.)."""
        
        # Generate robots.txt
        robots_content = f"""User-agent: *
Allow: /

Sitemap: {self.base_url}/sitemap.xml
"""
        with open(self.output_dir / "robots.txt", "w") as f:
            f.write(robots_content)
        
        # Generate sitemap.xml
        sitemap_urls = [self.base_url + "/"]
        for framework in self.frameworks_list:
            framework_id = framework.get("id")
            if framework_id:
                sitemap_urls.append(f"{self.base_url}/{framework_id}/")
                sitemap_urls.append(f"{self.base_url}/{framework_id}/app/")
        
        sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
"""
        for url in sitemap_urls:
            sitemap_content += f"""  <url>
    <loc>{url}</loc>
    <lastmod>{self._get_build_date()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
"""
        sitemap_content += "</urlset>"
        
        with open(self.output_dir / "sitemap.xml", "w") as f:
            f.write(sitemap_content)
        
        # Generate _redirects for Netlify (if needed)
        redirects_content = """# Netlify redirects
/*/source  https://github.com/anthropics/weather-front/tree/main/apps/:splat  302
/*  /404/  404
"""
        with open(self.output_dir / "_redirects", "w") as f:
            f.write(redirects_content)
        
        # Generate .htaccess for Apache (if needed)
        htaccess_content = """# Apache redirects
RewriteEngine On

# Redirect source code requests to GitHub
RewriteRule ^([^/]+)/source/?$ https://github.com/anthropics/weather-front/tree/main/apps/$1 [R=302,L]

# Handle 404s
ErrorDocument 404 /404/index.html

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
"""
        with open(self.output_dir / ".htaccess", "w") as f:
            f.write(htaccess_content)
    
    def _get_build_date(self) -> str:
        """Get current date in ISO format for sitemap."""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d")


@click.command()
@click.option('--base-url', default="", help='Base URL for the deployed website')
@click.option('--output', '-o', help='Output directory (overrides config)')
@click.option('--no-clean', is_flag=True, help='Do not clean output directory first')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def build_website(base_url: str, output: str, no_clean: bool, verbose: bool):
    """Build static website for deployment."""
    
    builder = StaticWebsiteBuilder(base_url=base_url)
    
    # Override output directory if specified
    if output:
        builder.output_dir = Path(output).resolve()
    
    builder.build(clean=not no_clean)
    
    if verbose:
        console.print(f"✨ Website ready for deployment!")


if __name__ == "__main__":
    build_website()
