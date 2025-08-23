# Benchmarking

Comprehensive performance analysis comparing frontend frameworks.

## Scripts

**Main:** `scripts/benchmark/main.py`
- Run: `npm run benchmark` or `python scripts/benchmark/main.py`
- CLI with progress tracking, multi-execution averaging
- Rich terminal UI with real-time stats

**Individual benchmarks:**
- `lighthouse.py` - Performance, accessibility, SEO scores
- `bundle_size.py` - File sizes, compression ratios  
- `source_analysis.py` - Code complexity, maintainability
- `build_time.py` - Compilation speed, output size
- `dev_server.py` - Startup time, HMR speed
- `resource_monitor.py` - CPU/memory usage

## Usage

```bash
# Start server first
npm start

# All benchmarks, all frameworks
npm run benchmark all

# Individual benchmark types
npm run benchmark lighthouse
npm run benchmark bundle-size
npm run benchmark source-analysis
npm run benchmark build-time
npm run benchmark dev-server
npm run benchmark resource-usage

# Specific frameworks
npm run benchmark lighthouse -- -f react,vue,svelte

# Multiple executions for averaging
npm run benchmark lighthouse -- --executions 5

# Detailed results with individual scores
npm run benchmark lighthouse -- --detailed

# Selective benchmark types (exclude resource-usage for lightweight apps)
npm run benchmark all -- --type lighthouse,bundle-size,source-analysis

# Developer experience benchmarks
npm run benchmark all -- --type dev-server,build-time

# Server status check
npm run benchmark server-check
```

## Prerequisites

**Server required:** Lighthouse and resource monitoring need `npm start` running
**Built frameworks:** Bundle size analysis requires built apps (`npm run build:all`)
**Chrome/Chromium:** Auto-detected and launched for Lighthouse
**Node dependencies:** Dev server and build time measurements need `npm install` per framework

## Results

Raw data in `benchmark-results/` with timestamps
- JSON format for analysis
- Console output with pass/fail status
- Multiple execution statistics (min/max/std dev)
- Averaged results across runs

## Metrics Explained

**Lighthouse:** Google's web performance scoring (0-100)
- Performance, Accessibility, Best Practices, SEO

**Bundle Size:** File sizes and compression
- Total/gzipped KB, compression ratio
- Framework overhead (excludes shared assets)

**Source Analysis:** Code complexity metrics
- Lines of code (physical/logical)
- Cyclomatic complexity, Halstead metrics
- Maintainability index (0-100 scale)

**Build Time:** Compilation performance
- Clean build duration, output size MB
- Non-destructive (preserves existing builds)

**Dev Server:** Development experience
- Startup time, HMR response time
- Automatic port detection and cleanup

**Resource Usage:** System monitoring ⚠️
- Memory/CPU usage, efficiency scores (0-100)
- Browser heap analysis, interaction scenarios
- **Note:** Minimal differences on lightweight apps like these weather demos

## Configuration

Settings in `config.json`:
- Server host/port
- Lighthouse categories and thresholds
- Framework definitions in `frameworks.json`