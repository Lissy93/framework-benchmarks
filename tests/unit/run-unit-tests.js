/**
 * Unit Test Runner
 * Runs all unit tests and reports results
 */

const fs = require('fs');
const path = require('path');

// Check if we need to install jsdom
const checkDependencies = () => {
  try {
    require('jsdom');
  } catch (error) {
    console.log('📦 Installing jsdom for DOM testing...');
    const { execSync } = require('child_process');
    execSync('npm install jsdom --save-dev', { stdio: 'inherit' });
    console.log('✅ jsdom installed successfully\n');
  }
};

const runAllTests = async () => {
  console.log('🧪 Weather App Unit Test Suite\n');
  console.log('========================================\n');
  
  try {
    checkDependencies();
    
    // Run weather service tests
    console.log('🔧 Testing Weather Service...');
    const weatherServiceTest = require('./weather-service.test.js');
    
    // Run weather app tests  
    console.log('\n🎨 Testing Weather App Logic...');
    const weatherAppTest = require('./weather-app.test.js');
    
    console.log('\n✅ All unit tests completed successfully!');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Unit tests failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };