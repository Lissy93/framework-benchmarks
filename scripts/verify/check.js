#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { color, loadFrameworks } = require('../utils');

const checks = [
  {
    name: 'Root node_modules',
    check: () => fs.existsSync('node_modules'),
    fix: 'npm install'
  },
  {
    name: 'Mock data present',
    check: () => fs.existsSync('assets/mocks/weather-data.json'),
    fix: 'npm run generate-mocks'
  },
  {
    name: 'Framework apps synced',
    check: () => {
      const frameworks = loadFrameworks();
      return frameworks.every(fw => 
        fs.existsSync(`apps/${fw.dir}/public/mocks/weather-data.json`) ||
        fs.existsSync(`apps/${fw.dir}/static/assets/mocks/weather-data.json`)
      );
    },
    fix: 'npm run sync-assets'
  },
  {
    name: 'Framework dependencies',
    check: () => {
      const frameworks = loadFrameworks();
      return frameworks
        .filter(fw => fw.hasNodeModules)
        .every(fw => fs.existsSync(`apps/${fw.dir}/node_modules`));
    },
    fix: 'npm run setup'
  },
  {
    name: 'Playwright installed',
    check: () => {
      try {
        require('@playwright/test');
        return true;
      } catch {
        return false;
      }
    },
    fix: 'npm run install:playwright'
  }
];

function runChecks() {
  console.log(color('🔍 Project Setup Verification', 'cyan'));
  console.log('─'.repeat(40));
  
  const results = checks.map(({ name, check, fix }) => {
    const passed = check();
    const status = passed ? color('✅', 'green') : color('❌', 'red');
    const suggestion = passed ? '' : color(` ℹ️  ${fix}`, 'blue');
    
    console.log(`${status} ${name}${suggestion}`);
    return { name, passed, fix };
  });
  
  const failedCount = results.filter(r => !r.passed).length;
  
  console.log('\n' + '─'.repeat(40));
  
  if (failedCount === 0) {
    console.log(color('🌞 All checks passed! Ww\'re ready to go!', 'green'));
  } else {
    console.log(color(`⚠️  ${failedCount} check${failedCount > 1 ? 's' : ''} failed`, 'yellow'));
    console.log(color('💡 Run suggested commands to fix issues', 'blue'));
    process.exit(1);
  }
}

if (require.main === module) {
  runChecks();
}

module.exports = { runChecks };
