// Après le build : convertit les images de /img en WebP redimensionné
// et réécrit les références dans le HTML/CSS/JS générés.
// Les chemins saisis dans Tina (/img/xxx.jpg) restent inchangés dans le contenu source.
import { readdir, readFile, writeFile, stat, unlink, mkdir } from 'node:fs/promises';
import { join, extname, basename, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const MAX_WIDTH = 2000;
const QUALITY = 78;
// Les images qui s'affichent en pleine largeur méritent plus de définition.
const PLEINE_LARGEUR = /^(hero|in-carne-feu|in-carne-marche|fleur|fleurs|arbre-en-fleurs|traversees|respiration)/i;
const MAX_WIDTH_HD = 2600;
const QUALITY_HD = 86;
const SOURCES = new Set(['.jpg', '.jpeg', '.png']);
// Les largeurs proposées au navigateur. Un téléphone recevait jusqu'ici le
// même fichier qu'un grand écran : 2000 px de large pour en afficher 343.
// Il choisit maintenant la plus petite qui lui suffise, et l'ordinateur garde
// la pleine définition. On ne fabrique que les tailles plus petites que
// l'image d'origine : l'agrandir ne lui ajouterait aucun détail.
const LARGEURS = [480, 768, 1024, 1366, 1800];

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
        const jeux = new Map();
        let before = 0;
        let after = 0;
        let variantes = 0;
        let poidsVariantes = 0;
        const deja = new Set();

        for (const file of await walk(imgDir).catch(() => [])) {
          const ext = extname(file);
          if (!SOURCES.has(ext.toLowerCase())) continue;
          const target = file.slice(0, -ext.length) + '.webp';
          const size = (await stat(file)).size;
          const hd = PLEINE_LARGEUR.test(basename(file));
          await sharp(file).rotate()
            .resize({ width: hd ? MAX_WIDTH_HD : MAX_WIDTH, withoutEnlargement: true })
            .webp({ quality: hd ? QUALITY_HD : QUALITY })
            .toFile(target);
          before += size;
          after += (await stat(target)).size;

          const pleine = (await sharp(target).metadata()).width;
          const tailles = [];
          for (const w of LARGEURS) {
            if (w >= pleine) continue;
            const variante = target.slice(0, -'.webp'.length) + `-${w}.webp`;
            await sharp(file).rotate()
              .resize({ width: w, withoutEnlargement: true })
              .webp({ quality: hd ? QUALITY_HD : QUALITY })
              .toFile(variante);
            tailles.push({ largeur: w, nom: relative(imgDir, variante).split(sep).join('/') });
            deja.add(variante);
            poidsVariantes += (await stat(variante)).size;
            variantes += 1;
          }
          if (tailles.length) {
            tailles.push({ largeur: pleine, nom: relative(imgDir, target).split(sep).join('/') });
            jeux.set('/img/' + relative(imgDir, target).split(sep).join('/'), tailles);
          }
          // On garde le chemin relatif à /img : les sous-dossiers doivent être réécrits aussi.
          renamed.set(relative(imgDir, file).split(sep).join('/'), relative(imgDir, target).split(sep).join('/'));
          await unlink(file);
        }

        // Une dizaine d'images arrivent déjà en WebP : la conversion ne les
        // voyait pas, et elles partaient donc en pleine taille vers les
        // téléphones. Ce sont justement les photos des cartes d'agenda.
        for (const file of await walk(imgDir).catch(() => [])) {
          if (!file.endsWith('.webp') || deja.has(file)) continue;
          const nom = relative(imgDir, file).split(sep).join('/');
          if (jeux.has(`/img/${nom}`)) continue;
          const pleine = (await sharp(file).metadata()).width;
          const tailles = [];
          for (const w of LARGEURS) {
            if (w >= pleine) continue;
            const variante = file.slice(0, -'.webp'.length) + `-${w}.webp`;
            await sharp(file).rotate()
              .resize({ width: w, withoutEnlargement: true })
              .webp({ quality: QUALITY })
              .toFile(variante);
            tailles.push({ largeur: w, nom: relative(imgDir, variante).split(sep).join('/') });
            deja.add(variante);
            poidsVariantes += (await stat(variante)).size;
            variantes += 1;
          }
          if (tailles.length) {
            tailles.push({ largeur: pleine, nom });
            jeux.set(`/img/${nom}`, tailles);
          }
        }

        const pattern = new RegExp(`/img/(${[...renamed.keys()].map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
        for (const file of await walk(root)) {
          if (!/\.(html|css|js)$/.test(file) || !renamed.size) continue;
          const src = await readFile(file, 'utf8');
          const next = src.replace(pattern, (_, name) => `/img/${renamed.get(name)}`);
          if (next !== src) await writeFile(file, next);
        }

        // Chaque <img> annonce les largeurs disponibles, et le navigateur prend
        // la plus petite qui lui suffise. « sizes » lui dit la place que
        // l'image occupera : sans indication on déclare toute la largeur de la
        // fenêtre, ce qui ne descend jamais trop bas et ne risque donc pas de
        // rendre une photo floue. Un composant qui connaît mieux sa mise en
        // page pose son propre « sizes », et celui-là n'est pas touché.
        let habillees = 0;
        for (const file of await walk(root)) {
          if (!file.endsWith('.html') || !jeux.size) continue;
          const src = await readFile(file, 'utf8');
          const next = src.replace(/<img\b[^>]*>/g, (balise) => {
            if (/\ssrcset=/.test(balise)) return balise;
            const m = balise.match(/\ssrc="([^"]+\.webp)"/);
            const jeu = m && jeux.get(m[1]);
            if (!jeu) return balise;
            const srcset = jeu.map((t) => `/img/${t.nom} ${t.largeur}w`).join(', ');
            const sizes = /\ssizes="/.test(balise) ? '' : ' sizes="100vw"';
            habillees += 1;
            return balise.replace(/(\s*\/?>)$/, (fin) => ` srcset="${srcset}"${sizes}${fin}`);
          });
          if (next !== src) await writeFile(file, next);
        }
        logger.info(`${habillees} balises <img> reçoivent les largeurs disponibles`);

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
        logger.info(`${variantes} tailles plus petites fabriquées (+${mb(poidsVariantes)} Mo stockés, pour alléger les téléphones)`);
      },
    },
  };
}
