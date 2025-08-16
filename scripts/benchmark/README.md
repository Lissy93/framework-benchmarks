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

### 📊 Source Analysis
Source code complexity and maintainability analysis measuring:
- **Lines of Code** - Physical and logical source lines
- **Cyclomatic Complexity** - Code path complexity and decision points
- **Halstead Metrics** - Operator/operand analysis and program volume
- **Maintainability Index** - Microsoft's maintainability formula (0-100 scale)

### ⏱️ Build Time
Build performance and output size measurement:
- **Build Duration** - Time to execute framework build command (clean builds only)
- **Output Size** - Total size of generated build artifacts
- **Build Status** - Success/failure with error details
- **Build Restoration** - Preserves existing build output (non-destructive)
- **Cache Cleaning** - Automatically cleans build caches for accurate measurements

### 🔍 Resource Usage
System resource monitoring with browser-level and OS-level metrics:
- **Memory Usage** - System memory consumption and browser heap analysis
- **CPU Utilization** - Process-level CPU usage and interaction peaks
- **Resource Efficiency** - Memory and CPU efficiency scoring (0-100 scale)
- **Interaction Analysis** - Resource usage during specific user interactions

**Note**: Resource monitoring is most valuable for larger applications with significant performance differences. For lightweight apps like these weather demos, the differences may be minimal and less meaningful. Consider excluding with `--type lighthouse,bundle-size,source-analysis` for more focused results.

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

# Run source code analysis
npm run benchmark source-analysis

# Run build time measurement
npm run benchmark build-time

# Run system resource monitoring
npm run benchmark resource-usage

# Run all benchmarks
npm run benchmark all

# Run specific benchmark types only (excluding resource-usage)
npm run benchmark all -- --type lighthouse,bundle-size,source-analysis,build-time

# Run only Build Time and Bundle Size
npm run benchmark all -- --type build-time,bundle-size

# Combine options for comprehensive testing
npm run benchmark lighthouse -- -f react,vue -e 3 --detailed
npm run benchmark all -- -f react,vue --detailed
npm run benchmark all -- --type lighthouse,bundle-size -f react,vue --detailed

# Check server status
npm run benchmark server-check
```

### Available Commands
- `npm run benchmark list` - Show available benchmark types
- `npm run benchmark server-check` - Verify server is running  
- `npm run benchmark all` - Run all benchmarks
- `npm run benchmark lighthouse` - Run Lighthouse audits
- `npm run benchmark bundle-size` - Analyze bundle sizes
- `npm run benchmark source-analysis` - Analyze source code complexity
- `npm run benchmark build-time` - Measure build time and output size
- `npm run benchmark resource-usage` - Monitor system resource usage

### Command Options

**Common Flags:**
- `-f, --frameworks` - Comma-separated frameworks (e.g., `react,vue,svelte`)
- `-d, --detailed` - Show detailed results with individual scores and metrics
- `-s, --save` - Save results to file (enabled by default)
- `-e, --executions` - Number of runs per framework for averaging (default: 1)
- `-t, --type` - Benchmark types to run for `all` command (comma-separated: `lighthouse,bundle-size,source-analysis,build-time,resource-usage`)

**Selective Benchmark Types Feature:**
- Use `--type` with the `all` command to run only specific benchmark types
- Comma-separated values: `lighthouse,bundle-size,source-analysis,build-time,resource-usage`
- Useful for excluding resource-usage on lightweight apps where resource differences are minimal
- Examples:
  - `--type lighthouse,bundle-size,build-time` - Performance, size, and build analysis
  - `--type build-time,bundle-size` - Build performance and output size only
  - `--type lighthouse,bundle-size,source-analysis` - All except build time and resource monitoring

**Multiple Executions Feature:**
- Runs each benchmark multiple times and averages results
- Provides statistical analysis (min, max, standard deviation)
- Clears browser cache between runs for accuracy
- Shows execution progress with completion indicators
- **Note**: Bundle size and source analysis run only once (always produce same results)
- **Build time benefits from multiple executions** for measuring build consistency and cache effects

## Prerequisites

### For Lighthouse Benchmarks
The Lighthouse benchmarking system automatically detects and launches Chrome across different platforms.

### For Bundle Size Analysis
Bundle size analysis requires:
- **Built frameworks** - Run `npm run build:framework` first
- **No server required** - Works offline with built assets

### For Source Analysis
Source code analysis requires:
- **Source code** - Analyzes files in framework `src/` directories
- **No build required** - Works directly with source files
- **No server required** - Works offline with source files

### For Build Time Measurement
Build time analysis requires:
- **Node.js dependencies** - `npm install` must be run for frameworks with `hasNodeModules: true`
- **Framework directories** - Individual framework folders in `apps/` directory
- **Build commands** - Uses `buildCommand` from `frameworks.json`
- **No server required** - Works offline with source and dependencies
- **Non-destructive** - Automatically backs up and restores existing build output
- **Clean builds only** - Always cleans caches and build output for accurate measurements

### For Resource Usage Monitoring
Resource monitoring requires:
- **Running server** - Server must be running at configured port
- **Browser processes** - Chrome/Chromium for DevTools Protocol access
- **System permissions** - Access to monitor system processes (psutil)
- **Python dependencies** - `psutil`, `websockets`, `requests`

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

### Source analysis fails
- Ensure framework directories exist in `apps/` folder
- Check that `src/` directories contain source files
- Verify source files have supported extensions (.js, .jsx, .ts, .tsx, .vue, .svelte, etc.)

### Build time measurement fails
- Ensure Node.js dependencies are installed: `npm install` in each framework directory
- Check that framework directories exist in `apps/` folder
- Verify build commands are correct in `frameworks.json`
- For build timeout errors: increase timeout (currently 5 minutes) or optimize build process
- Check disk space if backup/restore operations fail

### Resource monitoring fails
- Ensure server is running: `npm start` and verify with `npm run benchmark server-check`
- Install Python dependencies: `pip install psutil websockets requests`
- Check system permissions for process monitoring
- For WSL/Linux: ensure browser processes are accessible
- For enhanced monitoring: launch Chrome with `--remote-debugging-port=9222`

## Resource Usage Details

### What Resource Monitoring Measures

**System-Level Metrics:**
- **Memory Usage** - Total memory consumption by browser processes (MB)
- **CPU Usage** - CPU utilization percentage across all browser processes
- **Process Count** - Number of browser processes created by the application

**Browser-Level Metrics (when DevTools available):**
- **JavaScript Heap** - V8 heap memory usage and limits
- **Heap Growth** - Memory allocation patterns during interactions

**Interaction Scenarios:**
- **Initial Load** - Resource usage during page loading and initialization
- **Weather Search** - Resource consumption during search operations
- **UI Interactions** - Resource usage during user interface interactions
- **Memory Stress** - Long-term resource monitoring to detect memory leaks

### Understanding Results

**Efficiency Scores (0-100, higher is better):**
- **Memory Efficiency** - How efficiently the app uses memory relative to baseline
- **CPU Efficiency** - CPU usage efficiency during interactions

**Key Metrics:**
- **App Memory Usage** - Memory used by application (excluding browser baseline)
- **Peak CPU Usage** - Maximum CPU utilization during testing
- **Average CPU Usage** - Mean CPU usage across all interactions
- **Resource Deltas** - Memory and CPU changes during specific interactions

**Color Coding:**
- 🟢 **Green (80-100)** - Excellent efficiency
- 🟡 **Yellow (60-79)** - Good efficiency  
- 🔴 **Red (0-59)** - Poor efficiency, optimization needed

### Interpreting Resource Data

**Memory Analysis:**
- Low baseline + small deltas = efficient memory management
- Large heap growth = potential memory leaks
- High process count = framework overhead

**CPU Analysis:**
- Low average CPU = efficient processing
- High peak CPU = expensive operations during interactions
- Sustained high CPU = performance bottlenecks

**Comparative Analysis:**
Use resource monitoring to compare frameworks for:
- Memory footprint differences
- CPU efficiency variations
- Resource usage patterns
- Performance optimization opportunities

## Architecture

The benchmarking system uses:
- **Base classes** (`base.py`) - Extensible framework for new benchmark types
- **Lighthouse implementation** (`lighthouse.py`) - Google Lighthouse integration
- **Bundle size implementation** (`bundle_size.py`) - Bundle analysis with gzip compression
- **Source analysis implementation** (`source_analysis.py`) - Code complexity and maintainability analysis
- **Build time implementation** (`build_time.py`) - Build performance measurement with backup/restore
- **Resource monitoring implementation** (`resource_monitor.py`) - System resource monitoring with dual approach:
  - **System-level monitoring** - Process CPU/memory via psutil
  - **Browser-level monitoring** - Heap analysis via Chrome DevTools Protocol
- **Main CLI** (`main.py`) - Command interface and orchestration
- **Configuration** - Settings in `config.json` and `frameworks.json`

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