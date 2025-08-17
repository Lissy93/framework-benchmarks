"""Cross-platform Chrome launcher for Lighthouse benchmarks."""

import os
import platform
import subprocess
import time
from pathlib import Path
from typing import Optional, Tuple

import requests
from rich.console import Console

console = Console()


class ChromeLauncher:
    """Manages Chrome instances for Lighthouse benchmarks."""
    
    def __init__(self, port: int = 9222):
        self.port = port
        self.user_data_dir = Path.cwd() / "tmp" / "chrome-profile"
        self.process = None
        
    def find_chrome_executable(self) -> Optional[str]:
        """Find Chrome executable across different platforms."""
        system = platform.system().lower()
        
        # Platform-specific Chrome paths
        chrome_paths = {
            "linux": [
                "/usr/bin/google-chrome",
                "/usr/bin/google-chrome-stable", 
                "/usr/bin/chromium-browser",
                "/usr/bin/chromium",
                "/snap/bin/chromium",
                "google-chrome",
                "chromium-browser"
            ],
            "darwin": [  # macOS
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "/Applications/Chromium.app/Contents/MacOS/Chromium",
                "google-chrome",
                "chromium"
            ],
            "windows": [
                r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                r"C:\Users\%USERNAME%\AppData\Local\Google\Chrome\Application\chrome.exe",
                "chrome.exe",
                "google-chrome"
            ]
        }
        
        paths_to_try = chrome_paths.get(system, chrome_paths["linux"])
        
        for path in paths_to_try:
            try:
                # Expand environment variables for Windows paths
                expanded_path = os.path.expandvars(path)
                
                # Try using 'which' command first
                if not os.path.isabs(expanded_path):
                    result = subprocess.run(["which", path], capture_output=True, text=True)
                    if result.returncode == 0:
                        return result.stdout.strip()
                
                # Check if absolute path exists
                if os.path.isfile(expanded_path):
                    return expanded_path
                    
            except (subprocess.SubprocessError, OSError):
                continue
                
        return None
    
    def is_remote_chrome_available(self) -> bool:
        """Check if Chrome remote debugging is already available."""
        try:
            response = requests.get(f"http://localhost:{self.port}/json/version", timeout=2)
            if response.status_code == 200:
                version_info = response.json()
                console.print(f"[dim]Using existing Chrome: {version_info.get('Browser', 'Unknown')}[/dim]")
                return True
        except requests.RequestException:
            pass
        return False
    
    def launch_chrome(self) -> bool:
        """Launch Chrome with remote debugging if not already running."""
        if self.is_remote_chrome_available():
            return True
            
        chrome_path = self.find_chrome_executable()
        if not chrome_path:
            console.print("[red]No Chrome installation found[/red]")
            self._show_installation_help()
            return False
        
        # Create user data directory
        self.user_data_dir.mkdir(parents=True, exist_ok=True)
        
        # Chrome flags for reliable headless operation
        chrome_args = [
            chrome_path,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu", 
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--no-first-run",
            "--disable-default-apps",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-features=TranslateUI",
            "--disable-component-extensions-with-background-pages",
            "--no-default-browser-check",
            "--no-first-run",
            "--disable-web-security",
            "--allow-running-insecure-content",
            f"--remote-debugging-port={self.port}",
            f"--user-data-dir={self.user_data_dir}"
        ]
        
        try:
            console.print(f"[dim]Launching Chrome: {chrome_path}[/dim]")
            self.process = subprocess.Popen(
                chrome_args,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid if hasattr(os, 'setsid') else None
            )
            
            # Wait for Chrome to start up with better timing and more attempts
            for attempt in range(30):  # Increased attempts for CI environments
                time.sleep(0.5)  # Longer sleep for stability
                if self.is_remote_chrome_available():
                    console.print(f"[green]Chrome launched on port {self.port}[/green]")
                    return True
                # Check if process died
                if self.process.poll() is not None:
                    console.print(f"[red]Chrome process died with exit code {self.process.returncode}[/red]")
                    # Try to read stderr for more info
                    try:
                        _, stderr = self.process.communicate(timeout=1)
                        if stderr:
                            console.print(f"[red]Chrome stderr: {stderr.decode()[:200]}[/red]")
                    except:
                        pass
                    break
            
            console.print("[red]Chrome failed to start remote debugging[/red]")
            self.cleanup()
            return False
            
        except Exception as e:
            console.print(f"[red]Failed to launch Chrome: {e}[/red]")
            return False
    
    def cleanup(self):
        """Clean up Chrome process and temporary files."""
        if self.process:
            try:
                self.process.terminate()
                self.process.wait(timeout=5)
            except (subprocess.TimeoutExpired, OSError):
                try:
                    self.process.kill()
                except OSError:
                    pass
            self.process = None
    
    def _show_installation_help(self):
        """Show platform-specific Chrome installation instructions."""
        system = platform.system().lower()
        
        if system == "linux":
            console.print("[yellow]Install Chrome on Linux:[/yellow]")
            console.print("  [dim]# Ubuntu/Debian[/dim]")
            console.print("  [dim]wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -[/dim]")
            console.print("  [dim]sudo sh -c 'echo \"deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main\" >> /etc/apt/sources.list.d/google-chrome.list'[/dim]")
            console.print("  [dim]sudo apt update && sudo apt install google-chrome-stable[/dim]")
            console.print("  [dim]# Or install Chromium: sudo apt install chromium-browser[/dim]")
            
        elif system == "darwin":
            console.print("[yellow]Install Chrome on macOS:[/yellow]")
            console.print("  [dim]brew install --cask google-chrome[/dim]")
            console.print("  [dim]# Or download from: https://www.google.com/chrome/[/dim]")
            
        elif system == "windows":
            console.print("[yellow]Install Chrome on Windows:[/yellow]")
            console.print("  [dim]Download from: https://www.google.com/chrome/[/dim]")
            console.print("  [dim]Or use winget: winget install Google.Chrome[/dim]")
    
    def __enter__(self):
        """Context manager entry."""
        if self.launch_chrome():
            return self
        raise RuntimeError("Failed to launch Chrome")
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.cleanup()


def get_chrome_connection() -> Tuple[bool, Optional[ChromeLauncher]]:
    """Get a Chrome connection, launching if needed."""
    launcher = ChromeLauncher()
    
    # Try existing connection first
    if launcher.is_remote_chrome_available():
        return True, None
    
    # Try to launch Chrome
    if launcher.launch_chrome():
        return True, launcher
    
    return False, None