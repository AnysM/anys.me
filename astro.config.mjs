import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import optimizeImages from './src/integrations/optimize-images.mjs';
import reglages from './src/integrations/reglages.mjs';
import { rehypeLore, fichesMinces } from './src/lib/lore.mjs';
import { CODEX_OUVERT } from './src/lib/etat.mjs';

const exclues = ['/merci', '/admin', '/ateliers', '/reglages', '/essais', '/a-propos-2', '/a-propos-court',
  '/relecture',
  ...(CODEX_OUVERT ? fichesMinces().map((id) => `/codex/${id}/`) : ['/codex'])];

export default defineConfig({
  site: 'https://anys.me',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({ filter: (page) => !exclues.some((x) => page.includes(x)) }),
    optimizeImages(),
    reglages(),
  ],
  markdown: { rehypePlugins: [rehypeLore] },
  // En développement, l'atelier écrit dans les pages de contenu à chaque
  // frappe. Si le serveur les surveille, il recharge la page sous les doigts
  // de celui qui écrit. Il les ignore donc : c'est l'atelier qui demande un
  // rechargement, et seulement quand le rendu doit changer.
  vite: { server: { watch: { ignored: ['**/src/content/pages/**'] } } },
});
