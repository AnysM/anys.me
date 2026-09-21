// Après le build : convertit les images de /img en WebP redimensionné
// et réécrit les références dans le HTML/CSS/JS générés.
// Les chemins saisis dans Tina (/img/xxx.jpg) restent inchangés dans le contenu source.
import { readdir, readFile, writeFile, stat, unlink, mkdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const MAX_WIDTH = 2000;
const QUALITY = 78;
const SOURCES = new Set(['.jpg', '.jpeg', '.png']);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

export default function optimizeImages() {
  return {
    name: 'optimize-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const imgDir = join(root, 'img');
        const renamed = new Map();
        let before = 0;
        let after = 0;

        for (const file of await walk(imgDir).catch(() => [])) {
          const ext = extname(file);
          if (!SOURCES.has(ext.toLowerCase())) continue;
          const target = file.slice(0, -ext.length) + '.webp';
          const size = (await stat(file)).size;
          await sharp(file).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(target);
          before += size;
          after += (await stat(target)).size;
          renamed.set(basename(file), basename(target));
          await unlink(file);
        }

        const pattern = new RegExp(`/img/(${[...renamed.keys()].map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
        for (const file of await walk(root)) {
          if (!/\.(html|css|js)$/.test(file) || !renamed.size) continue;
          const src = await readFile(file, 'utf8');
          const next = src.replace(pattern, (_, name) => `/img/${renamed.get(name)}`);
          if (next !== src) await writeFile(file, next);
        }

        // Images de partage : WhatsApp, Messenger ou LinkedIn lisent mal le WebP et attendent du 1200 × 630.
        // Portrait (une œuvre) : posée entière sur le bleu nuit du site. Paysage : recadrée au plus parlant.
        const partageDir = join(imgDir, 'partage');
        await mkdir(partageDir, { recursive: true });
        const faites = new Map();
        const meta = /(<meta (?:property="og:image"|name="twitter:image") content=")([^"]*?)\/img\/([^"]+?)\.(webp|jpe?g|png)(")/g;
        for (const file of await walk(root)) {
          if (!file.endsWith('.html')) continue;
          const src = await readFile(file, 'utf8');
          const jobs = [];
          src.replace(meta, (_, a, origine, nom, ext) => { jobs.push(`${nom}.${ext}`); return _; });
          for (const nomFichier of jobs) {
            if (faites.has(nomFichier)) continue;
            const source = join(imgDir, nomFichier);
            const sortie = join(partageDir, nomFichier.replace(/\.(webp|jpe?g|png)$/, '.jpg').replace(/\//g, '-'));
            try {
              const { width, height } = await sharp(source).metadata();
              const portrait = height > width * 0.9;
              await sharp(source).rotate()
                .resize(1200, 630, portrait ? { fit: 'contain', background: '#0A0F20' } : { fit: 'cover', position: 'attention' })
                .flatten({ background: '#0A0F20' })
                .jpeg({ quality: 82, mozjpeg: true })
                .toFile(sortie);
              faites.set(nomFichier, basename(sortie));
            } catch { faites.set(nomFichier, null); }
          }
          const next = src.replace(meta, (m, a, origine, nom, ext, z) => {
            const jpg = faites.get(`${nom}.${ext}`);
            return jpg ? `${a}${origine}/img/partage/${jpg}${z}` : m;
          });
          if (next !== src) await writeFile(file, next);
        }
        logger.info(`${[...faites.values()].filter(Boolean).length} images de partage (1200 × 630)`);

        const mb = (n) => (n / 1048576).toFixed(1);
        logger.info(`${renamed.size} images converties en WebP : ${mb(before)} Mo → ${mb(after)} Mo`);
      },
    },
  };
}
