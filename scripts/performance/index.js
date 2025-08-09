#!/usr/bin/env node

const { program } = require('commander');
const { 
  generateRunId, 
  getAvailableFrameworks, 
  cleanupOldResults,
  saveReport 
} = require('./utils/results-manager.js');
const { runLighthouseTest } = require('./runners/lighthouse-runner.js');
const { runBundleAnalysis } = require('./runners/bundle-analyzer.js');
const { runRuntimePerformanceTest } = require('./runners/runtime-profiler.js');
const { consolidateAllFrameworks } = require('./consolidators/aggregate-framework.js');
const { generateFrameworkComparison } = require('./consolidators/compare-frameworks.js');

/**
 * Main performance testing orchestrator
 */
async function runPerformanceTests(options = {}) {
  const startTime = Date.now();
  const runId = options.runId || generateRunId();
  
  console.log(`🚀 Starting performance test run: ${runId}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  try {
    // Get frameworks to test
    const allFrameworks = getAvailableFrameworks();
    const frameworksToTest = options.frameworks || allFrameworks;
    const validFrameworks = frameworksToTest.filter(fw => allFrameworks.includes(fw));
    
    if (validFrameworks.length === 0) {
      throw new Error('No valid frameworks specified for testing');
    }
    
    console.log(`📋 Testing frameworks: ${validFrameworks.join(', ')}`);
    console.log(`🧪 Tests to run: ${getTestTypes(options).join(', ')}`);
    
    // Phase 1: Run individual tests for each framework
    const testResults = await runIndividualTests(validFrameworks, runId, options);
    
    // Phase 2: Consolidate results per framework  
    console.log(`\n📊 Phase 2: Consolidating framework results...`);
    const consolidationResult = await consolidateAllFrameworks(runId, validFrameworks);
    
    // Phase 3: Generate cross-framework comparison
    console.log(`\n📈 Phase 3: Generating comparison analysis...`);
    const comparison = await generateFrameworkComparison(runId, consolidationResult.consolidated);
    
    // Phase 4: Generate final report
    console.log(`\n📋 Phase 4: Generating final report...`);
    const report = await generateFinalReport(runId, comparison, testResults, options);
    
    // Cleanup old results if requested
    if (options.cleanup) {
      console.log(`\n🗑️  Cleaning up old results...`);
      cleanupOldResults(options.keepLast || 5);
    }
    
    const totalDuration = Date.now() - startTime;
    console.log(`\n✅ Performance testing completed in ${formatDuration(totalDuration)}`);
    console.log(`📊 Results saved for run: ${runId}`);
    
    return {
      runId,
      duration: totalDuration,
      frameworks: validFrameworks,
      comparison,
      report,
      errors: consolidationResult.errors
    };
    
  } catch (error) {
    console.error(`❌ Performance testing failed:`, error.message);
    throw error;
  }
}

/**
 * Run individual tests for all frameworks
 */
async function runIndividualTests(frameworks, runId, options) {
  console.log(`\n🧪 Phase 1: Running individual tests...`);
  
  const testTypes = getTestTypes(options);
  const results = {
    successful: [],
    failed: [],
    skipped: []
  };
  
  for (const framework of frameworks) {
    console.log(`\n📦 Testing ${framework}:`);
    
    const frameworkResults = {
      framework,
      tests: {},
      errors: []
    };
    
    // Run tests based on options
    if (testTypes.includes('lighthouse')) {
      try {
        console.log(`  🔍 Running Lighthouse test...`);
        frameworkResults.tests.lighthouse = await runLighthouseTest(framework, runId, {
          baseUrl: options.baseUrl
        });
      } catch (error) {
        console.warn(`    ⚠️  Lighthouse test failed: ${error.message}`);
        frameworkResults.errors.push({ test: 'lighthouse', error: error.message });
      }
    }
    
    if (testTypes.includes('bundle')) {
      try {
        console.log(`  📦 Running bundle analysis...`);
        frameworkResults.tests.bundle = await runBundleAnalysis(framework, runId);
      } catch (error) {
        console.warn(`    ⚠️  Bundle analysis failed: ${error.message}`);
        frameworkResults.errors.push({ test: 'bundle', error: error.message });
      }
    }
    
    if (testTypes.includes('runtime')) {
      try {
        console.log(`  ⚡ Running runtime performance test...`);
        frameworkResults.tests.runtime = await runRuntimePerformanceTest(framework, runId, {
          baseUrl: options.baseUrl
        });
      } catch (error) {
        console.warn(`    ⚠️  Runtime performance test failed: ${error.message}`);
        frameworkResults.errors.push({ test: 'runtime', error: error.message });
      }
    }
    
    // Categorize results
    if (frameworkResults.errors.length === 0) {
      results.successful.push(frameworkResults);
      console.log(`  ✅ All tests completed for ${framework}`);
    } else if (Object.keys(frameworkResults.tests).length > 0) {
      results.failed.push(frameworkResults);
      console.log(`  ⚠️  Some tests failed for ${framework} (${frameworkResults.errors.length} errors)`);
    } else {
      results.skipped.push(frameworkResults);
      console.log(`  ❌ All tests failed for ${framework}`);
    }
    
    // Add delay between frameworks to avoid resource contention
    if (frameworks.indexOf(framework) < frameworks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n📊 Test Results Summary:`);
  console.log(`  ✅ Successful: ${results.successful.length}/${frameworks.length}`);
  console.log(`  ⚠️  Partial failures: ${results.failed.length}/${frameworks.length}`);
  console.log(`  ❌ Complete failures: ${results.skipped.length}/${frameworks.length}`);
  
  return results;
}

/**
 * Generate final performance report
 */
async function generateFinalReport(runId, comparison, testResults, options) {
  const report = {
    runId,
    timestamp: new Date().toISOString(),
    summary: {
      frameworksTested: comparison.frameworks.length,
      testTypes: getTestTypes(options),
      environment: comparison.frameworkData[comparison.frameworks[0]]?.environment || null,
      duration: testResults.duration
    },
    
    // Key findings
    topPerformers: comparison.insights.topPerformers,
    rankings: {
      overall: comparison.rankings.overall?.slice(0, 5) || [],
      bundleSize: comparison.rankings.bundleSize?.slice(0, 5) || [],
      loadTime: comparison.rankings.loadTime?.slice(0, 5) || [],
      memoryUsage: comparison.rankings.memoryUsage?.slice(0, 5) || []
    },
    
    // Notable results
    notable: comparison.insights.notable,
    recommendations: comparison.insights.recommendations,
    
    // Quick comparison table
    comparisonTable: comparison.comparisonTable,
    
    // Statistics
    statistics: comparison.statistics,
    
    // Test execution summary
    execution: {
      successful: testResults.successful.length,
      failed: testResults.failed.length,
      skipped: testResults.skipped.length,
      errors: testResults.failed.flatMap(fr => fr.errors).concat(
        testResults.skipped.flatMap(fr => fr.errors)
      )
    }
  };
  
  // Save report
  await saveReport(runId, report, 'json');
  
  // Generate HTML report if requested
  if (options.html) {
    const htmlReport = generateHtmlReport(report);
    await saveReport(runId, htmlReport, 'html');
  }
  
  return report;
}

/**
 * Generate HTML report (basic version)
 */
function generateHtmlReport(report) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Performance Test Report - ${report.runId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    .section { margin: 30px 0; }
    .ranking { display: flex; gap: 20px; flex-wrap: wrap; }
    .ranking-item { background: #f9f9f9; padding: 15px; border-radius: 5px; min-width: 200px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .top-performer { color: #27ae60; font-weight: bold; }
    .recommendation { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Performance Test Report</h1>
    <p><strong>Run ID:</strong> ${report.runId}</p>
    <p><strong>Date:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
    <p><strong>Frameworks Tested:</strong> ${report.summary.frameworksTested}</p>
  </div>

  <div class="section">
    <h2>Top Performers</h2>
    ${report.topPerformers.map(tp => `
      <div class="top-performer">
        🏆 ${tp.framework} (Score: ${tp.score}/100)
        <br><small>Strengths: ${tp.strengths.join(', ')}</small>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Performance Comparison</h2>
    <table>
      <tr>
        ${report.comparisonTable.headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
      ${report.comparisonTable.rows.map(row => `
        <tr>
          <td>${row.framework}</td>
          <td>${row.overall}</td>
          <td>${row.loading}</td>
          <td>${row.runtime}</td>
          <td>${row.bundle}</td>
          <td>${row.memory}</td>
          <td>${row.bundleSize}</td>
          <td>${row.loadTime}</td>
        </tr>
      `).join('')}
    </table>
  </div>

  <div class="section">
    <h2>Recommendations</h2>
    ${report.recommendations.map(rec => `
      <div class="recommendation">
        <strong>${rec.type}:</strong> ${rec.message}
        <br><small>Affects: ${rec.frameworks.join(', ')}</small>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
}

/**
 * Get test types to run based on options
 */
function getTestTypes(options) {
  const defaultTests = ['lighthouse', 'bundle', 'runtime'];
  
  if (options.only) {
    return options.only.split(',').map(t => t.trim());
  }
  
  if (options.skip) {
    const skipTests = options.skip.split(',').map(t => t.trim());
    return defaultTests.filter(t => !skipTests.includes(t));
  }
  
  return defaultTests;
}

/**
 * Format duration in human readable format
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

// CLI setup
program
  .name('performance-test')
  .description('Run comprehensive performance tests on weather app frameworks')
  .option('-f, --frameworks <frameworks>', 'Comma-separated list of frameworks to test')
  .option('-b, --base-url <url>', 'Base URL for testing (default: http://localhost:3000)')
  .option('-o, --only <tests>', 'Only run specific tests (lighthouse,bundle,runtime)')
  .option('-s, --skip <tests>', 'Skip specific tests')
  .option('--html', 'Generate HTML report in addition to JSON')
  .option('--cleanup', 'Clean up old results after completion')
  .option('--keep-last <n>', 'Number of old results to keep when cleaning up', '5')
  .action(async (options) => {
    try {
      const frameworks = options.frameworks ? options.frameworks.split(',').map(f => f.trim()) : undefined;
      
      const result = await runPerformanceTests({
        frameworks,
        baseUrl: options.baseUrl || 'http://localhost:3000',
        only: options.only,
        skip: options.skip,
        html: options.html,
        cleanup: options.cleanup,
        keepLast: parseInt(options.keepLast)
      });
      
      console.log(`\n🎉 Performance testing completed successfully!`);
      console.log(`📊 View results: results/performance/consolidated/latest.json`);
      
      if (options.html) {
        console.log(`🌐 HTML report: results/performance/reports/performance-report-${result.runId}.html`);
      }
      
    } catch (error) {
      console.error(`💥 Performance testing failed:`, error.message);
      process.exit(1);
    }
  });

// Export for use as module
module.exports = {
  runPerformanceTests,
  runIndividualTests,
  generateFinalReport,
  getTestTypes
};

// Run CLI if called directly
if (require.main === module) {
  program.parse();
}