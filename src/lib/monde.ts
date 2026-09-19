// Relie les pièces du monde : fiches du Codex, propositions (offres + agenda) et récit.
import { getCollection, getEntry } from 'astro:content';
import { seuilDe } from './univers.mjs';
import { evoques } from './lore.mjs';

export type Proposition = {
  cle: string; // "offres/x" ou "agenda/x"
  id: string;
  titre: string;
  href: string;
  externe: boolean;
  seuil: string;
  categorie: string;
  resume?: string;
  prix?: string;
  quand?: string;
  image?: string;
  ordre: number;
  date?: Date;
  accueil: boolean;
};

const fmtCourt = (d: Date) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(d).replace('.', '');

export function ligneDate(d: any): string {
  if (!d.date) return d.rythme ?? 'Sur inscription';
  if (d.date_fin) {
    const j = Math.round((d.date_fin.getTime() - d.date.getTime()) / 86400000) + 1;
    const meme = d.date.getMonth() === d.date_fin.getMonth() && d.date.getFullYear() === d.date_fin.getFullYear();
    const mo = (x: Date) => new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(x).replace('.', '');
    const moy = (x: Date) => new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(x).replace('.', '');
    const r = meme ? `Du ${d.date.getDate()} au ${d.date_fin.getDate()} ${moy(d.date_fin)}` : `Du ${d.date.getDate()} ${mo(d.date)} au ${d.date_fin.getDate()} ${moy(d.date_fin)}`;
    return `${r} · ${j} jours`;
  }
  return fmtCourt(d.date) + (d.heure ? ` · ${d.heure}` : '');
}

export const hrefAgenda = (e: any) => e.data.site ?? `/agenda/${e.id}`;
export const estExterne = (href?: string) => !!href && /^https?:/.test(href);

export async function codex() {
  return (await getCollection('codex')).filter((c) => c.data.publie).sort((a, b) => a.data.ordre - b.data.ordre);
}

export async function propositions(): Promise<Proposition[]> {
  const offres = (await getCollection('offres')).filter((o) => o.data.publie);
  const agenda = (await getCollection('agenda')).filter((e) => e.data.publie);
  return [
    ...offres.map((o) => ({
      cle: `offres/${o.id}`, id: o.id, titre: o.data.titre, href: `/offre/${o.id}`, externe: false,
      seuil: seuilDe(o.data), categorie: o.data.categorie, resume: o.data.resume, image: o.data.image, ordre: o.data.ordre,
      accueil: o.data.accueil, prix: o.data.prix ?? (o.data.tarifs?.length ? `dès ${o.data.tarifs.map((t) => t.prix).sort((a, b) => parseInt(a) - parseInt(b))[0]}` : undefined),
      quand: o.data.duree ?? o.data.format,
    })),
    ...agenda.map((e) => ({
      cle: `agenda/${e.id}`, id: e.id, titre: e.data.titre, href: hrefAgenda(e), externe: estExterne(hrefAgenda(e)),
      seuil: seuilDe(e.data), categorie: e.data.categorie, resume: e.data.resume, image: e.data.image, ordre: e.data.ordre,
      prix: e.data.prix, quand: ligneDate(e.data), date: e.data.date, accueil: e.data.accueil,
    })),
  ];
}

/** Fiches du Codex qui mènent à cette proposition ("offres/x" ou "agenda/x"). */
export async function codexDe(cle: string) {
  const [col, id] = cle.split('/');
  return (await codex()).filter((c) => (c.data as any)[col]?.includes(id));
}

/** Les propositions vers lesquelles mène une fiche. */
export async function propositionsDe(fiche: any) {
  const toutes = await propositions();
  const cles = new Set([...fiche.data.offres.map((x: string) => `offres/${x}`), ...fiche.data.agenda.map((x: string) => `agenda/${x}`)]);
  return toutes.filter((p) => cles.has(p.cle));
}

/** Chapitres du récit, avec pour chacun les fiches du Codex qu'il évoque. */
export async function recit() {
  const ap = (await getEntry('pages', 'a-propos'))!.data;
  return (ap.chapitres ?? []).map((c, i) => ({
    ...c,
    ancre: `chapitre-${i + 1}`,
    echos: [...new Set([...(c.echos ?? []), ...evoques(c.texte)])],
  }));
}

/** Les chapitres du récit où apparaît une fiche. */
export async function chapitresDe(id: string) {
  return (await recit()).filter((c) => c.echos.includes(id));
}
