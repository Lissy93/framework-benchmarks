#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Build all framework applications for production performance testing
 */

const FRAMEWORKS = [
  { name: 'react', command: 'npm run build' },
  { name: 'vue', command: 'npm run build' },
  { name: 'svelte', command: 'npm run build' },
  { name: 'solid', command: 'npm run build' },
  { name: 'preact', command: 'npm run build' },
  { name: 'qwik', command: 'npm run build' },
  { name: 'jquery', command: 'npm run build' },
  { name: 'lit', command: 'npm run build' },
  { name: 'vanjs', command: 'npm run build' },
  { name: 'angular', command: 'npm run build' },
  { name: 'vanilla', command: 'echo "No build needed for vanilla JS"' },
  { name: 'alpine', command: 'echo "No build needed for Alpine JS"' }
];

async function buildAllFrameworks() {
  const startTime = Date.now();
  console.log('🏗️  Building all frameworks for production...\n');
  
  const results = {
    successful: [],
    failed: [],
    skipped: []
  };
  
  for (const framework of FRAMEWORKS) {
    const frameworkPath = path.join(__dirname, '../../apps', framework.name);
    
    // Check if framework directory exists
    if (!fs.existsSync(frameworkPath)) {
      console.log(`⚠️  Framework directory not found: ${framework.name}`);
      results.skipped.push(framework.name);
      continue;
    }
    
    console.log(`📦 Building ${framework.name}...`);
    
    try {
      const buildStartTime = Date.now();
      
      const output = execSync(framework.command, {
        cwd: frameworkPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 120000 // 2 minute timeout
      });
      
      const buildTime = Date.now() - buildStartTime;
      console.log(`  ✅ ${framework.name} built in ${buildTime}ms`);
      
      results.successful.push({
        framework: framework.name,
        buildTime,
        output: output.toString()
      });
      
    } catch (error) {
      console.error(`  ❌ ${framework.name} build failed:`, error.message);
      results.failed.push({
        framework: framework.name,
        error: error.message
      });
    }
    
    console.log(''); // Empty line for readability
  }
  
  const totalTime = Date.now() - startTime;
  
  // Summary
  console.log('📊 Build Summary:');
  console.log(`  ✅ Successful: ${results.successful.length}/${FRAMEWORKS.length}`);
  console.log(`  ❌ Failed: ${results.failed.length}/${FRAMEWORKS.length}`);
  console.log(`  ⚠️  Skipped: ${results.skipped.length}/${FRAMEWORKS.length}`);
  console.log(`  ⏱️  Total time: ${Math.round(totalTime/1000)}s\n`);
  
  if (results.successful.length > 0) {
    console.log('✅ Built frameworks:');
    results.successful.forEach(({ framework, buildTime }) => {
      console.log(`  - ${framework} (${buildTime}ms)`);
    });
    console.log('');
  }
  
  if (results.failed.length > 0) {
    console.log('❌ Failed frameworks:');
    results.failed.forEach(({ framework, error }) => {
      console.log(`  - ${framework}: ${error}`);
    });
    console.log('');
  }
  
  if (results.skipped.length > 0) {
    console.log('⚠️  Skipped frameworks:');
    results.skipped.forEach(framework => {
      console.log(`  - ${framework} (directory not found)`);
    });
    console.log('');
  }
  
  if (results.failed.length === 0) {
    console.log('🎉 All available frameworks built successfully!');
    console.log('🚀 Start production server: npm run serve:production');
    console.log('📊 Run performance tests: npm run perf');
  } else {
    console.log('⚠️  Some frameworks failed to build. Performance tests may be incomplete.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  buildAllFrameworks().catch(error => {
    console.error('❌ Build process failed:', error.message);
    process.exit(1);
  });
}

module.exports = { buildAllFrameworks };