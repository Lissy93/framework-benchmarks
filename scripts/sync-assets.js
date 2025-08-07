#!/usr/bin/env node

/**
 * Script to sync shared assets across all framework apps
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const APPS_DIR = path.join(__dirname, '..', 'apps');

function syncAssets() {
  console.log('Syncing shared assets across all apps...');
  
  if (!fs.existsSync(APPS_DIR)) {
    console.log('No apps directory found, skipping sync');
    return;
  }

  const apps = fs.readdirSync(APPS_DIR).filter(dir => 
    fs.statSync(path.join(APPS_DIR, dir)).isDirectory()
  );

  apps.forEach(app => {
    const appAssetsDir = path.join(APPS_DIR, app, 'public', 'assets');
    
    // Create public/assets directory if it doesn't exist
    fs.mkdirSync(appAssetsDir, { recursive: true });
    
    // Copy icons and styles
    const sourceIcons = path.join(ASSETS_DIR, 'icons');
    const sourceStyles = path.join(ASSETS_DIR, 'styles');
    const sourceMocks = path.join(ASSETS_DIR, 'mocks');
    const targetIcons = path.join(appAssetsDir, 'icons');
    const targetStyles = path.join(appAssetsDir, 'styles');
    const targetMocks = path.join(appAssetsDir, 'mocks');

    if (fs.existsSync(sourceIcons)) {
      fs.cpSync(sourceIcons, targetIcons, { recursive: true });
    }
    if (fs.existsSync(sourceStyles)) {
      fs.cpSync(sourceStyles, targetStyles, { recursive: true });
    }
    if (fs.existsSync(sourceMocks)) {
      fs.cpSync(sourceMocks, targetMocks, { recursive: true });
    }

    console.log(`✓ Synced assets for ${app}`);
  });

  console.log('Asset sync complete');
}

if (require.main === module) {
  syncAssets();
}

module.exports = { syncAssets };
