import { defineConfig } from '@playwright/test';

const baseURL = process.env.READING_PREVIEW_URL ?? 'http://127.0.0.1:4353';
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results/playwright',
  use: { baseURL, channel: process.env.BROWSER_CHANNEL ?? 'chrome' },
  webServer: process.env.READING_PREVIEW_URL ? undefined : {
    command: 'node node_modules/astro/bin/astro.mjs build --outDir test-results/reading-site && node node_modules/astro/bin/astro.mjs preview --ignore-lock --outDir test-results/reading-site --host 127.0.0.1 --port 4353',
    url: baseURL, timeout: 90000,
    env: { ASTRO_TELEMETRY_DISABLED: '1', NOTEBOOK_POSTS_DIR: './tests/fixtures/posts', NOTEBOOK_CACHE_DIR: './test-results/reading-cache' },
  },
});
