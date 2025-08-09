#!/usr/bin/env node

const { chromium } = require('playwright');
const { saveInterimResult } = require('../utils/results-manager.js');

/**
 * Run runtime performance tests for a specific framework
 */
async function runRuntimePerformanceTest(framework, runId, options = {}) {
  const startTime = Date.now();
  console.log(`⚡ Running runtime performance test for ${framework}...`);
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1350, height: 940 }
    });
    
    const page = await context.newPage();
    
    // Set up performance monitoring
    await setupPerformanceMonitoring(page);
    
    // Get the URL for the framework
    const baseUrl = options.baseUrl || 'http://localhost:3000';
    const url = getFrameworkUrl(framework, baseUrl);
    
    console.log(`  📊 Testing runtime performance: ${url}`);
    
    // Run performance tests
    const results = await runPerformanceScenarios(page, url, framework);
    
    const duration = Date.now() - startTime;
    console.log(`  ✅ Runtime performance test completed in ${duration}ms`);
    
    await saveInterimResult(framework, 'runtime', runId, {
      metrics: results,
      duration,
      url
    });
    
    return results;
    
  } catch (error) {
    console.error(`❌ Runtime performance test failed for ${framework}:`, error.message);
    
    await saveInterimResult(framework, 'runtime', runId, {
      error: error.message,
      duration: Date.now() - startTime,
      success: false
    });
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Set up performance monitoring on the page
 */
async function setupPerformanceMonitoring(page) {
  // Inject performance monitoring script
  await page.addInitScript(() => {
    window.performanceMetrics = {
      navigationStart: 0,
      domReady: 0,
      loadComplete: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      customMetrics: {},
      memorySnapshots: [],
      interactions: []
    };
    
    // Capture navigation timing
    window.addEventListener('load', () => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        window.performanceMetrics.navigationStart = nav.fetchStart;
        window.performanceMetrics.domReady = nav.domContentLoadedEventEnd - nav.fetchStart;
        window.performanceMetrics.loadComplete = nav.loadEventEnd - nav.fetchStart;
      }
      
      // Capture paint timing
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          window.performanceMetrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          window.performanceMetrics.firstContentfulPaint = entry.startTime;
        }
      });
    });
    
    // Memory monitoring
    if (performance.memory) {
      const captureMemory = () => {
        window.performanceMetrics.memorySnapshots.push({
          timestamp: Date.now(),
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        });
      };
      
      // Capture memory every 2 seconds
      setInterval(captureMemory, 2000);
      captureMemory(); // Initial snapshot
    }
    
    // Custom timing helper
    window.markPerformance = (name, value) => {
      window.performanceMetrics.customMetrics[name] = value || performance.now();
    };
    
    // Interaction tracking
    ['click', 'input', 'keydown'].forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        window.performanceMetrics.interactions.push({
          type: eventType,
          timestamp: performance.now(),
          target: e.target.tagName + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className.replace(/\s+/g, '.') : '')
        });
      });
    });
  });
}

/**
 * Run various performance test scenarios
 */
async function runPerformanceScenarios(page, url, framework) {
  const results = {
    initialLoad: null,
    searchInteraction: null,
    forecastInteraction: null,
    memoryUsage: null,
    frameworkBootstrap: null
  };
  
  // Scenario 1: Initial Page Load
  console.log('    📈 Testing initial page load...');
  results.initialLoad = await testInitialLoad(page, url);
  
  // Scenario 2: Search Interaction Performance
  console.log('    🔍 Testing search interaction...');
  results.searchInteraction = await testSearchInteraction(page);
  
  // Scenario 3: Forecast Interaction Performance
  console.log('    📊 Testing forecast interaction...');
  results.forecastInteraction = await testForecastInteraction(page);
  
  // Scenario 4: Memory Usage Analysis
  console.log('    💾 Analyzing memory usage...');
  results.memoryUsage = await analyzeMemoryUsage(page);
  
  // Scenario 5: Framework-specific bootstrap time
  console.log('    ⚡ Measuring framework bootstrap...');
  results.frameworkBootstrap = await measureFrameworkBootstrap(page, framework);
  
  return results;
}

/**
 * Test initial page load performance
 */
async function testInitialLoad(page, url) {
  const startTime = Date.now();
  
  // Navigate and wait for load
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Wait for any framework-specific initialization
  await page.waitForTimeout(2000);
  
  // Get performance metrics
  const metrics = await page.evaluate(() => window.performanceMetrics);
  
  const loadTime = Date.now() - startTime;
  
  return {
    totalLoadTime: loadTime,
    domReady: metrics.domReady || null,
    loadComplete: metrics.loadComplete || null,
    firstPaint: metrics.firstPaint || null,
    firstContentfulPaint: metrics.firstContentfulPaint || null,
    customMetrics: metrics.customMetrics
  };
}

/**
 * Test search interaction performance
 */
async function testSearchInteraction(page) {
  try {
    const searchInput = page.locator('[data-testid="search-input"]');
    const searchButton = page.locator('[data-testid="search-button"]');
    
    // Mark start of interaction
    await page.evaluate(() => window.markPerformance('searchStart'));
    
    // Type in search input
    const typeStartTime = Date.now();
    await searchInput.fill('London');
    const typeEndTime = Date.now();
    
    // Submit search
    const submitStartTime = Date.now();
    await searchButton.click();
    
    // Wait for results to appear
    await page.waitForSelector('[data-testid="current-weather"]', { timeout: 10000 });
    const submitEndTime = Date.now();
    
    await page.evaluate(() => window.markPerformance('searchEnd'));
    
    const metrics = await page.evaluate(() => window.performanceMetrics);
    
    return {
      inputResponseTime: typeEndTime - typeStartTime,
      searchResponseTime: submitEndTime - submitStartTime,
      totalInteractionTime: metrics.customMetrics.searchEnd - metrics.customMetrics.searchStart
    };
    
  } catch (error) {
    console.warn('    ⚠️  Search interaction test failed:', error.message);
    return { error: error.message };
  }
}

/**
 * Test forecast interaction performance
 */
async function testForecastInteraction(page) {
  try {
    // Wait for forecast items to be available
    await page.waitForSelector('[data-testid="forecast-item"]', { timeout: 5000 });
    
    const forecastItems = page.locator('[data-testid="forecast-item"]');
    const firstItem = forecastItems.first();
    
    // Test expanding/collapsing forecast items
    await page.evaluate(() => window.markPerformance('forecastInteractionStart'));
    
    const expandStartTime = Date.now();
    await firstItem.click();
    
    // Wait for details to expand (look for forecast details or wait a bit)
    await page.waitForTimeout(500);
    const expandEndTime = Date.now();
    
    // Collapse
    const collapseStartTime = Date.now();
    await firstItem.click();
    await page.waitForTimeout(500);
    const collapseEndTime = Date.now();
    
    await page.evaluate(() => window.markPerformance('forecastInteractionEnd'));
    
    const metrics = await page.evaluate(() => window.performanceMetrics);
    
    return {
      expandTime: expandEndTime - expandStartTime,
      collapseTime: collapseEndTime - collapseStartTime,
      totalInteractionTime: metrics.customMetrics.forecastInteractionEnd - metrics.customMetrics.forecastInteractionStart
    };
    
  } catch (error) {
    console.warn('    ⚠️  Forecast interaction test failed:', error.message);
    return { error: error.message };
  }
}

/**
 * Analyze memory usage patterns
 */
async function analyzeMemoryUsage(page) {
  try {
    const metrics = await page.evaluate(() => window.performanceMetrics);
    
    if (!metrics.memorySnapshots || metrics.memorySnapshots.length === 0) {
      return { error: 'Memory monitoring not available' };
    }
    
    const snapshots = metrics.memorySnapshots;
    const initialMemory = snapshots[0];
    const finalMemory = snapshots[snapshots.length - 1];
    
    const memoryGrowth = finalMemory.used - initialMemory.used;
    const peakMemory = Math.max(...snapshots.map(s => s.used));
    const averageMemory = snapshots.reduce((sum, s) => sum + s.used, 0) / snapshots.length;
    
    return {
      initialMemoryMB: Math.round(initialMemory.used / 1024 / 1024 * 100) / 100,
      finalMemoryMB: Math.round(finalMemory.used / 1024 / 1024 * 100) / 100,
      peakMemoryMB: Math.round(peakMemory / 1024 / 1024 * 100) / 100,
      averageMemoryMB: Math.round(averageMemory / 1024 / 1024 * 100) / 100,
      memoryGrowthMB: Math.round(memoryGrowth / 1024 / 1024 * 100) / 100,
      snapshots: snapshots.length
    };
    
  } catch (error) {
    console.warn('    ⚠️  Memory analysis failed:', error.message);
    return { error: error.message };
  }
}

/**
 * Measure framework-specific bootstrap time
 */
async function measureFrameworkBootstrap(page, framework) {
  try {
    // Get framework-specific timing information
    const timing = await page.evaluate((fw) => {
      // Try to get framework-specific performance marks
      const marks = performance.getEntriesByType('mark');
      const measures = performance.getEntriesByType('measure');
      
      // Look for framework-specific indicators
      const frameworkMarks = marks.filter(mark => 
        mark.name.includes(fw) || 
        mark.name.includes('framework') ||
        mark.name.includes('app') ||
        mark.name.includes('mount') ||
        mark.name.includes('render')
      );
      
      return {
        marks: frameworkMarks.map(m => ({ name: m.name, time: m.startTime })),
        measures: measures.map(m => ({ name: m.name, duration: m.duration })),
        domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || null
      };
    }, framework);
    
    // Estimate bootstrap time based on when interactive elements become available
    const interactiveStartTime = Date.now();
    
    try {
      await page.waitForSelector('[data-testid="search-input"]', { timeout: 5000 });
      const interactiveEndTime = Date.now();
      
      return {
        estimatedBootstrapTime: interactiveEndTime - interactiveStartTime,
        domContentLoaded: timing.domContentLoaded,
        frameworkMarks: timing.marks,
        frameworkMeasures: timing.measures
      };
    } catch (error) {
      return {
        error: 'Could not determine bootstrap time',
        domContentLoaded: timing.domContentLoaded,
        frameworkMarks: timing.marks,
        frameworkMeasures: timing.measures
      };
    }
    
  } catch (error) {
    console.warn('    ⚠️  Framework bootstrap measurement failed:', error.message);
    return { error: error.message };
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

module.exports = {
  runRuntimePerformanceTest,
  setupPerformanceMonitoring,
  runPerformanceScenarios,
  testInitialLoad,
  testSearchInteraction,
  testForecastInteraction,
  analyzeMemoryUsage,
  measureFrameworkBootstrap
};