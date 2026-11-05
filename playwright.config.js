import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

// The Codex environment provides /usr/bin/chromium. Elsewhere, set CHROMIUM_PATH
// or fall back to Playwright's own managed browser.
const executablePath =
  process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: 30000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: 1440, height: 1000 },
    launchOptions: executablePath ? { executablePath, args: ['--no-sandbox'] } : {},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
});
