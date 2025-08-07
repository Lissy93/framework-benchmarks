#!/usr/bin/env node

/**
 * Initial Setup Script
 * Complete setup for a fresh clone of the weather-front project
 * 
 * This script will:
 * 1. Install root dependencies
 * 2. Install dependencies for all framework apps
 * 3. Install Playwright browsers
 * 4. Generate package scripts from frameworks.json
 * 5. Generate mock data
 * 6. Sync shared assets across all apps
 * 7. Verify the setup is working
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Execute a command and return success status
 */
async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const fullCommand = `${command} ${args.join(' ')}`;
    console.log(`🔄 Running: ${fullCommand}`);
    
    const child = spawn(command, args, {
      stdio: options.quiet ? 'pipe' : 'inherit',
      shell: true,
      cwd: options.cwd || process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Completed: ${fullCommand}`);
        resolve(true);
      } else {
        console.error(`❌ Failed: ${fullCommand} (exit code: ${code})`);
        resolve(false);
      }
    });
    
    child.on('error', (error) => {
      console.error(`❌ Command failed: ${error.message}`);
      resolve(false);
    });
  });
}

/**
 * Check if a directory exists and has a package.json
 */
function hasPackageJson(dirPath) {
  const packageJsonPath = path.join(dirPath, 'package.json');
  return fs.existsSync(packageJsonPath);
}

/**
 * Get all app directories that need dependency installation
 */
function getAppDirectories() {
  const appsDir = path.join(__dirname, '..', '..', 'apps');
  if (!fs.existsSync(appsDir)) {
    return [];
  }
  
  return fs.readdirSync(appsDir)
    .map(dir => path.join(appsDir, dir))
    .filter(dir => {
      const isDirectory = fs.statSync(dir).isDirectory();
      const hasPackage = hasPackageJson(dir);
      return isDirectory && hasPackage;
    });
}

/**
 * Detect the package manager to use
 */
function detectPackageManager() {
  // Check for yarn.lock or package-lock.json to determine preferred manager
  const rootDir = path.join(__dirname, '..', '..');
  
  if (fs.existsSync(path.join(rootDir, 'yarn.lock'))) {
    return 'yarn';
  } else if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) {
    return 'npm';
  }
  
  // Default to npm
  return 'npm';
}

/**
 * Check if Node.js version is sufficient
 */
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  console.log(`📋 Node.js version: ${nodeVersion}`);
  
  if (majorVersion < 16) {
    console.warn('⚠️  Warning: Node.js 16+ is recommended for this project');
    return false;
  }
  
  console.log('✅ Node.js version is compatible');
  return true;
}

/**
 * Display system information
 */
function displaySystemInfo() {
  console.log('\n📊 System Information:');
  console.log(`   OS: ${os.type()} ${os.release()}`);
  console.log(`   Architecture: ${os.arch()}`);
  console.log(`   Node.js: ${process.version}`);
  console.log(`   Working Directory: ${process.cwd()}`);
}

/**
 * Main setup function
 */
async function initialSetup() {
  const startTime = Date.now();
  let totalSteps = 0;
  let completedSteps = 0;
  
  try {
    console.log('🚀 Starting initial setup for Weather Front project...\n');
    
    displaySystemInfo();
    
    // Check Node.js version
    if (!checkNodeVersion()) {
      console.log('\n⚠️  Continuing with setup, but some issues may occur with older Node.js versions\n');
    }
    
    const packageManager = detectPackageManager();
    console.log(`📦 Using package manager: ${packageManager}\n`);
    
    // Step 1: Install root dependencies
    totalSteps++;
    console.log('\n🔽 Step 1: Installing root dependencies...');
    console.log('─'.repeat(50));
    
    const rootInstallSuccess = await runCommand(packageManager, ['install']);
    if (rootInstallSuccess) {
      completedSteps++;
      console.log('✅ Root dependencies installed successfully');
    } else {
      throw new Error('Failed to install root dependencies');
    }
    
    // Step 2: Install Playwright browsers
    totalSteps++;
    console.log('\n🎭 Step 2: Installing Playwright browsers...');
    console.log('─'.repeat(50));
    
    const playwrightSuccess = await runCommand('npx', ['playwright', 'install']);
    if (playwrightSuccess) {
      completedSteps++;
      console.log('✅ Playwright browsers installed successfully');
    } else {
      console.warn('⚠️  Playwright browser installation failed, but continuing...');
    }
    
    // Step 3: Install app dependencies
    totalSteps++;
    console.log('\n📱 Step 3: Installing app dependencies...');
    console.log('─'.repeat(50));
    
    const appDirs = getAppDirectories();
    console.log(`Found ${appDirs.length} apps with package.json files`);
    
    let appsInstalled = 0;
    for (const appDir of appDirs) {
      const appName = path.basename(appDir);
      console.log(`\n📁 Installing dependencies for ${appName}...`);
      
      const appInstallSuccess = await runCommand(packageManager, ['install'], { cwd: appDir });
      if (appInstallSuccess) {
        appsInstalled++;
        console.log(`✅ ${appName} dependencies installed`);
      } else {
        console.warn(`⚠️  Failed to install dependencies for ${appName}`);
      }
    }
    
    if (appsInstalled > 0) {
      completedSteps++;
      console.log(`\n✅ Installed dependencies for ${appsInstalled}/${appDirs.length} apps`);
    }
    
    // Step 4: Generate package scripts
    totalSteps++;
    console.log('\n⚙️  Step 4: Generating package scripts...');
    console.log('─'.repeat(50));
    
    const generateScriptsSuccess = await runCommand('node', ['scripts/setup/generate-scripts.js']);
    if (generateScriptsSuccess) {
      completedSteps++;
      console.log('✅ Package scripts generated successfully');
    } else {
      console.warn('⚠️  Script generation failed, but continuing...');
    }
    
    // Step 5: Generate mock data
    totalSteps++;
    console.log('\n📄 Step 5: Generating mock data...');
    console.log('─'.repeat(50));
    
    const generateMocksSuccess = await runCommand('node', ['scripts/setup/generate-mocks.js']);
    if (generateMocksSuccess) {
      completedSteps++;
      console.log('✅ Mock data generated successfully');
    } else {
      console.warn('⚠️  Mock data generation failed, but continuing...');
    }
    
    // Step 6: Sync shared assets
    totalSteps++;
    console.log('\n🔄 Step 6: Syncing shared assets...');
    console.log('─'.repeat(50));
    
    const syncAssetsSuccess = await runCommand('node', ['scripts/setup/sync-assets.js']);
    if (syncAssetsSuccess) {
      completedSteps++;
      console.log('✅ Assets synced successfully');
    } else {
      console.warn('⚠️  Asset syncing failed, but continuing...');
    }
    
    // Step 7: Verify setup
    totalSteps++;
    console.log('\n🔍 Step 7: Verifying setup...');
    console.log('─'.repeat(50));
    
    // Check if key files exist
    const keyPaths = [
      'assets/mocks/weather-data.json',
      'apps/react/public/styles/base.css',
      'apps/react/node_modules',
      'node_modules/@playwright/test'
    ];
    
    let verificationsPassed = 0;
    for (const keyPath of keyPaths) {
      const fullPath = path.join(process.cwd(), keyPath);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${keyPath} exists`);
        verificationsPassed++;
      } else {
        console.log(`❌ ${keyPath} missing`);
      }
    }
    
    if (verificationsPassed === keyPaths.length) {
      completedSteps++;
      console.log('✅ Setup verification passed');
    }
    
    const duration = Date.now() - startTime;
    const successRate = (completedSteps / totalSteps * 100).toFixed(1);
    
    // Final summary
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 INITIAL SETUP COMPLETE');
    console.log('═'.repeat(60));
    console.log(`⏱️  Total time: ${Math.round(duration / 1000)}s`);
    console.log(`📊 Success rate: ${successRate}% (${completedSteps}/${totalSteps} steps)`);
    console.log(`📦 Package manager used: ${packageManager}`);
    console.log(`📱 Apps with dependencies: ${appsInstalled}/${appDirs.length}`);
    
    if (completedSteps === totalSteps) {
      console.log('\n🎊 Perfect! Your Weather Front project is ready to go!');
      console.log('\n🚀 Next steps:');
      console.log('   • Run `npm test` to execute all tests');
      console.log('   • Run `npm run dev:react` to start the React app');
      console.log('   • Run `npm run dev:vue` to start the Vue app');
      console.log('   • See package.json for all available commands');
    } else if (completedSteps >= totalSteps * 0.7) {
      console.log('\n✅ Setup mostly successful! Some optional steps failed but the project should work.');
      console.log('   Check the warnings above and resolve any issues as needed.');
    } else {
      console.log('\n⚠️  Setup completed with several issues. Please review the errors above.');
      process.exit(1);
    }
    
    console.log('\n📚 Documentation: https://github.com/Lissy93/weather-front');
    console.log('🐛 Issues: https://github.com/Lissy93/weather-front/issues');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   • Ensure Node.js 16+ is installed');
    console.log('   • Check your internet connection');
    console.log('   • Try running with --verbose for more details');
    console.log('   • Clear npm cache: npm cache clean --force');
    process.exit(1);
  }
}

// Allow verbose mode
const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

if (require.main === module) {
  initialSetup().catch(console.error);
}

module.exports = { initialSetup, runCommand };