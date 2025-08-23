# Transforming Results

Converting raw benchmark data into analysis-ready formats.

## Scripts

### Main Transform
**Script:** `scripts/transform/benchmark_results.py`
- Run: `python scripts/transform/benchmark_results.py`
- Processes raw benchmark data from `benchmark-results/`
- Outputs to `results/` directory
- Supports averaging across multiple executions
- Handles date-based result aggregation

```bash
# JSON format
python scripts/transform/benchmark_results.py --format json

# TSV format  
python scripts/transform/benchmark_results.py --format tsv

# Both formats
python scripts/transform/benchmark_results.py --format both

# With averaging
python scripts/transform/benchmark_results.py --format both --average
```

### Individual Transforms

**JSON Generation:** `benchmark_results_json.py`
- Structured data for programmatic consumption
- Framework comparison data
- Metric calculations and scoring

**TSV Generation:** `benchmark_results_tsv.py` 
- Spreadsheet-friendly tabular format
- Easy import into Excel/Google Sheets
- Column-based analysis

**Chart Generation:** `build_charts.py`
- Run: `python scripts/transform/build_charts.py`
- Creates Chart.js configurations
- Interactive visualizations
- Performance radar charts, bundle comparisons, etc.

### Stats and Metadata

**Framework Stats:** `fetch_framework_stats.py`
- Collects GitHub stars, npm downloads
- Real-world usage metrics
- Community health indicators

**Status Updates:** `insert_statuses.py`
- Build status badges
- CI/CD integration
- Deployment health checks

## Input Data

Raw results from `benchmark-results/YYYY-MM-DD/`:
- `lighthouse_*.json` - Performance scores
- `bundle_size_*.json` - File size data  
- `source_analysis_*.json` - Code metrics
- `build_time_*.json` - Compilation data
- `dev_server_*.json` - Development metrics
- `resource_*.json` - System usage

## Output Formats

### JSON (`results/summary.json`)
Structured data with:
- Framework-keyed metrics
- Calculated performance scores  
- Comparison ratios
- Statistical analysis

### TSV (`results/summary.tsv`)
Tabular format with:
- Framework rows
- Metric columns
- Numeric data ready for analysis
- Headers for easy import

### Charts (`website/static/charts/`)
Interactive visualizations:
- Performance radar charts
- Bundle size comparisons
- Build time distributions
- Resource consumption
- Maintainability treemaps

## Data Processing

**Averaging:** Multiple benchmark runs combined using statistical means
**Normalization:** Scores converted to 0-100 scales for comparison
**Ranking:** Frameworks ordered by performance categories
**Ratio Calculations:** Relative performance comparisons