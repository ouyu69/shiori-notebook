import { expect, it } from 'vitest';
import { formatDate, isCalendarDate } from '../src/lib/dates';
import { postSchema, slugFromEntry, excerpt, sortedVisible } from '../src/lib/content-rules';

const meta = { title: '记录', date: '2026-11-13', category: '技术' };
it('defaults to a draft with no tags', () => {
  expect(postSchema.parse(meta)).toMatchObject({draft: true, tags: []});
});
it('rejects incomplete metadata and impossible calendar dates', () => {
  for (const change of [{ title: ' ' }, { date: '2026-02-30' }, { updated: '2025-01-01' }, { category: '其他' }, { draft: 'false' }]) {
    expect(postSchema.safeParse({...meta, ...change}).success).toBe(false);
  }
  expect(isCalendarDate('2024-02-29')).toBe(true);
  expect(formatDate('2026-11-13')).toBe('2026.11.13');
});
it('derives a stable unique slug only from the canonical folder path', () => {
  expect(slugFromEntry('docker-notes/index.md')).toBe('docker-notes');
  for (const invalid of ['docker-notes/second.md', 'other/docker-notes/index.md', 'Docker Notes/index.md']) {
    expect(() => slugFromEntry(invalid)).toThrow(invalid);
  }
});
it('sorts by publication day and slug, filtering drafts for production', () => {
  const entries = ['b','a','c'].map((slug, i) => ({ slug, date: i === 2 ? '2026-11-14' : meta.date, draft: i === 2 }));
  expect(sortedVisible(entries, false).map(p => p.slug)).toEqual(['a','b']);
  expect(sortedVisible(entries, true).map(p => p.slug)).toEqual(['c','a','b']);
});
it('derives readable excerpts from rendered Markdown', () => {
  expect(excerpt('<h2>背景</h2><p>记录 <strong>一条</strong> <a href="/">笔记</a>。</p><pre>ignored</pre>')).toBe('记录 一条 笔记。');
  expect(excerpt('<p>缓存 &amp; 请求</p>')).toBe('缓存 & 请求');
});
