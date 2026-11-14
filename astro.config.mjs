import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false } },
  cacheDir: process.env.NOTEBOOK_CACHE_DIR || './node_modules/.astro',
});
