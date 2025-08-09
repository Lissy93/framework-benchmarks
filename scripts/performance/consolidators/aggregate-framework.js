#!/usr/bin/env node

const { loadFrameworkResults, saveConsolidatedResult } = require('../utils/results-manager.js');

/**
 * Consolidate all test results for a single framework
 */
async function consolidateFrameworkResults(framework, runId) {
  console.log(`📊 Consolidating results for ${framework}...`);
  
  try {
    // Load all interim results for this framework
    const interimResults = loadFrameworkResults(framework, runId);
    
    if (Object.keys(interimResults).length === 0) {
      throw new Error(`No interim results found for ${framework} in run ${runId}`);
    }
    
    // Consolidate the results
    const consolidated = {
      framework,
      runId,
      timestamp: new Date().toISOString(),
      environment: interimResults[Object.keys(interimResults)[0]]?.environment || null,
      
      // Performance summary
      summary: generatePerformanceSummary(interimResults),
      
      // Detailed results by test type
      lighthouse: interimResults.lighthouse?.metrics || null,
      bundle: interimResults.bundle?.metrics || null,
      runtime: interimResults.runtime?.metrics || null,
      
      // Test execution info
      execution: {
        testsRun: Object.keys(interimResults),
        totalDuration: Object.values(interimResults).reduce((sum, result) => sum + (result.duration || 0), 0),
        errors: Object.values(interimResults).filter(result => result.error).map(result => ({
          testType: result.testType,
          error: result.error
        }))
      },
      
      // Raw data reference
      rawResults: interimResults
    };
    
    // Calculate performance scores
    consolidated.scores = calculatePerformanceScores(consolidated);
    
    // Save consolidated results
    await saveConsolidatedResult(framework, runId, consolidated);
    
    console.log(`  ✅ Consolidated ${Object.keys(interimResults).length} test results for ${framework}`);
    return consolidated;
    
  } catch (error) {
    console.error(`❌ Failed to consolidate results for ${framework}:`, error.message);
    throw error;
  }
}

/**
 * Generate a performance summary from all test results
 */
function generatePerformanceSummary(interimResults) {
  const summary = {
    overall: 'unknown',
    strengths: [],
    weaknesses: [],
    keyMetrics: {}
  };
  
  // Lighthouse summary
  if (interimResults.lighthouse?.metrics) {
    const lh = interimResults.lighthouse.metrics;
    summary.keyMetrics.lighthouseScore = lh.performance || null;
    summary.keyMetrics.lcp = lh.lcp || null;
    summary.keyMetrics.fcp = lh.fcp || null;
    summary.keyMetrics.cls = lh.cls || null;
    summary.keyMetrics.tbt = lh.tbt || null;
    
    // Analyze Lighthouse performance
    if (lh.performance) {
      if (lh.performance >= 90) summary.strengths.push('Excellent Lighthouse score');
      else if (lh.performance < 60) summary.weaknesses.push('Poor Lighthouse score');
    }
    
    if (lh.lcp && lh.lcp < 2500) summary.strengths.push('Fast LCP');
    if (lh.lcp && lh.lcp > 4000) summary.weaknesses.push('Slow LCP');
    
    if (lh.cls && lh.cls < 0.1) summary.strengths.push('Low layout shift');
    if (lh.cls && lh.cls > 0.25) summary.weaknesses.push('High layout shift');
  }
  
  // Bundle summary
  if (interimResults.bundle?.metrics) {
    const bundle = interimResults.bundle.metrics.bundle;
    if (bundle) {
      summary.keyMetrics.bundleSize = bundle.totalSize || null;
      summary.keyMetrics.bundleSizeGzip = bundle.totalGzipSize || null;
      summary.keyMetrics.jsSize = bundle.breakdown?.javascript?.size || null;
      summary.keyMetrics.cssSize = bundle.breakdown?.css?.size || null;
      
      // Analyze bundle size
      if (bundle.totalGzipSize) {
        if (bundle.totalGzipSize < 50000) summary.strengths.push('Small bundle size');
        else if (bundle.totalGzipSize > 200000) summary.weaknesses.push('Large bundle size');
      }
    }
    
    const build = interimResults.bundle.metrics.build;
    if (build?.buildTime) {
      summary.keyMetrics.buildTime = build.buildTime;
      if (build.buildTime < 5000) summary.strengths.push('Fast build time');
      else if (build.buildTime > 30000) summary.weaknesses.push('Slow build time');
    }
  }
  
  // Runtime summary
  if (interimResults.runtime?.metrics) {
    const runtime = interimResults.runtime.metrics;
    
    if (runtime.initialLoad) {
      summary.keyMetrics.initialLoadTime = runtime.initialLoad.totalLoadTime || null;
      summary.keyMetrics.domReady = runtime.initialLoad.domReady || null;
      
      if (runtime.initialLoad.totalLoadTime < 2000) summary.strengths.push('Fast initial load');
      else if (runtime.initialLoad.totalLoadTime > 5000) summary.weaknesses.push('Slow initial load');
    }
    
    if (runtime.memoryUsage && !runtime.memoryUsage.error) {
      summary.keyMetrics.peakMemoryMB = runtime.memoryUsage.peakMemoryMB || null;
      summary.keyMetrics.memoryGrowthMB = runtime.memoryUsage.memoryGrowthMB || null;
      
      if (runtime.memoryUsage.peakMemoryMB < 50) summary.strengths.push('Low memory usage');
      else if (runtime.memoryUsage.peakMemoryMB > 150) summary.weaknesses.push('High memory usage');
      
      if (runtime.memoryUsage.memoryGrowthMB < 5) summary.strengths.push('Stable memory usage');
      else if (runtime.memoryUsage.memoryGrowthMB > 20) summary.weaknesses.push('Memory growth issues');
    }
    
    if (runtime.searchInteraction && !runtime.searchInteraction.error) {
      summary.keyMetrics.searchResponseTime = runtime.searchInteraction.searchResponseTime || null;
      
      if (runtime.searchInteraction.searchResponseTime < 1000) summary.strengths.push('Fast interactions');
      else if (runtime.searchInteraction.searchResponseTime > 3000) summary.weaknesses.push('Slow interactions');
    }
  }
  
  // Determine overall assessment
  const strengthCount = summary.strengths.length;
  const weaknessCount = summary.weaknesses.length;
  
  if (strengthCount > weaknessCount * 2) summary.overall = 'excellent';
  else if (strengthCount > weaknessCount) summary.overall = 'good';
  else if (weaknessCount > strengthCount) summary.overall = 'needs-improvement';
  else summary.overall = 'average';
  
  return summary;
}

/**
 * Calculate normalized performance scores (0-100) for different aspects
 */
function calculatePerformanceScores(consolidated) {
  const scores = {
    overall: 0,
    loading: 0,
    runtime: 0,
    bundle: 0,
    memory: 0
  };
  
  let validScores = 0;
  
  // Loading performance score (from Lighthouse)
  if (consolidated.lighthouse?.performance) {
    scores.loading = consolidated.lighthouse.performance;
    scores.overall += scores.loading;
    validScores++;
  }
  
  // Runtime performance score (based on interaction times)
  if (consolidated.runtime?.searchInteraction?.searchResponseTime) {
    const responseTime = consolidated.runtime.searchInteraction.searchResponseTime;
    // Score: 100 for <500ms, 0 for >5000ms, linear interpolation between
    scores.runtime = Math.max(0, Math.min(100, 100 - ((responseTime - 500) / 4500) * 100));
    scores.overall += scores.runtime;
    validScores++;
  }
  
  // Bundle performance score (based on gzipped size)
  if (consolidated.bundle?.bundle?.totalGzipSize) {
    const sizeKB = consolidated.bundle.bundle.totalGzipSize / 1024;
    // Score: 100 for <50KB, 0 for >500KB, linear interpolation between
    scores.bundle = Math.max(0, Math.min(100, 100 - ((sizeKB - 50) / 450) * 100));
    scores.overall += scores.bundle;
    validScores++;
  }
  
  // Memory performance score (based on peak usage)
  if (consolidated.runtime?.memoryUsage?.peakMemoryMB) {
    const peakMB = consolidated.runtime.memoryUsage.peakMemoryMB;
    // Score: 100 for <25MB, 0 for >200MB, linear interpolation between
    scores.memory = Math.max(0, Math.min(100, 100 - ((peakMB - 25) / 175) * 100));
    scores.overall += scores.memory;
    validScores++;
  }
  
  // Calculate overall score as average of valid scores
  if (validScores > 0) {
    scores.overall = Math.round(scores.overall / validScores);
  }
  
  // Round all scores
  Object.keys(scores).forEach(key => {
    scores[key] = Math.round(scores[key]);
  });
  
  return scores;
}

/**
 * Consolidate results for multiple frameworks
 */
async function consolidateAllFrameworks(runId, frameworks) {
  console.log(`📊 Consolidating results for all frameworks in run ${runId}...`);
  
  const consolidated = {};
  const errors = [];
  
  for (const framework of frameworks) {
    try {
      consolidated[framework] = await consolidateFrameworkResults(framework, runId);
    } catch (error) {
      console.warn(`⚠️  Failed to consolidate ${framework}: ${error.message}`);
      errors.push({ framework, error: error.message });
    }
  }
  
  console.log(`✅ Consolidated results for ${Object.keys(consolidated).length}/${frameworks.length} frameworks`);
  
  return {
    consolidated,
    errors,
    summary: {
      totalFrameworks: frameworks.length,
      successfulFrameworks: Object.keys(consolidated).length,
      failedFrameworks: errors.length
    }
  };
}

module.exports = {
  consolidateFrameworkResults,
  consolidateAllFrameworks,
  generatePerformanceSummary,
  calculatePerformanceScores
};