#!/usr/bin/env node

/**
 * Run All Linting
 * Execute lint checks across all configured frameworks with detailed reporting
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Execute a command and capture both output and success status
 */
async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    
    const child = spawn(command, args, { 
      stdio: options.quiet ? 'pipe' : ['pipe', 'pipe', 'pipe'],
      shell: true,
      cwd: options.cwd || process.cwd()
    });
    
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
        if (!options.quiet) process.stdout.write(data);
      });
    }
    
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
        if (!options.quiet) process.stderr.write(data);
      });
    }
    
    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout,
        errors: stderr,
        code
      });
    });
    
    child.on('error', (error) => {
      console.error(`❌ Command failed: ${error.message}`);
      resolve({
        success: false,
        output: '',
        errors: error.message,
        code: -1
      });
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
 * Parse ESLint output for warnings and errors
 */
function parseLintOutput(output) {
  const lines = output.split('\n');
  let errors = 0;
  let warnings = 0;
  
  for (const line of lines) {
    if (line.includes('✖') && line.includes('problem')) {
      const match = line.match(/✖ (\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
      if (match) {
        errors = parseInt(match[2]) || 0;
        warnings = parseInt(match[3]) || 0;
        break;
      }
    }
  }
  
  return { errors, warnings };
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
 * Main lint execution function
 */
async function runAllLinting() {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Starting framework lint execution...\n');
    
    const frameworks = loadFrameworks().filter(fw => fw.lintFiles && fw.lintFiles.length > 0);
    const results = [];
    
    if (frameworks.length === 0) {
      throw new Error('No frameworks with linting configuration found');
    }
    
    // Run linting for each framework
    for (const framework of frameworks) {
      const frameworkStartTime = Date.now();
      
      console.log(`\n${framework.icon || '🔍'} Linting ${framework.name}...`);
      console.log('─'.repeat(50));
      
      const result = await runCommand('npm', ['run', `lint:${framework.id}`], {
        quiet: false
      });
      
      const duration = Date.now() - frameworkStartTime;
      const lintStats = parseLintOutput(result.output + result.errors);
      
      results.push({
        name: framework.name,
        id: framework.id,
        icon: framework.icon || '📦',
        success: result.success,
        duration,
        errors: lintStats.errors,
        warnings: lintStats.warnings
      });
      
      const status = result.success ? '✅ CLEAN' : 
        (lintStats.errors > 0 ? `❌ ${lintStats.errors} ERRORS` : `⚠️  ${lintStats.warnings} WARNINGS`);
      console.log(`${framework.name}: ${status} (${formatDuration(duration)})`);
    }
    
    const totalDuration = Date.now() - startTime;
    
    // Generate summary report
    console.log('\n' + '═'.repeat(60));
    console.log('📊 LINTING EXECUTION SUMMARY');
    console.log('═'.repeat(60));
    
    const clean = results.filter(r => r.success);
    const withIssues = results.filter(r => !r.success);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0);
    
    console.log(`\n⏱️  Total execution time: ${formatDuration(totalDuration)}`);
    console.log(`📋 Frameworks linted: ${results.length}`);
    console.log(`✅ Clean: ${clean.length}`);
    console.log(`⚠️  With issues: ${withIssues.length}`);
    console.log(`🚨 Total errors: ${totalErrors}`);
    console.log(`⚠️  Total warnings: ${totalWarnings}`);
    
    if (clean.length > 0) {
      console.log('\n🎉 CLEAN FRAMEWORKS:');
      clean.forEach(result => {
        console.log(`   ${result.icon} ${result.name} (${formatDuration(result.duration)})`);
      });
    }
    
    if (withIssues.length > 0) {
      console.log('\n🔧 FRAMEWORKS WITH ISSUES:');
      withIssues.forEach(result => {
        const issues = [];
        if (result.errors > 0) issues.push(`${result.errors} errors`);
        if (result.warnings > 0) issues.push(`${result.warnings} warnings`);
        console.log(`   ${result.icon} ${result.name} - ${issues.join(', ')} (${formatDuration(result.duration)})`);
      });
    }
    
    // Overall result
    const successRate = (clean.length / results.length * 100).toFixed(1);
    console.log(`\n🎯 Clean Rate: ${successRate}% (${clean.length}/${results.length})`);
    
    if (totalErrors > 0) {
      console.log(`\n❌ Found ${totalErrors} errors that must be fixed`);
      process.exit(1);
    } else if (totalWarnings > 0) {
      console.log(`\n⚠️  Found ${totalWarnings} warnings - consider addressing them`);
    } else {
      console.log('\n🎊 All code is clean! Excellent work!');
    }
    
  } catch (error) {
    console.error('❌ Error running lint:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllLinting();
}

module.exports = { runAllLinting, runCommand, formatDuration, parseLintOutput };