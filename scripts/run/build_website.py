#!/usr/bin/env python3
"""
Static website builder for deployment.
Generates a complete static website from the framework comparison templates.
"""

import json
import re
import shutil
import time
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


def extract_framework_commentary(framework_id: str, root_dir: Path) -> Optional[str]:
    """Extract framework-specific commentary from README.md between markers."""
    readme_path = root_dir / "apps" / framework_id / "README.md"
    
    if not readme_path.exists():
        return None
        
    try:
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        match = re.search(
            r'<!-- start_framework_specific -->(.*?)<!-- end_framework_specific -->',
            content, 
            re.DOTALL
        )
        
        if match:
            return match.group(1).strip()
        return None
        
    except Exception:
        return None


def copy_file_to_locations(source: Path, filename: str, static_output: Path, dev_static: Path) -> bool:
    """Copy a file to both output and development static directories."""
    if not source.exists():
        return False
        
    try:
        dest1 = static_output / filename
        shutil.copy2(source, dest1)
        
        if dev_static.exists():
            dest2 = dev_static / filename  
            shutil.copy2(source, dest2)
            
        return True
    except Exception:
        return False


def copy_framework_stats(root_dir: Path, static_output: Path) -> None:
    """Copy framework stats JSON file to static directories."""
    source = root_dir / "results" / "framework-stats.json"
    dev_static = root_dir / "website" / "static"
    
    if copy_file_to_locations(source, "framework-stats.json", static_output, dev_static):
        locations = "static/ and website/static/" if dev_static.exists() else "static/"
        console.print(f"[green]✓ Framework stats copied:[/green] {source.name} → {locations}")
    elif source.exists():
        console.print(f"[red]✗ Failed to copy framework stats[/red]")
    else:
        console.print(f"[yellow]⚠ Framework stats not found:[/yellow] {source}")


def copy_benchmark_results(root_dir: Path, static_output: Path) -> None:
    """Copy latest benchmark results JSON file to static directories."""
    results_dir = root_dir / "results"
    dev_static = root_dir / "website" / "static"
    
    if not results_dir.exists():
        console.print(f"[yellow]⚠ Results directory not found:[/yellow] {results_dir}")
        return
        
    benchmark_files = list(results_dir.glob("benchmark_results_*.json"))
    if not benchmark_files:
        console.print(f"[yellow]⚠ No benchmark results found in:[/yellow] {results_dir}")
        return
        
    latest = max(benchmark_files, key=lambda x: x.stat().st_mtime)
    
    if copy_file_to_locations(latest, "results-summary.json", static_output, dev_static):
        locations = "static/ and website/static/" if dev_static.exists() else "static/"
        console.print(f"[green]✓ Benchmark results copied:[/green] {latest.name} → {locations}")
    else:
        console.print(f"[red]✗ Failed to copy benchmark results[/red]")


def generate_framework_commentary(frameworks: List[Dict], root_dir: Path, static_output: Path) -> None:
    """Generate framework commentary JSON file from README.md files."""
    commentary_data = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "items": []
    }
    
    for framework in frameworks:
        framework_id = framework.get("id")
        if not framework_id:
            continue
            
        commentary = extract_framework_commentary(framework_id, root_dir)
        
        commentary_data["items"].append({
            "id": framework_id,
            "name": framework.get("name", framework_id.title()),
            "commentary": commentary
        })
    
    dev_static = root_dir / "website" / "static"
    
    try:
        # Write to output directory
        output_path = static_output / "framework-commentary.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(commentary_data, f, indent=2, ensure_ascii=False)
        
        # Write to development directory
        if dev_static.exists():
            dev_path = dev_static / "framework-commentary.json"
            with open(dev_path, 'w', encoding='utf-8') as f:
                json.dump(commentary_data, f, indent=2, ensure_ascii=False)
            locations = "static/ and website/static/"
        else:
            locations = "static/"
            
        found_count = sum(1 for item in commentary_data["items"] if item["commentary"])
        console.print(f"[green]✓ Framework commentary generated:[/green] {found_count}/{len(frameworks)} frameworks → {locations}")
        
    except Exception as e:
        console.print(f"[red]✗ Failed to generate framework commentary:[/red] {e}")


def build_html_pages(generator: WebsiteGenerator, output_dir: Path) -> Dict[str, str]:
    """Generate all HTML pages and write them to files."""
    pages = generator.get_all_static_pages()
    
    for url_path, html_content in pages.items():
        if url_path == '/':
            file_path = output_dir / 'index.html'
        else:
            clean_path = url_path.strip('/')
            file_path = output_dir / clean_path / 'index.html'
        
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
    
    return pages


def copy_static_assets(root_dir: Path, config: Dict, output_dir: Path) -> None:
    """Copy static assets (CSS, JS, images) and data files to output directory."""
    static_dir = root_dir / config["directories"]["staticDir"]
    static_output = output_dir / 'static'
    
    if static_dir.exists():
        if static_output.exists():
            shutil.rmtree(static_output)
        shutil.copytree(static_dir, static_output)
    
    # Copy data files using helper functions
    copy_framework_stats(root_dir, static_output)
    copy_benchmark_results(root_dir, static_output)


def copy_project_assets(root_dir: Path, config: Dict, output_dir: Path) -> None:
    """Copy project assets directory to the output directory root."""
    assets_dir = root_dir / config.get("directories", {}).get("assetsDir", "assets")
    
    if not assets_dir.exists():
        return
        
    for item in assets_dir.iterdir():
        dest = output_dir / item.name
        if item.is_dir():
            if dest.exists():
                shutil.rmtree(dest)
            shutil.copytree(item, dest)
        else:
            if dest.exists():
                dest.unlink()
            shutil.copy2(item, dest)


def copy_framework_apps(frameworks: List[Dict], root_dir: Path, config: Dict, output_dir: Path) -> int:
    """Copy built framework apps to the output directory."""
    copied_count = 0
    app_dir = config.get("directories", {}).get("appDir", "apps")
    
    for framework_data in frameworks:
        framework_id = framework_data.get("id")
        build_config = framework_data.get("build", {})
        build_dir = build_config.get("dir", "dist")
        
        # Handle special cases for build directories
        if framework_id == "svelte":
            build_dir = "build"
        elif framework_id == "angular":
            build_dir = "dist/weather-app-angular"
        elif framework_id in ["vanilla", "alpine"]:
            dist_path = root_dir / app_dir / framework_id / "dist"
            build_dir = "dist" if dist_path.exists() and (dist_path / "index.html").exists() else None
        
        # Determine source path
        if build_dir:
            source_path = root_dir / app_dir / framework_id / build_dir
        else:
            source_path = root_dir / app_dir / framework_id
        
        # Skip if not built
        if not source_path.exists() or not (source_path / "index.html").exists():
            console.print(f"⚠️  Skipping {framework_id} - not built")
            continue
        
        # Copy to output directory
        output_app_dir = output_dir / framework_id / "app"
        
        if output_app_dir.exists():
            shutil.rmtree(output_app_dir)
        
        output_app_dir.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(source_path, output_app_dir)
        copied_count += 1
    
    return copied_count


def generate_deployment_files(base_url: str, frameworks: List[Dict], output_dir: Path) -> None:
    """Generate additional files for deployment (robots.txt, sitemap, etc.)."""
    # Generate robots.txt
    robots_content = f"User-agent: *\nAllow: /\n\nSitemap: {base_url}/sitemap.xml\n"
    with open(output_dir / "robots.txt", "w") as f:
        f.write(robots_content)
    
    # Generate sitemap.xml
    sitemap_urls = [base_url + "/"]
    for framework in frameworks:
        framework_id = framework.get("id")
        if framework_id:
            sitemap_urls.append(f"{base_url}/{framework_id}/")
            sitemap_urls.append(f"{base_url}/{framework_id}/app/")
    
    build_date = time.strftime("%Y-%m-%d")
    sitemap_content = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url in sitemap_urls:
        sitemap_content += f'  <url>\n    <loc>{url}</loc>\n    <lastmod>{build_date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
    
    sitemap_content += "</urlset>"
    with open(output_dir / "sitemap.xml", "w") as f:
        f.write(sitemap_content)
    
    # Generate _redirects for Netlify
    redirects_content = "# Netlify redirects\n/*/source  https://github.com/anthropics/weather-front/tree/main/apps/:splat  302\n/*  /404/  404\n"
    with open(output_dir / "_redirects", "w") as f:
        f.write(redirects_content)
    
    # Generate .htaccess for Apache
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
    with open(output_dir / ".htaccess", "w") as f:
        f.write(htaccess_content)


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
        """Build the complete static website."""
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
            pages = build_html_pages(self.generator, self.output_dir)
            progress.update(pages_task, completed=len(pages), total=len(pages))
            
            # Copy static assets and data files
            assets_task = progress.add_task("Copying static assets...", total=None)
            copy_static_assets(self.root_dir, self.config, self.output_dir)
            progress.update(assets_task, completed=1, total=1)
            
            # Generate framework commentary
            commentary_task = progress.add_task("Generating framework commentary...", total=None)
            static_output = self.output_dir / 'static'
            generate_framework_commentary(self.frameworks_list, self.root_dir, static_output)
            progress.update(commentary_task, completed=1, total=1)
            
            # Copy project assets
            project_assets_task = progress.add_task("Copying project assets...", total=None)
            copy_project_assets(self.root_dir, self.config, self.output_dir)
            progress.update(project_assets_task, completed=1, total=1)
            
            # Copy framework apps
            apps_task = progress.add_task("Copying framework apps...", total=None)
            copied_apps = copy_framework_apps(self.frameworks_list, self.root_dir, self.config, self.output_dir)
            progress.update(apps_task, completed=copied_apps, total=len(self.frameworks_list))
            
            # Generate deployment files
            extras_task = progress.add_task("Generating deployment files...", total=None)
            generate_deployment_files(self.base_url, self.frameworks_list, self.output_dir)
            progress.update(extras_task, completed=1, total=1)
        
        console.print(f"✅ Static website built successfully!")
        console.print(f"📁 Output directory: {self.output_dir}")
        console.print(f"📄 Generated {len(pages)} HTML pages")
        console.print(f"📱 Copied {copied_apps} framework apps")


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