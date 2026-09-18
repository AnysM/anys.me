// Après le build : convertit les images de /img en WebP redimensionné
// et réécrit les références dans le HTML/CSS/JS générés.
// Les chemins saisis dans Tina (/img/xxx.jpg) restent inchangés dans le contenu source.
import { readdir, readFile, writeFile, stat, unlink } from 'node:fs/promises';
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

        const mb = (n) => (n / 1048576).toFixed(1);
        logger.info(`${renamed.size} images converties en WebP : ${mb(before)} Mo → ${mb(after)} Mo`);
      },
    },
  };
}
