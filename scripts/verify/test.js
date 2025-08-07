#!/usr/bin/env node

/**
 * Run All Tests
 * Execute test suites across all configured frameworks with detailed reporting
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Execute a command and return success status
 */
async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { 
      stdio: options.quiet ? 'pipe' : 'inherit',
      shell: true,
      cwd: options.cwd || process.cwd()
    });
    
    child.on('close', (code) => {
      resolve(code === 0);
    });
    
    child.on('error', (error) => {
      console.error(`❌ Command failed: ${error.message}`);
      resolve(false);
    });
  });
}

/**
 * Load frameworks configuration
 */
function loadFrameworks() {
  try {
    const { loadFrameworks } = require('../setup/generate-scripts.js');
    return loadFrameworks();
  } catch (error) {
    // Fallback to reading frameworks.json directly
    const fs = require('fs');
    const configPath = path.join(__dirname, '..', '..', 'frameworks.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.frameworks || [];
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

/**
 * Main test execution function
 */
async function runAllTests() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting framework test suite execution...\n');
    
    const frameworks = loadFrameworks();
    const results = [];
    
    if (frameworks.length === 0) {
      throw new Error('No frameworks found in configuration');
    }
    
    // Run tests for each framework
    for (const framework of frameworks) {
      const frameworkStartTime = Date.now();
      
      console.log(`\n${framework.icon || '🧪'} Testing ${framework.name}...`);
      console.log('─'.repeat(50));
      
      const success = await runCommand('npm', ['run', `test:${framework.id}`], {
        quiet: false
      });
      
      const duration = Date.now() - frameworkStartTime;
      
      results.push({
        name: framework.name,
        id: framework.id,
        icon: framework.icon || '📦',
        success,
        duration
      });
      
      const status = success ? '✅ PASSED' : '❌ FAILED';
      console.log(`${framework.name}: ${status} (${formatDuration(duration)})`);
    }
    
    const totalDuration = Date.now() - startTime;
    
    // Generate summary report
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('═'.repeat(60));
    
    const passed = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n⏱️  Total execution time: ${formatDuration(totalDuration)}`);
    console.log(`📋 Frameworks tested: ${results.length}`);
    console.log(`✅ Passed: ${passed.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (passed.length > 0) {
      console.log('\n🎉 PASSING FRAMEWORKS:');
      passed.forEach(result => {
        console.log(`   ${result.icon} ${result.name} (${formatDuration(result.duration)})`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n💥 FAILING FRAMEWORKS:');
      failed.forEach(result => {
        console.log(`   ${result.icon} ${result.name} (${formatDuration(result.duration)})`);
      });
    }
    
    // Overall result
    const successRate = (passed.length / results.length * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}% (${passed.length}/${results.length})`);
    
    if (failed.length === results.length) {
      console.log('\n❌ All tests failed - this may indicate a configuration issue');
      process.exit(1);
    } else if (failed.length > 0) {
      console.log('\n⚠️  Some tests failed - check output above for details');
      process.exit(1);
    } else {
      console.log('\n🎊 All tests passed! Great work!');
    }
    
  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, runCommand, formatDuration };
