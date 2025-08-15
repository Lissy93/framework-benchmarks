# Benchmarking System

This directory contains benchmarking tools for measuring performance across all weather app frameworks.

## Available Benchmarks

### 🌟 Lighthouse
Google Lighthouse performance audits measuring:
- **Performance** - Loading speed, interactivity
- **Accessibility** - Screen reader compatibility, ARIA labels  
- **Best Practices** - Security, modern standards
- **SEO** - Search engine optimization

## Usage

### Quick Start
```bash
# Start the benchmark server
npm start

# Run Lighthouse on all frameworks  
npm run benchmark lighthouse

# Run on specific frameworks
npm run benchmark lighthouse -- -f react,vue,svelte

# Show detailed results
npm run benchmark lighthouse -- --detailed

# Check server status
npm run benchmark server-check
```

### Available Commands
- `npm run benchmark list` - Show available benchmark types
- `npm run benchmark server-check` - Verify server is running  
- `npm run benchmark all` - Run all benchmarks
- `npm run benchmark lighthouse` - Run Lighthouse audits

## Chrome Setup

The Lighthouse benchmarking system automatically detects and launches Chrome across different platforms.

### Automatic Chrome Management
The system will automatically:
- **Detect** existing Chrome installations
- **Launch** Chrome with remote debugging if needed
- **Connect** to existing Chrome instances
- **Clean up** Chrome processes when done

### Manual Chrome Setup (Optional)
If you prefer to manage Chrome manually:

```bash
# Start Chrome with remote debugging (any platform)
google-chrome --headless --remote-debugging-port=9222 --user-data-dir=chrome-profile
```

### Installation by Platform

**Linux/WSL:**
```bash
# Install Chrome (recommended)
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt update && sudo apt install google-chrome-stable

# Or install Chromium
sudo apt install chromium-browser
```

**macOS:**
```bash
brew install --cask google-chrome
```

**Windows:**
```bash
winget install Google.Chrome
# Or download from: https://www.google.com/chrome/
```

## Configuration

Benchmark settings are configured in `config.json`:

```json
{
  "benchmarks": {
    "server": {
      "host": "127.0.0.1", 
      "port": 3000,
      "baseUrl": "http://127.0.0.1:3000"
    },
    "lighthouse": {
      "categories": ["performance", "accessibility", "best-practices", "seo"],
      "thresholds": {
        "performance": 80,
        "accessibility": 90, 
        "best-practices": 80,
        "seo": 90
      }
    }
  }
}
```

## Results

Results are saved to `benchmark-results/` with timestamps:
- **JSON format** - Raw data for analysis
- **Console output** - Formatted tables with pass/fail status

## Troubleshooting

### "Unable to connect to Chrome"
- Ensure Chrome/Chromium is installed
- Try installing: `sudo apt install chromium-browser`
- For WSL, make sure X11 forwarding is configured

### Server not running
- Start with: `npm start`
- Verify server health: `npm run benchmark server-check`

### Framework not found
- Check framework is built: `npm run build:react`
- Verify server shows framework: http://127.0.0.1:3000/

## Architecture

The benchmarking system uses:
- **Base classes** (`base.py`) - Extensible framework for new benchmark types
- **Lighthouse implementation** (`lighthouse.py`) - Google Lighthouse integration
- **Main CLI** (`main.py`) - Command interface and orchestration
- **Configuration** - Settings in `config.json` following project patterns

## Adding New Benchmarks

To add a new benchmark type:

1. Create `new_benchmark.py` extending `BenchmarkRunner`
2. Implement required abstract methods
3. Add configuration to `config.json`
4. Register in `main.py` CLI
5. Update this README

Example:
```python
class NewBenchmarkRunner(BenchmarkRunner):
    @property
    def benchmark_name(self) -> str:
        return "New Benchmark"
    
    def run_single_benchmark(self, framework: str) -> BenchmarkResult:
        # Implementation here
        pass
```