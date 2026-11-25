// Fabrique les visuels de dates d'un atelier : post Instagram, story, et calque
// transparent à poser sur une vidéo. Le rendu passe par sharp, qui lit les polices
// du système (pas les .woff2 du dépôt) : Futura et Cormorant Garamond sont fournies
// par macOS, Biloxi Script doit être copiée dans ~/Library/Fonts.
//
//   node scripts/visuel-dates.mjs                        (les trois formats du mois)
//   node scripts/visuel-dates.mjs --format solo
//   node scripts/visuel-dates.mjs --titre serif --photo fleurs-melees.jpg
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

// photoH est la hauteur du bandeau photo, et donc la part d'image dans le visuel.
// Elle prime sur le cadrage : la photo remplit le bandeau, quitte à être recadrée.
const formats = {
  post:      { W: 1080, H: 1350, photoH: 608, piedY: 1210, pas: 84, noteGap: 66 },
  story:     { W: 1080, H: 1920, photoH: 900, piedY: 1550, pas: 94, noteGap: 76 },
  calque:    { W: 1080, H: 1920, photoH: 900, piedY: 1550, pas: 94, noteGap: 76, transparent: true },
  // Une seule séance, annoncée en grand.
  solo:      { W: 1080, H: 1350, photoH: 744, piedY: 1210, solo: true },
  soloStory: { W: 1080, H: 1920, photoH: 980, piedY: 1530, solo: true },
};

const TITRE_CORPS = 96;
const SOUS_CORPS = 28;
const MARGE = 118;

// Le titre se pose tout en bas du bandeau, là où le dégradé a déjà presque fermé :
// la photo l'habite sans le disputer. Le sous-titre tombe sur le navy plein.
const repères = (L, bande) => {
  const titreY = bande - 56;
  const sousY = titreY + 74;
  return L.solo
    ? { titreY, sousY, jourY: sousY + 180, dateY: sousY + 262, heureY: sousY + 352 }
    : { titreY, sousY, moisY: sousY + 144, ligneY: sousY + 210 };
};

function dessin(L, variante, bande) {
  const mid = L.W / 2;
  const t = titres[variante];
  const R = repères(L, bande);
  let o = '';

  if (L.transparent) {
    // Pas de photo : le voile part de transparent au-dessus du titre.
    const haut = R.titreY - 170;
    o += `<defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${NAVY}" stop-opacity="0"/>
        <stop offset="0.18" stop-color="${NAVY}" stop-opacity="0.88"/>
        <stop offset="1" stop-color="${NAVY}" stop-opacity="0.94"/>
      </linearGradient></defs>
      <rect x="0" y="${haut}" width="${L.W}" height="${L.H - haut}" fill="url(#v)"/>`;
  } else {
    // La photo court jusqu'en bas. Le voile reste léger sur le bandeau, se densifie
    // derrière le titre, et s'arrête à 0,88 : les fleurs restent présentes sous les
    // dates au lieu de disparaître derrière un aplat.
    const h = (y) => Math.max(0, Math.min(1, y / L.H)).toFixed(3);
    o += `<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${NAVY}" stop-opacity="0.12"/>
        <stop offset="${h(bande - 320)}" stop-color="${NAVY}" stop-opacity="0.24"/>
        <stop offset="${h(bande - 170)}" stop-color="${NAVY}" stop-opacity="0.46"/>
        <stop offset="${h(bande + 20)}" stop-color="${NAVY}" stop-opacity="0.93"/>
        <stop offset="1" stop-color="${NAVY}" stop-opacity="0.95"/>
      </linearGradient>
      <radialGradient id="g">
        <stop offset="0" stop-color="${NAVY}" stop-opacity="0.26"/>
        <stop offset="1" stop-color="${NAVY}" stop-opacity="0"/>
      </radialGradient></defs>
      <rect x="0" y="0" width="${L.W}" height="${L.H}" fill="url(#f)"/>
      <ellipse cx="${mid}" cy="${R.titreY - 24}" rx="${Math.round(L.W * 0.46)}" ry="90" fill="url(#g)"/>`;
  }

  o += `<text x="${mid}" y="${R.titreY}" text-anchor="middle" font-family="${t.famille}" font-style="${t.style}" font-size="${Math.round(TITRE_CORPS * t.facteur)}" fill="${CREAM}">${contenu.titre}</text>`;
  o += `<text x="${mid}" y="${R.sousY}" text-anchor="middle" font-family="${SANS}" font-size="${SOUS_CORPS}" letter-spacing="4" fill="${GOLD}">${contenu.sousTitre}</text>`;

  if (L.solo) {
    const s = contenu.seance;
    o += `<text x="${mid}" y="${R.jourY}" text-anchor="middle" font-family="${SANS}" font-size="34" letter-spacing="11" fill="${PALE}">${s.jour}</text>`;
    o += `<text x="${mid}" y="${R.dateY}" text-anchor="middle" font-family="${SANS}" font-size="72" letter-spacing="6" fill="${CREAM}">${s.date}</text>`;
    o += `<text x="${mid}" y="${R.heureY}" text-anchor="middle" font-family="${SANS}" font-size="56" letter-spacing="2" fill="${GOLD}">${s.heure}</text>`;
    if (s.note) {
      o += `<text x="${mid}" y="${R.heureY + 56}" text-anchor="middle" font-family="${SANS}" font-size="24" letter-spacing="3.5" fill="${CORAL}">${s.note}</text>`;
    }
    return pied(o, L, mid);
  }

  o += `<text x="${mid}" y="${R.moisY}" text-anchor="middle" font-family="${SANS}" font-size="26" letter-spacing="12" fill="${PALE}">${contenu.mois}</text>`;

  let y = R.ligneY;
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

  if (L.transparent) {
    const svg = Buffer.from(dessin(L, variante, L.photoH));
    const fichier = path.join(sortie, `${base(nomFormat)}-calque.png`);
    await sharp(svg).png().toFile(fichier);
    return fichier;
  }

  const bande = L.photoH;
  // La photo occupe tout le visuel, le voile fait le reste.
  const image = await sharp(path.join('public/img', photo))
    .resize(L.W, L.H, { fit: 'cover', position: 'centre' }).toBuffer();
  const fichier = path.join(sortie, `${base(nomFormat)}-${nomFormat.toLowerCase()}.jpg`);
  await sharp({ create: { width: L.W, height: L.H, channels: 3, background: NAVY } })
    .composite([{ input: image, top: 0, left: 0 }, { input: Buffer.from(dessin(L, variante, bande)), top: 0, left: 0 }])
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
const photo = lire('photo', 'fleur-eclosion.jpg');
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
