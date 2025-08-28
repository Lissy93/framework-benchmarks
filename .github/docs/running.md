# Running Applications

This guide covers building framework applications and running them locally or in production.

## Building Applications

To build all framework applications for production:

```bash
npm run build
```

This compiles each framework into optimized production builds. The process runs in parallel and takes a few minutes to complete all frameworks.

You can also build individual frameworks:

```bash
npm run build:react
npm run build:vue
npm run build:angular
npm run build:svelte
# ... and so on for all frameworks
```

Build outputs are saved to each framework's build directory (usually `dist/` or `build/`).

## Running the Server

After building, start the production server:

```bash
npm start
```

This starts a Flask server on port 3000 that serves all framework applications and the comparison website. Visit `http://localhost:3000` to see the homepage, or `http://localhost:3000/react` to view a specific framework.

The server includes:
- Framework routing (serves each app at `/{framework}/`)
- Static asset handling
- Health check endpoint at `/health`
- 404 error pages for missing frameworks

## Development Mode

For development with hot reloading, you can run individual framework dev servers:

```bash
npm run dev:react     # React development server
npm run dev:vue       # Vue development server  
npm run dev:angular   # Angular development server
# ... etc for all frameworks
```

These run on port 3000 and provide framework-specific development features like hot module replacement.

To run all dev servers simultaneously:

```bash
npm run dev:all
```

## Static Website Generation

The comparison website can be built as a static site for deployment:

```bash
python scripts/run/build_website.py
```

This generates a complete static website in `dist-website/` with:
- Pre-rendered HTML pages for all frameworks
- Interactive charts and visualizations  
- All static assets and styles
- Optimized for CDN deployment

## Common Patterns

**Local development**: Use individual dev servers (`npm run dev:react`) for working on specific frameworks.

**Testing builds**: Use `npm run build` followed by `npm start` to test production builds locally.

**CI/CD deployment**: Use `npm run build` then static website generation for hosting platforms.

## Build Directories

Each framework saves builds to its standard location:
- React, Vue, Solid, etc: `apps/{framework}/dist/`
- Angular: `apps/{framework}/dist/weather-app-angular/`
- Svelte: `apps/{framework}/build/`
- Vanilla, Alpine: No build step (served directly)

The main server automatically detects and serves from the correct build directory for each framework.