# Deployment

This guide covers deploying the framework benchmarks website to various hosting platforms.

## Static Site Generation

The project can be built as a static website for deployment to CDNs and static hosting services:

```bash
# Build all frameworks first
npm run build

# Generate static website
python scripts/run/build_website.py
```

This creates a complete static site in `dist-website/` with:
- Pre-rendered HTML pages for all frameworks
- Comparison website with charts and statistics
- All static assets (CSS, JS, images)
- Framework applications ready to serve

## Deployment Platforms

**Netlify**
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build && python scripts/run/build_website.py`
3. Set publish directory: `dist-website`
4. Deploy automatically on git push

**Vercel**
1. Import project from GitHub to Vercel
2. Set build command: `npm run build && python scripts/run/build_website.py`
3. Set output directory: `dist-website`
4. Configure Node.js and Python runtime

**GitHub Pages**
1. Use GitHub Actions workflow to build and deploy
2. Build generates `dist-website/` directory
3. Deploy to `gh-pages` branch automatically
4. Enable Pages in repository settings

**CDN/S3**
Upload contents of `dist-website/` to your CDN or static hosting service. All paths are relative and work without server-side processing.

## Docker Deployment

For server-based deployment, use the Docker image:

```bash
# Pull and run
docker run -p 3000:3000 ghcr.io/lissy93/framework-benchmarks:latest

# Or build locally
docker build -t framework-benchmarks .
docker run -p 3000:3000 framework-benchmarks
```

The Docker image includes:
- All frameworks pre-built
- Python Flask server
- Google Chrome for benchmarking
- All dependencies installed

## Environment Variables

For Docker deployments, you can configure:
- `NODE_ENV`: Set to `production` for optimized builds
- `PORT`: Change server port (default 3000)
- `HOST`: Change bind address (default 127.0.0.1)

## Custom Domain

For custom domains:
1. Update `config.json` with your domain
2. Rebuild static site with correct URLs
3. Configure DNS to point to your hosting platform
4. Set up SSL/HTTPS through your hosting provider

## Performance Optimization

**Static deployments** benefit from:
- CDN distribution for global performance
- Gzip/Brotli compression
- Browser caching headers
- Image optimization

**Server deployments** can use:
- Reverse proxy (nginx) for static assets
- Load balancing for multiple instances
- Database for storing benchmark results
- Caching layers for improved performance

## Continuous Deployment

The project includes GitHub Actions workflows for:
- Building and testing on every commit
- Generating fresh benchmark data
- Updating charts and statistics
- Publishing Docker images
- Deploying to production

Set up webhooks or scheduled builds to keep your deployment updated with the latest benchmark results.