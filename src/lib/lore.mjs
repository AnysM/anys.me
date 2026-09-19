// Tisse les liens vers le Codex : la première apparition d'un mot du Codex
// (titre ou alias) dans une page devient un lien discret vers sa fiche.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { visit, SKIP } from 'unist-util-visit';

const DIR = join(process.cwd(), 'src/content/codex');

export function lireCodex() {
  let files = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.md')); } catch { return []; }
  return files
    .map((f) => ({ id: f.replace(/\.md$/, ''), data: matter(readFileSync(join(DIR, f), 'utf8')).data }))
    .filter((e) => e.data.publie !== false);
}

/** Fiches trop courtes pour être proposées aux moteurs de recherche (contenu « mince »). */
export const MINIMUM_SEO = 200;
export function fichesMinces() {
  let files = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.md')); } catch { return []; }
  return files.filter((f) => matter(readFileSync(join(DIR, f), 'utf8')).content.trim().length < MINIMUM_SEO).map((f) => f.replace(/\.md$/, ''));
}

const echap = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function construire() {
  const formes = [];
  for (const e of lireCodex()) {
    const titre = String(e.data.titre ?? '').replace(/^(le|la|les|l[’']|un|une)\s*/i, '');
    for (const f of [titre, ...(e.data.alias ?? [])]) if (f) formes.push({ f: f.toLowerCase(), id: e.id });
  }
  formes.sort((a, b) => b.f.length - a.f.length);
  const parForme = new Map(formes.map((x) => [x.f, x.id]));
  const re = formes.length
    ? new RegExp(`(?<![\\p{L}\\p{N}])(${formes.map((x) => echap(x.f)).join('|')})(?![\\p{L}\\p{N}])`, 'giu')
    : null;
  return { re, parForme };
}

let cache;
const lexique = () => (cache ??= construire());

/** Contexte de page : chaque fiche n'est liée qu'une fois, et jamais depuis sa propre page. */
export const contexte = (soi = null) => ({ deja: new Set(soi ? [soi] : []) });

/** Découpe un texte en morceaux { t } ou { t, id } selon les mots du Codex trouvés. */
export function decouper(texte, ctx) {
  const { re, parForme } = lexique();
  if (!re || !texte) return [{ t: texte ?? '' }];
  const out = [];
  let dernier = 0;
  for (const m of texte.matchAll(re)) {
    const id = parForme.get(m[0].toLowerCase());
    if (!id || ctx.deja.has(id)) continue;
    ctx.deja.add(id);
    if (m.index > dernier) out.push({ t: texte.slice(dernier, m.index) });
    out.push({ t: m[0], id });
    dernier = m.index + m[0].length;
  }
  if (dernier < texte.length) out.push({ t: texte.slice(dernier) });
  return out;
}

/** Identifiants des fiches évoquées dans un texte (sans consommer le contexte d'une page). */
export const evoques = (texte) => decouper(texte, contexte()).filter((x) => x.id).map((x) => x.id);

const html = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Texte brut saisi dans Tina → HTML : échappe, tisse les liens du Codex,
 * puis applique *manuscrite* et **doré**.
 */
export function tisser(texte, ctx) {
  return decouper(texte ?? '', ctx)
    .map((x) => (x.id ? `<a class="lore" href="/codex/${x.id}">${html(x.t)}</a>` : html(x.t)))
    .join('')
    .replace(/&lt;br&gt;/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<span class="script">$1</span>');
}

const INTOUCHABLES = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'code', 'pre']);

/** Plugin rehype : tisse les liens dans les contenus Markdown (offres, agenda, fiches). */
export function rehypeLore() {
  return (arbre, fichier) => {
    const chemin = String(fichier.path ?? '');
    const soi = chemin.includes('/content/codex/') ? chemin.split('/').pop().replace(/\.md$/, '') : null;
    const ctx = contexte(soi);
    visit(arbre, (noeud, index, parent) => {
      if (noeud.type === 'element' && INTOUCHABLES.has(noeud.tagName)) return SKIP;
      if (noeud.type !== 'text' || !parent || index == null) return;
      const morceaux = decouper(noeud.value, ctx);
      if (morceaux.length === 1 && !morceaux[0].id) return;
      const nouveaux = morceaux.map((x) =>
        x.id
          ? { type: 'element', tagName: 'a', properties: { className: ['lore'], href: `/codex/${x.id}` }, children: [{ type: 'text', value: x.t }] }
          : { type: 'text', value: x.t },
      );
      parent.children.splice(index, 1, ...nouveaux);
      return [SKIP, index + nouveaux.length];
    });
  };
}
