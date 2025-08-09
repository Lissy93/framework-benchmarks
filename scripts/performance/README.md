# Performance Testing System

A comprehensive performance testing suite for comparing all weather app framework implementations.

## Overview

This system measures and compares performance across multiple dimensions:

- **Lighthouse Performance**: Core Web Vitals, loading metrics, best practices
- **Bundle Analysis**: Bundle sizes, build times, code complexity
- **Runtime Performance**: Interaction speed, memory usage, framework bootstrap time

## Quick Start

```bash
# Run complete performance test on all frameworks
npm run perf

# Run with HTML report generation
npm run perf:html

# Test specific frameworks only
npm run perf -- --frameworks "react,vue,vanjs"

# Run only specific test types
npm run perf:lighthouse  # Only Lighthouse tests
npm run perf:bundle      # Only bundle analysis
npm run perf:runtime     # Only runtime performance

# Test VanJS only (convenience script)
npm run perf:vanjs
```

## CLI Options

```bash
node scripts/performance/index.js [options]

Options:
  -f, --frameworks <frameworks>  Comma-separated list of frameworks to test
  -b, --base-url <url>          Base URL for testing (default: http://localhost:3000)
  -o, --only <tests>            Only run specific tests (lighthouse,bundle,runtime)
  -s, --skip <tests>            Skip specific tests
  --html                        Generate HTML report in addition to JSON
  --cleanup                     Clean up old results after completion
  --keep-last <n>               Number of old results to keep when cleaning (default: 5)
```

## Results Structure

```
results/performance/
├── raw/                    # Individual test results
│   ├── react/
│   │   ├── lighthouse-20240108-142030.json
│   │   ├── bundle-20240108-142030.json
│   │   └── runtime-20240108-142030.json
│   └── vanjs/
├── consolidated/           # Processed framework summaries
│   ├── latest.json         # Most recent complete run
│   └── comparison-run-20240108-142030.json
└── reports/               # Final formatted reports
    ├── performance-report-run-20240108-142030.json
    └── performance-report-run-20240108-142030.html
```

## What Gets Measured

### Lighthouse Tests
- Performance score (0-100)
- Core Web Vitals: LCP, FCP, CLS, TBT
- Loading metrics: FMP, TTI, Speed Index
- Resource optimization scores
- Network and JavaScript performance

### Bundle Analysis
- Total bundle size (raw and gzipped)
- JavaScript/CSS/HTML breakdown
- Build time and success rate
- Source code complexity (lines, files)
- Framework-specific bundle composition

### Runtime Performance
- Initial page load timing
- Search interaction responsiveness
- Forecast interaction performance
- Memory usage patterns and growth
- Framework bootstrap time estimation

## Performance Scores

The system calculates normalized scores (0-100) for:

- **Overall**: Weighted average of all performance aspects
- **Loading**: Based on Lighthouse performance score
- **Runtime**: Based on interaction response times
- **Bundle**: Based on gzipped bundle size
- **Memory**: Based on peak memory usage

## Example Results

### Consolidated Framework Result
```json
{
  "framework": "vanjs",
  "runId": "run-20240108-142030",
  "scores": {
    "overall": 94,
    "loading": 98,
    "runtime": 92,
    "bundle": 96,
    "memory": 90
  },
  "summary": {
    "overall": "excellent",
    "strengths": ["Small bundle size", "Fast interactions", "Low memory usage"],
    "weaknesses": [],
    "keyMetrics": {
      "bundleSizeGzip": 45000,
      "initialLoadTime": 1200,
      "peakMemoryMB": 35.2,
      "searchResponseTime": 850
    }
  }
}
```

### Comparison Report
```json
{
  "rankings": {
    "overall": [
      {"rank": 1, "framework": "vanjs", "value": 94},
      {"rank": 2, "framework": "react", "value": 87},
      {"rank": 3, "framework": "vue", "value": 85}
    ]
  },
  "insights": {
    "topPerformers": [...],
    "recommendations": [
      {
        "type": "bundle-optimization",
        "frameworks": ["angular"],
        "message": "Consider bundle optimization techniques"
      }
    ]
  }
}
```

## Prerequisites

- All framework apps must be built and available
- A development server should be running on port 3000 (or specify `--base-url`)
- Chrome/Chromium must be installed for Lighthouse tests

## Troubleshooting

### Common Issues

1. **Framework not found**: Ensure the framework exists in `apps/` directory
2. **Build failures**: Check that framework has valid `package.json` and build script
3. **Lighthouse failures**: Ensure development server is running and accessible
4. **Memory test failures**: Some frameworks may not support memory monitoring

### Debug Mode

Add more verbose logging by setting environment variable:
```bash
DEBUG=perf npm run perf
```

## Extending the System

### Adding New Test Types

1. Create runner in `scripts/performance/runners/`
2. Add test type to `getTestTypes()` in main script
3. Update consolidation logic in `aggregate-framework.js`

### Custom Metrics

Add custom performance marks in your framework code:
```javascript
// In your app
window.markPerformance('customMetric', Date.now());
```

The runtime profiler will automatically capture these.

## Performance Benchmarks

### Scoring Rubric

- **Excellent (90-100)**: Top-tier performance, minimal overhead
- **Good (70-89)**: Solid performance with minor optimization opportunities  
- **Average (50-69)**: Adequate performance, some optimization needed
- **Poor (<50)**: Significant performance issues requiring attention

### Bundle Size Guidelines

- **Small (<50KB gzipped)**: Excellent
- **Medium (50-150KB gzipped)**: Good
- **Large (150-300KB gzipped)**: Average
- **Very Large (>300KB gzipped)**: Needs optimization