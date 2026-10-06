import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import optimizeImages from './src/integrations/optimize-images.mjs';
import reglages from './src/integrations/reglages.mjs';
import { rehypeLore, fichesMinces } from './src/lib/lore.mjs';

const exclues = ['/merci', '/admin', '/reglages', '/essais-photos', ...fichesMinces().map((id) => `/codex/${id}/`)];

export default defineConfig({
  site: 'https://anys.me',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({ filter: (page) => !exclues.some((x) => page.includes(x)) }),
    optimizeImages(),
    reglages(),
  ],
  markdown: { rehypePlugins: [rehypeLore] },
});
