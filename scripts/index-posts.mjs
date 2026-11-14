import { readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { createIndex, close } from 'pagefind';

const site = process.argv[2] || 'dist';
await access(join(site, 'search', 'index.html'));
const posts = await readdir(join(site, 'posts')).catch(error => {
  if (error.code === 'ENOENT') return [];
  throw error;
});
if (posts.length) {
  try {
    const { index, errors } = await createIndex();
    if (!index) throw new Error(errors.join('\n'));
    const added = await index.addDirectory({ path: site, glob: 'posts/**/index.html' });
    if (added.errors.length || !added.page_count) throw new Error(added.errors.join('\n') || '没有文章被索引');
    const output = await index.writeFiles({ outputPath: join(site, 'pagefind') });
    if (output.errors.length) throw new Error(output.errors.join('\n'));
    console.log('已索引 ' + added.page_count + ' 篇文章');
  } finally { await close(); }
} else { console.log('还没有已发布的文章。'); }
