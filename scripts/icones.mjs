// Fabrique les icônes d'écran d'accueil à partir du logo.
//
// Le logo est transparent et décentré dans son cadre : on le détoure d'abord,
// sinon le vide compte comme de l'image et l'étoile se retrouve de travers une
// fois posée au milieu du carré.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SOURCE = 'public/img/logo.png';
const DOSSIER = 'public/icones';
const FOND = { r: 0x0a, g: 0x0f, b: 0x20, alpha: 1 }; // la couleur du site

// part : la place que prend l'étoile dans le carré. iOS arrondit lui-même les
// angles, et une icône « maskable » peut être rognée jusqu'à son cercle
// intérieur : on lui laisse donc une marge plus large.
const ICONES = [
  { nom: 'apple-touch-icon.png', taille: 180, part: 0.66 },
  { nom: 'icone-192.png', taille: 192, part: 0.7 },
  { nom: 'icone-512.png', taille: 512, part: 0.7 },
  { nom: 'icone-512-masquable.png', taille: 512, part: 0.56 },
];

await mkdir(DOSSIER, { recursive: true });

const detoure = await sharp(SOURCE).trim().png().toBuffer();
const { width, height } = await sharp(detoure).metadata();
console.log(`étoile détourée : ${width} × ${height}`);

for (const { nom, taille, part } of ICONES) {
  const dedans = Math.round(taille * part);
  const etoile = await sharp(detoure)
    .resize(dedans, dedans, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({ create: { width: taille, height: taille, channels: 4, background: FOND } })
    .composite([{ input: etoile, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(`${DOSSIER}/${nom}`);

  console.log(`  ${nom} · ${taille}×${taille}, étoile à ${Math.round(part * 100)} %`);
}
