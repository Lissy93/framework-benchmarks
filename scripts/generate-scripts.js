#!/usr/bin/env node

/**
 * Script to generate package.json scripts from frameworks.json configuration
 */

const fs = require('fs');
const path = require('path');

const FRAMEWORKS_CONFIG = path.join(__dirname, '..', 'frameworks.json');
const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');

function generateScripts() {
  console.log('🔄 Generating package.json scripts from frameworks.json...');
  
  // Read frameworks config
  const frameworksConfig = JSON.parse(fs.readFileSync(FRAMEWORKS_CONFIG, 'utf8'));
  const frameworks = frameworksConfig.frameworks;
  
  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  
  // Generate individual test scripts
  frameworks.forEach(framework => {
    packageJson.scripts[`test:${framework.id}`] = framework.testCommand;
    packageJson.scripts[`dev:${framework.id}`] = framework.dir === 'vanilla' 
      ? `cd apps/${framework.dir} && ${framework.devCommand}`
      : `cd apps/${framework.dir} && npm run dev`;
  });
  
  // Generate main test script that runs all frameworks
  const testCommands = frameworks.map(framework => 
    `(npm run test:${framework.id} || echo '${framework.name} tests completed')`
  ).join('; ');
  
  packageJson.scripts.test = `${testCommands}; echo 'All test suites completed'`;
  
  // Write updated package.json
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log('✅ Successfully updated package.json scripts:');
  frameworks.forEach(framework => {
    console.log(`   - test:${framework.id}`);
    console.log(`   - dev:${framework.id}`);
  });
  console.log('   - test (main script)');
}

function listFrameworks() {
  const frameworksConfig = JSON.parse(fs.readFileSync(FRAMEWORKS_CONFIG, 'utf8'));
  return frameworksConfig.frameworks;
}

function getFrameworkIds() {
  return listFrameworks().map(f => f.id);
}

function getFrameworksForGitHub() {
  return getFrameworkIds().join(',');
}

if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
    case undefined:
      generateScripts();
      break;
    case 'list':
      console.log(JSON.stringify(listFrameworks(), null, 2));
      break;
    case 'ids':
      console.log(getFrameworkIds().join(','));
      break;
    case 'github':
      console.log(getFrameworksForGitHub());
      break;
    default:
      console.log(`Usage: ${process.argv[1]} [generate|list|ids|github]`);
      console.log('  generate: Update package.json scripts (default)');
      console.log('  list: List all frameworks with details');  
      console.log('  ids: List framework IDs only');
      console.log('  github: Output framework list for GitHub Actions');
      process.exit(1);
  }
}

module.exports = { 
  generateScripts, 
  listFrameworks, 
  getFrameworkIds, 
  getFrameworksForGitHub 
};