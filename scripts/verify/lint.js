#!/usr/bin/env node

const { color, formatDuration, runCommand, loadFrameworks, parseLintOutput } = require('../utils');

async function runAllLinting() {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Starting framework lint execution...\n');
    
    const frameworks = loadFrameworks().filter(fw => fw.lintFiles?.length > 0);
    if (frameworks.length === 0) throw new Error('No frameworks with linting configuration found');
    
    const results = [];
    
    // Run linting for each framework
    for (const framework of frameworks) {
      const frameworkStartTime = Date.now();
      
      console.log(`\n${framework.icon} Linting ${framework.name}...`);
      console.log('─'.repeat(50));
      
      const result = await runCommand('npm', ['run', `lint:${framework.id}`], { captureOutput: true });
      const duration = Date.now() - frameworkStartTime;
      const lintStats = parseLintOutput(result.output + result.errors);
      
      const status = result.success ? color('✅ CLEAN', 'green') : 
        lintStats.errors > 0 ? color(`❌ ${lintStats.errors} ERRORS`, 'red') : 
        color(`⚠️ ${lintStats.warnings} WARNINGS`, 'yellow');
      
      console.log(`${framework.name}: ${status} (${formatDuration(duration)})`);
      
      results.push({
        name: framework.name,
        icon: framework.icon,
        success: result.success,
        duration,
        errors: lintStats.errors,
        warnings: lintStats.warnings
      });
    }
    
    // Generate summary
    const totalDuration = Date.now() - startTime;
    const clean = results.filter(r => r.success);
    const withIssues = results.filter(r => !r.success);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0);
    const successRate = (clean.length / results.length * 100).toFixed(1);
    
    const cleanList = clean.map(r => `   ${r.icon} ${r.name} (${formatDuration(r.duration)})`).join('\n');
    const issuesList = withIssues.map(r => {
      const issues = [];
      if (r.errors > 0) issues.push(`${r.errors} errors`);
      if (r.warnings > 0) issues.push(`${r.warnings} warnings`);
      return `   ${r.icon} ${r.name} - ${issues.join(', ')} (${formatDuration(r.duration)})`;
    }).join('\n');
    
    const summary = `
═══════════════════════════════════════════════════════════
📊 LINTING EXECUTION SUMMARY
═══════════════════════════════════════════════════════════

⏱️  Total execution time: ${formatDuration(totalDuration)}
📋 Frameworks linted: ${results.length}
✅ Clean: ${clean.length}
⚠️  With issues: ${withIssues.length}
🚨 Total errors: ${totalErrors}
⚠️  Total warnings: ${totalWarnings}

${clean.length > 0 ? `🎉 CLEAN FRAMEWORKS:\n${cleanList}\n` : ''}
${withIssues.length > 0 ? `🔧 FRAMEWORKS WITH ISSUES:\n${issuesList}\n` : ''}
🎯 Clean Rate: ${successRate}% (${clean.length}/${results.length})`;
    
    console.log(summary);
    
    if (totalErrors > 0) {
      console.log(color(`\n❌ Found ${totalErrors} errors that must be fixed`, 'red'));
      process.exit(1);
    } else if (totalWarnings > 0) {
      console.log(color(`\n⚠️  Found ${totalWarnings} warnings - consider addressing them`, 'yellow'));
    } else {
      console.log(color('\n✅ All lint checks passed', 'green'));
    }
    
  } catch (error) {
    console.error(color('❌ Error running lint:', 'red'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllLinting();
}

module.exports = { runAllLinting, runCommand, formatDuration, parseLintOutput };
