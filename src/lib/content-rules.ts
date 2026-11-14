import { z } from 'astro/zod';
import { parseHTML } from 'linkedom';
import { isCalendarDate } from './dates';

const date = z.string().refine(isCalendarDate, '请使用有效的 YYYY-MM-DD 日期');
export const postSchema = z.object({
  title: z.string().trim().min(1),
  date,
  updated: date.optional(),
  category: z.enum(['技术', '生活']),
  tags: z.array(z.string().trim().refine(tag => !/[\/\\\x00-\x1f\x7f]/.test(tag) && tag !== '.' && tag !== '..', '标签含有无效字符')).default([])
    .transform(tags => [...new Set(tags.filter(Boolean))]),
  draft: z.boolean().default(true),
  description: z.string().trim().optional(),
}).refine(post => !post.updated || post.updated >= post.date, {
  path: ['updated'], message: '更新日期不能早于发布日期',
});

export function slugFromEntry(entry: string) {
  const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/index\.md$/.exec(entry);
  if (!match) throw new Error('文章路径应为 <英文小写标识>/index.md：' + entry);
  return match[1];
}

export function sortedVisible<T extends { date: string; slug: string; draft: boolean }>(entries: T[], includeDrafts: boolean) {
  return entries.filter(post => includeDrafts || !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug, 'en'));
}

export function excerpt(html: string) {
  const { document } = parseHTML('<html><body>' + html + '</body></html>');
  document.querySelectorAll('pre,script,style').forEach(node => node.remove());
  const text = (document.querySelector('p') ?? document.body).textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const chars = Array.from(text);
  return chars.length > 120 ? chars.slice(0, 120).join('') + '…' : text;
}
