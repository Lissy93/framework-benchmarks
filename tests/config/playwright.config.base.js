const { defineConfig, devices } = require('@playwright/test');

function createConfig(framework) {
  const configs = {
    vanilla: {
      baseURL: 'http://localhost:3000/apps/vanilla?mock=true',
      webServer: {
        command: 'npm run dev:vanilla',
        url: 'http://localhost:3000?mock=true',
      }
    },
    react: {
      baseURL: 'http://localhost:3000?mock=true',
      webServer: {
        command: 'npm run dev:react',
        url: 'http://localhost:3000?mock=true',
      }
    },
    angular: {
      baseURL: 'http://localhost:3000?mock=true',
      webServer: {
        command: 'npm run dev:angular',
        url: 'http://localhost:3000?mock=true',
      }
    },
    svelte: {
      baseURL: 'http://localhost:3000?mock=true',
      webServer: {
        command: 'npm run dev:svelte',
        url: 'http://localhost:3000?mock=true',
      }
    },
    preact: {
      baseURL: 'http://localhost:3000?mock=true',
      webServer: {
        command: 'npm run dev:preact',
        url: 'http://localhost:3000?mock=true',
      }
    },
    solid: {
      baseURL: 'http://localhost:3000?mock=true',
      webServer: {
        command: 'npm run dev:solid',
        url: 'http://localhost:3000?mock=true',
      }
    },
    qwik: {
      baseURL: 'http://localhost:3000?mock=true',
      webServer: {
        command: 'npm run dev:qwik',
        url: 'http://localhost:3000?mock=true',
      }
    }
  };

  const config = configs[framework];
  if (!config) {
    throw new Error(`Unknown framework: ${framework}`);
  }

  return defineConfig({
    testDir: '../',
    testIgnore: ['**/unit/**', '**/test-helpers.js'],
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
      baseURL: config.baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
    },

    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      }
    ],

    webServer: {
      ...config.webServer,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
    },
  });
}

module.exports = { createConfig };