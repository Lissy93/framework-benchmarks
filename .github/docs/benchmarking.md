# Benchmarking

This guide covers running performance benchmarks to compare the different framework implementations.

## Quick Start

```bash
# Build all frameworks first
npm run build

# Start the server
npm start

# Run all benchmarks
npm run benchmark
```

The benchmark process will test all frameworks across multiple performance metrics and generate detailed results.

## Available Benchmarks

**Lighthouse** - Google's web performance auditing tool that measures performance, accessibility, SEO, and best practices on a 0-100 scale.

**Bundle Size** - Analyzes the file sizes of production builds, including total size, gzipped size, and compression ratios.

**Source Analysis** - Examines code complexity, maintainability, and technical debt using metrics like cyclomatic complexity and lines of code.

**Build Time** - Measures how long it takes to compile each framework from source to production build.

**Dev Server** - Tests development experience by measuring dev server startup time and hot module replacement speed.

**Resource Usage** - Monitors CPU and memory consumption during runtime (results may be minimal for simple applications).

## Running Specific Benchmarks

You can run individual benchmark types:

```bash
npm run benchmark:lighthouse    # Web performance scores
npm run perf:bundle            # File size analysis
npm run perf:lighthouse        # Alternative lighthouse command
```

For more control, use the Python script directly:

```bash
python scripts/benchmark/main.py all                    # All benchmarks
python scripts/benchmark/main.py all --executions 3     # Run 3 times and average
python scripts/benchmark/main.py all --frameworks react,vue,svelte
python scripts/benchmark/main.py all --type lighthouse,bundle-size
```

## Prerequisites

Before running benchmarks:

1. **Build frameworks**: Run `npm run build` to create production builds
2. **Start server**: Run `npm start` to serve the applications  
3. **Install Chrome**: Lighthouse requires Chrome or Chromium browser
4. **Python dependencies**: Ensure `pip install -r scripts/requirements.txt` was run

## Understanding Results

Results are saved in `benchmark-results/` with timestamps. The console output shows:
- Individual scores for each framework
- Pass/fail status against thresholds  
- Statistical analysis when using multiple executions
- Summary comparisons across frameworks

**Performance scores** range from 0-100, with higher being better.
**Bundle sizes** are shown in KB for both raw and gzipped files.
**Build times** are measured in seconds.
**Complexity scores** use industry-standard metrics for code maintainability.

## Common Issues

**Server not running** - Ensure `npm start` is active before running Lighthouse benchmarks
**Chrome not found** - Install Chrome or set Chrome path in environment variables
**Frameworks not built** - Run `npm run build` before bundle size analysis
**Inconsistent results** - Use `--executions 3` for more reliable averages

The benchmark system is designed to provide objective, reproducible measurements for comparing framework performance and developer experience.