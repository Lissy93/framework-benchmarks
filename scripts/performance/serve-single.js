#!/usr/bin/env node

const express = require('express');
const { join } = require('path');
const { existsSync } = require('fs');

/**
 * Serve a single framework application for performance testing
 * Usage: node serve-single.js <framework> [port]
 * Example: node serve-single.js react 3001
 */

const FRAMEWORK_PATHS = {
  // Vite-built frameworks (build to ./dist/)
  react: 'apps/react/dist',
  vue: 'apps/vue/dist', 
  svelte: 'apps/svelte/build', // Svelte uses 'build' directory
  solid: 'apps/solid/dist',
  preact: 'apps/preact/dist',
  qwik: 'apps/qwik/dist',
  jquery: 'apps/jquery/dist',
  lit: 'apps/lit/dist',
  vanjs: 'apps/vanjs/dist',
  
  // Angular (builds to ./dist/weather-app-angular/)
  angular: 'apps/angular/dist/weather-app-angular',
  
  // Static frameworks (no build needed)
  vanilla: 'apps/vanilla',
  alpine: 'apps/alpine'
};

const serveFramework = (frameworkName, port = 3000) => {
  const frameworkPath = FRAMEWORK_PATHS[frameworkName.toLowerCase()];
  
  if (!frameworkPath) {
    console.error(`❌ Unknown framework: ${frameworkName}`);
    console.log(`Available frameworks: ${Object.keys(FRAMEWORK_PATHS).join(', ')}`);
    process.exit(1);
  }
  
  const fullPath = join(__dirname, '../..', frameworkPath);
  
  if (!existsSync(fullPath)) {
    console.error(`❌ Build directory not found: ${fullPath}`);
    console.log(`💡 Try building first: node scripts/performance/build-single.js ${frameworkName}`);
    process.exit(1);
  }
  
  if (!existsSync(join(fullPath, 'index.html'))) {
    console.error(`❌ index.html not found in: ${fullPath}`);
    process.exit(1);
  }
  
  const app = express();
  
  // Serve static files
  app.use(express.static(fullPath, {
    index: 'index.html',
    setHeaders: (res) => {
      // Add cache headers for performance testing
      res.set('Cache-Control', 'public, max-age=3600');
      res.set('Access-Control-Allow-Origin', '*');
    }
  }));
  
  // Handle SPA routing - serve index.html for all routes
  app.get('*', (req, res) => {
    res.sendFile(join(fullPath, 'index.html'));
  });
  
  // Start server
  const server = app.listen(port, () => {
    console.log(`🚀 ${frameworkName} server running on http://localhost:${port}`);
    console.log(`📁 Serving from: ${fullPath}`);
    console.log(`📊 Test URL: http://localhost:${port}?mock=true`);
    console.log(`⏹️  Press Ctrl+C to stop`);
  });
  
  // Handle graceful shutdown
  const gracefulShutdown = () => {
    console.log(`\n🛑 Stopping ${frameworkName} server...`);
    server.close(() => {
      process.exit(0);
    });
  };
  
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
};

// Parse command line arguments
const [,, frameworkName, portArg] = process.argv;
const port = parseInt(portArg) || 3000;

if (!frameworkName) {
  console.log('Usage: node serve-single.js <framework> [port]');
  console.log(`Available frameworks: ${Object.keys(FRAMEWORK_PATHS).join(', ')}`);
  console.log('\nExamples:');
  console.log('  node serve-single.js react');
  console.log('  node serve-single.js vue 3001');
  console.log('  node serve-single.js angular 8080');
  process.exit(1);
}

serveFramework(frameworkName, port);