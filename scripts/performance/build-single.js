#!/usr/bin/env node

const { execSync } = require('child_process');
const { join } = require('path');
const { existsSync } = require('fs');

/**
 * Build a single framework application for performance testing
 * Usage: node build-single.js <framework>
 * Example: node build-single.js react
 */

const FRAMEWORKS = {
  react: { command: 'npm run build', distDir: 'dist' },
  vue: { command: 'npm run build', distDir: 'dist' },
  svelte: { command: 'npm run build', distDir: 'build' },
  solid: { command: 'npm run build', distDir: 'dist' },
  preact: { command: 'npm run build', distDir: 'dist' },
  qwik: { command: 'npm run build', distDir: 'dist' },
  jquery: { command: 'npm run build', distDir: 'dist' },
  lit: { command: 'npm run build', distDir: 'dist' },
  vanjs: { command: 'npm run build', distDir: 'dist' },
  angular: { command: 'npm run build', distDir: 'dist/weather-app-angular' },
  vanilla: { command: 'echo "No build needed for vanilla JS"', distDir: '.' },
  alpine: { command: 'echo "No build needed for Alpine JS"', distDir: '.' }
};

const buildFramework = (frameworkName) => {
  const framework = FRAMEWORKS[frameworkName.toLowerCase()];
  
  if (!framework) {
    console.error(`❌ Unknown framework: ${frameworkName}`);
    console.log(`Available frameworks: ${Object.keys(FRAMEWORKS).join(', ')}`);
    process.exit(1);
  }
  
  const frameworkPath = join(__dirname, '../../apps', frameworkName.toLowerCase());
  
  if (!existsSync(frameworkPath)) {
    console.error(`❌ Framework directory not found: ${frameworkPath}`);
    process.exit(1);
  }
  
  console.log(`🏗️  Building ${frameworkName}...`);
  
  try {
    const startTime = Date.now();
    
    execSync(framework.command, {
      cwd: frameworkPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120000 // 2 minute timeout
    });
    
    const buildTime = Date.now() - startTime;
    console.log(`✅ ${frameworkName} built successfully in ${buildTime}ms`);
    
    // Check if dist directory exists
    const distPath = join(frameworkPath, framework.distDir);
    if (existsSync(distPath)) {
      console.log(`📁 Build output available at: ${distPath}`);
      console.log(`🚀 Serve with: node scripts/performance/serve-single.js ${frameworkName}`);
    } else {
      console.log(`⚠️  Expected build directory not found: ${distPath}`);
    }
    
  } catch (error) {
    console.error(`❌ ${frameworkName} build failed:`, error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout.toString());
    if (error.stderr) console.error('STDERR:', error.stderr.toString());
    process.exit(1);
  }
};

// Parse command line arguments
const [,, frameworkName] = process.argv;

if (!frameworkName) {
  console.log('Usage: node build-single.js <framework>');
  console.log(`Available frameworks: ${Object.keys(FRAMEWORKS).join(', ')}`);
  console.log('\nExamples:');
  console.log('  node build-single.js react');
  console.log('  node build-single.js vue');
  console.log('  node build-single.js angular');
  process.exit(1);
}

buildFramework(frameworkName);