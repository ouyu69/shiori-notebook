import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseHTML } from 'linkedom';

// Build isolated copies so that withdrawing or renaming a fixture cannot change an author's notes.
await mkdir('test-results', { recursive: true });
const root = (await mkdtemp('test-results/content-')).replaceAll('\\', '/');
const source = root + '/posts';
const output = root + '/dist';
await cp('tests/fixtures/posts', source, { recursive: true });
const article = path.join(source, 'markdown-notes/index.md');
const original = await readFile(article, 'utf8');
const build = () => spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', output], {
  encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', NOTEBOOK_POSTS_DIR: source, NOTEBOOK_CACHE_DIR: path.join(root, 'cache') }
});
function buildOk() {
  const result = build();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const search = spawnSync(process.execPath, ['scripts/index-posts.mjs', output], { encoding: 'utf8' });
  assert.equal(search.status, 0, search.stdout + search.stderr);
}
const html = route => readFile(path.join(output, route, 'index.html'), 'utf8');
await mkdir(path.join(source, 'default-draft'));
await writeFile(path.join(source, 'default-draft/index.md'), original.split('##')[0].replace('draft: false', '').replace('让 Markdown 笔记有一个稳定的地址', '缺省草稿标记样文'));
buildOk();
await stat(path.join(output, 'pagefind/pagefind.js'));
for (const route of ['', 'articles', 'articles/tech', 'archive']) {
  assert.match(await html(route), /href="\/posts\/markdown-notes\/"/);
}
assert.doesNotMatch(await html('articles/life'), /href="\/posts\//);
assert.deepEqual(await readdir(path.join(output, 'posts')), ['markdown-notes']);
const post = parseHTML(await html('posts/markdown-notes')).document;
assert.equal(post.querySelector('.adjacent'), null);
const src = post.querySelector('.prose img')?.getAttribute('src');
assert.ok(src);
assert.ok((await stat(path.join(output, new URL(src, 'https://site.test/posts/markdown-notes/').pathname))).isFile());
for (const file of await readdir(output, { recursive: true })) {
  if (file.endsWith('.html')) assert.doesNotMatch(await readFile(path.join(output, file), 'utf8'), /散步时记下的一件小事|缺省草稿标记样文/);
}
await writeFile(article, original.replace('让 Markdown 笔记有一个稳定的地址', '改过标题的笔记'));
buildOk();
assert.match(await html('posts/markdown-notes'), /改过标题的笔记/);
await writeFile(article, original.replace('draft: false', 'draft: true'));
buildOk();
await assert.rejects(html('posts/markdown-notes'), { code: 'ENOENT' });
await assert.rejects(stat(path.join(output, 'pagefind/pagefind.js')), { code: 'ENOENT' });
assert.match(await html('search'), /还没有已发布的笔记/);
assert.doesNotMatch(await html('archive'), /href="\/posts\//);
await writeFile(article, original.replace('2026-11-13', '2026-02-30'));
const invalid = build();
assert.notEqual(invalid.status, 0);
assert.match(invalid.stdout + invalid.stderr, /markdown-notes[\\/]index\.md/);
console.log('PASS: publishing, relative image, categories, both draft cases, stable URL, withdrawal and invalid date.');
