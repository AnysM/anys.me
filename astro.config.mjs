import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import optimizeImages from './src/integrations/optimize-images.mjs';
import { rehypeLore, fichesMinces } from './src/lib/lore.mjs';

const exclues = ['/merci', '/admin', ...fichesMinces().map((id) => `/codex/${id}/`)];

export default defineConfig({
  site: 'https://anys.me',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({ filter: (page) => !exclues.some((x) => page.includes(x)) }),
    optimizeImages(),
  ],
  markdown: { rehypePlugins: [rehypeLore] },
});
