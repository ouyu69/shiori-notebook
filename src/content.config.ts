import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { postSchema, slugFromEntry } from './lib/content-rules';

const posts = defineCollection({
  loader: glob({
    base: process.env.NOTEBOOK_POSTS_DIR || './src/content/posts',
    pattern: '**/*.md',
    generateId({ entry, data, base }) {
      const slug = slugFromEntry(entry);
      // Astro parses unquoted YAML dates as Date and may roll an invalid day into the next month.
      // Recover the author's original calendar values before schema validation.
      if (data.date instanceof Date || data.updated instanceof Date) {
        const source = readFileSync(new URL(entry, base), 'utf8');
        const header = /^\uFEFF?\s*---\s*\r?\n([\s\S]*?)\r?\n---(?:\s|$)/.exec(source);
        if (!header) throw new Error('无法读取文章日期：' + entry);
        const raw = parse(header[1], { schema: 'core', merge: true });
        if (data.date instanceof Date) data.date = raw.date;
        if (data.updated instanceof Date) data.updated = raw.updated;
      }
      return slug;
    },
  }),
  schema: postSchema,
});
export const collections = { posts };
