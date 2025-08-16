import json
import re
from pathlib import Path
from typing import Dict, List, Tuple
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()

def load_frameworks(file_path: str) -> List[Dict]:
    """Load frameworks data from JSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f).get('frameworks', [])
    except Exception as e:
        console.print(f"[red]Error loading {file_path}: {e}[/red]")
        return []

def format_url(url: str) -> Tuple[str, str]:
    """Format URL for display (no protocol or trailing slash) and return (display, href)."""
    if not url:
        return "", ""
    display = url.replace('https://', '').replace('http://', '').rstrip('/')
    return display, url

def generate_section_header(framework: Dict) -> str:
    """Generate header section for README."""
    meta = framework['meta']
    fw_name = framework.get('displayName', framework['name'])
    badge_name = fw_name.replace(' ', '_').replace('-', '_')
    return f"""<!-- start_header -->
<h1 align="center">{meta['emoji']} Weather Front - {fw_name}</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <img src="https://img.shields.io/badge/Framework-{badge_name}-{meta['color'].replace('#', '')}?logo={meta['iconName']}&logoColor=fff&labelColor={meta['accentColor'].replace('#', '')}" />
  <img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" />
  <img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" />
</p>
<!-- end_header -->"""

def generate_section_about(framework: Dict) -> str:
    """Generate about section for README."""
    fw_name = framework.get('displayName', framework['name'])
    meta = framework['meta']
    return f"""<!-- start_about -->

## About

<img align="right" src="/assets/screenshot.png" width="400">

This is a simple weather app, built in [{fw_name}]({meta['website']}) (as well as also [10 other frontend frameworks](/)) in order to review, compare and benchmark frontend web frameworks.

- 🌦️ Live weather conditions
- 📅 7-day weather forecast
- 🔍 City search functionality
- 📍 Geolocation support
- 💾 Persistent location storage
- 📱 Responsive design
- ♿ Accessible interface
- 🎨 Multi-theme support
- 🧪 Fully unit tested
- 🌐 Internationalized

<!-- end_about -->"""

def generate_section_status(framework: Dict) -> str:
    """Generate status section for README."""
    fw_id = framework['id']
    return f"""<!-- start_status -->

## Status

| Task | Status |
|---|---|
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/test-{fw_id}.svg)](https://github.com/Lissy93/weather-front/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/lint-{fw_id}.svg)](https://github.com/Lissy93/weather-front/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/build-{fw_id}.svg)](https://github.com/Lissy93/weather-front/actions/workflows/build.yml) |

<!-- end_status -->"""

def generate_section_usage(framework: Dict) -> str:
    """Generate usage section for README."""
    fw_dir = framework['dir']
    build = framework['build']
    return f"""<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#usage). Then `cd apps/{fw_dir}` and use the following commands:

```bash
npm run dev    # Start dev server ({build['devCommand']})
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production ({build['buildCommand']})
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->"""

def generate_section_real_world_app(framework: Dict) -> str:
    """Generate real-world app section for README if example exists."""
    if not framework.get('exampleRealApp'):
        return ""
    example = framework['exampleRealApp']
    fw_name = framework.get('displayName', framework['name'])
    description = example.get('longDescription', example.get('description', ''))
    repo_display, repo_href = format_url(example.get('repo', ''))
    website_display, website_href = format_url(example.get('website', ''))
    return f"""<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a {fw_name} app. So, checkout:

<a href="{repo_href}"><img align="left" src="{example.get('logo', '')}" width="96"></a>

> **{example.get('title', '')}** - _{description}_<br>
> 🐙 Get it on GitHub at [{repo_display}]({repo_href})<br>
> 🌐 View the website at [{website_display}]({website_href})

<br>
<!-- end_real_world_app -->"""

def generate_section_license() -> str:
    """Generate license section for README."""
    return """<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/Lissy93/weather-front/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->"""

def generate_readme_content(framework: Dict) -> Dict[str, str]:
    """Generate all README content sections for a framework."""
    return {
        'header': generate_section_header(framework),
        'about': generate_section_about(framework),
        'status': generate_section_status(framework),
        'usage': generate_section_usage(framework),
        'real_world_app': generate_section_real_world_app(framework),
        'license': generate_section_license()
    }

def update_readme(framework: Dict, content_sections: Dict[str, str]) -> None:
    """Update or create README, preserving framework-specific content."""
    fw_dir = framework['dir']
    readme_path = Path(f"apps/{fw_dir}/README.md")
    
    if not readme_path.exists():
        content = (
            f"{content_sections['header']}\n\n"
            f"{content_sections['about']}\n\n"
            f"{content_sections['status']}\n\n"
            f"{content_sections['usage']}\n\n"
            f"{content_sections['real_world_app']}\n\n" if content_sections['real_world_app'] else ""
            "<!-- start_framework_specific -->\n\n"
            "<!-- Framework-specific notes go here -->\n\n"
            "<!-- end_framework_specific -->\n\n"
            f"{content_sections['license']}"
        )
        try:
            readme_path.parent.mkdir(parents=True, exist_ok=True)
            with readme_path.open('w') as f:
                f.write(content)
            console.print(f"[green]Created README for {framework['name']} at {readme_path}[/green]")
        except Exception as e:
            console.print(f"[red]Error creating README for {framework['name']}: {e}[/red]")
        return

    try:
        with readme_path.open('r') as f:
            content = f.read()
        
        for section, new_content in content_sections.items():
            if new_content:
                pattern = rf"<!-- start_{section} -->.*?<!-- end_{section} -->"
                if not re.search(pattern, content, flags=re.DOTALL) and section == 'real_world_app':
                    content = content.replace(
                        '<!-- start_framework_specific -->',
                        f"{new_content}\n\n<!-- start_framework_specific -->"
                    )
                else:
                    content = re.sub(pattern, new_content, content, flags=re.DOTALL)
        
        with readme_path.open('w') as f:
            f.write(content)
        console.print(f"[green]Updated README for {framework['name']} at {readme_path}[/green]")
    except Exception as e:
        console.print(f"[red]Error updating README for {framework['name']}: {e}[/red]")

def main() -> None:
    """Generate or update READMEs for all frameworks."""
    frameworks = load_frameworks("frameworks.json")
    if not frameworks:
        console.print("[red]No frameworks found. Exiting.[/red]")
        return

    with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console) as progress:
        task = progress.add_task("Generating READMEs...", total=len(frameworks))
        for framework in frameworks:
            update_readme(framework, generate_readme_content(framework))
            progress.advance(task)

    console.print("[bold green]All READMEs generated/updated successfully![/bold green]")

if __name__ == "__main__":
    main()
