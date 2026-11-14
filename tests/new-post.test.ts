import { it, expect } from 'vitest';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { postSchema } from '../src/lib/content-rules';
import { tagKey } from '../src/lib/tags';
it('creates a Shanghai-dated draft and preserves existing notes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'notebook-write-'));
  const run = (slug: string) => spawnSync(process.execPath, ['scripts/new-post.mjs',slug,'--title','测试：一个标题'], {
    env: {...process.env, NOTEBOOK_POSTS_DIR:dir}, encoding:'utf8'
  });
  expect(run('one-note').status).toBe(0);
  const file = join(dir,'one-note/index.md');
  const text = await readFile(file,'utf8');
  expect(text).toContain('draft: true');
  expect(text).toContain(new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date()));
  expect((await stat(join(dir,'one-note/images'))).isDirectory()).toBe(true);
  expect(run('one-note').status).not.toBe(0);
  expect(run('../escape').status).not.toBe(0);
  expect(await readFile(file,'utf8')).toBe(text);
});
it('normalizes tags and keeps link segments distinct', () => {
  const data = { title:'笔记', date:'2026-11-14', category:'技术' };
  expect(postSchema.parse({...data,tags:[' 笔记 ','','笔记']}).tags).toEqual(['笔记']);
  for (const tag of ['..','a/b','a\\b']) expect(postSchema.safeParse({...data,tags:[tag]}).success).toBe(false);
  expect(tagKey('C#')).not.toEqual(tagKey('C++'));
});
