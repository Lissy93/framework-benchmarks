# Running

Building and serving framework applications.

## Scripts

### Building

**Build all:** `scripts/run/build.py`
- Run: `npm run build` or `npm run build:all`
- Parallel compilation of all frameworks
- Progress tracking and error handling
- Timeout management (2min per framework)

**Individual builds:**
```bash
npm run build:react
npm run build:vue  
npm run build:angular
# etc...
```

**Production builds:** `npm run build -- --for-comparison`
- Sets correct base paths for deployment
- Builds website after frameworks complete
- Used by CI/CD workflows

### Serving

**Development:** `scripts/run/serve.py`
- Run: `npm start`
- Flask server on port 3000
- Routes all frameworks + static assets
- Health check endpoint at `/health`
- Framework selection via `/{framework}/`

**Individual dev servers:**
```bash
npm run dev:react    # Port 3000
npm run dev:vue      # Port 3000  
npm run dev:angular  # Port 3000
# etc...
```

### Website Generation

**Static site:** `scripts/run/build_website.py`
- Run: `python scripts/run/build_website.py`
- Generates comparison website
- Framework stats and demos
- Interactive charts and visualizations
- CDN-ready static files in `dist-website/`

**Template engine:** `scripts/run/generator.py`
- Jinja2-based HTML generation
- Framework metadata injection
- Dynamic content rendering

## Build Outputs

Framework builds in `apps/{framework}/dist/` or `apps/{framework}/build/`
Website output in `dist-website/`
Static assets copied to appropriate directories

## Port Management

Dev servers use port 3000 by default
Main serve script handles framework routing
Individual framework dev servers for debugging only