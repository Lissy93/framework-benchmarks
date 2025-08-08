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
    },
    vue: {
      baseURL: 'http://localhost:3000?mock=true',
      webServer: {
        command: 'npm run dev:vue',
        url: 'http://localhost:3000?mock=true',
      }
    },
    jquery: {
      baseURL: 'http://localhost:3000?mock=true',
      webServer: {
        command: 'npm run dev:jquery',
        url: 'http://localhost:3000?mock=true',
      }
    },
    alpine: {
      baseURL: 'http://localhost:3000/apps/alpine?mock=true',
      webServer: {
        command: 'npm run dev:alpine',
        url: 'http://localhost:3000?mock=true',
      }
    },
    lit: {
      baseURL: 'http://localhost:3000?mock=true',
      webServer: {
        command: 'npm run dev:lit',
        url: 'http://localhost:3000?mock=true',
      }
    },
    vanjs: {
      baseURL: 'http://localhost:3000?mock=true',
      webServer: {
        command: 'npm run dev:vanjs',
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
    retries: process.env.CI ? 2 : 1, // Reasonable retries
    workers: process.env.CI ? 2 : 4, // Better parallelization
    reporter: [['html'], ['list']], // Cleaner terminal output
    timeout: 30000, // Reasonable global timeout
    expect: {
      timeout: 5000, // Reasonable expect timeout
    },
    use: {
      baseURL: config.baseURL,
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure', 
      video: 'retain-on-failure',
      actionTimeout: 0, // Use default
      navigationTimeout: 0, // Use default
    },

    projects: [
      {
        name: 'chromium',
        use: { 
          ...devices['Desktop Chrome'],
          // Additional browser options for stability
          launchOptions: {
            args: [
              '--disable-dev-shm-usage',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding',
              '--no-sandbox',
              '--disable-web-security'
            ],
          },
        },
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
