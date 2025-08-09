#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', '..', '..', 'results', 'performance');
const RAW_DIR = path.join(RESULTS_DIR, 'raw');
const CONSOLIDATED_DIR = path.join(RESULTS_DIR, 'consolidated');
const REPORTS_DIR = path.join(RESULTS_DIR, 'reports');

/**
 * Generate a unique run ID based on timestamp
 */
function generateRunId() {
  const now = new Date();
  return `run-${now.toISOString().slice(0, 19).replace(/[:.]/g, '').replace('T', '-')}`;
}

/**
 * Ensure all required directories exist
 */
function ensureDirectories() {
  const dirs = [RAW_DIR, CONSOLIDATED_DIR, REPORTS_DIR];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Save interim test results for a specific framework and test type
 */
function saveInterimResult(framework, testType, runId, data) {
  ensureDirectories();
  
  const frameworkDir = path.join(RAW_DIR, framework);
  if (!fs.existsSync(frameworkDir)) {
    fs.mkdirSync(frameworkDir, { recursive: true });
  }
  
  const filename = `${testType}-${runId.replace('run-', '')}.json`;
  const filepath = path.join(frameworkDir, filename);
  
  const result = {
    framework,
    testType,
    timestamp: new Date().toISOString(),
    runId,
    environment: getEnvironmentInfo(),
    ...data
  };
  
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
  console.log(`📝 Saved ${testType} results for ${framework}: ${filename}`);
  
  return filepath;
}

/**
 * Load all interim results for a specific framework and run
 */
function loadFrameworkResults(framework, runId) {
  const frameworkDir = path.join(RAW_DIR, framework);
  if (!fs.existsSync(frameworkDir)) {
    return {};
  }
  
  const files = fs.readdirSync(frameworkDir)
    .filter(file => file.includes(runId.replace('run-', '')) && file.endsWith('.json'));
  
  const results = {};
  files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(frameworkDir, file), 'utf8'));
    results[data.testType] = data;
  });
  
  return results;
}

/**
 * Save consolidated framework results
 */
function saveConsolidatedResult(framework, runId, data) {
  ensureDirectories();
  
  const filename = `${framework}-${runId}.json`;
  const filepath = path.join(CONSOLIDATED_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`📊 Saved consolidated results for ${framework}: ${filename}`);
  
  return filepath;
}

/**
 * Save cross-framework comparison results
 */
function saveComparisonResult(runId, data) {
  ensureDirectories();
  
  const filename = `comparison-${runId}.json`;
  const filepath = path.join(CONSOLIDATED_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`📈 Saved comparison results: ${filename}`);
  
  // Also save as latest
  const latestPath = path.join(CONSOLIDATED_DIR, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(data, null, 2));
  
  return filepath;
}

/**
 * Save final performance report
 */
function saveReport(runId, data, format = 'json') {
  ensureDirectories();
  
  const filename = `performance-report-${runId}.${format}`;
  const filepath = path.join(REPORTS_DIR, filename);
  
  if (format === 'json') {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } else if (format === 'html') {
    fs.writeFileSync(filepath, data);
  }
  
  console.log(`📋 Saved performance report: ${filename}`);
  return filepath;
}

/**
 * Get system environment information
 */
function getEnvironmentInfo() {
  const os = require('os');
  
  return {
    node: process.version,
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB',
    loadAvg: os.loadavg()
  };
}

/**
 * List available frameworks from the apps directory
 */
function getAvailableFrameworks() {
  const appsDir = path.join(__dirname, '..', '..', '..', 'apps');
  
  if (!fs.existsSync(appsDir)) {
    return [];
  }
  
  return fs.readdirSync(appsDir)
    .filter(dir => {
      const dirPath = path.join(appsDir, dir);
      return fs.statSync(dirPath).isDirectory() && dir !== 'node_modules';
    })
    .sort();
}

/**
 * Clean up old results (keep last N runs)
 */
function cleanupOldResults(keepLast = 5) {
  const dirs = [RAW_DIR, CONSOLIDATED_DIR];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    // Get all run directories/files, sort by creation time
    const items = fs.readdirSync(dir)
      .map(item => ({
        name: item,
        path: path.join(dir, item),
        stat: fs.statSync(path.join(dir, item))
      }))
      .sort((a, b) => b.stat.mtime - a.stat.mtime);
    
    // Remove old items beyond keepLast
    items.slice(keepLast).forEach(item => {
      if (item.stat.isDirectory()) {
        fs.rmSync(item.path, { recursive: true });
      } else {
        fs.unlinkSync(item.path);
      }
      console.log(`🗑️  Cleaned up old result: ${item.name}`);
    });
  });
}

module.exports = {
  generateRunId,
  ensureDirectories,
  saveInterimResult,
  loadFrameworkResults,
  saveConsolidatedResult,
  saveComparisonResult,
  saveReport,
  getEnvironmentInfo,
  getAvailableFrameworks,
  cleanupOldResults,
  RESULTS_DIR,
  RAW_DIR,
  CONSOLIDATED_DIR,
  REPORTS_DIR
};