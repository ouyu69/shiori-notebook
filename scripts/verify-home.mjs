import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const origin = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4321';
const out = 'docs/acceptance/stage-1';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'chrome' });
try {
  for (const width of [390, 768, 1440]) {
    for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      if (process.argv[2]) {
        await page.goto(pathToFileURL(process.argv[2]).href);
        await page.screenshot({ path: out + '/reference-' + width + '-' + colorScheme + '.png', fullPage: true });
        if (width === 1440 && colorScheme === 'light') {
          for (const route of ['articles', 'archive', 'about', 'post/css']) {
            await page.goto(pathToFileURL(process.argv[2]).href + '#/' + route);
            await page.screenshot({ path: out + '/reference-' + route.replace('/', '-') + '.png', fullPage: true });
          }
        }
      }
      await page.goto(origin);
      await page.waitForLoadState('networkidle');
      assert.equal(await page.locator('html').getAttribute('data-theme'), colorScheme);
      assert.equal(await page.locator('.home-character').evaluate(img => img.currentSrc.endsWith('/sitting-character.png') && img.naturalWidth > 0), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: out + '/home-' + width + '-' + colorScheme + '.png', fullPage: true });
      await page.getByRole('button', { name: '切换夜间模式' }).click();
      await page.reload();
      assert.notEqual(await page.locator('html').getAttribute('data-theme'), colorScheme);
      await page.locator('.term-status-link').click();
      await page.waitForURL('**/articles/');
      assert.equal(await page.locator('h1').textContent(), '文章');
      assert.deepEqual(errors, []);
      await context.close();
    }
  }
  const page = await browser.newPage();
  await page.goto(origin);
  await page.waitForFunction(() => sessionStorage.getItem('kanlai-greeted') === '1');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/articles/');
  await page.goto(origin);
  assert.equal(await page.locator('.is-pending').count(), 0);
  assert.equal(await page.locator('.home-character').evaluate(img => img.currentSrc.endsWith('breathing.webp')), true);
  for (const route of ['/archive/', '/about/']) assert.equal((await page.goto(origin + route)).status(), 200);
  console.log('PASS: six viewport/theme combinations, character selection, theme persistence, navigation and session replay.');
} finally { await browser.close(); }
