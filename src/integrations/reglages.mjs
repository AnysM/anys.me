// En développement seulement : les petites routes qui servent les ateliers
// (/reglages pour les séparations, /essais-photos pour les images).
// Rien de tout cela n'existe dans le site publié.
import { writeFile, readFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

// Les dossiers où l'atelier va chercher des photos à essayer.
const VIVIERS = [
  join(homedir(), 'Downloads', 'Sélection officielle'),
  join(homedir(), 'Downloads', 'glyphes'),
];
const IMAGES = /\.(jpe?g|png|webp|heic)$/i;

function chemin(rel) {
  return fileURLToPath(new URL('../' + rel, import.meta.url));
}
function lire(req) {
  return new Promise((res) => { let c = ''; req.on('data', (x) => { c += x; }); req.on('end', () => res(c)); });
}
function json(res, data, code = 200) {
  res.statusCode = code;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(data));
}

// Remplace une clé du frontmatter de accueil.md, sans toucher au reste.
async function poserDansLeContenu(cle, valeur) {
  const f = chemin('content/pages/accueil.md');
  const texte = await readFile(f, 'utf8');
  const ligne = new RegExp('^' + cle + ':.*$', 'm');
  const neuf = ligne.test(texte)
    ? texte.replace(ligne, `${cle}: ${valeur}`)
    : texte.replace(/^---\n/, `---\n${cle}: ${valeur}\n`);
  await writeFile(f, neuf, 'utf8');
}

export default function reglages() {
  return {
    name: 'reglages',
    hooks: {
      'astro:server:setup': ({ server }) => {
        // ── Les séparations ──────────────────────────────────────────────
        server.middlewares.use('/__reglages', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (corps) => {
            try {
              const d = JSON.parse(corps);
              const bon = d && typeof d === 'object' && Object.keys(d).length >= 4
                && Object.values(d).every((v) => v && typeof v === 'object' && 'bord' in v);
              if (!bon) throw new Error('ce ne sont pas des réglages de séparations');
              await writeFile(chemin('data/separateurs.json'), JSON.stringify(d, null, 2) + '\n', 'utf8');
              json(res, { ok: true });
            } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
          });
        });

        // ── Le voile et la lumière de chaque photo de fond ───────────────
        server.middlewares.use('/__fonds', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (corps) => {
            try {
              const d = JSON.parse(corps);
              const bon = d && typeof d === 'object' && Object.keys(d).length >= 4
                && Object.values(d).every((v) => v && typeof v === 'object' && 'voile' in v && 'lumiere' in v);
              if (!bon) throw new Error('ce ne sont pas des réglages de photos');
              await writeFile(chemin('data/fonds.json'), JSON.stringify(d, null, 2) + '\n', 'utf8');
              json(res, { ok: true });
            } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
          });
        });

        // ── Les signes ───────────────────────────────────────────────────
        server.middlewares.use('/__signes', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (corps) => {
            try {
              const d = JSON.parse(corps);
              const bon = d && typeof d === 'object' && Object.keys(d).length >= 3
                && Object.values(d).every((v) => v && typeof v === 'object' && 'n' in v && 'mode' in v);
              if (!bon) throw new Error('ce ne sont pas des réglages de signes');
              await writeFile(chemin('data/signes.json'), JSON.stringify(d, null, 2) + '\n', 'utf8');
              json(res, { ok: true });
            } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
          });
        });

        // ── Les photos : la liste de ce qu'on peut essayer ───────────────
        server.middlewares.use('/__photos/liste', async (req, res) => {
          const sortie = [];
          for (const dossier of VIVIERS) {
            if (!existsSync(dossier)) continue;
            for (const f of (await readdir(dossier)).filter((x) => IMAGES.test(x)).sort()) {
              sortie.push({ dossier, fichier: f, cle: Buffer.from(join(dossier, f)).toString('base64url') });
            }
          }
          // Et celles qui sont déjà dans le site.
          const pub = chemin('../public/img');
          for (const f of (await readdir(pub)).filter((x) => IMAGES.test(x)).sort()) {
            sortie.push({ dossier: pub, fichier: f, dedans: '/img/' + f,
              cle: Buffer.from(join(pub, f)).toString('base64url') });
          }
          json(res, sortie);
        });

        // ── Les photos : une vignette, ou l'aperçu en grand ──────────────
        server.middlewares.use('/__photos/vue', async (req, res) => {
          const u = new URL(req.url, 'http://x');
          const cle = u.searchParams.get('cle');
          const large = Number(u.searchParams.get('l') || 320);
          try {
            const src = Buffer.from(cle, 'base64url').toString();
            if (!VIVIERS.some((d) => src.startsWith(d)) && !src.startsWith(chemin('../public'))) {
              return json(res, { erreur: 'hors des dossiers autorisés' }, 403);
            }
            const buf = await sharp(src).rotate().resize({ width: large, withoutEnlargement: true })
              .jpeg({ quality: 80 }).toBuffer();
            res.setHeader('content-type', 'image/jpeg');
            res.setHeader('cache-control', 'max-age=3600');
            res.end(buf);
          } catch (e) { json(res, { erreur: String(e) }, 400); }
        });

        // ── Les photos : on en choisit une pour un emplacement ───────────
        server.middlewares.use('/__photos/choisir', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (corps) => {
            try {
              const { champ, cle } = JSON.parse(corps);
              const src = Buffer.from(cle, 'base64url').toString();
              let dedans;
              if (src.startsWith(chemin('../public'))) {
                dedans = '/img/' + basename(src);           // déjà dans le site
              } else {
                const nom = basename(src, extname(src)).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const dossier = chemin('../public/img/photos');
                if (!existsSync(dossier)) await mkdir(dossier, { recursive: true });
                await sharp(src).rotate().resize({ width: 2200, withoutEnlargement: true })
                  .jpeg({ quality: 86 }).toFile(join(dossier, nom + '.jpg'));
                dedans = '/img/photos/' + nom + '.jpg';
              }
              await poserDansLeContenu(champ, dedans);
              json(res, { ok: true, dedans });
            } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
          });
        });
      },
    },
  };
}
