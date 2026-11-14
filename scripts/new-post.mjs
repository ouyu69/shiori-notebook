import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

try {
  const { positionals, values } = parseArgs({ allowPositionals: true, options: {
    title: { type: 'string' }, category: { type: 'string', default: '技术' }
  } });
  const [slug] = positionals;
  if (positionals.length !== 1 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      !values.title?.trim() || !['技术', '生活'].includes(values.category)) {
    throw new Error('用法：npm run new:post -- <小写英文标识> --title "标题" --category 技术或生活');
  }
  const base = process.env.NOTEBOOK_POSTS_DIR || 'src/content/posts';
  await mkdir(base, { recursive: true });
  const dir = join(base, slug);
  await mkdir(dir); // Exclusive creation also protects against concurrent invocations.
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
  const header = ['---', 'title: ' + JSON.stringify(values.title.trim()), 'date: ' + date, 'category: ' + values.category,
    'tags: []', 'draft: true', '---', '', ''].join('\n');
  await mkdir(join(dir, 'images'));
  await writeFile(join(dir, 'index.md'), header, { flag: 'wx' });
  console.log(join(dir, 'index.md'));
} catch (error) {
  console.error(error.code === 'EEXIST' ? '该文章目录已存在。' : error.message);
  process.exitCode = 1;
}
