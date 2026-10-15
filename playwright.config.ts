import { defineConfig } from '@playwright/test';

const basePath = process.env.BASE_PATH ?? '/';
const baseURL = `http://127.0.0.1:4173${basePath}`;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'node scripts/serve-dist.mjs', url: baseURL, reuseExistingServer: false, timeout: 15000 },
});
