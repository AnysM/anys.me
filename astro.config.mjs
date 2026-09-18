import { defineConfig } from 'astro/config';
import optimizeImages from './src/integrations/optimize-images.mjs';

export default defineConfig({
  site: 'https://anys.me',
  integrations: [optimizeImages()],
});
