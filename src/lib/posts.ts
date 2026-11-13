import { getCollection } from 'astro:content';
import { excerpt, sortedVisible } from './content-rules';

export const postUrl = (slug: string) => '/posts/' + slug + '/';

export async function getPosts({ includeDrafts = import.meta.env.DEV } = {}) {
  const entries = await getCollection('posts');
  return sortedVisible(entries.map(entry => ({
    ...entry.data, slug: entry.id, entry,
    excerpt: entry.data.description || excerpt(entry.rendered?.html ?? ''),
  })), import.meta.env.DEV && includeDrafts);
}
export type PostSummary = Awaited<ReturnType<typeof getPosts>>[number];
