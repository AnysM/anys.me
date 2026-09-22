// Référencement : données structurées (schema.org), descriptions et dates.
import { execSync } from 'node:child_process';

export const SITE = 'https://anys.me';
export const PERSONNE_ID = `${SITE}/#anys`;
export const SITE_ID = `${SITE}/#site`;

export const personne = {
  '@type': 'Person',
  '@id': PERSONNE_ID,
  name: 'Anys Mechkar',
  url: `${SITE}/a-propos/`,
  image: `${SITE}/img/portrait.jpg`,
  description: 'Guide, créateur et initiateur. Accompagnement des transitions de vie, soins énergétiques, ateliers de présence, de mouvement et de créativité à Lyon.',
  jobTitle: 'Accompagnant, praticien de soins énergétiques et artiste',
  address: { '@type': 'PostalAddress', addressLocality: 'Lyon', addressCountry: 'FR' },
  knowsAbout: ['Méditation de pleine conscience', 'Danse Butô', 'Soin énergétique', 'Chamanisme', 'Human Design', 'Accompagnement des transitions de vie'],
  sameAs: ['https://www.instagram.com/anys.mechkar/', 'https://www.youtube.com/@anys.mechkar', 'https://www.facebook.com/anys.mechkar/'],
};

export const siteWeb = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: SITE,
  name: 'Anys Mechkar',
  inLanguage: 'fr-FR',
  publisher: { '@id': PERSONNE_ID },
};

/** URL absolue au format canonique du site (avec slash final, comme le sitemap). */
export const abs = (chemin: string) => {
  const u = new URL(chemin, SITE);
  if (u.origin === SITE && !u.pathname.endsWith('/') && !/\.\w+$/.test(u.pathname)) u.pathname += '/';
  return u.href;
};

export const fil = (etapes: { nom: string; url: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: etapes.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.nom, item: abs(e.url) })),
});

const sansMarkdown = (t = '') => t.replace(/[*_#>`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();

/** Description de 140 à 160 caractères : le résumé, complété par le début du texte si besoin. */
export function description(resume = '', corps = '', max = 158) {
  let d = sansMarkdown(resume);
  if (d.length < 110) {
    const norm = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const suite = sansMarkdown(corps).split(/(?<=[.!?…])\s+/).filter((p) => !norm(d).includes(norm(p)) && !norm(p).includes(norm(d))).join(' ');
    d = `${d}${d && !/[.!?…]$/.test(d) ? '.' : ''} ${suite}`.trim();
  }
  if (d.length <= max) return d;
  const coupe = d.slice(0, max);
  return coupe.slice(0, coupe.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…';
}

/** Date de dernière modification d'un fichier selon git (repli : la date donnée). */
export function modifieLe(fichier: string, repli?: Date) {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${fichier}"`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (iso) return new Date(iso);
  } catch {}
  return repli;
}
