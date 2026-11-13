import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

// Both servers use tests/fixtures/posts, one in dev mode and one serving its production build.
const [dev, production] = process.argv.slice(2);
if (!dev || !production) throw new Error('Usage: node scripts/verify-posts.mjs <dev-url> <production-url>');
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const [base, drafts] of [[dev, true], [production, false]]) {
    await page.goto(base + '/articles/');
    assert.equal(await page.locator('.post-list li').count(), drafts ? 2 : 1);
    await page.getByRole('link', { name: '生活', exact: true }).click();
    assert.equal(await page.locator('.post-list li').count(), drafts ? 1 : 0);
    if (drafts) {
      await page.locator('.post-row').click();
      assert.match(await page.locator('.post-meta').innerText(), /草稿/);
      assert.equal(await page.locator('.adjacent a').count(), 1);
    }
    await page.goto(base + '/archive/');
    await page.getByRole('link', { name: /让 Markdown 笔记/ }).click();
    await page.reload();
    assert.match(await page.locator('h1').innerText(), /稳定的地址/);
    await page.locator('.prose img').evaluate(img => img.decode());
    assert.equal(await page.locator('.prose img').evaluate(img => img.naturalWidth > 0), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  assert.equal((await page.goto(production + '/posts/quiet-evening/')).status(), 404);
  console.log('PASS: dev and production visibility, category links, archive, mobile image, direct refresh and draft 404.');
} finally { await browser.close(); }
