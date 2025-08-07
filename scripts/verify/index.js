#!/usr/bin/env node

const { color } = require('../utils');
const { runChecks } = require('./check');
const { runAllTests } = require('./test');
const { runAllLinting } = require('./lint');

async function runAllVerifications() {
  // 1. Validate the project is setup correctly
  await runChecks();
  // 2. Run the test suite
  await runAllTests();
  // 3. Run the linting checks
  await runAllLinting();
}

if (require.main === module) {
  runAllVerifications();
}

module.exports = { runAllVerifications };
