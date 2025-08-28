# Website

Comparison website showcasing framework demos and performance metrics.

## Structure

**Templates:** `website/templates/`
- `base.html` - Common layout and navigation
- `homepage.html` - Framework grid with stats
- `framework.html` - Individual framework pages
- `404.html` - Error page

**Static Assets:** `website/static/`
- `css/` - Website styling
- `js/charts.js` - Interactive visualizations  
- `charts/` - Chart.js configurations
- Data files (stats, summaries, commentary)

## Building

**Development:** Website built automatically with framework builds
```bash
npm run build -- --static-site
```

**Production:** Static site generation
```bash  
python scripts/run/build_website.py
```

Output in `dist-website/` ready for CDN deployment.

## Features

### Framework Grid
Homepage displays all 12 frameworks with:
- Performance scores
- Bundle sizes
- Build times
- Demo links

### Individual Pages
Each framework gets dedicated page:
- Live demo iframe
- Detailed metrics
- Source code links
- Implementation notes

### Interactive Charts
Chart.js visualizations with:
- Performance radar charts
- Bundle size comparisons
- Build time distributions
- Resource consumption
- Framework toggling/filtering

### Data Integration
Real-time stats from:
- Latest benchmark results
- GitHub metrics (stars, issues)
- npm download counts
- Build status indicators

## Deployment

**Static hosting:** Optimized for CDN deployment
**Asset optimization:** Minified CSS/JS, compressed images
**SEO friendly:** Meta tags, structured data, sitemaps  
**Mobile responsive:** Works on all device sizes

## Templates

**Jinja2 engine:** `scripts/run/generator.py`
- Framework metadata injection
- Dynamic content generation
- Template inheritance
- Conditional rendering

## Charts

**Interactive features:**
- Framework show/hide toggles
- Tooltip details
- Responsive design
- Color-coded metrics

**Chart types:**
- Radar (performance overview)  
- Bar (bundle sizes, build times)
- Scatter (efficiency comparisons)
- Pie/donut (distribution)
- Treemap (complexity visualization)
