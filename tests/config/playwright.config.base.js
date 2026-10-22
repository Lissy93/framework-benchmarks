const path = require('path');
const { defineConfig, devices } = require('@playwright/test');
const { frameworks } = require('../../frameworks.json');

// Every framework's dev server runs on port 3000 (see devCommand in frameworks.json)
const BASE_URL = 'http://localhost:3000/';

function createConfig(framework) {
  if (!frameworks.some(fw => fw.id === framework)) {
    throw new Error(`Unknown framework: ${framework}`);
  }

  return defineConfig({
    testDir: path.join(__dirname, '..'),
    testIgnore: ['**/unit/**', '**/test-helpers.js'],
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 2 : 4,
    reporter: [['html'], ['list']],
    timeout: 30000,
    expect: { timeout: 5000 },
    use: {
      baseURL: `${BASE_URL}?mock=true`,
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure'
    },
    projects: [{
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--no-sandbox',
            '--disable-web-security'
          ]
        }
      }
    }],
    webServer: {
      command: `npm run dev:${framework}`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000
    }
  });
}

module.exports = { createConfig };
