#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Production server for serving all built framework applications
for performance testing
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, Any, Optional
import mimetypes
import click
from flask import Flask, request, send_file, jsonify, Response
from rich.console import Console

# Add parent directory to path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from common import get_config, get_frameworks

console = Console()

class FrameworkServer:
    def __init__(self, port: int = 3000):
        self.app = Flask(__name__)
        self.port = port
        self.config = get_config()
        self.frameworks_list = get_frameworks()
        self.root_dir = Path(__file__).parent.parent.parent
        self.templates_dir = Path(__file__).parent
        self.frameworks = self._discover_frameworks()
        
        # Setup routes
        self._setup_routes()
    
    def _discover_frameworks(self) -> Dict[str, Dict]:
        """Discover frameworks and their build status from frameworks.json"""
        frameworks = {}
        directories = self.config.get("directories", {})
        app_dir = directories.get("appDir", "apps")
        
        for framework_data in self.frameworks_list:
            framework_id = framework_data.get("id")
            build_config = framework_data.get("build", {})
            build_dir = build_config.get("dir", "dist")
            
            # Handle special cases from original server
            if framework_id == "svelte":
                build_dir = "build"
            elif framework_id == "angular":
                build_dir = "dist/weather-app-angular"
            elif framework_id in ["vanilla", "alpine"]:
                build_dir = None  # No build directory needed
            
            # Construct full path
            if build_dir:
                full_path = self.root_dir / app_dir / framework_id / build_dir
            else:
                full_path = self.root_dir / app_dir / framework_id
            
            # Check if framework exists and is built
            exists = full_path.exists()
            index_exists = (full_path / "index.html").exists() if exists else False
            
            frameworks[framework_id] = {
                "name": framework_data.get("meta", {}).get("name", framework_id.title()),
                "path": str(full_path.relative_to(self.root_dir)),
                "full_path": full_path,
                "exists": exists,
                "index_file": index_exists,
                "emoji": framework_data.get("meta", {}).get("emoji", "🔧"),
                "icon": framework_data.get("meta", {}).get("iconName", ""),
                "color": framework_data.get("meta", {}).get("color", "000"),
                "build_required": build_dir is not None
            }
        
        return frameworks
    
    def _load_template(self, template_name: str) -> str:
        """Load HTML template from templates directory"""
        template_path = self.templates_dir / template_name
        if template_path.exists():
            return template_path.read_text(encoding='utf-8')
        return f"<html><body><h1>Template {template_name} not found</h1></body></html>"
    
    def _render_index(self) -> str:
        """Render the main index page with framework cards"""
        template = self._load_template("index.html")
        
        # Generate framework cards
        cards_html = []
        for framework_id, framework_info in self.frameworks.items():
            if framework_info["exists"] and framework_info["index_file"]:
                status_class = "status-built"
                status_text = "✅ Built"
                link_class = "framework-link"
                link_url = f"/{framework_id}"
            elif not framework_info["exists"]:
                status_class = "status-missing"
                status_text = "⚠️ Missing"
                link_class = "framework-link disabled"
                link_url = f"/{framework_id}"
            else:
                status_class = "status-error"
                status_text = "⚠️ Not Built"
                link_class = "framework-link disabled"
                link_url = f"/{framework_id}"
            
            mock_param = "?mock=true" if request.args.get('mock') else ""
            
            card_html = f'''
            <div class="framework-card" style="--fw-color: {framework_info["color"]};">
                <div class="framework-status {status_class}">{status_text}</div>
                <img
                    class="framework-icon"
                    width="64"
                    src="https://cdn.simpleicons.org/{framework_info["icon"]}"
                    alt="{framework_info["emoji"]}"
                />
                <div class="framework-name">{framework_info["name"]}</div>
                <a href="{link_url}{mock_param}" class="{link_class}">
                    {'View App' if status_class == 'status-built' else 'View Error'}
                </a>
            </div>
            '''
            cards_html.append(card_html)
        
        # Generate performance URLs
        urls_html = []
        for framework_id in self.frameworks.keys():
            url_html = f'<li>http://localhost:{self.port}/{framework_id}?mock=true</li>'
            urls_html.append(url_html)
        
        # Replace placeholders
        template = template.replace("<!-- FRAMEWORK_CARDS_PLACEHOLDER -->", "".join(cards_html))
        template = template.replace("<!-- PERFORMANCE_URLS_PLACEHOLDER -->", "".join(urls_html))
        
        return template
    
    def _render_error(self, framework_id: str, error_type: str, error_message: str, error_path: Optional[str] = None) -> str:
        """Render error page for framework issues"""
        template = self._load_template("error.html")
        
        # Generate solution based on error type
        solution_html = ""
        if error_type == "Framework not configured":
            solution_html = f'''
            <div class="solution-box">
                <div class="solution-title">How to fix this:</div>
                <ul class="solution-steps">
                    <li>Add '{framework_id}' configuration to frameworks.json</li>
                    <li>Create the framework directory: apps/{framework_id}</li>
                    <li>Set up the framework application</li>
                </ul>
            </div>
            '''
        elif error_type == "Build directory not found":
            framework_info = self.frameworks.get(framework_id, {})
            if framework_info.get("build_required"):
                solution_html = f'''
                <div class="solution-box">
                    <div class="solution-title">How to fix this:</div>
                    <ul class="solution-steps">
                        <li>cd apps/{framework_id}</li>
                        <li>npm install</li>
                        <li>npm run build</li>
                    </ul>
                </div>
                '''
            else:
                solution_html = f'''
                <div class="solution-box">
                    <div class="solution-title">How to fix this:</div>
                    <ul class="solution-steps">
                        <li>Create the directory: apps/{framework_id}</li>
                        <li>Add index.html file to the directory</li>
                    </ul>
                </div>
                '''
        elif error_type == "Index file missing":
            solution_html = f'''
            <div class="solution-box">
                <div class="solution-title">How to fix this:</div>
                <ul class="solution-steps">
                    <li>Check if the build process completed successfully</li>
                    <li>Ensure index.html is generated in the build output</li>
                    <li>Verify build configuration in frameworks.json</li>
                </ul>
            </div>
            '''
        
        # Generate available apps list
        available_apps = []
        for fid, finfo in self.frameworks.items():
            if finfo["exists"] and finfo["index_file"]:
                available_apps.append(f'<span class="app-tag">{finfo["name"]}</span>')
        
        # Replace placeholders
        template = template.replace("<!-- ERROR_TYPE_PLACEHOLDER -->", error_type)
        template = template.replace("<!-- ERROR_MESSAGE_PLACEHOLDER -->", error_message)
        
        if error_path:
            path_html = f'<div class="error-path">Path: {error_path}</div>'
            template = template.replace("<!-- ERROR_PATH_PLACEHOLDER -->", path_html)
        else:
            template = template.replace("<!-- ERROR_PATH_PLACEHOLDER -->", "")
        
        template = template.replace("<!-- SOLUTION_PLACEHOLDER -->", solution_html)
        template = template.replace("<!-- AVAILABLE_APPS_PLACEHOLDER -->", "".join(available_apps))
        
        return template
    
    def _rewrite_html_paths(self, html_content: str, framework_id: str) -> str:
        """Rewrite HTML content to fix asset paths for subpath serving"""
        # Replace absolute paths with framework-prefixed paths
        rewritten = html_content
        rewritten = re.sub(r'href="\/(?!\/)', f'href="/{framework_id}/', rewritten)
        rewritten = re.sub(r'src="\/(?!\/)', f'src="/{framework_id}/', rewritten)
        rewritten = re.sub(r'url\(\/(?!\/)', f'url(/{framework_id}/', rewritten)
        rewritten = re.sub(r'href=\/(?!\/)', f'href=/{framework_id}/', rewritten)
        rewritten = re.sub(r'src=\/(?!\/)', f'src=/{framework_id}/', rewritten)
        rewritten = re.sub(r'import\("\/(?!\/)', f'import("/{framework_id}/', rewritten)
        rewritten = re.sub(r"import\('\/(?!\/)", f"import('/{framework_id}/", rewritten)
        rewritten = re.sub(r'"\/(_app|assets|js|css)\/(?!\/)', f'"/{framework_id}/\\1/', rewritten)
        rewritten = re.sub(r"'\/(_app|assets|js|css)\/(?!\/)", f"'/{framework_id}/\\1/", rewritten)
        
        # Special handling for static apps (vanilla, alpine) with relative paths
        if framework_id in ['vanilla', 'alpine']:
            if '<base href=' not in rewritten:
                rewritten = re.sub(
                    r'<head>',
                    f'<head>\\n    <base href="/{framework_id}/">',
                    rewritten,
                    flags=re.IGNORECASE
                )
        
        # Special handling for Angular base href
        if framework_id == 'angular' and '<base href=' not in rewritten:
            rewritten = re.sub(
                r'<head>',
                f'<head>\\n  <base href="/{framework_id}/">',
                rewritten,
                flags=re.IGNORECASE
            )
        
        # Special handling for SvelteKit base configuration
        if framework_id == 'svelte':
            rewritten = re.sub(r'base:\s*""', f'base: "/{framework_id}"', rewritten)
        
        return rewritten
    
    def _setup_routes(self):
        """Setup Flask routes"""
        
        @self.app.route('/')
        def index():
            return self._render_index()
        
        @self.app.route('/health')
        def health():
            framework_status = {}
            for framework_id, framework_info in self.frameworks.items():
                framework_status[framework_id] = {
                    "path": framework_info["path"],
                    "exists": framework_info["exists"],
                    "indexFile": framework_info["index_file"]
                }
            
            return jsonify({
                "server": "performance-testing-server",
                "port": self.port,
                "frameworks": framework_status
            })
        
        @self.app.route('/<framework_id>')
        @self.app.route('/<framework_id>/')
        @self.app.route('/<framework_id>/<path:filename>')
        def serve_framework(framework_id, filename=''):
            return self._serve_framework_file(framework_id, filename)
        
        @self.app.errorhandler(404)
        def not_found(error):
            return jsonify({
                "error": "Not found",
                "available_frameworks": list(self.frameworks.keys()),
                "example": f"http://localhost:{self.port}/react?mock=true"
            }), 404
        
        @self.app.errorhandler(500)
        def server_error(error):
            console.print(f"Server error: {error}", style="red")
            return jsonify({
                "error": "Internal server error",
                "message": str(error)
            }), 500
    
    def _serve_framework_file(self, framework_id: str, filename: str = ''):
        """Serve files for a specific framework"""
        # Check if framework exists
        if framework_id not in self.frameworks:
            error_html = self._render_error(
                framework_id,
                "Framework not configured",
                f"Framework '{framework_id}' is not configured in frameworks.json",
                None
            )
            return Response(error_html, mimetype='text/html'), 404
        
        framework_info = self.frameworks[framework_id]
        
        # Check if framework directory exists
        if not framework_info["exists"]:
            error_html = self._render_error(
                framework_id,
                "Build directory not found",
                f"Build directory not found for '{framework_id}'",
                str(framework_info["full_path"])
            )
            return Response(error_html, mimetype='text/html'), 404
        
        # Determine file to serve
        if not filename or filename == '/':
            filename = 'index.html'
        
        file_path = framework_info["full_path"] / filename
        
        # If requesting index.html or HTML file, handle path rewriting
        if filename == 'index.html' or filename.endswith('.html') or '.' not in filename:
            index_path = framework_info["full_path"] / 'index.html'
            
            if not index_path.exists():
                error_html = self._render_error(
                    framework_id,
                    "Index file missing",
                    f"index.html not found for '{framework_id}'",
                    str(index_path)
                )
                return Response(error_html, mimetype='text/html'), 404
            
            # Read and rewrite HTML content
            html_content = index_path.read_text(encoding='utf-8')
            rewritten_html = self._rewrite_html_paths(html_content, framework_id)
            
            return Response(
                rewritten_html,
                mimetype='text/html',
                headers={'Cache-Control': 'public, max-age=3600'}
            )
        
        # Serve static files
        if not file_path.exists():
            return jsonify({"error": f"File not found: {filename}"}), 404
        
        # Determine MIME type
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type:
            if file_path.suffix.lower() in ['.js', '.mjs']:
                mime_type = 'application/javascript'
            elif file_path.suffix.lower() in ['.ts', '.tsx']:
                mime_type = 'application/javascript'
            elif file_path.suffix.lower() == '.css':
                mime_type = 'text/css'
            else:
                mime_type = 'application/octet-stream'
        
        response = send_file(
            str(file_path),
            mimetype=mime_type,
            as_attachment=False
        )
        response.headers['Cache-Control'] = 'public, max-age=3600'
        return response
    
    def run(self):
        """Start the Flask development server"""
        console.print("[bold green]Performance Testing Server starting on http://localhost:{port}[/bold green]".format(port=self.port))
        console.print("[cyan]Available frameworks: {frameworks}[/cyan]".format(frameworks=', '.join(self.frameworks.keys())))
        console.print("[cyan]Health check: http://localhost:{port}/health[/cyan]".format(port=self.port))
        console.print("[cyan]Example test URL: http://localhost:{port}/react?mock=true[/cyan]".format(port=self.port))
        
        self.app.run(host='0.0.0.0', port=self.port, debug=False)


@click.command()
@click.option('--port', '-p', default=3000, help='Port to run the server on')
def serve(port: int):
    """Start the production performance testing server"""
    server = FrameworkServer(port=port)
    server.run()


if __name__ == '__main__':
    serve()
