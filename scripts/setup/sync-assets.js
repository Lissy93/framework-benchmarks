#!/usr/bin/env node

/**
 * Sync Shared Assets
 * Synchronizes common assets (styles, icons, mocks) across all framework apps
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets');
const APPS_DIR = path.join(__dirname, '..', '..', 'apps');

/**
 * Get file/directory size recursively
 */
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) return 0;
  
  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      fs.readdirSync(itemPath).forEach(item => {
        calculateSize(path.join(itemPath, item));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
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

/**
 * Copy directory with file count tracking
 */
function copyDirectoryWithStats(source, target) {
  if (!fs.existsSync(source)) return { files: 0, size: 0 };
  
  const stats = { files: 0, size: 0 };
  
  function copyRecursive(src, dest) {
    const sourceStats = fs.statSync(src);
    
    if (sourceStats.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(item => {
        copyRecursive(path.join(src, item), path.join(dest, item));
      });
    } else {
      fs.copyFileSync(src, dest);
      stats.files++;
      stats.size += sourceStats.size;
    }
  }
  
  copyRecursive(source, target);
  return stats;
}

/**
 * Sync assets for a specific app
 */
function syncAppAssets(appName, appPath) {
  const appAssetsDir = path.join(appPath, 'public', 'assets');
  
  // Ensure assets directory exists
  fs.mkdirSync(appAssetsDir, { recursive: true });
  
  const syncResults = [];
  const assetTypes = [
    { name: 'icons', source: path.join(ASSETS_DIR, 'icons'), target: path.join(appAssetsDir, 'icons') },
    { name: 'styles', source: path.join(ASSETS_DIR, 'styles'), target: path.join(appAssetsDir, 'styles') },
    { name: 'mocks', source: path.join(ASSETS_DIR, 'mocks'), target: path.join(appAssetsDir, 'mocks') }
  ];
  
  for (const assetType of assetTypes) {
    if (fs.existsSync(assetType.source)) {
      const stats = copyDirectoryWithStats(assetType.source, assetType.target);
      syncResults.push({
        type: assetType.name,
        files: stats.files,
        size: stats.size
      });
    }
  }
  
  return syncResults;
}

/**
 * Main sync function
 */
async function syncAssets() {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Synchronizing shared assets across framework apps...\n');
    
    // Check if directories exist
    if (!fs.existsSync(APPS_DIR)) {
      throw new Error('Apps directory not found');
    }
    
    if (!fs.existsSync(ASSETS_DIR)) {
      throw new Error('Assets directory not found');
    }
    
    // Get all app directories
    const apps = fs.readdirSync(APPS_DIR).filter(dir => {
      const appPath = path.join(APPS_DIR, dir);
      return fs.statSync(appPath).isDirectory() && dir !== 'node_modules';
    });
    
    if (apps.length === 0) {
      throw new Error('No app directories found');
    }
    
    const allResults = [];
    
    // Sync assets for each app
    for (const app of apps) {
      const appPath = path.join(APPS_DIR, app);
      console.log(`📁 ${app}:`);
      
      const syncResults = syncAppAssets(app, appPath);
      
      let totalFiles = 0;
      let totalSize = 0;
      
      syncResults.forEach(result => {
        if (result.files > 0) {
          console.log(`   ${result.type}: ${result.files} files (${formatBytes(result.size)})`);
          totalFiles += result.files;
          totalSize += result.size;
        }
      });
      
      console.log(`   ✅ Total: ${totalFiles} files (${formatBytes(totalSize)})\n`);
      
      allResults.push({
        app,
        files: totalFiles,
        size: totalSize,
        syncResults
      });
    }
    
    const duration = Date.now() - startTime;
    const grandTotalFiles = allResults.reduce((sum, result) => sum + result.files, 0);
    const grandTotalSize = allResults.reduce((sum, result) => sum + result.size, 0);
    
    // Summary
    console.log('✅ Asset Synchronization Complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Apps processed: ${apps.length}`);
    console.log(`📄 Total files synced: ${grandTotalFiles}`);
    console.log(`💾 Total data synced: ${formatBytes(grandTotalSize)}`);
    console.log(`⏱️  Completed in: ${duration}ms`);
    console.log(`\n🎯 Apps synced: ${apps.join(', ')}\n`);
    
  } catch (error) {
    console.error('❌ Error syncing assets:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  syncAssets();
}

module.exports = { 
  syncAssets, 
  syncAppAssets, 
  formatBytes, 
  getDirectorySize 
};