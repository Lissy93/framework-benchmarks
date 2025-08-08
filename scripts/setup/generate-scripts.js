#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { color } = require('../utils');

const FRAMEWORKS_CONFIG = path.join(__dirname, '..', '..', 'frameworks.json');
const PACKAGE_JSON = path.join(__dirname, '..', '..', 'package.json');

const loadFrameworks = () => {
  try {
    const config = JSON.parse(fs.readFileSync(FRAMEWORKS_CONFIG, 'utf8'));
    return config.frameworks || [];
  } catch (error) {
    throw new Error(`Failed to load frameworks.json: ${error.message}`);
  }
};

const loadPackageJson = () => {
  try {
    return JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to load package.json: ${error.message}`);
  }
};

const generateFrameworkScripts = (frameworks) => {
  const scripts = {};
  
  frameworks.forEach(framework => {
    // Use npx for playwright commands to ensure they work in CI/CD
    const testCommand = framework.testCommand.startsWith('playwright ') 
      ? `npx ${framework.testCommand}`
      : framework.testCommand;
    scripts[`test:${framework.id}`] = testCommand;
    
    scripts[`dev:${framework.id}`] = framework.dir === 'vanilla' 
      ? `cd apps/${framework.dir} && ${framework.devCommand}`
      : `cd apps/${framework.dir} && npm run dev`;
    
    if (framework.lintFiles?.length > 0) {
      const extensions = framework.lintFiles.length === 1 
        ? framework.lintFiles[0]
        : `{${framework.lintFiles.join(',')}}`;
      scripts[`lint:${framework.id}`] = `eslint 'apps/${framework.dir}/**/*.${extensions}'`;
    }
  });
  
  return scripts;
};

const generateLintFixScript = (frameworks) => 
  frameworks
    .filter(fw => fw.lintFiles?.length > 0)
    .map(fw => `npm run lint:${fw.id} -- --fix`)
    .join(' && ');

const generateScripts = async () => {
  const startTime = Date.now();
  
  try {
    console.log('🔧 Generating package.json scripts...');
    
    const frameworks = loadFrameworks();
    const packageJson = loadPackageJson();
    const frameworkScripts = generateFrameworkScripts(frameworks);
    
    Object.assign(packageJson.scripts, frameworkScripts);
    packageJson.scripts.test = 'node scripts/verify/test.js';
    packageJson.scripts.lint = 'node scripts/verify/lint.js';
    packageJson.scripts.verify = 'node scripts/verify/index.js';
    packageJson.scripts.check = 'node scripts/verify/check.js';
    packageJson.scripts['lint:fix'] = generateLintFixScript(frameworks);
    
    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2) + '\n');
    
    const duration = Date.now() - startTime;
    const scriptCount = Object.keys(frameworkScripts).length + 3;
    const lintingFrameworks = frameworks.filter(fw => fw.lintFiles?.length > 0);
    
    const frameworkList = frameworks.map(fw => {
      const scripts = [`   • dev:${fw.id.padEnd(8)} - ${fw.name} development server`,
                      `   • test:${fw.id.padEnd(7)} - ${fw.name} test suite`];
      if (fw.lintFiles?.length > 0) {
        scripts.push(`   • lint:${fw.id.padEnd(7)} - ${fw.name} linting`);
      }
      return scripts.join('\n');
    }).join('\n');
    
    const summary = `
${color('✅ Script Generation Complete', 'green')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Frameworks processed: ${frameworks.length}
⚡ Scripts generated: ${scriptCount + 2}
⏱️  Completed in: ${duration}ms

📦 Generated scripts:
${frameworkList}
   • test${' '.repeat(10)} - Run all framework tests
   • lint${' '.repeat(10)} - Run all framework linting
   • verify${' '.repeat(8)} - Run tests + linting (complete verification)
   • check${' '.repeat(9)} - Check project setup and dependencies
   • lint:fix${' '.repeat(6)} - Run all framework linting with auto-fix`;
    
    console.log(summary);
    
  } catch (error) {
    console.error(color('❌ Error generating scripts:', 'red'), error.message);
    process.exit(1);
  }
};

const main = async () => {
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
    case undefined:
      await generateScripts();
      break;
      
    case 'list':
      try {
        const frameworks = loadFrameworks();
        const frameworksList = frameworks.map(fw => 
          `${fw.icon} ${fw.name.padEnd(12)} (${fw.id})
   Directory: apps/${fw.dir}
   Test: ${fw.testCommand}
`).join('\n');
        
        console.log(`\n📋 Available Frameworks:\n━━━━━━━━━━━━━━━━━━━━━━━━\n${frameworksList}`);
      } catch (error) {
        console.error(color('❌ Error listing frameworks:', 'red'), error.message);
        process.exit(1);
      }
      break;
      
    case 'ids':
    case 'github':
      try {
        const frameworks = loadFrameworks();
        console.log(frameworks.map(f => f.id).join(','));
      } catch (error) {
        console.error(color('❌ Error getting framework IDs:', 'red'), error.message);
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
};

if (require.main === module) main();

module.exports = { 
  generateScripts,
  loadFrameworks,
  generateFrameworkScripts,
  generateLintFixScript
};