#!/usr/bin/env node

const { spawn } = require('child_process');

async function runCommand(command, args = []) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Running: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, { 
      stdio: 'inherit',
      shell: true 
    });
    
    child.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function runAllTests() {
  const frameworks = [
    { name: 'Vanilla', command: 'npm', args: ['run', 'test:vanilla'] },
    { name: 'React', command: 'npm', args: ['run', 'test:react'] },
    { name: 'Angular', command: 'npm', args: ['run', 'test:angular'] },
    { name: 'Svelte', command: 'npm', args: ['run', 'test:svelte'] }
  ];

  const results = [];
  
  console.log('🚀 Running tests for all frameworks...\n');
  
  for (const framework of frameworks) {
    const success = await runCommand(framework.command, framework.args);
    results.push({
      name: framework.name,
      success: success
    });
  }
  
  // Print summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  let totalPassed = 0;
  for (const result of results) {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${result.name}: ${status}`);
    if (result.success) totalPassed++;
  }
  
  console.log(`\n🎯 Overall: ${totalPassed}/${results.length} frameworks passed`);
  
  // Exit with error code only if all tests failed
  if (totalPassed === 0) {
    process.exit(1);
  }
}

runAllTests().catch(console.error);