// Fabrique les visuels de dates d'un atelier : post Instagram, story, et calque
// transparent à poser sur une vidéo. Le rendu passe par sharp, qui lit les polices
// du système (pas les .woff2 du dépôt) : Futura et Cormorant Garamond sont fournies
// par macOS, Biloxi Script doit être copiée dans ~/Library/Fonts.
//
//   node scripts/visuel-dates.mjs                        (les trois formats)
//   node scripts/visuel-dates.mjs --format story
//   node scripts/visuel-dates.mjs --titre serif --photo arbre-en-fleurs.jpg
//   node scripts/visuel-dates.mjs --sortie ~/Desktop

import sharp from 'sharp';
import path from 'node:path';
import os from 'node:os';

// ---------------------------------------------------------------- le contenu

const contenu = {
  titre: 'Infloressence',
  sousTitre: 'MÉDITATION  ·  DANSE BUTOH  ·  VOYAGE SONORE',
  mois: 'NOVEMBRE',
  // Pour un visuel qui n'annonce qu'une séance, les formats solo.
  seance: { jour: 'VENDREDI', date: '27 NOVEMBRE', heure: '18h30 → 20h', note: null },
  seances: [
    { jour: 'VENDREDI 6',  heure: '19h → 20h30', note: 'HORAIRE EXCEPTIONNEL' },
    { jour: 'DIMANCHE 15', heure: '19h → 20h30' },
    { jour: 'VENDREDI 20', heure: '18h30 → 20h' },
    { jour: 'VENDREDI 27', heure: '18h30 → 20h' },
  ],
  lieu: 'CHANKA STUDIO  ·  51 QUAI SAINT-VINCENT  ·  LYON',
  tarifs: '20 € la séance',
  site: 'ANYS.ME',
};

// ---------------------------------------------------------------- la grammaire

const NAVY = '#0A0F20', CREAM = '#ECE7DE', GOLD = '#E0AE5E', PALE = '#A6ADC4', CORAL = '#F07A5F';
const SANS = 'Futura', SERIF = 'Cormorant Garamond', MAIN = 'Biloxi Script';

// Deux écritures possibles pour le titre. Le manuscrit est plus fin, il demande
// un corps plus grand pour peser autant.
const titres = {
  manuscrit: { famille: MAIN,  style: 'normal', facteur: 1.52 },
  serif:     { famille: SERIF, style: 'italic', facteur: 1.0 },
};

const formats = {
  post:   { W: 1080, H: 1350, photoH: 668, fade: 300, titreY: 524,  sousY: 598,  moisY: 742,
            ligneY: 812,  pas: 84, noteGap: 66, piedY: 1196 },
  story:  { W: 1080, H: 1920, photoH: 980, fade: 440, titreY: 836,  sousY: 910,  moisY: 1054,
            ligneY: 1124, pas: 94, noteGap: 76, piedY: 1560 },
  // Calque : mêmes repères que la story, sans photo, avec un voile dégradé pour
  // que le texte tienne sur n'importe quelle image de fond.
  calque: { W: 1080, H: 1920, photoH: 800, fade: 380, titreY: 930,  sousY: 1002, moisY: 1080,
            ligneY: 1150, pas: 94, noteGap: 76, piedY: 1576, transparent: true },
  // Une seule séance, annoncée en grand.
  solo:      { W: 1080, H: 1350, photoH: 744, fade: 330, titreY: 604,  sousY: 678,
               jourY: 868,  dateY: 952,  heureY: 1044, piedY: 1182, solo: true },
  soloStory: { W: 1080, H: 1920, photoH: 1080, fade: 500, titreY: 940, sousY: 1014,
               jourY: 1230, dateY: 1320, heureY: 1416, piedY: 1570, solo: true },
};

const TITRE_CORPS = 96;
const SOUS_CORPS = 28;
const MARGE = 118;

function dessin(L, variante) {
  const mid = L.W / 2;
  const t = titres[variante];
  let o = '';

  if (L.transparent) {
    // Le voile ne couvre que le bas, là où se pose le texte.
    const haut = L.titreY - 150;
    o += `<defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${NAVY}" stop-opacity="0"/>
        <stop offset="0.18" stop-color="${NAVY}" stop-opacity="0.88"/>
        <stop offset="1" stop-color="${NAVY}" stop-opacity="0.94"/>
      </linearGradient></defs>
      <rect x="0" y="${haut}" width="${L.W}" height="${L.H - haut}" fill="url(#v)"/>`;
  } else {
    // Le dégradé s'arrête à mi-voile derrière le titre, pour que les fleurs
    // restent visibles autour des lettres, puis ferme sur le navy plein.
    const h = (y) => Math.max(0, Math.min(1, y / L.photoH)).toFixed(3);
    o += `<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${NAVY}" stop-opacity="0.16"/>
        <stop offset="${h(L.fade)}" stop-color="${NAVY}" stop-opacity="0.26"/>
        <stop offset="${h(L.titreY - 80)}" stop-color="${NAVY}" stop-opacity="0.40"/>
        <stop offset="${h(L.titreY + 50)}" stop-color="${NAVY}" stop-opacity="0.64"/>
        <stop offset="1" stop-color="${NAVY}" stop-opacity="1"/>
      </linearGradient>
      <radialGradient id="g">
        <stop offset="0" stop-color="${NAVY}" stop-opacity="0.60"/>
        <stop offset="1" stop-color="${NAVY}" stop-opacity="0"/>
      </radialGradient></defs>
      <rect x="0" y="0" width="${L.W}" height="${L.photoH}" fill="url(#f)"/>
      <ellipse cx="${mid}" cy="${L.titreY - 26}" rx="${Math.round(L.W * 0.46)}" ry="108" fill="url(#g)"/>`;
  }

  o += `<text x="${mid}" y="${L.titreY}" text-anchor="middle" font-family="${t.famille}" font-style="${t.style}" font-size="${Math.round(TITRE_CORPS * t.facteur)}" fill="${CREAM}">${contenu.titre}</text>`;
  o += `<text x="${mid}" y="${L.sousY}" text-anchor="middle" font-family="${SANS}" font-size="${SOUS_CORPS}" letter-spacing="4" fill="${GOLD}">${contenu.sousTitre}</text>`;
  if (L.solo) {
    const s = contenu.seance;
    o += `<text x="${mid}" y="${L.jourY}" text-anchor="middle" font-family="${SANS}" font-size="34" letter-spacing="11" fill="${PALE}">${s.jour}</text>`;
    o += `<text x="${mid}" y="${L.dateY}" text-anchor="middle" font-family="${SANS}" font-size="72" letter-spacing="6" fill="${CREAM}">${s.date}</text>`;
    o += `<text x="${mid}" y="${L.heureY}" text-anchor="middle" font-family="${SANS}" font-size="56" letter-spacing="2" fill="${GOLD}">${s.heure}</text>`;
    if (s.note) {
      o += `<text x="${mid}" y="${L.heureY + 56}" text-anchor="middle" font-family="${SANS}" font-size="24" letter-spacing="3.5" fill="${CORAL}">${s.note}</text>`;
    }
    return pied(o, L, mid);
  }

  o += `<text x="${mid}" y="${L.moisY}" text-anchor="middle" font-family="${SANS}" font-size="26" letter-spacing="12" fill="${PALE}">${contenu.mois}</text>`;

  let y = L.ligneY;
  for (const s of contenu.seances) {
    o += `<text x="${MARGE}" y="${y}" font-family="${SANS}" font-size="39" letter-spacing="4" fill="${CREAM}">${s.jour}</text>`;
    o += `<text x="${L.W - MARGE}" y="${y}" text-anchor="end" font-family="${SANS}" font-size="39" letter-spacing="1" fill="${GOLD}">${s.heure}</text>`;
    let filet = y + 30;
    if (s.note) {
      o += `<text x="${MARGE}" y="${y + 36}" font-family="${SANS}" font-size="21" letter-spacing="3.5" fill="${CORAL}">${s.note}</text>`;
      filet = y + L.noteGap;
    }
    o += `<line x1="${MARGE}" y1="${filet}" x2="${L.W - MARGE}" y2="${filet}" stroke="#FFFFFF" stroke-width="1" opacity="0.13"/>`;
    y = filet + (L.pas - 30);
  }

  return pied(o, L, mid);
}

// Le pied, commun à toutes les mises en page : lieu, tarifs, adresse du site.
function pied(o, L, mid) {
  o += `<text x="${mid}" y="${L.piedY}" text-anchor="middle" font-family="${SANS}" font-size="24" letter-spacing="3.5" fill="${PALE}">${contenu.lieu}</text>`;
  o += `<text x="${mid}" y="${L.piedY + 44}" text-anchor="middle" font-family="${SANS}" font-size="28" letter-spacing="1.5" fill="${CREAM}">${contenu.tarifs}</text>`;
  o += `<text x="${mid}" y="${L.piedY + 86}" text-anchor="middle" font-family="${SANS}" font-size="22" letter-spacing="6" fill="${GOLD}">${contenu.site}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L.W}" height="${L.H}">${o}</svg>`;
}

async function rendre(nomFormat, variante, photo, sortie) {
  const L = formats[nomFormat];
  const svg = Buffer.from(dessin(L, variante));

  if (L.transparent) {
    const fichier = path.join(sortie, `${base(nomFormat)}-calque.png`);
    await sharp(svg).png().toFile(fichier);
    return fichier;
  }

  const fichier = path.join(sortie, `${base(nomFormat)}-${nomFormat.toLowerCase()}.jpg`);
  const image = await sharp(path.join('public/img', photo))
    .resize(L.W, L.photoH, { fit: 'cover', position: 'centre' }).toBuffer();
  await sharp({ create: { width: L.W, height: L.H, channels: 3, background: NAVY } })
    .composite([{ input: image, top: 0, left: 0 }, { input: svg, top: 0, left: 0 }])
    .jpeg({ quality: 92 }).toFile(fichier);
  return fichier;
}

// Le nom du fichier dit ce qu'il annonce : le mois entier, ou la seule séance.
const colle = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const base = (nomFormat) => formats[nomFormat].solo
  ? `${colle(contenu.titre)}-${colle(`${contenu.seance.jour} ${contenu.seance.date}`)}`
  : `${colle(contenu.titre)}-${colle(contenu.mois)}`;

// ---------------------------------------------------------------- la ligne de commande

const args = process.argv.slice(2);
const lire = (nom, defaut) => {
  const i = args.indexOf(`--${nom}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : defaut;
};

const variante = lire('titre', 'manuscrit');
const photo = lire('photo', 'fleurs-bleues.jpg');
const sortie = lire('sortie', os.tmpdir()).replace(/^~/, os.homedir());
const demande = lire('format', null);
const aFaire = demande ? [demande] : ['post', 'story', 'calque'];

if (!titres[variante]) {
  console.error(`Titre inconnu : ${variante}. Au choix : ${Object.keys(titres).join(', ')}`);
  process.exit(1);
}

for (const f of aFaire) {
  if (!formats[f]) {
    console.error(`Format inconnu : ${f}. Au choix : ${Object.keys(formats).join(', ')}`);
    process.exit(1);
  }
  console.log(await rendre(f, variante, photo, sortie));
}
