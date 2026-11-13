import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const origin = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4321';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'chrome' });
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await page.goto(origin);
    const lines = page.locator('[data-dialogue]');
    const rows = new Set();
    const positions = new Set();
    const thinkingRows = new Set();
    let wrapped = false;
    for (let step = 0; step < 170; step++) {
      await page.clock.runFor(100);
      const sample = await lines.evaluateAll(lines => {
        const active = lines.findLast(line => !line.classList.contains('is-pending'));
        if (!active) return null;
        const text = active.querySelector('.type-live');
        const prompt = document.querySelector('.term-chat > :last-child');
        if (active === lines.at(-1) && text.textContent === active.querySelector('.type-ghost').textContent &&
            prompt.querySelector('.type-caret') && !prompt.classList.contains('is-pending')) return { done: true };
        const caret = text.querySelector('.type-caret');
        const rect = caret?.getBoundingClientRect();
        const thinking = active.querySelector('.thinking-dots')?.getBoundingClientRect().width > 0;
        return { row: lines.indexOf(active), thinking, length: text.textContent.length, x: rect?.x, y: rect?.y,
          lineTop: text.getBoundingClientRect().top, count: document.querySelectorAll('.type-caret').length };
      });
      if (sample?.done) break;
      if (sample?.thinking) {
        assert.equal(sample.length, 0, 'reply text should wait until thinking finishes');
        thinkingRows.add(sample.row);
      }
      if (!sample || !sample.length) continue;
      if ([1, 3].includes(sample.row)) assert.ok(thinkingRows.has(sample.row), 'each kanlai reply starts with thinking dots');
      assert.equal(sample.count, 1);
      assert.ok(Number.isFinite(sample.x), 'typing caret should follow the active text');
      rows.add(sample.row);
      if (sample.row === 0) positions.add(sample.x);
      if (sample.y - sample.lineTop > 20) wrapped = true;
    }
    assert.equal(rows.size, 4);
    assert.deepEqual([...thinkingRows], [1, 3]);
    assert.ok(positions.size > 1, 'caret should advance as characters print');
    if (width === 390) assert.ok(wrapped, 'caret should follow text onto the wrapped line');
    assert.equal(await page.locator('.term-chat > :last-child .type-caret').count(), 1);
    await page.close();
  }
  console.log('PASS: caret advances, wraps, changes rows, and returns to the prompt.');
} finally { await browser.close(); }
