// Les réglages fins de la mise en forme : police, taille, couleur.
//
// Trois listes fermées, tirées des polices et des couleurs du site. On ne
// choisit pas une valeur, on choisit un nom — sinon la page finit par porter
// quinze gris différents et plus aucune cohérence.
//
// Dans le fichier, ça s'écrit `[le texte]{doré grand garamond}` : du texte
// clair, lisible à l'œil nu, et qui se relit sans ambiguïté.

export const POLICES = [
  { nom: 'jost',     dit: 'Jost',        css: "'Jost', sans-serif" },
  { nom: 'garamond', dit: 'EB Garamond', css: "'EB Garamond', serif" },
  { nom: 'biloxi',   dit: 'Manuscrite',  css: "'Biloxi Script', cursive" },
];

export const TAILLES = [
  { nom: 'minuscule', dit: 'Minuscule', css: '0.78em' },
  { nom: 'petit',     dit: 'Petit',     css: '0.9em' },
  { nom: 'grand',     dit: 'Grand',     css: '1.3em' },
  { nom: 'immense',   dit: 'Immense',   css: '1.9em' },
];

export const TEINTES = [
  { nom: 'creme',  dit: 'Crème',  css: 'var(--cream)' },
  { nom: 'dore',   dit: 'Doré',   css: 'var(--gold)' },
  { nom: 'gris',   dit: 'Gris',   css: 'var(--muted)' },
  { nom: 'indigo', dit: 'Indigo', css: 'var(--indigo-soft)' },
  { nom: 'corail', dit: 'Corail', css: 'var(--coral)' },
];

export const FAMILLES = { police: POLICES, taille: TAILLES, teinte: TEINTES };

// Tous les noms reconnus, et à quelle famille ils appartiennent.
export const DE_NOM = Object.fromEntries(
  Object.entries(FAMILLES).flatMap(([famille, liste]) =>
    liste.map((x) => [x.nom, { famille, ...x }])),
);

export const classeDe = (nom) => 't-' + nom;

// Le CSS des réglages, posé une fois pour toutes.
export function feuille() {
  const r = [];
  for (const x of POLICES) r.push(`.${classeDe(x.nom)}{font-family:${x.css}}`);
  for (const x of TAILLES) r.push(`.${classeDe(x.nom)}{font-size:${x.css}}`);
  for (const x of TEINTES) r.push(`.${classeDe(x.nom)}{color:${x.css}}`);
  return r.join('\n');
}

// `[texte]{doré grand}` → <span class="t-dore t-grand">texte</span>
// On ne reconnaît que les noms de la liste : tout le reste reste du texte.
export const MOTIF = /\[([^\]\n]+)\]\{([a-zéè ]+)\}/g;

export function reglages(ligne) {
  return String(ligne).replace(MOTIF, (tout, texte, noms) => {
    const classes = noms.trim().split(/\s+/).filter((n) => DE_NOM[n]).map(classeDe);
    if (!classes.length) return tout;
    return `<span class="${classes.join(' ')}">${texte}</span>`;
  });
}
