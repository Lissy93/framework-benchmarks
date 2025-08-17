#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Production server for serving all built framework applications.
Serves both the comparison website and individual framework apps for benchmarking.
"""

import mimetypes
from dataclasses import dataclass
from functools import wraps
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import click
from flask import Flask, request, send_file, jsonify, redirect
from rich.console import Console

# Add parent directory to path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from common import get_config, get_frameworks
sys.path.append(str(Path(__file__).parent.parent / "website"))
from generator import WebsiteGenerator

console = Console()

# Constants
ASSET_TYPES = ["assets", "build", "styles", "_app", "js", "public", "src"]
SPECIAL_BUILD_DIRS = {
    "svelte": "build",
    "angular": "dist/weather-app-angular",
}
NO_BUILD_FRAMEWORKS = {"vanilla", "alpine"}


@dataclass
class FrameworkInfo:
    """Information about a framework and its build status."""
    id: str
    name: str
    path: str
    full_path: Path
    exists: bool
    index_file: bool
    emoji: str
    build_required: bool
    config: dict


class FrameworkServer:
    """Flask server for framework comparison website and apps."""
    
    def __init__(self, port: int = 3000, host: str = "127.0.0.1") -> None:
        self.port = port
        self.host = host
        self.config = get_config()
        self.root_dir = Path(__file__).parent.parent.parent
        
        # Initialize Flask app
        static_folder = str(self.root_dir / self.config["directories"]["staticDir"])
        self.app = Flask(__name__, static_folder=static_folder, static_url_path='/static')
        self.app.url_map.strict_slashes = False
        
        # Initialize components
        self.frameworks = self._discover_frameworks()
        self.website_generator = WebsiteGenerator(is_static=False)
        self.assets_dir = (self.root_dir / "assets").resolve()
        
        # Setup all routes
        self._setup_routes()
    
    def _discover_frameworks(self) -> Dict[str, FrameworkInfo]:
        """Discover frameworks and their build status."""
        frameworks = {}
        app_dir = self.config.get("directories", {}).get("appDir", "apps")
        
        for framework_data in get_frameworks():
            framework_id = framework_data.get("id")
            build_dir = self._get_build_dir(framework_id, framework_data.get("build", {}))
            full_path = self._get_framework_path(framework_id, app_dir, build_dir)
            
            frameworks[framework_id] = FrameworkInfo(
                id=framework_id,
                name=framework_data.get("meta", {}).get("name", framework_id.title()),
                path=str(full_path.relative_to(self.root_dir)),
                full_path=full_path,
                exists=full_path.exists(),
                index_file=(full_path / "index.html").exists() if full_path.exists() else False,
                emoji=framework_data.get("meta", {}).get("emoji", "🔧"),
                build_required=build_dir is not None,
                config=framework_data
            )
        
        return frameworks
    
    def _get_build_dir(self, framework_id: str, build_config: dict) -> Optional[str]:
        """Get the build directory for a framework."""
        if framework_id in NO_BUILD_FRAMEWORKS:
            return None
        return SPECIAL_BUILD_DIRS.get(framework_id, build_config.get("dir", "dist"))
    
    def _get_framework_path(self, framework_id: str, app_dir: str, build_dir: Optional[str]) -> Path:
        """Get the full path to a framework's build directory."""
        base_path = self.root_dir / app_dir / framework_id
        return base_path / build_dir if build_dir else base_path
    
    def _setup_routes(self) -> None:
        """Setup all Flask routes."""
        self._setup_api_routes()
        self._setup_core_routes()
        self._setup_framework_routes()
        self._setup_asset_routes()
        self._setup_error_handlers()
    
    def _setup_api_routes(self) -> None:
        """Setup API endpoints."""
        @self.app.route('/health')
        def health_check():
            return jsonify({
                "status": "healthy",
                "frameworks": len(self.frameworks),
                "built_frameworks": sum(1 for fw in self.frameworks.values() if fw.exists),
                "server": "framework-comparison"
            })
        
        @self.app.route('/api/frameworks')
        def api_frameworks():
            return jsonify({
                "frameworks": [
                    {
                        "id": fw.id,
                        "name": fw.name,
                        "available": fw.exists,
                        "emoji": fw.emoji
                    }
                    for fw in self.frameworks.values()
                ]
            })
    
    def _setup_core_routes(self) -> None:
        """Setup core website routes."""
        @self.app.route('/')
        def homepage():
            return self.website_generator.render_homepage()
        
        @self.app.route('/<framework_id>/')
        def framework_page(framework_id: str):
            if framework_id in self.frameworks:
                return self.website_generator.render_framework_page(framework_id)
            return self._assets_fallback(framework_id)
    
    def _setup_framework_routes(self) -> None:
        """Setup framework-specific routes."""
        @self.app.route('/<framework_id>/app/')
        @self.app.route('/<framework_id>/app/<path:subpath>')
        def framework_app(framework_id: str, subpath: str = ''):
            return self._serve_framework_app(framework_id, subpath)
        
        @self.app.route('/<framework_id>/source')
        def framework_source(framework_id: str):
            if framework_id not in self.frameworks:
                return self.website_generator.render_404(), 404
            github_url = f"https://github.com/anthropics/weather-front/tree/main/apps/{framework_id}"
            return redirect(github_url)
    
    def _setup_asset_routes(self) -> None:
        """Setup asset redirect routes."""
        # Create multiple routes for asset types with a single handler
        asset_routes = [f'/<framework_id>/{asset_type}/<path:asset_path>' 
                       for asset_type in ASSET_TYPES]
        
        for route in asset_routes:
            self.app.add_url_rule(route, 'framework_asset_redirect', 
                                 self._framework_asset_redirect, methods=['GET'])
        
        # Direct file redirects (for Angular/Lit)
        @self.app.route('/<framework_id>/<filename>')
        def framework_file_redirect(framework_id: str, filename: str):
            return self._framework_file_redirect(framework_id, filename)
        
        # Svelte special case
        @self.app.route('/_app/<path:asset_path>')
        def svelte_asset_redirect(asset_path: str):
            return self._svelte_asset_redirect(asset_path)
        
        # Global assets fallback
        @self.app.route('/<path:req_path>')
        def assets_fallback(req_path: str):
            return self._assets_fallback(req_path)
    
    def _setup_error_handlers(self) -> None:
        """Setup error handlers."""
        @self.app.errorhandler(404)
        def not_found(error):
            return self.website_generator.render_404(), 404
    
    def _serve_framework_app(self, framework_id: str, subpath: str) -> Tuple[str, int]:
        """Serve a framework application file."""
        if framework_id not in self.frameworks:
            return self.website_generator.render_404(), 404
        
        framework = self.frameworks[framework_id]
        
        if not framework.exists:
            return self._render_framework_error(framework), 404
        
        file_path = self._resolve_file_path(framework, subpath)
        return self._serve_file_securely(file_path, framework.full_path)
    
    def _render_framework_error(self, framework: FrameworkInfo) -> str:
        """Render error page for missing framework."""
        available_frameworks = [
            {'id': fw.id, 'name': fw.name, 'emoji': fw.emoji, 'exists': fw.exists}
            for fw in self.frameworks.values() if fw.exists
        ]
        
        return self.website_generator.render_framework_error(
            framework_id=framework.id,
            framework_name=framework.name,
            available_frameworks=available_frameworks,
            build_dir=framework.config.get('buildDir', 'dist')
        )
    
    def _resolve_file_path(self, framework: FrameworkInfo, subpath: str) -> Path:
        """Resolve the file path for a framework request."""
        if not subpath or subpath.endswith('/'):
            return framework.full_path / "index.html"
        return framework.full_path / subpath
    
    def _serve_file_securely(self, file_path: Path, framework_path: Path) -> Tuple[str, int]:
        """Serve a file with security checks."""
        try:
            file_path = file_path.resolve()
            framework_path = framework_path.resolve()
            
            # Security check - ensure file is within framework directory
            if not str(file_path).startswith(str(framework_path)):
                return "Access denied", 403
            
            if not file_path.exists() or not file_path.is_file():
                return "File not found", 404
            
            mime_type, _ = mimetypes.guess_type(str(file_path))
            return send_file(file_path, mimetype=mime_type)
            
        except Exception:
            return "File not found", 404
    
    def _framework_asset_redirect(self, framework_id: str, asset_path: str):
        """Redirect framework asset requests to the app directory."""
        if framework_id not in self.frameworks:
            return self.website_generator.render_404(), 404
        
        # Extract asset type from path
        path_segments = request.path.split('/')
        if len(path_segments) >= 3:
            asset_type = path_segments[2]
            remaining_path = '/'.join(path_segments[3:])
            redirect_url = f"/{framework_id}/app/{asset_type}/{remaining_path}"
            return redirect(redirect_url)
        
        return self.website_generator.render_404(), 404
    
    def _framework_file_redirect(self, framework_id: str, filename: str):
        """Redirect direct file requests to app directory."""
        if framework_id in self.frameworks:
            framework = self.frameworks[framework_id]
            if framework.exists:
                file_path = framework.full_path / filename
                if file_path.exists() and file_path.is_file():
                    return redirect(f"/{framework_id}/app/{filename}")
        
        return self._assets_fallback(f"{framework_id}/{filename}")
    
    def _svelte_asset_redirect(self, asset_path: str):
        """Redirect Svelte _app assets based on referer."""
        referer = request.headers.get('Referer', '')
        
        # Try to determine framework from referer
        if '/svelte/app' in referer:
            return redirect(f"/svelte/app/_app/{asset_path}")
        
        # Fallback: search for asset in any framework
        for framework in self.frameworks.values():
            if framework.exists:
                asset_file = framework.full_path / "_app" / asset_path
                if asset_file.exists():
                    return redirect(f"/{framework.id}/app/_app/{asset_path}")
        
        return self.website_generator.render_404(), 404
    
    def _assets_fallback(self, req_path: str):
        """Serve global assets or return 404."""
        try:
            candidate = (self.assets_dir / req_path).resolve()
            candidate.relative_to(self.assets_dir)  # Security check
            
            if candidate.is_file():
                mime_type, _ = mimetypes.guess_type(str(candidate))
                return send_file(candidate, mimetype=mime_type or "application/octet-stream")
                
        except Exception:
            pass
        
        return self.website_generator.render_404(), 404
    
    def run(self, debug: bool = False) -> None:
        """Start the Flask development server."""
        self._print_startup_info()
        
        try:
            self.app.run(host=self.host, port=self.port, debug=debug, threaded=True)
        except KeyboardInterrupt:
            console.print("\n👋 Server stopped")
        except Exception as e:
            console.print(f"❌ Server error: {e}")
    
    def _print_startup_info(self) -> None:
        """Print server startup information."""
        built_count = sum(1 for fw in self.frameworks.values() if fw.exists)
        
        console.print("🚀 Starting framework comparison server...")
        console.print(f"📊 Found {len(self.frameworks)} frameworks")
        console.print(f"✅ {built_count} frameworks built and ready")
        
        if built_count < len(self.frameworks):
            missing = [fw.id for fw in self.frameworks.values() if not fw.exists]
            console.print(f"⚠️  Missing builds for: {', '.join(missing)}")
        
        console.print(f"🌐 Server running at http://{self.host}:{self.port}")
        console.print(f"🏠 Homepage: http://{self.host}:{self.port}/")
        console.print(f"🔍 Health check: http://{self.host}:{self.port}/health")
        
        if built_count > 0:
            example_framework = next(fw.id for fw in self.frameworks.values() if fw.exists)
            console.print(f"📱 Example app: http://{self.host}:{self.port}/{example_framework}/app/")
            console.print(f"📄 Example page: http://{self.host}:{self.port}/{example_framework}/")


@click.command()
@click.option('--port', '-p', default=3000, help='Port to run the server on')
@click.option('--host', '-h', default="127.0.0.1", help='Host to bind the server to')
@click.option('--debug', '-d', is_flag=True, help='Run in debug mode')
def serve(port: int, host: str, debug: bool) -> None:
    """Start the framework comparison website server."""
    server = FrameworkServer(port=port, host=host)
    server.run(debug=debug)


if __name__ == "__main__":
    serve()