#!/usr/bin/env node

/**
 * Generate Package Scripts
 * Automatically generates package.json scripts from frameworks.json configuration
 */

const fs = require('fs');
const path = require('path');

const FRAMEWORKS_CONFIG = path.join(__dirname, '..', '..', 'frameworks.json');
const PACKAGE_JSON = path.join(__dirname, '..', '..', 'package.json');

/**
 * Read frameworks configuration
 */
function loadFrameworks() {
  try {
    const config = JSON.parse(fs.readFileSync(FRAMEWORKS_CONFIG, 'utf8'));
    return config.frameworks || [];
  } catch (error) {
    throw new Error(`Failed to load frameworks.json: ${error.message}`);
  }
}

/**
 * Read current package.json
 */
function loadPackageJson() {
  try {
    return JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to load package.json: ${error.message}`);
  }
}

/**
 * Generate dev, test, and lint scripts for each framework
 */
function generateFrameworkScripts(frameworks) {
  const scripts = {};
  
  frameworks.forEach(framework => {
    // Test script
    scripts[`test:${framework.id}`] = framework.testCommand;
    
    // Dev script
    scripts[`dev:${framework.id}`] = framework.dir === 'vanilla' 
      ? `cd apps/${framework.dir} && ${framework.devCommand}`
      : `cd apps/${framework.dir} && npm run dev`;
    
    // Lint script
    if (framework.lintFiles && framework.lintFiles.length > 0) {
      const fileExtensions = framework.lintFiles.length === 1 
        ? framework.lintFiles[0]
        : `{${framework.lintFiles.join(',')}}`;
      scripts[`lint:${framework.id}`] = `eslint 'apps/${framework.dir}/**/*.${fileExtensions}'`;
    }
  });
  
  return scripts;
}

/**
 * Generate main test script that runs all frameworks
 */
function generateMainTestScript(frameworks) {
  const testCommands = frameworks.map(framework => 
    `npm run test:${framework.id}`
  ).join(' && ');
  
  return testCommands;
}

/**
 * Generate main lint script that runs all frameworks
 */
function generateMainLintScript(frameworks) {
  const lintCommands = frameworks
    .filter(framework => framework.lintFiles && framework.lintFiles.length > 0)
    .map(framework => `npm run lint:${framework.id}`)
    .join(' && ');
  
  return lintCommands;
}

/**
 * Generate lint:fix script that runs all frameworks with --fix flag
 */
function generateLintFixScript(frameworks) {
  const lintFixCommands = frameworks
    .filter(framework => framework.lintFiles && framework.lintFiles.length > 0)
    .map(framework => `npm run lint:${framework.id} -- --fix`)
    .join(' && ');
  
  return lintFixCommands;
}

/**
 * Main script generation function
 */
async function generateScripts() {
  const startTime = Date.now();
  
  try {
    console.log('🔧 Generating package.json scripts...');
    
    const frameworks = loadFrameworks();
    const packageJson = loadPackageJson();
    
    // Generate framework-specific scripts
    const frameworkScripts = generateFrameworkScripts(frameworks);
    Object.assign(packageJson.scripts, frameworkScripts);
    
    // Generate main test script (using verification runner)
    packageJson.scripts.test = 'node scripts/verify/test.js';
    
    // Generate main lint script (using verification runner)
    packageJson.scripts.lint = 'node scripts/verify/lint.js';
    
    // Generate lint:fix script
    packageJson.scripts['lint:fix'] = generateLintFixScript(frameworks);
    
    // Write updated package.json
    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2) + '\n');
    
    const duration = Date.now() - startTime;
    
    // Summary
    console.log('\n✅ Script Generation Complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Frameworks processed: ${frameworks.length}`);
    console.log(`⚡ Scripts generated: ${Object.keys(frameworkScripts).length + 3}`);
    console.log(`⏱️  Completed in: ${duration}ms`);
    console.log('\n📦 Generated scripts:');
    
    frameworks.forEach(framework => {
      console.log(`   • dev:${framework.id.padEnd(8)} - ${framework.name} development server`);
      console.log(`   • test:${framework.id.padEnd(7)} - ${framework.name} test suite`);
      if (framework.lintFiles && framework.lintFiles.length > 0) {
        console.log(`   • lint:${framework.id.padEnd(7)} - ${framework.name} linting`);
      }
    });
    console.log(`   • test${' '.repeat(10)} - Run all framework tests`);
    console.log(`   • lint${' '.repeat(10)} - Run all framework linting`);
    console.log(`   • lint:fix${' '.repeat(6)} - Run all framework linting with auto-fix\n`);
    
  } catch (error) {
    console.error('❌ Error generating scripts:', error.message);
    process.exit(1);
  }
}

/**
 * Command line interface
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
    case undefined:
      await generateScripts();
      break;
      
    case 'list':
      try {
        const frameworks = loadFrameworks();
        console.log('\n📋 Available Frameworks:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
        frameworks.forEach(fw => {
          console.log(`${fw.icon} ${fw.name.padEnd(12)} (${fw.id})`);
          console.log(`   Directory: apps/${fw.dir}`);
          console.log(`   Test: ${fw.testCommand}`);
          console.log('');
        });
      } catch (error) {
        console.error('❌ Error listing frameworks:', error.message);
        process.exit(1);
      }
      break;
      
    case 'ids':
      try {
        const frameworks = loadFrameworks();
        console.log(frameworks.map(f => f.id).join(','));
      } catch (error) {
        console.error('❌ Error getting framework IDs:', error.message);
        process.exit(1);
      }
      break;
      
    default:
      console.log(`
🛠️  Package Script Generator

Usage: ${path.basename(process.argv[1])} [command]

Commands:
  generate    Update package.json scripts from frameworks.json (default)
  list        Display all frameworks with details  
  ids         Output framework IDs only (comma-separated)
      `);
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  generateScripts,
  loadFrameworks,
  generateFrameworkScripts,
  generateMainTestScript,
  generateMainLintScript,
  generateLintFixScript
};