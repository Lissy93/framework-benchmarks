#!/usr/bin/env node

const { color, formatDuration, runCommand, loadFrameworks } = require('../utils');

async function runAllTests() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting framework test suite execution...\n');
    
    const frameworks = loadFrameworks();
    if (frameworks.length === 0) throw new Error('No frameworks found in configuration');
    
    const results = [];
    
    // Run tests for each framework
    for (const framework of frameworks) {
      const frameworkStartTime = Date.now();
      
      console.log(`\n${framework.icon} Testing ${framework.name}...`);
      console.log('─'.repeat(50));
      
      const result = await runCommand('npm', ['run', `test:${framework.id}`], { captureOutput: false });
      const duration = Date.now() - frameworkStartTime;
      
      const status = result.success ? color('✅ PASSED', 'green') : color('❌ FAILED', 'red');
      console.log(`${framework.name}: ${status} (${formatDuration(duration)})`);
      
      results.push({
        name: framework.name,
        icon: framework.icon,
        success: result.success,
        duration
      });
    }
    
    // Generate summary
    const totalDuration = Date.now() - startTime;
    const passed = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const successRate = (passed.length / results.length * 100).toFixed(1);
    
    const passedList = passed.map(r => `   ${r.icon} ${r.name} (${formatDuration(r.duration)})`).join('\n');
    const failedList = failed.map(r => `   ${r.icon} ${r.name} (${formatDuration(r.duration)})`).join('\n');
    
    let summary = `
═══════════════════════════════════════════════════════════
📊 TEST EXECUTION SUMMARY
═══════════════════════════════════════════════════════════

⏱️  Total execution time: ${formatDuration(totalDuration)}
📋 Frameworks tested: ${results.length}
✅ Passed: ${passed.length}
❌ Failed: ${failed.length}
🎯 Success Rate: ${successRate}% (${passed.length}/${results.length})
`;

    if (passed.length > 0) {
      summary += `\n🎉 PASSING FRAMEWORKS:\n${passedList}\n`;
    }
    if (failed.length > 0) {
      summary += `\n💥 FAILING FRAMEWORKS:\n${failedList}\n`;
    }
    console.log(summary);
    
    if (failed.length === results.length) {
      console.log(color('\n❌ All tests failed - this may indicate a configuration issue', 'red'));
      process.exit(1);
    } else if (failed.length > 0) {
      console.log(color('\n⚠️  Some tests failed - check output above for details', 'yellow'));
      process.exit(1);
    } else {
      console.log(color('\n✅ All tests passed', 'green'));
      console.log(color('\nToday is a wonderful day to be alive 😊', 'magenta'));
    }
    
  } catch (error) {
    console.error(color('❌ Error running tests:', 'red'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, runCommand, formatDuration };
