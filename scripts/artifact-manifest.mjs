import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const root = process.argv[2] ?? 'dist';
const manifest = {};
for (const file of await readdir(root, { recursive: true, withFileTypes: true })) {
  if (!file.isFile() || file.name === 'manifest.json') continue;
  const path = join(file.parentPath, file.name);
  const name = path.slice(root.length + 1).replaceAll('\\', '/');
  manifest[name] = createHash('sha256').update(await readFile(path)).digest('hex');
}
await writeFile(join(root, 'manifest.json'), JSON.stringify(manifest, null, 2));
