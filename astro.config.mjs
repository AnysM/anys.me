import { defineConfig } from 'astro/config';
import optimizeImages from './src/integrations/optimize-images.mjs';
import { rehypeLore } from './src/lib/lore.mjs';

export default defineConfig({
  site: 'https://anys.me',
  integrations: [optimizeImages()],
  markdown: { rehypePlugins: [rehypeLore] },
});
