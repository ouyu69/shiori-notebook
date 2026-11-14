import { test, expect } from '@playwright/test';
test('searches published Chinese text and tags and opens the matching article', async ({ page }) => {
  await page.goto('/search/');
  const input = page.getByRole('searchbox');
  const results = page.locator('#search-results a');
  for (const query of ['文件夹', '知识整理']) {
    await input.fill(query);
    await expect(page.locator('#search-status')).toHaveText('找到 1 篇笔记');
    await expect(results.first()).toHaveText('让 Markdown 笔记有一个稳定的地址');
  }
  await results.first().click();
  await page.getByRole('link', { name: '#知识整理' }).click();
  await expect(page.locator('h1')).toHaveText('#知识整理');
  await page.reload();
  await expect(page.locator('.post-row')).toHaveCount(1);
  await page.goto('/search/');
  await input.fill('散步');
  await expect(page.locator('#search-status')).toHaveText('没有找到相关笔记。');
  await input.fill('');
  await expect(page.locator('#search-status')).toBeEmpty();
  await expect(results).toHaveCount(0);
});
