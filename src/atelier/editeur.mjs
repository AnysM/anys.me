// L'éditeur de l'atelier, bâti sur Tiptap / ProseMirror.
//
// Pourquoi une bibliothèque : un `contenteditable` nu laisse le navigateur
// décider de tout — où va le curseur, ce que fait Entrée, ce que produit un
// collage. ProseMirror tient un document à part du DOM et n'applique que des
// transformations qu'on a décrites. L'annulation, la sélection, les claviers
// internationaux et le collage deviennent des problèmes résolus.
//
// Ce fichier n'est servi qu'en développement, par la route /__editeur.js.
// Il n'entre jamais dans le site publié.
import { Editor, Extension, Mark, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { POLICES, TAILLES, TEINTES, DE_NOM, classeDe } from '../lib/styles-texte.mjs';
export { FAMILLES } from '../lib/styles-texte.mjs';

// ── Le manuscrit : la troisième marque du récit, à côté du gras et de
//    l'italique. Elle s'écrit `*comme ça*` et se rend en Biloxi doré.
const Manuscrit = Mark.create({
  name: 'manuscrit',
  parseHTML: () => [{ tag: 'span.script' }],
  renderHTML: ({ HTMLAttributes }) => ['span', mergeAttributes(HTMLAttributes, { class: 'script' }), 0],
  addKeyboardShortcuts() {
    return { 'Mod-e': () => this.editor.commands.toggleMark('manuscrit') };
  },
});

// ── Les réglages fins : police, taille, couleur ─────────────────────────
// Une marque par famille, qui ne porte qu'un nom de la liste fermée. On ne
// choisit jamais une valeur libre : la page garderait sa cohérence un mois.
function familleDeMarque(nom, liste) {
  return Mark.create({
    name: nom,
    addAttributes: () => ({ valeur: { default: null } }),
    parseHTML: () => liste.map((x) => ({ tag: 'span.' + classeDe(x.nom),
      getAttrs: () => ({ valeur: x.nom }) })),
    renderHTML: ({ HTMLAttributes, mark }) =>
      ['span', mergeAttributes({ class: classeDe(mark.attrs.valeur) },
        { ...HTMLAttributes, valeur: undefined }), 0],
  });
}
export const Police = familleDeMarque('police', POLICES);
export const Taille = familleDeMarque('taille', TAILLES);
export const Teinte = familleDeMarque('teinte', TEINTES);

// ── Markdown restreint → document ───────────────────────────────────────
// Le fichier ne connaît que trois marques et deux séparations : le retour à
// la ligne simple et la ligne vide. On lit caractère par caractère, c'est la
// seule façon de poser une marque qui en chevauche une autre.
const MARQUES = { gras: '**', italique: '_', manuscrit: '*' };
const NOM = { gras: 'bold', italique: 'italic', manuscrit: 'manuscrit' };

function enCaracteres(md, heritage = null) {
  const sortie = [];
  let i = 0, style = null;
  while (i < md.length) {
    if (md.startsWith('**', i)) { style = style === 'gras' ? null : 'gras'; i += 2; continue; }
    if (md[i] === '_') { style = style === 'italique' ? null : 'italique'; i += 1; continue; }
    if (md[i] === '*') { style = style === 'manuscrit' ? null : 'manuscrit'; i += 1; continue; }
    if (md[i] === '[') {
      const m = /^\[([^\]\n]+)\]\{([a-zéè ]+)\}/.exec(md.slice(i));
      const noms = m ? m[2].trim().split(/\s+/).filter((n) => DE_NOM[n]) : [];
      if (noms.length) {
        const r = { ...(heritage ?? {}) };
        for (const n of noms) r[DE_NOM[n].famille] = n;
        for (const sous of enCaracteres(m[1], r)) sortie.push({ ...sous, s: sous.s ?? style });
        i += m[0].length;
        continue;
      }
    }
    sortie.push({ c: md[i], s: md[i] === '\n' ? null : style, r: heritage });
    i += 1;
  }
  return sortie;
}

const memeReglage = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export function versDoc(md) {
  const paragraphes = String(md ?? '').split(/\n{2,}/);
  return {
    type: 'doc',
    content: paragraphes.map((par) => {
      const contenu = [];
      let tampon = '', style = null;
      const vider = () => {
        if (!tampon) return;
        const marques = style ? [{ type: NOM[style] }] : [];
        for (const [famille, valeur] of Object.entries(reglage ?? {})) {
          marques.push({ type: famille, attrs: { valeur } });
        }
        contenu.push({ type: 'text', text: tampon, ...(marques.length ? { marks: marques } : {}) });
        tampon = '';
      };
      let reglage = null;
      for (const { c, s, r } of enCaracteres(par)) {
        if (c === '\n') { vider(); style = null; reglage = null; contenu.push({ type: 'hardBreak' }); continue; }
        if (s !== style || !memeReglage(r, reglage)) { vider(); style = s; reglage = r; }
        tampon += c;
      }
      vider();
      return { type: 'paragraph', ...(contenu.length ? { content: contenu } : {}) };
    }),
  };
}

// ── Document → markdown restreint ───────────────────────────────────────
export function versMarkdown(doc) {
  const paragraphes = [];
  doc.forEach((par) => {
    let t = '', ouvert = null, reglage = null;
    const fermeMarque = () => { if (ouvert) { t += MARQUES[ouvert]; ouvert = null; } };
    const fermeReglage = () => {
      if (!reglage) return;
      fermeMarque();
      t += ']{' + Object.values(reglage).join(' ') + '}';
      reglage = null;
    };
    par.forEach((n) => {
      if (n.type.name === 'hardBreak') { fermeMarque(); fermeReglage(); t += '\n'; return; }
      if (!n.isText) return;
      const noms = n.marks.map((x) => x.type.name);
      const style = noms.includes('bold') ? 'gras' : noms.includes('italic') ? 'italique'
        : noms.includes('manuscrit') ? 'manuscrit' : null;
      const r = {};
      for (const m of n.marks) {
        if (['police', 'taille', 'teinte'].includes(m.type.name) && m.attrs.valeur) {
          r[m.type.name] = m.attrs.valeur;
        }
      }
      const reg = Object.keys(r).length ? r : null;

      // Un blanc de bord ne doit jamais être pris dans une marque : il ne se
      // rendrait pas. On le sort avant d'ouvrir.
      const avant = style ? (n.text.match(/^\s+/) || [''])[0] : '';
      const apres = style ? (n.text.match(/\s+$/) || [''])[0] : '';
      const coeur = style ? n.text.slice(avant.length, n.text.length - apres.length) : n.text;

      if (!memeReglage(reg, reglage)) {
        fermeReglage();
        if (reg) { t += '['; reglage = reg; }
      }
      if (avant) { fermeMarque(); t += avant; }
      if (!coeur) { if (apres) { fermeMarque(); t += apres; } return; }
      if (style !== ouvert) { fermeMarque(); if (style) { t += MARQUES[style]; ouvert = style; } }
      t += coeur;
      if (apres) { fermeMarque(); t += apres; }
    });
    fermeMarque();
    fermeReglage();
    // Deux sauts de ligne d'affilée, dans le fichier, veulent dire « nouveau
    // paragraphe ». Un paragraphe ne peut donc pas en contenir : on les réduit
    // à un, sinon la relecture couperait le paragraphe en deux.
    //
    // Même chose aux deux bords. Un saut posé en fin de paragraphe — ce qui
    // arrive à chaque fois qu'on appuie sur Entrée au bout d'une phrase —
    // laissait une ligne vide dans le fichier, et la relecture en faisait un
    // nouveau paragraphe. Le saut ne compte que s'il a du texte de part et
    // d'autre : dès que la ligne suivante est écrite, il revient tout seul.
    paragraphes.push(t.replace(/\n{2,}/g, '\n').replace(/([^\S\n]) +/g, '$1')
      .replace(/^[^\S\n]*\n/, '').replace(/\n[^\S\n]*$/, ''));
  });
  return paragraphes.join('\n\n');
}

// ── Le rendu vivant ─────────────────────────────────────────────────────
// Les mêmes règles que la page publiée, appliquées pendant que tu écris :
// un paragraphe entièrement en gras devient un souffle, entièrement à la main
// une main levée, et une phrase courte seule reçoit son silence. C'est ce qui
// rend l'édition vraiment « ce que tu vois est ce que tu auras ».
export function allureDe(par) {
  if (par.childCount === 0) return null;
  let saut = false, tout = { bold: true, manuscrit: true }, texte = '';
  par.forEach((n) => {
    if (n.type.name === 'hardBreak') { saut = true; return; }
    if (!n.isText) return;
    texte += n.text;
    // Une espace de bord ne porte jamais la marque : le markdown la sort du
    // gras pour qu'elle se rende. Elle ne doit donc pas décider de l'allure,
    // sinon un paragraphe qui finit par une espace perd son souffle au
    // rechargement. La page, elle, coupe les bords avant de regarder.
    if (!n.text.trim()) return;
    const m = n.marks.map((x) => x.type.name);
    if (!m.includes('bold')) tout.bold = false;
    if (!m.includes('manuscrit')) tout.manuscrit = false;
  });
  if (!texte.trim()) return null;
  // Un souffle garde son allure même sur deux lignes : c'est l'ensemble du
  // paragraphe qui est en gras, le saut ne le coupe pas en deux.
  if (tout.bold) return 'souffle';
  if (tout.manuscrit) return 'main-levee';
  if (!saut && texte.length <= 90) return 'seule';
  return null;
}

// La litanie du manifeste : deux paragraphes de suite qui commencent par les
// mêmes deux mots. La tête s'écrit une seule fois, en grand et à la main ; les
// suivantes la portent dans le fichier mais ne l'affichent pas. L'éditeur fait
// la même chose, pour que ce que tu vois soit ce que le site rendra.
// Attention : textContent d'un paragraphe ProseMirror avale les sauts de
// ligne. Sans eux, « Une mémoire\nd'un monde » donne « Une mémoired'un » et la
// litanie ne se reconnaît plus. On reconstruit le texte comme la page le lit.
function texteAvecSauts(par) {
  let t = '';
  par.forEach((n) => { t += n.type.name === 'hardBreak' ? '\n' : (n.text ?? ''); });
  return t;
}
const deuxMots = (par) => texteAvecSauts(par).trim().split(/\s+/).slice(0, 2).join(' ');

function decorsLitanie(doc) {
  const d = [];
  const lignes = [];
  doc.forEach((par, pos) => lignes.push({ par, pos, t: deuxMots(par) }));
  lignes.forEach((x, k) => {
    if (!x.t) return;
    const avant = k > 0 && lignes[k - 1].t === x.t;
    const apres = k + 1 < lignes.length && lignes[k + 1].t === x.t;
    if (!avant && !apres) return;
    const premier = !avant;
    d.push(Decoration.node(x.pos, x.pos + x.par.nodeSize,
      { class: 'litanie' + (premier ? ' litanie--premiere' : '') }));
    const de = x.pos + 1;
    // Le saut de ligne compte pour un caractère dans le document.
    const a = de + x.t.length + (premier ? 0 : 1);
    d.push(Decoration.inline(de, Math.min(a, x.pos + x.par.nodeSize - 1),
      { nodeName: 'span', class: premier ? 'litanie__tete script' : 'at-cache' }));
  });
  return d;
}

const cleAllure = new PluginKey('allure');
const plugeAllure = (manifeste) => new Plugin({
  key: cleAllure,
  props: {
    decorations(etat) {
      if (manifeste) return DecorationSet.create(etat.doc, decorsLitanie(etat.doc));
      const d = [];
      etat.doc.forEach((par, pos) => {
        const a = allureDe(par);
        if (a) d.push(Decoration.node(pos, pos + par.nodeSize, { class: a }));
      });
      return DecorationSet.create(etat.doc, d);
    },
  },
});

const Allure = Extension.create({
  name: 'allure',
  addOptions: () => ({ manifeste: false }),
  addProseMirrorPlugins() { return [plugeAllure(this.options.manifeste)]; },
});

// Une valeur d'une seule ligne — un titre, une amorce — n'a pas de paragraphes.
const UneLigne = Extension.create({
  name: 'uneLigne',
  addKeyboardShortcuts: () => ({ Enter: () => true, 'Shift-Enter': () => true }),
});

// Dans ce récit, un paragraphe tient plusieurs lignes : le saut de ligne est le
// geste courant, la coupure de paragraphe l'exception. On inverse donc la
// convention du web. Sans ça, Entrée casse une litanie en deux et sa tête
// manuscrite disparaît.
const Entrees = Extension.create({
  name: 'entrees',
  // Plus prioritaire que le clavier de base, sinon c'est lui qui répond.
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      // La convention de partout : Entrée ouvre un paragraphe, les trois
      // autres descendent d'une ligne à l'intérieur du même.
      Enter: () => this.editor.commands.splitBlock(),
      'Shift-Enter': () => this.editor.commands.setHardBreak(),
      'Alt-Enter': () => this.editor.commands.setHardBreak(),
      'Alt-Space': () => this.editor.commands.setHardBreak(),
    };
  },
});

// Un seul paragraphe, mais qui respire sur plusieurs lignes : l'invitation
// vit dans le <p> de la page, elle ne peut pas se couper en deux blocs —
// elle peut en revanche descendre d'une ligne.
const UnParagraphe = Extension.create({
  name: 'unParagraphe',
  priority: 1000,
  addKeyboardShortcuts() {
    const br = () => this.editor.commands.setHardBreak();
    return { Enter: br, 'Shift-Enter': br, 'Alt-Enter': br, 'Alt-Space': br };
  },
});

// ── Monter un éditeur sur une zone de la page ───────────────────────────
export function monter({ element, markdown, surChangement, surSelection, surFocus, manifeste, ligne, souple }) {
  return new Editor({
    element,
    extensions: [
      StarterKit.configure({
        heading: false, bulletList: false, orderedList: false, listItem: false,
        blockquote: false, codeBlock: false, code: false, strike: false,
        horizontalRule: false, dropcursor: false,
        hardBreak: ligne && !souple ? false : undefined,
      }),
      Manuscrit, Police, Taille, Teinte,
      Allure.configure({ manifeste: !!manifeste }),
      ...(ligne ? (souple ? [UnParagraphe] : [UneLigne]) : [Entrees]),
    ],
    content: versDoc(markdown),
    editorProps: {
      attributes: { class: 'at-zone' },
      // Coller reste du texte : on ne veut pas les styles d'ailleurs.
      transformPastedHTML: (html) => html.replace(/<[^>]+>/g, ''),
    },
    onUpdate: ({ editor }) => surChangement(versMarkdown(editor.state.doc)),
    onSelectionUpdate: ({ editor }) => surSelection && surSelection(editor),
    onFocus: ({ editor }) => surFocus && surFocus(editor),
    onCreate: ({ editor }) => surSelection && surSelection(editor),
  });
}
