#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

/**
 * Production server for serving all built framework applications
 * for performance testing
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Framework build directory mapping
const FRAMEWORK_PATHS = {
  // Vite-built frameworks (build to ./dist/)
  react: 'apps/react/dist',
  vue: 'apps/vue/dist', 
  svelte: 'apps/svelte/build', // Svelte uses 'build' directory
  solid: 'apps/solid/dist',
  preact: 'apps/preact/dist',
  qwik: 'apps/qwik/dist', // Qwik builds to dist/ with index.html
  jquery: 'apps/jquery/dist',
  lit: 'apps/lit/dist',
  vanjs: 'apps/vanjs/dist',
  
  // Angular (builds to ./dist/weather-app-angular/)
  angular: 'apps/angular/dist/weather-app-angular',
  
  // Static frameworks (no build needed)
  vanilla: 'apps/vanilla',
  alpine: 'apps/alpine'
};

/**
 * Rewrite HTML content to fix asset paths for subpath serving
 */
function rewriteHtmlPaths(htmlContent, framework) {
  // Replace absolute paths with framework-prefixed paths
  let rewritten = htmlContent
    .replace(/href="\/(?!\/)/g, `href="/${framework}/`)
    .replace(/src="\/(?!\/)/g, `src="/${framework}/`)
    .replace(/url\(\/(?!\/)/g, `url(/${framework}/`)
    // Handle CSS and JS files that might not have quotes
    .replace(/href=\/(?!\/)/g, `href=/${framework}/`)
    .replace(/src=\/(?!\/)/g, `src=/${framework}/`)
    // Handle JavaScript import() statements inside <script> tags
    .replace(/import\("\/(?!\/)/g, `import("/${framework}/`)
    .replace(/import\('\/(?!\/)/g, `import('/${framework}/`)
    // Handle other JS string literals that reference absolute paths
    .replace(/"\/(_app|assets|js|css)\/(?!\/)/g, `"/${framework}/$1/`)
    .replace(/'\/(_app|assets|js|css)\/(?!\/)/g, `'/${framework}/$1/`);
  
  // Special handling for static apps (vanilla, alpine) with relative paths
  if (framework === 'vanilla' || framework === 'alpine') {
    // Add base href for static apps to ensure all relative paths resolve correctly
    if (!rewritten.includes('<base href=')) {
      rewritten = rewritten.replace(
        /<head>/i, 
        `<head>\n    <base href="/${framework}/">`
      );
    }
  }
  
  // Special handling for Angular base href
  if (framework === 'angular' && !rewritten.includes('<base href=')) {
    // Insert base href after <head> tag if it doesn't exist
    rewritten = rewritten.replace(
      /<head>/i, 
      `<head>\n  <base href="/${framework}/">`
    );
  }
  
  // Special handling for SvelteKit base configuration
  if (framework === 'svelte') {
    // Update SvelteKit base configuration
    rewritten = rewritten.replace(
      /base:\s*""/g, 
      `base: "/${framework}"`
    );
  }
  
  return rewritten;
}

/**
 * Serve specific framework
 */
function serveFramework(framework, req, res, next) {
  const frameworkPath = FRAMEWORK_PATHS[framework];
  
  if (!frameworkPath) {
    return res.status(404).json({ 
      error: `Framework '${framework}' not found`,
      available: Object.keys(FRAMEWORK_PATHS)
    });
  }
  
  const fullPath = path.join(__dirname, '../..', frameworkPath);

  console.log(fullPath)
  
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ 
      error: `Build directory not found for '${framework}'`,
      path: fullPath,
      hint: `Try running: cd apps/${framework} && npm run build`
    });
  }
  
  // Handle HTML files with path rewriting
  if (req.path === '/' || req.path.endsWith('.html') || !path.extname(req.path)) {
    const indexPath = path.join(fullPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      const htmlContent = fs.readFileSync(indexPath, 'utf8');
      const rewrittenHtml = rewriteHtmlPaths(htmlContent, framework);
      
      res.set({
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      });
      
      return res.send(rewrittenHtml);
    }
  }
  
  // Serve static files from framework build directory
  express.static(fullPath, {
    setHeaders: (res, filePath) => {
      // Add cache headers for production builds
      res.set('Cache-Control', 'public, max-age=3600');
      
      // Set correct MIME types for JavaScript and TypeScript files
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.js' || ext === '.mjs') {
        res.set('Content-Type', 'application/javascript');
      } else if (ext === '.tsx' || ext === '.ts') {
        res.set('Content-Type', 'application/javascript');
      } else if (ext === '.css') {
        res.set('Content-Type', 'text/css');
      }
    }
  })(req, res, next);
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  const availableFrameworks = {};
  
  Object.keys(FRAMEWORK_PATHS).forEach(framework => {
    const frameworkPath = FRAMEWORK_PATHS[framework];
    const fullPath = path.join(__dirname, '../..', frameworkPath);
    availableFrameworks[framework] = {
      path: frameworkPath,
      exists: fs.existsSync(fullPath),
      indexFile: fs.existsSync(path.join(fullPath, 'index.html'))
    };
  });
  
  res.json({
    server: 'performance-testing-server',
    port: PORT,
    frameworks: availableFrameworks
  });
});

/**
 * Framework selector endpoint - shows available frameworks
 */
app.get('/', (req, res) => {
  const frameworks = Object.keys(FRAMEWORK_PATHS);
  const mockParam = req.query.mock ? '?mock=true' : '';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Weather App Performance Testing Server</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .framework-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .framework-card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; text-align: center; }
        .framework-card a { text-decoration: none; color: #007acc; font-weight: bold; }
        .framework-card a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>Weather App Performance Testing Server</h1>
      <p>Select a framework to test:</p>
      <div class="framework-list">
        ${frameworks.map(fw => `
          <div class="framework-card">
            <a href="/${fw}${mockParam}">${fw.charAt(0).toUpperCase() + fw.slice(1)}</a>
          </div>
        `).join('')}
      </div>
      <hr>
      <p><strong>Performance Testing URLs:</strong></p>
      <ul>
        ${frameworks.map(fw => `<li><code>http://localhost:${PORT}/${fw}?mock=true</code></li>`).join('')}
      </ul>
      <p><a href="/health">Server Health Check</a></p>
    </body>
    </html>
  `);
});

/**
 * Serve framework at /:framework path
 */
app.use('/:framework', (req, res, next) => {
  const framework = req.params.framework.toLowerCase();
  serveFramework(framework, req, res, next);
});

/**
 * Default route - serve React as default for compatibility
 */
app.use('*', (req, res, next) => {
  // If URL has no framework specified, serve react as default
  if (req.originalUrl === '/' || req.originalUrl.startsWith('/?')) {
    return serveFramework('react', req, res, next);
  }
  next();
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

/**
 * 404 handler
 */
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    available_frameworks: Object.keys(FRAMEWORK_PATHS),
    example: `http://localhost:${PORT}/react?mock=true`
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`🚀 Performance Testing Server running on http://localhost:${PORT}`);
  console.log(`📋 Available frameworks: ${Object.keys(FRAMEWORK_PATHS).join(', ')}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Example test URL: http://localhost:${PORT}/react?mock=true`);
});

module.exports = app;
