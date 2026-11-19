// Ce que le CMS effacerait sans rien dire.
//
// Tina réécrit un fichier entier à partir de son schéma : un champ qu'il ne
// déclare pas disparaît à l'enregistrement, sans message, sans erreur. C'est
// ainsi que les numéros d'actes de l'À propos ont été effacés deux fois, et
// avec eux tous les titres de chapitre de la page.
//
// Ce script compare chaque champ réellement présent dans les contenus avec ce
// que le schéma déclare, et nomme les absents. Il tourne au démarrage du
// serveur de développement et avant chaque build.
//
//   node scripts/verifier-schema.mjs

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');

// Les champs déclarés, à plat : « chapitres.acte », « tarifs.prix ».
function declares(champs, prefixe = '', vus = new Set()) {
  for (const f of champs ?? []) {
    const route = prefixe ? prefixe + '.' + f.name : f.name;
    vus.add(route);
    if (f.fields) declares(f.fields, route, vus);
    // Un champ à gabarits (« templates ») porte ses champs dans chacun d'eux.
    for (const t of f.templates ?? []) declares(t.fields, route, vus);
  }
  return vus;
}

// Les champs réellement écrits, à plat, les numéros de liste effacés.
function presents(valeur, prefixe = '', vus = new Set()) {
  if (Array.isArray(valeur)) {
    for (const v of valeur) presents(v, prefixe, vus);
    return vus;
  }
  if (valeur && typeof valeur === 'object') {
    for (const [k, v] of Object.entries(valeur)) {
      const route = prefixe ? prefixe + '.' + k : k;
      vus.add(route);
      presents(v, route, vus);
    }
  }
  return vus;
}

// Le fichier appartient-il à cette collection ? Tina choisit par son « match ».
const retenu = (nom, collection) => {
  const inclus = collection.match?.include;
  if (!inclus) return true;
  const motif = new RegExp('^' + inclus.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  return motif.test(nom);
};

const schema = JSON.parse(readFileSync(join(racine, 'tina/__generated__/_schema.json'), 'utf8'));
const trous = [];
const orphelins = [];

for (const c of schema.collections) {
  const dossier = join(racine, c.path);
  if (!existsSync(dossier)) continue;
  const champs = declares(c.fields);
  for (const f of readdirSync(dossier).filter((x) => x.endsWith('.md'))) {
    const nom = f.replace(/\.md$/, '');
    if (!retenu(nom, c)) continue;
    const data = matter.read(join(dossier, f)).data;
    const manquants = [...presents(data)].filter((k) => !champs.has(k));
    if (manquants.length) trous.push({ fichier: c.path + '/' + f, collection: c.name, manquants });
  }
}

// Un fichier qu'aucune collection ne retient n'est pas modifiable dans Tina,
// mais il ne risque rien non plus : on le signale seulement.
for (const dossier of new Set(schema.collections.map((c) => c.path))) {
  const d = join(racine, dossier);
  if (!existsSync(d)) continue;
  const couverts = schema.collections.filter((c) => c.path === dossier);
  for (const f of readdirSync(d).filter((x) => x.endsWith('.md'))) {
    const nom = f.replace(/\.md$/, '');
    if (!couverts.some((c) => retenu(nom, c))) orphelins.push(dossier + '/' + f);
  }
}

if (!trous.length) {
  console.log('✓ schéma Tina : tous les champs des contenus sont déclarés'
    + (orphelins.length ? ` (${orphelins.length} fichier(s) hors Tina)` : ''));
  process.exit(0);
}

console.error('\n⚠ Des champs ne sont pas déclarés dans le schéma Tina.');
console.error('  Enregistrer une de ces pages dans Tina les effacerait.\n');
for (const t of trous) {
  console.error('  ' + t.fichier + '  (collection « ' + t.collection + ' »)');
  for (const m of t.manquants) console.error('      · ' + m);
}
if (orphelins.length) {
  console.error('\n  Hors de Tina, donc sans risque : ' + orphelins.join(', '));
}
console.error('');
process.exit(1);
