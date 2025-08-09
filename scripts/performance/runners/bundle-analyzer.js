#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { saveInterimResult } = require('../utils/results-manager.js');

/**
 * Analyze bundle size and composition for a specific framework
 */
async function runBundleAnalysis(framework, runId, options = {}) {
  const startTime = Date.now();
  console.log(`📦 Running bundle analysis for ${framework}...`);
  
  try {
    const frameworkDir = path.join(__dirname, '..', '..', '..', 'apps', framework);
    
    if (!fs.existsSync(frameworkDir)) {
      throw new Error(`Framework directory not found: ${frameworkDir}`);
    }
    
    // Build the framework if it has a build process
    const buildResults = await buildFramework(framework, frameworkDir);
    
    // Analyze the built assets
    const bundleAnalysis = await analyzeBundleAssets(framework, frameworkDir);
    
    // Analyze source code complexity
    const sourceAnalysis = await analyzeSourceCode(framework, frameworkDir);
    
    const duration = Date.now() - startTime;
    console.log(`  ✅ Bundle analysis completed in ${duration}ms`);
    
    const results = {
      build: buildResults,
      bundle: bundleAnalysis,
      source: sourceAnalysis,
      duration
    };
    
    await saveInterimResult(framework, 'bundle', runId, {
      metrics: results,
      duration
    });
    
    return results;
    
  } catch (error) {
    console.error(`❌ Bundle analysis failed for ${framework}:`, error.message);
    
    await saveInterimResult(framework, 'bundle', runId, {
      error: error.message,
      duration: Date.now() - startTime,
      success: false
    });
    
    throw error;
  }
}

/**
 * Build the framework project if it has a build process
 */
async function buildFramework(framework, frameworkDir) {
  console.log(`  🔨 Building ${framework}...`);
  
  const packageJsonPath = path.join(frameworkDir, 'package.json');
  
  // Check if framework has a build process
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`  ℹ️  No package.json found for ${framework}, skipping build`);
    return { hasConfig: false, buildTime: 0 };
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const buildScript = packageJson.scripts?.build;
  
  if (!buildScript) {
    console.log(`  ℹ️  No build script found for ${framework}`);
    return { hasConfig: true, hasBuildScript: false, buildTime: 0 };
  }
  
  try {
    const buildStartTime = Date.now();
    
    // Clean any existing build
    const distDir = path.join(frameworkDir, 'dist');
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true });
    }
    
    // Run the build
    execSync('npm run build', { 
      cwd: frameworkDir, 
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120000 // 2 minute timeout
    });
    
    const buildTime = Date.now() - buildStartTime;
    console.log(`  ✅ Build completed in ${buildTime}ms`);
    
    return {
      hasConfig: true,
      hasBuildScript: true,
      buildTime,
      success: true
    };
    
  } catch (error) {
    console.warn(`  ⚠️  Build failed for ${framework}: ${error.message}`);
    return {
      hasConfig: true,
      hasBuildScript: true,
      buildTime: 0,
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyze built bundle assets
 */
async function analyzeBundleAssets(framework, frameworkDir) {
  console.log(`  📊 Analyzing bundle assets for ${framework}...`);
  
  const distDir = path.join(frameworkDir, 'dist');
  const publicDir = path.join(frameworkDir, 'public');
  
  // Look for built assets in common locations
  const assetDirs = [distDir, publicDir, frameworkDir];
  const results = {
    totalSize: 0,
    totalGzipSize: 0,
    files: [],
    breakdown: {
      javascript: { size: 0, gzipSize: 0, count: 0 },
      css: { size: 0, gzipSize: 0, count: 0 },
      html: { size: 0, gzipSize: 0, count: 0 },
      images: { size: 0, gzipSize: 0, count: 0 },
      other: { size: 0, gzipSize: 0, count: 0 }
    }
  };
  
  for (const dir of assetDirs) {
    if (fs.existsSync(dir)) {
      await analyzeDirectory(dir, results, dir);
    }
  }
  
  return results;
}

/**
 * Recursively analyze files in a directory
 */
async function analyzeDirectory(dirPath, results, rootDir) {
  // Dynamic import for gzip-size (ES module)
  const { default: gzipSizeLib } = await import('gzip-size');
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', '.git', '.cache', 'coverage'].includes(item)) {
        await analyzeDirectory(itemPath, results, rootDir);
      }
    } else if (stat.isFile()) {
      const relativePath = path.relative(rootDir, itemPath);
      const ext = path.extname(item).toLowerCase();
      const size = stat.size;
      
      // Skip very small files and temp files
      if (size < 100 || item.startsWith('.') || item.includes('.map')) {
        continue;
      }
      
      let gzipSize = 0;
      try {
        const content = fs.readFileSync(itemPath);
        gzipSize = await gzipSizeLib.sync(content);
      } catch (error) {
        // If gzip fails, just use original size
        gzipSize = size;
      }
      
      const fileInfo = {
        path: relativePath,
        size,
        gzipSize,
        type: getFileType(ext)
      };
      
      results.files.push(fileInfo);
      results.totalSize += size;
      results.totalGzipSize += gzipSize;
      
      // Add to breakdown
      const type = fileInfo.type;
      results.breakdown[type].size += size;
      results.breakdown[type].gzipSize += gzipSize;
      results.breakdown[type].count += 1;
    }
  }
}

/**
 * Categorize files by type
 */
function getFileType(ext) {
  const typeMap = {
    '.js': 'javascript',
    '.mjs': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'javascript',
    '.tsx': 'javascript',
    '.css': 'css',
    '.scss': 'css',
    '.sass': 'css',
    '.less': 'css',
    '.html': 'html',
    '.htm': 'html',
    '.png': 'images',
    '.jpg': 'images',
    '.jpeg': 'images',
    '.gif': 'images',
    '.svg': 'images',
    '.webp': 'images',
    '.ico': 'images'
  };
  
  return typeMap[ext] || 'other';
}

/**
 * Analyze source code complexity and structure
 */
async function analyzeSourceCode(framework, frameworkDir) {
  console.log(`  🔍 Analyzing source code for ${framework}...`);
  
  const srcDir = path.join(frameworkDir, 'src');
  const jsDir = path.join(frameworkDir, 'js');
  
  // Look for source files in common locations
  const sourceDirs = [srcDir, jsDir, frameworkDir];
  
  const results = {
    totalLines: 0,
    totalFiles: 0,
    breakdown: {
      javascript: { lines: 0, files: 0 },
      typescript: { lines: 0, files: 0 },
      css: { lines: 0, files: 0 },
      html: { lines: 0, files: 0 },
      other: { lines: 0, files: 0 }
    }
  };
  
  for (const dir of sourceDirs) {
    if (fs.existsSync(dir)) {
      await analyzeSourceDirectory(dir, results);
    }
  }
  
  return results;
}

/**
 * Recursively analyze source files in a directory
 */
async function analyzeSourceDirectory(dirPath, results) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Skip irrelevant directories
      if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item)) {
        await analyzeSourceDirectory(itemPath, results);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      
      // Only analyze relevant source files
      if (['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.sass', '.html', '.vue', '.svelte'].includes(ext)) {
        try {
          const content = fs.readFileSync(itemPath, 'utf8');
          const lines = content.split('\n').length;
          
          const type = getSourceType(ext);
          results.breakdown[type].lines += lines;
          results.breakdown[type].files += 1;
          results.totalLines += lines;
          results.totalFiles += 1;
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  }
}

/**
 * Categorize source files by type
 */
function getSourceType(ext) {
  const typeMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.vue': 'javascript',
    '.svelte': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.css': 'css',
    '.scss': 'css',
    '.sass': 'css',
    '.less': 'css',
    '.html': 'html',
    '.htm': 'html'
  };
  
  return typeMap[ext] || 'other';
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

module.exports = {
  runBundleAnalysis,
  buildFramework,
  analyzeBundleAssets,
  analyzeSourceCode,
  formatBytes
};