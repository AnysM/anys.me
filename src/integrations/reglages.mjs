// En développement seulement : les petites routes qui servent les ateliers
// (/reglages pour les séparations, /essais-photos pour les images).
// Rien de tout cela n'existe dans le site publié.
import { writeFile, readFile, readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';
import matter from 'gray-matter';
import { styler, texteNu, enCaracteres, enMarkdown } from '../lib/marques.mjs';
import { build } from 'esbuild';

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


// Remplace une clé du frontmatter sans toucher au reste du fichier : la valeur
// peut être sur la ligne (« univers: [a, b] ») ou en liste en dessous.
function remplacerCle(texte, cle, valeur) {
  const fin = texte.indexOf('\n---', 4);
  if (!texte.startsWith('---') || fin < 0) throw new Error('frontmatter introuvable');
  const tete = texte.slice(0, fin);
  const reste = texte.slice(fin);
  const re = new RegExp('^' + cle + ':[^\\n]*(?:\\n[ \\t]+-[^\\n]*)*', 'm');
  const ligne = cle + ': ' + valeur;
  return (re.test(tete) ? tete.replace(re, ligne) : tete + '\n' + ligne) + reste;
}


// Le corps d'une fiche : tout ce qui suit le frontmatter.
function couper(texte) {
  const fin = texte.indexOf('\n---', 4);
  if (!texte.startsWith('---') || fin < 0) throw new Error('frontmatter introuvable');
  const apres = texte.indexOf('\n', fin + 1);
  return { tete: texte.slice(0, apres + 1), corps: texte.slice(apres + 1) };
}

// ── L'atelier de mise en valeur ────────────────────────────────────────
// On ne passe pas par gray-matter pour écrire : il replierait les blocs
// littéraux « |- » en « >- » et les retours à la ligne du récit, qui sont
// du sens, deviendraient du hasard. On opère directement sur le fichier.
// Un texte de bloc peut s'écrire de deux façons dans le YAML : en bloc
// littéral « |- » quand il a plusieurs lignes, ou sur une seule ligne entre
// quotes quand il est court. Il faut lire les deux, sinon on saute un bloc et
// tous les suivants sont décalés d'un rang.
function dequote(v) {
  const t = v.trim();
  if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
  if (t.startsWith('"') && t.endsWith('"')) return JSON.parse(t);
  return t;
}

function zoneDepuis(lignes, i) {
  const cle = lignes[i].match(/^(\s*)([A-Za-z_]+):\s*(.*)$/);
  const creuxCle = cle[1].length;
  const valeur = cle[3];
  if (!/^\|-?$/.test(valeur.trim())) {
    // une seule ligne : on la relit, et on la réécrira en bloc littéral
    return { debut: i, fin: i + 1, creux: creuxCle + 2, scalaire: true, texte: dequote(valeur), cle: cle[2] };
  }
  const debut = i + 1;
  let creux = null, j = debut;
  for (; j < lignes.length; j++) {
    const l = lignes[j];
    if (!l.trim()) continue;
    const ind = l.match(/^ */)[0].length;
    if (creux === null) { if (ind <= creuxCle) break; creux = ind; }
    else if (ind < creux) break;
  }
  let fin = j;
  while (fin > debut && !lignes[fin - 1].trim()) fin--;
  const c = creux ?? creuxCle + 2;
  return { debut, fin, creux: c, scalaire: false, cle: cle[2],
           texte: lignes.slice(debut, fin).map((l) => l.slice(c)).join('\n') };
}

// Les zones éditables d'une page : le texte de chaque bloc du récit, dans
// l'ordre exact des chapitres, et les champs libres qui les précèdent.
function zones(texte) {
  const lignes = texte.split('\n');
  const blocs = [], champs = {};
  for (let i = 0; i < lignes.length; i++) {
    if (/^    texte:/.test(lignes[i])) {
      const z = zoneDepuis(lignes, i); blocs.push(z); i = z.fin - 1; continue;
    }
    if (/^(manifeste|invitation):/.test(lignes[i])) {
      const z = zoneDepuis(lignes, i); champs[z.cle] = z; i = z.fin - 1;
    }
  }
  return { lignes, blocs, champs };
}

function reposerZone(lignes, zone, neuf) {
  const creux = ' '.repeat(zone.creux);
  const corps = neuf.split('\n').map((l) => (l.trim() ? creux + l : ''));
  // Un texte d'une ligne revient en bloc littéral : c'est stable, et ça évite
  // qu'un bloc disparaisse du comptage la prochaine fois.
  const tete = zone.scalaire ? [' '.repeat(zone.creux - 2) + zone.cle + ': |-'] : [];
  return [...lignes.slice(0, zone.debut), ...tete, ...corps, ...lignes.slice(zone.fin)];
}

// Le paragraphe visé, et de quoi le remettre à sa place.
function paragraphes(texteBloc) {
  return texteBloc.split(/\n\n+/);
}

// Coupe un paragraphe à l'offset du texte nu, en refermant proprement les
// marques de part et d'autre. `isolerFin` coupe aussi à la fin de la ligne
// visée, pour laisser la phrase seule dans son paragraphe.
function decouper(md, offset, sep, isolerFin = false) {
  const cars = enCaracteres(md);
  const debutLigne = isolerFin ? (() => { let k = offset; while (k > 0 && cars[k - 1].c !== '\n') k--; return k; })() : offset;
  let finLigne = offset;
  if (isolerFin) { while (finLigne < cars.length && cars[finLigne].c !== '\n') finLigne++; }
  const tranche = (a, b) => enMarkdown(cars.slice(a, b)).replace(/^\n+|\n+$/g, '');
  if (!isolerFin) {
    const g = tranche(0, offset), dte = tranche(offset, cars.length);
    return [g, dte].filter(Boolean).join(sep);
  }
  const avant = tranche(0, debutLigne);
  const seule = tranche(debutLigne, finLigne);
  const apres = tranche(finLigne, cars.length);
  return [avant, seule, apres].filter(Boolean).join('\n\n');
}

// Une valeur d'une seule ligne : un titre, une amorce. On la réécrit en place,
// en la mettant entre quotes si elle en a besoin.
function citer(v) {
  const t = String(v).replace(/\r?\n/g, ' ').trim();
  if (!t) return "''";
  if (/^[\s>|&*!%@`'"#-]|:\s|\s#|[:#]$/.test(t)) return "'" + t.replace(/'/g, "''") + "'";
  return t;
}

// Repère la ligne d'une clé simple, au premier niveau ou dans une entrée de
// liste repérée par son numéro (les actes portent un `'n'`).
function ligneScalaire(lignes, cle, acte) {
  if (acte === undefined) {
    const i = lignes.findIndex((l) => new RegExp('^' + cle + ':').test(l));
    if (i < 0) throw new Error('clé « ' + cle + ' » introuvable');
    return { i, creux: '' };
  }
  const depart = lignes.findIndex((l) => new RegExp("^  - 'n': " + acte + '$').test(l));
  if (depart < 0) throw new Error('acte ' + acte + ' introuvable');
  for (let j = depart + 1; j < lignes.length && !/^  - /.test(lignes[j]); j++) {
    if (new RegExp('^    ' + cle + ':').test(lignes[j])) return { i: j, creux: '    ' };
  }
  throw new Error('« ' + cle + ' » absent de l\'acte ' + acte);
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

        // ── Le fond du pied de page ──────────────────────────────────────
        server.middlewares.use('/__pied', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (corps) => {
            try {
              const d = JSON.parse(corps);
              const bon = d && typeof d === 'object' && typeof d.fusion === 'string'
                && ['normal', 'overlay', 'screen', 'soft-light', 'luminosity', 'multiply'].includes(d.fusion)
                && ['opacite', 'saturation', 'luminosite', 'contraste'].every((k) => typeof d[k] === 'number');
              if (!bon) throw new Error('ce ne sont pas des réglages de pied de page');
              await writeFile(chemin('data/pied.json'), JSON.stringify(d, null, 2) + '\n', 'utf8');
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
        // ── Les photos du récit ──────────────────────────────────────────
        // Liste des photos disponibles, et des blocs du récit avec leur début
        // de texte, pour que l'atelier sache quoi montrer.
        server.middlewares.use('/__recit/etat', async (req, res) => {
          try {
            const page = String(new URL(req.originalUrl ?? req.url, 'http://x').searchParams.get('page') ?? 'a-propos')
              .replace(/[^a-z0-9-]/gi, '');
            const dossiers = ['photos', 'recit'];
            const photos = [];
            for (const d of dossiers) {
              const dir = chemin('../public/img/' + d);
              if (!existsSync(dir)) continue;
              for (const f of await readdir(dir)) {
                if (IMAGES.test(f)) photos.push('/img/' + d + '/' + f);
              }
            }
            const f = matter.read(chemin('content/pages/' + page + '.md'));
            json(res, { ok: true, photos: photos.sort(), chapitres: f.data.chapitres ?? [],
              actes: f.data.actes ?? [], manifeste: f.data.manifeste ?? '', invitation: f.data.invitation ?? '' });
          } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
        });

        // Enregistre les photos choisies, sans toucher aux textes.
        server.middlewares.use('/__recit/poser', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (corps) => {
            try {
              const page = String(new URL(req.originalUrl ?? req.url, 'http://x').searchParams.get('page') ?? 'a-propos')
                .replace(/[^a-z0-9-]/gi, '');
              const d = JSON.parse(corps);
              if (!Array.isArray(d)) throw new Error('il faut une liste de blocs');
              const chemin_ = chemin('content/pages/' + page + '.md');
              const f = matter.read(chemin_);
              if (d.length !== (f.data.chapitres ?? []).length) throw new Error('le nombre de blocs ne correspond pas');
              f.data.chapitres = f.data.chapitres.map((c, i) => {
                const v = d[i] ?? {};
                const neuf = { ...c };
                delete neuf.image; delete neuf.allure; delete neuf.vignettes; delete neuf.cote;
                if (v.image) { neuf.image = v.image; neuf.allure = v.allure || 'pleine'; }
                else if (Array.isArray(v.vignettes) && v.vignettes.length) neuf.vignettes = v.vignettes.slice(0, 3);
                if (['gauche', 'droite', 'centre'].includes(v.cote)) neuf.cote = v.cote;
                if (typeof v.texte === 'string' && v.texte.trim()) neuf.texte = v.texte;
                return neuf;
              });
              // lineWidth -1 : sans quoi js-yaml replie les textes longs en « >- » et les
              // retours à la ligne du récit, qui sont du sens, deviennent illisibles.
              await writeFile(chemin_, matter.stringify(f.content, f.data, { lineWidth: -1 }), 'utf8');
              json(res, { ok: true });
            } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
          });
        });

        // ── Le moteur de l'éditeur ───────────────────────────────────────
        // Tiptap vit dans node_modules : on le rassemble à la volée et on le
        // sert comme un module. Rien de tout ça n'entre dans le site publié —
        // cette route n'existe que sur le serveur de développement.
        let moteur = null, moteurDate = 0;
        server.middlewares.use('/__editeur.js', async (req, res) => {
          try {
            const src = chemin('atelier/editeur.mjs');
            const { mtimeMs } = await stat(src);
            if (!moteur || mtimeMs !== moteurDate) {
              moteurDate = mtimeMs;
              const r = await build({
                entryPoints: [src],
                bundle: true, format: 'esm', write: false, target: 'es2022',
                logLevel: 'silent',
              });
              moteur = r.outputFiles[0].text;
            }
            res.setHeader('content-type', 'text/javascript; charset=utf-8');
            res.end(moteur);
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('content-type', 'text/javascript');
            res.end('throw new Error(' + JSON.stringify('atelier : ' + String(e.message ?? e)) + ')');
          }
        });

        // ── L'atelier de mise en valeur, en direct sur la page ───────────
        // Une seule route pour tout : les styles posés sur une sélection et
        // les coupes de paragraphe. Elle refuse d'écrire si un seul mot a
        // bougé — c'est la garantie que l'atelier ne réécrit jamais le texte.
        server.middlewares.use('/__texte', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (corps) => {
            try {
              const d = JSON.parse(corps);
              const page = String(d.page ?? '').replace(/[^a-z0-9-]/gi, '');
              if (!page) throw new Error('page manquante');
              const f = chemin('content/pages/' + page + '.md');
              const source = await readFile(f, 'utf8');
              const { lignes, blocs, champs } = zones(source);

              // Une valeur d'une seule ligne : titre de page, amorce, titre de
              // chapitre. Elle ne passe pas par le découpage en paragraphes.
              if (d.action === 'ligne-valeur') {
                if (typeof d.markdown !== 'string') throw new Error('texte manquant');
                const { i, creux } = ligneScalaire(lignes, d.cle, d.acte);
                const copie = [...lignes];
                copie[i] = creux + d.cle + ': ' + citer(d.markdown);
                const abri = chemin('../.corbeille/textes');
                if (!existsSync(abri)) await mkdir(abri, { recursive: true });
                const quand = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                await writeFile(join(abri, page + '-' + quand + '.md'), source, 'utf8');
                await writeFile(f, copie.join('\n'), 'utf8');
                return json(res, { ok: true });
              }

              const champ = d.champ && d.champ !== 'chapitres' ? d.champ : null;
              const zone = champ ? champs[champ] : blocs[d.bloc];
              if (!zone) throw new Error(champ ? ('champ « ' + champ + ' » introuvable') : ('bloc ' + d.bloc + ' introuvable (' + blocs.length + ' blocs)'));

              const pars = paragraphes(zone.texte);
              const i = d.par;
              // Une écriture de bloc entier n'a pas de numéro de paragraphe.
              if (d.action !== 'bloc' && pars[i] === undefined) {
                throw new Error('paragraphe ' + i + ' introuvable');
              }

              // Le filet de sécurité : la page peut rendre un blanc de plus que le
              // fichier n'en contient. On vérifie que l'extrait sélectionné est bien
              // à l'endroit annoncé, sinon on le retrouve — sinon on refuse.
              if (typeof d.extrait === 'string' && d.extrait && d.debut !== undefined) {
                const nu = texteNu(pars[i]);
                if (nu.slice(d.debut, d.fin) !== d.extrait) {
                  const places = [];
                  for (let k = nu.indexOf(d.extrait); k !== -1; k = nu.indexOf(d.extrait, k + 1)) places.push(k);
                  if (!places.length) throw new Error('refus : « ' + d.extrait.slice(0, 40) + ' » ne se trouve pas dans ce paragraphe');
                  const k = places.reduce((m, x) => (Math.abs(x - d.debut) < Math.abs(m - d.debut) ? x : m));
                  d.debut = k; d.fin = k + d.extrait.length;
                }
              }

              if (d.action === 'style') {
                const style = d.style === 'net' ? null : d.style;
                if (style && !['gras', 'italique', 'manuscrit'].includes(style)) throw new Error('style inconnu');
                pars[i] = styler(pars[i], d.debut, d.fin, style);
              } else if (d.action === 'souffle') {
                const nu = texteNu(pars[i]);
                const deja = /^\*\*[^*]*\*\*$/.test(pars[i].trim());
                pars[i] = deja ? nu : styler(nu, 0, nu.length, 'gras');
              } else if (d.action === 'texte') {
                // Le seul endroit où les mots peuvent changer : c'est lui qui écrit.
                if (typeof d.markdown !== 'string') throw new Error('texte manquant');
                const t = d.markdown.replace(/\n{2,}/g, '\n').replace(/[ \t]+$/gm, '');
                if (!t.trim()) throw new Error('refus : un paragraphe vide — utilise plutôt ⇤ pour le recoller');
                pars[i] = t;
              } else if (d.action === 'bloc') {
                // L'éditeur envoie tout le texte du bloc d'un coup : c'est lui
                // qui tient la vérité pendant qu'on écrit.
                if (typeof d.markdown !== 'string') throw new Error('texte manquant');
                pars.length = 0;
                pars.push(...d.markdown.split(/\n{3,}/).join('\n\n').split(/\n{2,}/));
              } else if (d.action === 'courant') {
                // Le paragraphe redevient du texte courant : on retire seulement
                // la marque qui l'enveloppe en entier, pas celles du dedans.
                const t = pars[i].trim();
                const m = t.match(/^\*\*([\s\S]*)\*\*$/) || t.match(/^\*([\s\S]*)\*$/);
                if (m && !/\*/.test(m[1])) pars[i] = m[1];
              } else if (d.action === 'main') {
                const nu = texteNu(pars[i]);
                const deja = /^\*[^*]*\*$/.test(pars[i].trim());
                pars[i] = deja ? nu : styler(nu, 0, nu.length, 'manuscrit');
              } else if (d.action === 'ligne') {
                // Couper en deux lignes à l'endroit du curseur, dans le même paragraphe.
                if (d.debut <= 0 || d.debut >= texteNu(pars[i]).length) throw new Error('rien à couper ici');
                pars[i] = decouper(pars[i], d.debut, '\n');
              } else if (d.action === 'isoler') {
                pars[i] = decouper(pars[i], d.debut, '\n\n', true);
              } else if (d.action === 'recoller') {
                if (i === 0) throw new Error('aucun paragraphe au-dessus');
                pars[i - 1] = pars[i - 1] + '\n' + pars[i];
                pars.splice(i, 1);
              } else throw new Error('action inconnue : ' + d.action);

              const neuf = reposerZone(lignes, zone, pars.join('\n\n')).join('\n');
              if (d.action === 'texte' || d.action === 'bloc') {
                // Tu écris : les mots changent, forcément. À la place de la garde,
                // une copie datée de l'état d'avant, qu'on peut toujours rouvrir.
                const abri = chemin('../.corbeille/textes');
                if (!existsSync(abri)) await mkdir(abri, { recursive: true });
                const quand = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                await writeFile(join(abri, page + '-' + quand + '.md'), source, 'utf8');
              } else {
                const mots = (t) => t.replace(/[*_]/g, '').split(/\s+/).filter(Boolean).join(' ');
                if (mots(neuf) !== mots(source)) throw new Error('refus : des mots auraient changé');
              }
              await writeFile(f, neuf, 'utf8');
              json(res, { ok: true });
            } catch (e) { json(res, { ok: false, erreur: String(e.message ?? e) }, 400); }
          });
        });

        // ── Le Codex, par dimension ──────────────────────────────────────
        server.middlewares.use('/__codex/etat', async (req, res) => {
          try {
            const { UNIVERS, TYPES } = await import('../lib/univers.mjs');
            const dir = chemin('content/codex');
            const fiches = [];
            for (const f of (await readdir(dir)).filter((x) => x.endsWith('.md'))) {
              const d = matter.read(join(dir, f));
              fiches.push({
                id: f.replace(/\.md$/, ''), titre: d.data.titre ?? f,
                type: d.data.type ?? 'notion',
                univers: Array.isArray(d.data.univers) ? d.data.univers : [],
                alias: Array.isArray(d.data.alias) ? d.data.alias : [],
                signes: String(d.content ?? '').trim().length,
              });
            }
            json(res, { ok: true, fiches: fiches.sort((a, b) => a.titre.localeCompare(b.titre, 'fr')),
              univers: UNIVERS.map((u) => ({ id: u.id, nom: u.nom })),
              types: TYPES.map((t) => ({ id: t.id, label: t.label, pluriel: t.pluriel })) });
          } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
        });

        // Enregistre le type et les dimensions des fiches modifiées.
        server.middlewares.use('/__codex/poser', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (corps) => {
            try {
              const liste = JSON.parse(corps);
              if (!Array.isArray(liste)) throw new Error('il faut une liste de fiches');
              for (const f of liste) {
                const p = chemin('content/codex/' + String(f.id).replace(/[^a-z0-9-]/gi, '') + '.md');
                if (!existsSync(p)) throw new Error('fiche inconnue : ' + f.id);
                let t = await readFile(p, 'utf8');
                t = remplacerCle(t, 'type', f.type);
                t = remplacerCle(t, 'univers', '[' + (f.univers ?? []).join(', ') + ']');
                await writeFile(p, t, 'utf8');
              }
              json(res, { ok: true, n: liste.length });
            } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
          });
        });

        // Crée une fiche vide, prête à être écrite.
        server.middlewares.use('/__codex/creer', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (corps) => {
            try {
              const d = JSON.parse(corps);
              const titre = String(d.titre ?? '').trim();
              if (!titre) throw new Error('il faut un titre');
              const id = titre.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
              const p = chemin('content/codex/' + id + '.md');
              if (existsSync(p)) throw new Error('cette fiche existe déjà : ' + id);
              const tete = ['---', 'titre: ' + JSON.stringify(titre),
                'type: ' + (d.type || 'notion'),
                'univers: [' + (d.univers ?? []).join(', ') + ']',
                'alias: [' + JSON.stringify(titre) + ']',
                'publie: false', '---', '', 'À écrire.', ''].join('\n');
              await writeFile(p, tete, 'utf8');
              json(res, { ok: true, id });
            } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
          });
        });

        // ── Lire et écrire une fiche entière ─────────────────────────────
        server.middlewares.use('/__codex/fiche', (req, res) => {
          const id = String(new URL(req.originalUrl ?? req.url, 'http://x').searchParams.get('id') ?? '')
            .replace(/[^a-z0-9-]/gi, '');
          const p = id && chemin('content/codex/' + id + '.md');
          if (req.method === 'GET') {
            (async () => {
              try {
                if (!p || !existsSync(p)) throw new Error('fiche inconnue');
                const d = matter.read(p);
                json(res, { ok: true, id, titre: d.data.titre ?? '', resume: d.data.resume ?? '',
                  question: d.data.question ?? '', alias: (d.data.alias ?? []).join(', '),
                  publie: d.data.publie !== false, type: d.data.type ?? 'notion',
                  univers: Array.isArray(d.data.univers) ? d.data.univers : [],
                  corps: String(d.content ?? '').replace(/^\n+/, '') });
              } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
            })();
            return;
          }
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (brut) => {
            try {
              const d = JSON.parse(brut);
              if (!p || !existsSync(p)) throw new Error('fiche inconnue');
              let t = await readFile(p, 'utf8');
              if (typeof d.titre === 'string' && d.titre.trim()) t = remplacerCle(t, 'titre', JSON.stringify(d.titre.trim()));
              if (typeof d.resume === 'string') t = remplacerCle(t, 'resume', JSON.stringify(d.resume));
              if (typeof d.question === 'string') t = remplacerCle(t, 'question', JSON.stringify(d.question));
              if (typeof d.alias === 'string') {
                const l = d.alias.split(',').map((x) => x.trim()).filter(Boolean);
                t = remplacerCle(t, 'alias', '[' + l.map((x) => JSON.stringify(x)).join(', ') + ']');
              }
              if (typeof d.type === 'string') t = remplacerCle(t, 'type', d.type);
              if (Array.isArray(d.univers)) t = remplacerCle(t, 'univers', '[' + d.univers.join(', ') + ']');
              t = remplacerCle(t, 'publie', d.publie === false ? 'false' : 'true');
              if (typeof d.corps === 'string') {
                const { tete } = couper(t);
                t = tete + '\n' + d.corps.replace(/\s+$/, '') + '\n';
              }
              await writeFile(p, t, 'utf8');
              json(res, { ok: true, signes: String(d.corps ?? '').trim().length });
            } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
          });
        });

        // Retirer une fiche : elle part à la corbeille, jamais effacée pour de bon.
        server.middlewares.use('/__codex/supprimer', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
          lire(req).then(async (brut) => {
            try {
              const id = String(JSON.parse(brut).id ?? '').replace(/[^a-z0-9-]/gi, '');
              const p = id && chemin('content/codex/' + id + '.md');
              if (!p || !existsSync(p)) throw new Error('fiche inconnue');
              const corbeille = chemin('../.corbeille/codex');
              await mkdir(corbeille, { recursive: true });
              const quand = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
              const vers = join(corbeille, id + '--' + quand + '.md');
              await writeFile(vers, await readFile(p, 'utf8'), 'utf8');
              await (await import('node:fs/promises')).rm(p);
              json(res, { ok: true, corbeille: vers });
            } catch (e) { json(res, { ok: false, erreur: String(e) }, 400); }
          });
        });
      },
    },
  };
}
