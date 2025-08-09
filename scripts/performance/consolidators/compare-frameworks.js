#!/usr/bin/env node

const { saveComparisonResult } = require('../utils/results-manager.js');

/**
 * Generate cross-framework comparison from consolidated results
 */
async function generateFrameworkComparison(runId, consolidatedResults) {
  console.log(`📈 Generating framework comparison for run ${runId}...`);
  
  try {
    const frameworks = Object.keys(consolidatedResults);
    
    if (frameworks.length === 0) {
      throw new Error('No consolidated results to compare');
    }
    
    const comparison = {
      runId,
      timestamp: new Date().toISOString(),
      frameworks: frameworks.sort(),
      
      // Individual framework data
      frameworkData: consolidatedResults,
      
      // Rankings by different metrics
      rankings: generateRankings(consolidatedResults),
      
      // Statistical analysis
      statistics: generateStatistics(consolidatedResults),
      
      // Performance insights
      insights: generateInsights(consolidatedResults),
      
      // Summary comparison table
      comparisonTable: generateComparisonTable(consolidatedResults)
    };
    
    // Save the comparison
    await saveComparisonResult(runId, comparison);
    
    console.log(`  ✅ Generated comparison for ${frameworks.length} frameworks`);
    return comparison;
    
  } catch (error) {
    console.error(`❌ Failed to generate framework comparison:`, error.message);
    throw error;
  }
}

/**
 * Generate rankings for different performance metrics
 */
function generateRankings(consolidatedResults) {
  const frameworks = Object.keys(consolidatedResults);
  const rankings = {};
  
  // Helper function to rank by metric (higher is better unless specified)
  const rankByMetric = (metricPath, lowerIsBetter = false) => {
    return frameworks
      .map(fw => ({
        framework: fw,
        value: getNestedValue(consolidatedResults[fw], metricPath)
      }))
      .filter(item => item.value !== null && item.value !== undefined)
      .sort((a, b) => lowerIsBetter ? a.value - b.value : b.value - a.value)
      .map((item, index) => ({
        rank: index + 1,
        framework: item.framework,
        value: item.value
      }));
  };
  
  // Overall performance rankings
  rankings.overall = rankByMetric('scores.overall');
  rankings.lighthouse = rankByMetric('scores.loading');
  rankings.runtime = rankByMetric('scores.runtime');
  rankings.bundle = rankByMetric('scores.bundle');
  rankings.memory = rankByMetric('scores.memory');
  
  // Specific metric rankings
  rankings.bundleSize = rankByMetric('summary.keyMetrics.bundleSizeGzip', true);
  rankings.loadTime = rankByMetric('summary.keyMetrics.initialLoadTime', true);
  rankings.memoryUsage = rankByMetric('summary.keyMetrics.peakMemoryMB', true);
  rankings.buildTime = rankByMetric('summary.keyMetrics.buildTime', true);
  rankings.searchResponse = rankByMetric('summary.keyMetrics.searchResponseTime', true);
  
  // Lighthouse-specific rankings
  rankings.lcp = rankByMetric('lighthouse.lcp', true);
  rankings.fcp = rankByMetric('lighthouse.fcp', true);
  rankings.cls = rankByMetric('lighthouse.cls', true);
  rankings.tbt = rankByMetric('lighthouse.tbt', true);
  
  return rankings;
}

/**
 * Generate statistical analysis of the results
 */
function generateStatistics(consolidatedResults) {
  const frameworks = Object.keys(consolidatedResults);
  
  const stats = {
    frameworkCount: frameworks.length,
    metrics: {}
  };
  
  // Calculate statistics for key metrics
  const metricsToAnalyze = [
    { path: 'scores.overall', name: 'overallScore' },
    { path: 'scores.loading', name: 'loadingScore' },
    { path: 'scores.runtime', name: 'runtimeScore' },
    { path: 'scores.bundle', name: 'bundleScore' },
    { path: 'scores.memory', name: 'memoryScore' },
    { path: 'summary.keyMetrics.bundleSizeGzip', name: 'bundleSizeGzip' },
    { path: 'summary.keyMetrics.initialLoadTime', name: 'loadTime' },
    { path: 'summary.keyMetrics.peakMemoryMB', name: 'peakMemory' },
    { path: 'summary.keyMetrics.buildTime', name: 'buildTime' },
    { path: 'lighthouse.performance', name: 'lighthouseScore' },
    { path: 'lighthouse.lcp', name: 'lcp' },
    { path: 'lighthouse.fcp', name: 'fcp' }
  ];
  
  metricsToAnalyze.forEach(metric => {
    const values = frameworks
      .map(fw => getNestedValue(consolidatedResults[fw], metric.path))
      .filter(v => v !== null && v !== undefined && !isNaN(v));
    
    if (values.length > 0) {
      stats.metrics[metric.name] = calculateBasicStats(values);
    }
  });
  
  return stats;
}

/**
 * Generate performance insights and recommendations
 */
function generateInsights(consolidatedResults) {
  const insights = {
    topPerformers: [],
    commonStrengths: [],
    commonWeaknesses: [],
    recommendations: [],
    notable: []
  };
  
  const frameworks = Object.keys(consolidatedResults);
  
  // Find top performers by overall score
  const overallRanking = frameworks
    .map(fw => ({
      framework: fw,
      score: consolidatedResults[fw].scores?.overall || 0
    }))
    .sort((a, b) => b.score - a.score);
  
  insights.topPerformers = overallRanking.slice(0, 3).map(item => ({
    framework: item.framework,
    score: item.score,
    strengths: consolidatedResults[item.framework].summary?.strengths || []
  }));
  
  // Analyze common patterns
  const allStrengths = frameworks.flatMap(fw => 
    consolidatedResults[fw].summary?.strengths || []
  );
  const allWeaknesses = frameworks.flatMap(fw => 
    consolidatedResults[fw].summary?.weaknesses || []
  );
  
  insights.commonStrengths = getFrequencyMap(allStrengths)
    .filter(item => item.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  insights.commonWeaknesses = getFrequencyMap(allWeaknesses)
    .filter(item => item.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Generate recommendations
  insights.recommendations = generateRecommendations(consolidatedResults);
  
  // Find notable results
  insights.notable = findNotableResults(consolidatedResults);
  
  return insights;
}

/**
 * Generate comparison table for easy viewing
 */
function generateComparisonTable(consolidatedResults) {
  const frameworks = Object.keys(consolidatedResults).sort();
  
  const table = {
    headers: ['Framework', 'Overall', 'Loading', 'Runtime', 'Bundle', 'Memory', 'Bundle Size', 'Load Time'],
    rows: frameworks.map(fw => {
      const data = consolidatedResults[fw];
      return {
        framework: fw,
        overall: data.scores?.overall || '-',
        loading: data.scores?.loading || '-',
        runtime: data.scores?.runtime || '-',
        bundle: data.scores?.bundle || '-',
        memory: data.scores?.memory || '-',
        bundleSize: formatBytes(data.summary?.keyMetrics?.bundleSizeGzip),
        loadTime: formatTime(data.summary?.keyMetrics?.initialLoadTime)
      };
    })
  };
  
  return table;
}

/**
 * Helper function to get nested object values safely
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

/**
 * Calculate basic statistics for a set of values
 */
function calculateBasicStats(values) {
  if (values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / values.length,
    median: sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)],
    count: values.length
  };
}

/**
 * Get frequency map of items
 */
function getFrequencyMap(items) {
  const map = {};
  items.forEach(item => {
    map[item] = (map[item] || 0) + 1;
  });
  
  return Object.entries(map).map(([item, count]) => ({ item, count }));
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(consolidatedResults) {
  const recommendations = [];
  const frameworks = Object.keys(consolidatedResults);
  
  // Bundle size recommendations
  const largeBundles = frameworks.filter(fw => {
    const bundleSize = consolidatedResults[fw].summary?.keyMetrics?.bundleSizeGzip;
    return bundleSize && bundleSize > 200000; // > 200KB
  });
  
  if (largeBundles.length > 0) {
    recommendations.push({
      type: 'bundle-optimization',
      frameworks: largeBundles,
      message: 'Consider bundle optimization techniques like code splitting, tree shaking, and minification'
    });
  }
  
  // Memory usage recommendations
  const highMemoryFrameworks = frameworks.filter(fw => {
    const peakMemory = consolidatedResults[fw].summary?.keyMetrics?.peakMemoryMB;
    return peakMemory && peakMemory > 100; // > 100MB
  });
  
  if (highMemoryFrameworks.length > 0) {
    recommendations.push({
      type: 'memory-optimization',
      frameworks: highMemoryFrameworks,
      message: 'Review memory usage patterns and implement cleanup strategies'
    });
  }
  
  // Performance score recommendations
  const lowScoreFrameworks = frameworks.filter(fw => {
    const overallScore = consolidatedResults[fw].scores?.overall;
    return overallScore && overallScore < 70;
  });
  
  if (lowScoreFrameworks.length > 0) {
    recommendations.push({
      type: 'general-performance',
      frameworks: lowScoreFrameworks,
      message: 'Focus on improving overall performance metrics'
    });
  }
  
  return recommendations;
}

/**
 * Find notable results worth highlighting
 */
function findNotableResults(consolidatedResults) {
  const notable = [];
  const frameworks = Object.keys(consolidatedResults);
  
  // Find the fastest loading framework
  const loadTimes = frameworks
    .map(fw => ({
      framework: fw,
      loadTime: consolidatedResults[fw].summary?.keyMetrics?.initialLoadTime
    }))
    .filter(item => item.loadTime)
    .sort((a, b) => a.loadTime - b.loadTime);
  
  if (loadTimes.length > 0) {
    notable.push({
      type: 'fastest-load',
      framework: loadTimes[0].framework,
      value: loadTimes[0].loadTime,
      message: `Fastest initial load time`
    });
  }
  
  // Find the smallest bundle
  const bundleSizes = frameworks
    .map(fw => ({
      framework: fw,
      bundleSize: consolidatedResults[fw].summary?.keyMetrics?.bundleSizeGzip
    }))
    .filter(item => item.bundleSize)
    .sort((a, b) => a.bundleSize - b.bundleSize);
  
  if (bundleSizes.length > 0) {
    notable.push({
      type: 'smallest-bundle',
      framework: bundleSizes[0].framework,
      value: bundleSizes[0].bundleSize,
      message: `Smallest bundle size`
    });
  }
  
  // Find the most memory efficient
  const memoryUsage = frameworks
    .map(fw => ({
      framework: fw,
      peakMemory: consolidatedResults[fw].summary?.keyMetrics?.peakMemoryMB
    }))
    .filter(item => item.peakMemory)
    .sort((a, b) => a.peakMemory - b.peakMemory);
  
  if (memoryUsage.length > 0) {
    notable.push({
      type: 'most-memory-efficient',
      framework: memoryUsage[0].framework,
      value: memoryUsage[0].peakMemory,
      message: `Lowest peak memory usage`
    });
  }
  
  return notable;
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (!bytes) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format time to human readable format
 */
function formatTime(ms) {
  if (!ms) return '-';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

module.exports = {
  generateFrameworkComparison,
  generateRankings,
  generateStatistics,
  generateInsights,
  generateComparisonTable,
  formatBytes,
  formatTime
};