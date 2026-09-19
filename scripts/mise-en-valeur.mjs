// Pose une œuvre sur un fond bleu nuit, avec une ombre portée douce (image principale d'un artefact).
// Usage : node scripts/mise-en-valeur.mjs photo-recadree.jpg public/img/artefact-nom-1.jpg
// La photo doit être recadrée au ras de l'œuvre (sans mur ni table autour).
import sharp from 'sharp';

const [source, cible] = process.argv.slice(2);
if (!source || !cible) { console.error('Usage : node scripts/mise-en-valeur.mjs source.jpg cible.jpg'); process.exit(1); }

const W = 1600, H = 2000;
const art = await sharp(source).rotate().resize({ height: 1480, width: 1300, fit: 'inside' }).toBuffer({ resolveWithObject: true });
const aw = art.info.width, ah = art.info.height;
const x = Math.round((W - aw) / 2), y = Math.round((H - ah) / 2) - 40;

// Fond éclairé par le haut + deux ombres (large et diffuse, courte et plus dense), floutées ensemble
const svg = `<svg width="${W}" height="${H}"><defs><radialGradient id="g" cx="50%" cy="28%" r="80%">
  <stop offset="0" stop-color="#202a5c"/><stop offset="0.55" stop-color="#121a40"/><stop offset="1" stop-color="#090d20"/>
  </radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="${x + 14}" y="${y + 46}" width="${aw - 6}" height="${ah}" fill="#000" fill-opacity="0.8"/>
  <rect x="${x + 4}" y="${y + 14}" width="${aw - 2}" height="${ah}" fill="#000" fill-opacity="0.5"/></svg>`;
const fond = await sharp(Buffer.from(svg)).blur(42).toBuffer();
await sharp(fond).composite([{ input: art.data, left: x, top: y }]).jpeg({ quality: 92 }).toFile(cible);
console.log(`${cible} (${W}×${H})`);
