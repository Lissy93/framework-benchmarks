# 🚀 Benchmark GitHub Actions

This directory contains automated workflows for running framework benchmarks.

## Available Workflows

### `benchmark.yml` - Framework Performance Benchmarks

**Trigger**: Manual dispatch only (for controlled execution)

**Purpose**: Runs comprehensive performance benchmarks across all supported frameworks and exports results as artifacts.

#### Input Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `benchmark_types` | Benchmark types to run (comma-separated) | All types | `lighthouse,bundle-size,build-time` |
| `frameworks` | Frameworks to test (comma-separated) | All frameworks | `react,vue,svelte` |
| `executions` | Number of executions per benchmark | `1` | `3` |
| `detailed_output` | Show detailed benchmark results | `false` | `true` |
| `timeout_minutes` | Job timeout in minutes | `60` | `90` |

#### Available Benchmark Types

- `lighthouse` - Google Lighthouse performance audits
- `bundle-size` - Bundle size analysis
- `source-analysis` - Source code complexity analysis  
- `build-time` - Build time and output size measurement
- `dev-server` - Dev server startup and HMR speed
- `resource-usage` - System resource monitoring

#### Available Frameworks

- `vanilla` - Vanilla JavaScript
- `react` - React
- `angular` - Angular  
- `svelte` - Svelte
- `preact` - Preact
- `solid` - Solid.js
- `qwik` - Qwik
- `vue` - Vue 3
- `jquery` - jQuery
- `alpine` - Alpine.js
- `lit` - Lit
- `vanjs` - VanJS

#### Example Usage

1. **Run all benchmarks on all frameworks**:
   - Go to Actions → Framework Benchmarks → Run workflow
   - Leave all parameters as default

2. **Run specific benchmarks on specific frameworks**:
   - Set `benchmark_types`: `lighthouse,build-time`
   - Set `frameworks`: `react,vue,svelte`
   - Set `executions`: `3`

3. **Detailed analysis with extended timeout**:
   - Set `detailed_output`: `true`
   - Set `timeout_minutes`: `90`

#### Artifacts

The workflow generates two types of artifacts:

1. **benchmark-results-{run_number}**:
   - Complete benchmark results in JSON format
   - Organized by date with index files
   - Retained for 30 days

2. **benchmark-logs-{run_number}** (only on failure):
   - Debug logs for troubleshooting
   - Retained for 7 days

#### Workflow Features

- ✅ **Robust Setup**: Installs all system dependencies, Node.js, Python, Chrome
- ✅ **Health Checks**: Verifies server and environment before running benchmarks
- ✅ **Error Recovery**: Retry logic for transient failures
- ✅ **Resource Cleanup**: Proper cleanup of processes and resources
- ✅ **Timeout Protection**: Configurable timeouts to prevent hung jobs
- ✅ **Detailed Logging**: Comprehensive logs for debugging
- ✅ **Results Summary**: GitHub Step Summary with benchmark overview

#### Best Practices

1. **Start Small**: Test with a few frameworks first (`react,vue`) before running all
2. **Use Retries**: Set `executions` to 3+ for more reliable averages
3. **Monitor Resources**: Check GitHub Actions usage when running full benchmarks
4. **Download Artifacts**: Results are only retained for 30 days
5. **Check Logs**: If benchmarks fail, check the detailed logs artifact

#### Troubleshooting

- **Chrome Issues**: The workflow installs Chrome stable with all dependencies
- **Server Startup**: 60-second timeout with health checks before benchmarks  
- **Memory Limits**: Ubuntu runners have 7GB RAM, sufficient for all benchmarks
- **Timeout Errors**: Increase `timeout_minutes` for comprehensive runs
- **Network Issues**: Retry logic handles transient network failures

#### Security

- ✅ Uses official GitHub Actions with pinned versions
- ✅ No secrets or credentials required
- ✅ Manual dispatch only (no automatic triggers)
- ✅ Read-only permissions sufficient
- ✅ Artifacts auto-expire to prevent storage bloat