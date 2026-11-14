import { test, expect } from '@playwright/test';

const article = '/posts/markdown-notes/';
test('desktop contents link to the actual repeated headings', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(article);
  const toc = page.getByRole('navigation', { name: '文章目录' }).filter({ visible: true });
  const links = toc.getByRole('link', { name: '检查结果', exact: true });
  await expect(links).toHaveCount(2);
  const second = await links.nth(1).getAttribute('href');
  expect(second).not.toBe(await links.first().getAttribute('href'));
  await links.nth(1).click();
  await expect(page.locator(':target')).toHaveText('检查结果');
  const token = page.locator('pre code span[style]').first();
  const before = await token.evaluate(el => getComputedStyle(el).color);
  await page.locator('.theme-toggle').click();
  await expect.poll(() => token.evaluate(el => getComputedStyle(el).color)).not.toBe(before);
});
test('copy preserves the code and reports denied access', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto(article);
  const button = page.getByRole('button', { name: '复制代码' }).first();
  await button.click();
  const code = await page.locator('pre code').first().textContent();
  expect(code).toContain('\n');
  await expect(button.or(page.getByRole('button', { name: '已复制' })).first()).toHaveText('已复制');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard.replaceAll('\r\n', '\n')).toBe(code);
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', {
    value: async () => { throw new Error('denied'); },
  }));
  await page.getByRole('button', { name: '已复制' }).first().click();
  await expect(page.getByText('复制失败，请手动选择代码')).toBeVisible();
});
test('mobile contents, wide code and table stay within the article', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(article);
  const details = page.locator('.mobile-toc');
  await expect(details).toBeVisible();
  expect(await details.evaluate(el => el.hasAttribute('open'))).toBe(false);
  await details.locator('summary').focus();
  await page.keyboard.press('Enter');
  await details.getByRole('link').first().click();
  await expect(page.locator(':target')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const selector of ['.prose pre', '.prose table']) {
    expect(await page.locator(selector).first().evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
  }
});
test('about and unknown addresses have navigable content', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('heading', { name: '关于这本手记' })).toBeVisible();
  expect((await page.goto('/missing-note/'))?.status()).toBe(404);
  await page.getByRole('link', { name: '回到笔记列表' }).click();
  await expect(page).toHaveURL(/\/articles\/$/);
});
