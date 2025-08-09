#!/usr/bin/env node

const { saveInterimResult } = require('../utils/results-manager.js');

/**
 * Lighthouse performance test configuration
 */
const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'interactive',
      'total-blocking-time',
      'cumulative-layout-shift',
      'server-response-time',
      'network-server-latency',
      'mainthread-work-breakdown',
      'bootup-time',
      'uses-optimized-images',
      'uses-text-compression',
      'unused-javascript',
      'legacy-javascript',
      'total-byte-weight',
      'dom-size'
    ],
    throttling: {
      rttMs: 40,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
};

/**
 * Run Lighthouse performance test for a specific framework
 */
async function runLighthouseTest(framework, runId, options = {}) {
  const startTime = Date.now();
  console.log(`🔍 Running Lighthouse test for ${framework}...`);
  
  let chrome;
  try {
    // Dynamic imports for ES modules
    const { default: lighthouse } = await import('lighthouse');
    const chromeLauncher = await import('chrome-launcher');
    
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--no-default-browser-check',
        '--disable-default-apps'
      ]
    });

    // Determine the correct URL for the framework
    const baseUrl = options.baseUrl || 'http://localhost:3000';
    const url = getFrameworkUrl(framework, baseUrl);
    
    console.log(`  📊 Testing URL: ${url}`);
    
    // Run Lighthouse
    const result = await lighthouse(url, {
      port: chrome.port,
      ...options.lighthouseOptions
    }, LIGHTHOUSE_CONFIG);

    const duration = Date.now() - startTime;
    console.log(`  ✅ Lighthouse test completed in ${duration}ms`);

    // Process and save results
    const processedResults = processLighthouseResults(result);
    await saveInterimResult(framework, 'lighthouse', runId, {
      metrics: processedResults,
      duration,
      url,
      rawData: {
        lhr: result.lhr,
        artifacts: result.artifacts ? 'included' : 'not-included'
      }
    });

    return processedResults;

  } catch (error) {
    console.error(`❌ Lighthouse test failed for ${framework}:`, error.message);
    
    await saveInterimResult(framework, 'lighthouse', runId, {
      error: error.message,
      duration: Date.now() - startTime,
      success: false
    });
    
    throw error;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

/**
 * Get the correct URL for testing a specific framework
 */
function getFrameworkUrl(framework, baseUrl) {
  // Most frameworks are served directly from their own dev servers on different ports
  // But for performance testing, we assume they're all served from baseUrl with mock=true
  // The only exceptions are vanilla and alpine which don't have dev servers and are served as static files
  const staticFrameworks = ['vanilla', 'alpine'];
  
  if (staticFrameworks.includes(framework)) {
    return `${baseUrl}/apps/${framework}?mock=true`;
  } else {
    // All other frameworks (react, vue, svelte, angular, preact, solid, qwik, jquery, lit, vanjs) are served directly
    return `${baseUrl}?mock=true`;
  }
}

/**
 * Process raw Lighthouse results into our standardized format
 */
function processLighthouseResults(result) {
  const lhr = result.lhr;
  const audits = lhr.audits;
  
  return {
    // Overall score
    performance: Math.round(lhr.categories.performance.score * 100),
    
    // Core Web Vitals
    lcp: audits['largest-contentful-paint']?.numericValue || null,
    fcp: audits['first-contentful-paint']?.numericValue || null,
    cls: audits['cumulative-layout-shift']?.numericValue || null,
    fid: null, // FID is not measurable in Lighthouse, use TBT instead
    tbt: audits['total-blocking-time']?.numericValue || null,
    
    // Additional performance metrics
    fmp: audits['first-meaningful-paint']?.numericValue || null,
    tti: audits['interactive']?.numericValue || null,
    speedIndex: audits['speed-index']?.numericValue || null,
    
    // Network and resource metrics
    serverResponseTime: audits['server-response-time']?.numericValue || null,
    totalByteWeight: audits['total-byte-weight']?.numericValue || null,
    domSize: audits['dom-size']?.numericValue || null,
    
    // JavaScript performance
    bootupTime: audits['bootup-time']?.numericValue || null,
    mainThreadWorkBreakdown: audits['mainthread-work-breakdown']?.numericValue || null,
    unusedJavaScript: audits['unused-javascript']?.details?.overallSavingsBytes || null,
    legacyJavaScript: audits['legacy-javascript']?.details?.overallSavingsBytes || null,
    
    // Resource optimization
    usesOptimizedImages: audits['uses-optimized-images']?.score === 1,
    usesTextCompression: audits['uses-text-compression']?.score === 1,
    
    // Detailed breakdown
    breakdown: {
      categories: lhr.categories,
      timing: lhr.timing,
      userAgent: lhr.environment?.userAgent
    }
  };
}

/**
 * Run multiple Lighthouse tests and return averaged results
 */
async function runMultipleLighthouseTests(framework, runId, runs = 3, options = {}) {
  console.log(`🔄 Running ${runs} Lighthouse tests for ${framework} (for averaging)...`);
  
  const results = [];
  for (let i = 0; i < runs; i++) {
    console.log(`  Run ${i + 1}/${runs}`);
    try {
      const result = await runLighthouseTest(framework, `${runId}-${i}`, options);
      results.push(result);
      
      // Wait between runs to avoid interference
      if (i < runs - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.warn(`  ⚠️  Run ${i + 1} failed, continuing...`);
    }
  }
  
  if (results.length === 0) {
    throw new Error(`All ${runs} Lighthouse tests failed for ${framework}`);
  }
  
  // Calculate averages
  const averaged = calculateAverageResults(results);
  
  // Save averaged results
  await saveInterimResult(framework, 'lighthouse', runId, {
    metrics: averaged,
    runsCompleted: results.length,
    runsAttempted: runs
  });
  
  return averaged;
}

/**
 * Calculate average results from multiple Lighthouse runs
 */
function calculateAverageResults(results) {
  if (results.length === 0) return null;
  if (results.length === 1) return results[0];
  
  const averaged = {};
  const sampleResult = results[0];
  
  // Average numeric values
  Object.keys(sampleResult).forEach(key => {
    if (typeof sampleResult[key] === 'number') {
      const values = results.map(r => r[key]).filter(v => v !== null);
      averaged[key] = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
    } else if (typeof sampleResult[key] === 'boolean') {
      // For booleans, use the most common value
      const trueCount = results.filter(r => r[key] === true).length;
      averaged[key] = trueCount > results.length / 2;
    } else {
      // For complex objects, take the first one
      averaged[key] = sampleResult[key];
    }
  });
  
  return averaged;
}

module.exports = {
  runLighthouseTest,
  runMultipleLighthouseTests,
  processLighthouseResults,
  getFrameworkUrl,
  LIGHTHOUSE_CONFIG
};