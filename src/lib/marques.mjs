// Les marques de mise en valeur du récit, manipulées caractère par caractère.
//
// Le texte d'un bloc est du markdown restreint : `**gras**`, `_italique_`,
// `*manuscrit*`. Une marque ne traverse jamais un retour à la ligne, parce que
// le rendu tisse ligne par ligne. Tout passe par un tableau de caractères
// portant chacun son style : c'est la seule façon d'appliquer un style sur une
// sélection qui chevauche une marque existante sans laisser de marque orpheline.

export const MARQUES = { gras: '**', italique: '_', manuscrit: '*' };

// Markdown → un caractère, un style.
export function enCaracteres(md) {
  const sortie = [];
  let i = 0, style = null;
  while (i < md.length) {
    if (md.startsWith('**', i)) { style = style === 'gras' ? null : 'gras'; i += 2; continue; }
    if (md[i] === '_') { style = style === 'italique' ? null : 'italique'; i += 1; continue; }
    if (md[i] === '*') { style = style === 'manuscrit' ? null : 'manuscrit'; i += 1; continue; }
    sortie.push({ c: md[i], s: md[i] === '\n' ? null : style });
    i += 1;
  }
  return sortie;
}

// Un caractère, un style → markdown. Les marques se referment avant chaque
// retour à la ligne et avant les blancs de bord, qui ne doivent jamais être
// pris dans une marque sous peine de ne pas être rendus.
export function enMarkdown(cars) {
  let out = '', ouvert = null;
  const ferme = () => { if (ouvert) { out += MARQUES[ouvert]; ouvert = null; } };
  for (let i = 0; i < cars.length; i++) {
    const { c } = cars[i];
    // un blanc en bord de marque sort de la marque
    let s = cars[i].s;
    if (s && /\s/.test(c)) {
      const dedansAvant = i > 0 && cars[i - 1].s === s && !/\s/.test(cars[i - 1].c);
      const dedansApres = cars.slice(i + 1).some((x) => x.s === s && !/\s/.test(x.c))
        && cars.slice(i + 1).findIndex((x) => x.s !== s) !== 0;
      if (!(dedansAvant && dedansApres)) s = null;
    }
    if (s !== ouvert) { ferme(); if (s) { out += MARQUES[s]; ouvert = s; } }
    out += c;
  }
  ferme();
  return out;
}

export const texteNu = (md) => enCaracteres(md).map((x) => x.c).join('');

// Pose un style sur l'intervalle [debut, fin) du texte nu d'un paragraphe.
// `style` à null remet en texte courant.
export function styler(md, debut, fin, style) {
  const cars = enCaracteres(md);
  const a = Math.max(0, Math.min(debut, cars.length));
  const b = Math.max(a, Math.min(fin, cars.length));
  for (let i = a; i < b; i++) if (cars[i].c !== '\n') cars[i].s = style;
  return enMarkdown(cars);
}
