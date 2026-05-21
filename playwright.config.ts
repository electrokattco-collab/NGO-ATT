/**
 * Playwright E2E Test Configuration
 * 
 * End-to-end testing for critical user flows
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: 'html',
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'on-first-retry',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
      ENABLE_RATE_LIMIT: 'false',
      YOCO_WEBHOOK_SECRET: 'playwright-test-webhook-secret',
      PAYFAST_MERCHANT_ID: 'pf_test_merchant',
      PAYFAST_MERCHANT_KEY: 'pf_test_key',
      PAYFAST_PASSPHRASE: 'playwright-test-passphrase',
      PAYFAST_SANDBOX_MODE: 'true',
      ENABLE_PAYMENTS: 'false',
      ENABLE_EMAILS: 'false',
      CORS_ORIGIN: 'http://localhost:3000',
    },
  },
});
