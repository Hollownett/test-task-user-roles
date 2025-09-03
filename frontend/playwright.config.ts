import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    trace: 'retain-on-failure', 
    video: isCI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',
  },

  webServer: [
    {
      command: 'npm run start:prod',
      cwd: '../backend',
      url: 'http://127.0.0.1:3000/health',
      timeout: 120_000,
      reuseExistingServer: true,
      env: {
        NODE_ENV: 'test',
        PORT: '3000',
        DATABASE_TYPE: 'sqlite',
        DATABASE_DATABASE: './tmp/e2e.sqlite',
        DATABASE_SYNCHRONIZE: 'true',
        DATABASE_LOGGING: 'false',
      },
    },
    {
      command: 'npm run preview -- --host --port 5173',
      cwd: '.',
      url: 'http://127.0.0.1:5173/',
      timeout: 120_000,
      reuseExistingServer: true,
      env: {
        NODE_ENV: 'test',
        VITE_API_URL: 'http://127.0.0.1:3000',
      },
    },
  ],
  projects: isCI
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],
});
