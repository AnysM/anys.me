// En développement seulement : une petite route qui enregistre les réglages
// des séparations depuis la page /reglages. Elle n'existe pas dans le site publié.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export default function reglages() {
  return {
    name: 'reglages',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use('/__reglages', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          let corps = '';
          req.on('data', (c) => { corps += c; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(corps);
              const chemin = fileURLToPath(new URL('../data/separateurs.json', import.meta.url));
              await writeFile(chemin, JSON.stringify(data, null, 2) + '\n', 'utf8');
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, erreur: String(e) }));
            }
          });
        });
      },
    },
  };
}
