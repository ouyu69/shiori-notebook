import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  cacheDir: process.env.NOTEBOOK_CACHE_DIR || './node_modules/.astro',
});
