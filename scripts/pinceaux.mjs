/**
 * Fabrique les quatre sens de chaque bord de pinceau.
 *
 * Une séparation est un aplat de couleur unie, masqué par un bord photographié.
 * Comme le fond n'a aucun motif, retourner l'élément ne retourne visuellement
 * que le masque — et c'est précisément ce qu'un vieux WebKit ne fait pas : il
 * peint le masque dans le repère d'avant transformation, si bien que la bande
 * s'affiche à l'endroit alors qu'on l'a demandée à l'envers.
 *
 * Plutôt que de contourner ce bug, on le rend impossible : chaque sens a son
 * image. Le CSS ne transforme plus rien, il choisit un fichier.
 *
 *     node scripts/pinceaux.mjs
 *
 * À relancer seulement si tu ajoutes ou remplaces un bord-N.png. Les variantes
 * se régénèrent alors entièrement, donc il n'y a rien à supprimer à la main.
 */
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BROSSES = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img', 'brosses');

// Le nom dit à quoi la variante sert, pas quelle opération l'a produite : on
// lit « bord-4-haut-retourne » et on sait où il va, sans traduire.
const SENS = [
  { suffixe: '-haut', flip: true, flop: false },
  { suffixe: '-retourne', flip: false, flop: true },
  { suffixe: '-haut-retourne', flip: true, flop: true },
];

const ko = (o) => `${(o / 1024).toFixed(0)} Ko`;

const fichiers = (await readdir(BROSSES))
  .filter((n) => /^bord-\d+\.png$/.test(n))
  .sort();

if (!fichiers.length) {
  console.error(`Aucun bord-N.png dans ${BROSSES}`);
  process.exit(1);
}

let faits = 0;
let poids = 0;

for (const nom of fichiers) {
  const base = nom.replace(/\.png$/, '');
  for (const { suffixe, flip, flop } of SENS) {
    const sortie = join(BROSSES, `${base}${suffixe}.png`);
    let image = sharp(join(BROSSES, nom));
    if (flip) image = image.flip();   // haut ↔ bas
    if (flop) image = image.flop();   // gauche ↔ droite
    // Le masque ne lit que le canal alpha : la palette ne sert à rien, et une
    // compression maximale ne coûte que du temps de fabrication.
    await image.png({ compressionLevel: 9, palette: true }).toFile(sortie);
    poids += (await stat(sortie)).size;
    faits++;
  }
}

console.log(`${faits} variantes fabriquées à partir de ${fichiers.length} bords (${ko(poids)})`);
console.log('Chaque bord existe maintenant dans les quatre sens : le CSS choisit un fichier au lieu de retourner un élément.');
