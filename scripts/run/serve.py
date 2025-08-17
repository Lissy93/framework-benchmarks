#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Production server for serving all built framework applications with new website structure.
Serves both the comparison website and individual framework apps for benchmarking.
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, Any, Optional
import mimetypes
import click
from flask import Flask, request, send_file, send_from_directory, jsonify, Response, redirect, url_for
from rich.console import Console

# Add parent directory to path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from common import get_config, get_frameworks

# Import website generator
generator_path = Path(__file__).parent.parent / "website"
sys.path.append(str(generator_path))
from generator import WebsiteGenerator

console = Console()

class FrameworkServer:
    """Flask server for framework comparison website and apps."""
    
    def __init__(self, port: int = 3000, host: str = "127.0.0.1"):
        self.port = port
        self.host = host
        self.config = get_config()
        self.frameworks_list = get_frameworks()
        self.root_dir = Path(__file__).parent.parent.parent
        
        # Configure Flask with correct static folder
        static_folder = str(self.root_dir / self.config["directories"]["staticDir"])
        self.app = Flask(__name__, static_folder=static_folder, static_url_path='/static')
        
        self.frameworks = self._discover_frameworks()
        
        # Initialize website generator
        self.website_generator = WebsiteGenerator(is_static=False)

        self.assets_dir = (self.root_dir / "assets").resolve()
        
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
            
            # Handle special cases for build directories
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
                "build_required": build_dir is not None,
                "config": framework_data
            }
        
        return frameworks
    
    def _setup_routes(self):
        """Setup Flask routes for the new website structure."""
        
        # API healthcheck endpoint
        @self.app.route('/health')
        def health_check():
            """Health check endpoint for monitoring."""
            return jsonify({
                "status": "healthy",
                "frameworks": len(self.frameworks),
                "built_frameworks": sum(1 for fw in self.frameworks.values() if fw["exists"]),
                "server": "framework-comparison"
            })
        
        # API endpoint to get framework information
        @self.app.route('/api/frameworks')
        def api_frameworks():
            """API endpoint returning framework information."""
            return jsonify({
                "frameworks": [
                    {
                        "id": fw_id,
                        "name": fw_data["name"], 
                        "available": fw_data["exists"],
                        "emoji": fw_data["emoji"]
                    }
                    for fw_id, fw_data in self.frameworks.items()
                ]
            })
        
        # Homepage
        @self.app.route('/')
        def homepage():
            """Serve the comparison website homepage."""
            return self.website_generator.render_homepage()
        
        # Landing page for each framework. Will fallback to assets if needed, then to 404
        @self.app.route('/<framework_id>/')
        def framework_page(framework_id):
            if framework_id in self.frameworks:
                return self.website_generator.render_framework_page(framework_id)
            return assets_fallback(framework_id)
            
        
        # Framework asset routes (must come before framework app routes)
        def serve_framework_asset(asset_path: str, allowed_patterns: list = None):
            """Helper to serve framework assets based on referer."""
            referer = request.headers.get('Referer', '')
            
            # Extract framework ID from referer
            for fw_id, framework in self.frameworks.items():
                if f'/{fw_id}/app/' in referer and framework["exists"]:
                    file_path = framework["full_path"] / asset_path
                    if file_path.exists():
                        return send_file(file_path)
            
            return "Asset not found", 404
        
        @self.app.route('/_app/<path:subpath>')
        def svelte_assets(subpath):
            """Serve Svelte _app assets."""
            return serve_framework_asset(f"_app/{subpath}")
        
        @self.app.route('/assets/<path:subpath>')
        def vite_assets(subpath):
            """Serve Vite assets."""
            return serve_framework_asset(f"assets/{subpath}")
            
        @self.app.route('/styles/<path:subpath>')
        def styles_assets(subpath):
            """Serve style assets."""
            return serve_framework_asset(f"styles/{subpath}")
            
        
        @self.app.route('/dist/<path:subpath>')
        def dist_assets(subpath):
            """Serve dist assets."""
            return serve_framework_asset(f"dist/{subpath}")
            
        @self.app.route('/build/<path:subpath>')
        def build_assets(subpath):
            """Serve build assets."""
            return serve_framework_asset(f"build/{subpath}")
        
        # CSS for the website only (not used for framework pages)
        @self.app.route('/css/<path:subpath>')
        def css_assets(subpath):
            """Serve CSS assets."""
            return serve_framework_asset(f"css/{subpath}")

        # Framework apps (for benchmarking and usage)
        @self.app.route('/<framework_id>/app/')
        @self.app.route('/<framework_id>/app/<path:subpath>')
        def framework_app(framework_id, subpath=''):
            """Serve the actual framework applications."""
            if framework_id not in self.frameworks:
                return self.website_generator.render_404(), 404
            
            framework = self.frameworks[framework_id]
            
            if not framework["exists"]:
                # Get available frameworks for the error page
                available_frameworks = [
                    {
                        'id': fw_id,
                        'name': fw_data['name'],
                        'emoji': fw_data['emoji'],
                        'exists': fw_data['exists']
                    }
                    for fw_id, fw_data in self.frameworks.items()
                    if fw_data['exists']
                ]
                
                return self.website_generator.render_framework_error(
                    framework_id=framework_id,
                    framework_name=framework['name'],
                    available_frameworks=available_frameworks,
                    build_dir=framework.get('config', {}).get('buildDir', 'dist')
                ), 404
            
            # Handle index.html or specific file requests
            if not subpath or subpath.endswith('/'):
                file_path = framework["full_path"] / "index.html"
            else:
                file_path = framework["full_path"] / subpath
            
            # Security check - ensure file is within framework directory
            try:
                file_path = file_path.resolve()
                framework_path = framework["full_path"].resolve()
                if not str(file_path).startswith(str(framework_path)):
                    return "Access denied", 403
            except Exception:
                return "File not found", 404
            
            if not file_path.exists():
                return "File not found", 404
            
            # Serve the file
            if file_path.is_file():
                return send_file(file_path)
            else:
                return "Not a file", 404
        
        # Framework source code redirects
        @self.app.route('/<framework_id>/source')
        def framework_source(framework_id):
            """Redirect to GitHub source code for the framework."""
            if framework_id not in self.frameworks:
                return self.website_generator.render_404(), 404
            
            # Default to GitHub repository with app directory
            github_url = f"https://github.com/anthropics/weather-front/tree/main/apps/{framework_id}"
            return redirect(github_url)

        # Serves static global assets from /assets (only if path not already matched)
        @self.app.route('/<path:req_path>')
        def assets_fallback(req_path: str):
            try:
                candidate = (self.assets_dir / req_path).resolve()
                candidate.relative_to(self.assets_dir)
                if candidate.is_file():
                    guessed, _ = mimetypes.guess_type(str(candidate))
                    return send_file(candidate, mimetype=guessed or "application/octet-stream")
            except Exception:
                pass
            return self.website_generator.render_404(), 404
                
        # 404 handler
        @self.app.errorhandler(404)
        def not_found(error):
            """Custom 404 page."""
            return self.website_generator.render_404(), 404
        
    
    def run(self, debug: bool = False):
        """Start the Flask development server."""
        console.print(f"🚀 Starting framework comparison server...")
        console.print(f"📊 Found {len(self.frameworks)} frameworks")
        
        built_count = sum(1 for fw in self.frameworks.values() if fw["exists"])
        console.print(f"✅ {built_count} frameworks built and ready")
        
        if built_count < len(self.frameworks):
            missing = [fw_id for fw_id, fw in self.frameworks.items() if not fw["exists"]]
            console.print(f"⚠️  Missing builds for: {', '.join(missing)}")
        
        console.print(f"🌐 Server running at http://{self.host}:{self.port}")
        console.print(f"🏠 Homepage: http://{self.host}:{self.port}/")
        console.print(f"🔍 Health check: http://{self.host}:{self.port}/health")
        
        # Show some example URLs
        if built_count > 0:
            example_framework = next(fw_id for fw_id, fw in self.frameworks.items() if fw["exists"])
            console.print(f"📱 Example app: http://{self.host}:{self.port}/{example_framework}/app/")
            console.print(f"📄 Example page: http://{self.host}:{self.port}/{example_framework}/")
        
        try:
            self.app.run(
                host=self.host,
                port=self.port,
                debug=debug,
                threaded=True
            )
        except KeyboardInterrupt:
            console.print("\n👋 Server stopped")
        except Exception as e:
            console.print(f"❌ Server error: {e}")


@click.command()
@click.option('--port', '-p', default=3000, help='Port to run the server on')
@click.option('--host', '-h', default="127.0.0.1", help='Host to bind the server to')
@click.option('--debug', '-d', is_flag=True, help='Run in debug mode')
def serve(port: int, host: str, debug: bool):
    """Start the framework comparison website server."""
    server = FrameworkServer(port=port, host=host)
    server.run(debug=debug)


if __name__ == "__main__":
    serve()
