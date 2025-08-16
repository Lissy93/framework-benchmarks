# Benchmarking System

This directory contains benchmarking tools for measuring performance across all weather app frameworks.

## Available Benchmarks

### 🌟 Lighthouse
Google Lighthouse performance audits measuring:
- **Performance** - Loading speed, interactivity
- **Accessibility** - Screen reader compatibility, ARIA labels  
- **Best Practices** - Security, modern standards
- **SEO** - Search engine optimization

### 📦 Bundle Size
JavaScript and CSS bundle analysis measuring:
- **File Sizes** - Uncompressed and gzipped bundle sizes
- **Compression** - Gzip compression ratios
- **Framework Overhead** - Pure framework code (excludes shared assets)

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

# Run multiple executions for improved accuracy
npm run benchmark lighthouse -- --executions 5

# Run bundle size analysis
npm run benchmark bundle-size

# Run all benchmarks
npm run benchmark all

# Combine options for comprehensive testing
npm run benchmark lighthouse -- -f react,vue -e 3 --detailed
npm run benchmark all -- -f react,vue --detailed

# Check server status
npm run benchmark server-check
```

### Available Commands
- `npm run benchmark list` - Show available benchmark types
- `npm run benchmark server-check` - Verify server is running  
- `npm run benchmark all` - Run all benchmarks
- `npm run benchmark lighthouse` - Run Lighthouse audits
- `npm run benchmark bundle-size` - Analyze bundle sizes

### Command Options

**Common Flags:**
- `-f, --frameworks` - Comma-separated frameworks (e.g., `react,vue,svelte`)
- `-d, --detailed` - Show detailed results with individual scores and metrics
- `-s, --save` - Save results to file (enabled by default)
- `-e, --executions` - Number of runs per framework for averaging (default: 1)

**Multiple Executions Feature:**
- Runs each benchmark multiple times and averages results
- Provides statistical analysis (min, max, standard deviation)
- Clears browser cache between runs for accuracy
- Shows execution progress with completion indicators
- **Note**: Bundle size analysis runs only once (always produces same results)

## Prerequisites

### For Lighthouse Benchmarks
The Lighthouse benchmarking system automatically detects and launches Chrome across different platforms.

### For Bundle Size Analysis
Bundle size analysis requires:
- **Built frameworks** - Run `npm run build:framework` first
- **No server required** - Works offline with built assets

### Automatic Chrome Management (Lighthouse Only)
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

### Multiple Execution Results

When using `--executions > 1`, results include:
- **Averaged scores** - Mean values across all successful runs
- **Statistical analysis** - Min/max/standard deviation for all metrics
- **Execution metadata** - Run counts, success/failure statistics

Example statistics in saved JSON:
```json
{
  "execution_stats": {
    "total_executions": 5,
    "successful_executions": 5,
    "failed_executions": 0,
    "averaged": true,
    "statistics": {
      "scores": {
        "performance": {"min": 95.0, "max": 98.0, "std_dev": 1.2}
      },
      "metrics": {
        "first-contentful-paint": {
          "min": 1850.5, "max": 1975.2, "std_dev": 45.3,
          "score_min": 0.85, "score_max": 0.87, "score_std_dev": 0.01
        }
      }
    }
  }
}
```

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

### Inconsistent benchmark results
- Use `--executions 3` or higher for more stable averages
- Statistical analysis helps identify result variability
- Cache clearing between runs improves accuracy

### Bundle size analysis fails
- Ensure frameworks are built: `npm run build:react`, `npm run build:vue`, etc.
- Check that `dist/` or `build/` directories exist in framework folders
- Verify build output contains JavaScript/CSS files

## Architecture

The benchmarking system uses:
- **Base classes** (`base.py`) - Extensible framework for new benchmark types
- **Lighthouse implementation** (`lighthouse.py`) - Google Lighthouse integration
- **Bundle size implementation** (`bundle_size.py`) - Bundle analysis with gzip compression
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