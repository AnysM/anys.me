// Atteindre n'importe quel champ d'une page, par son chemin.
//
// L'atelier savait écrire trois choses : une clé tout en haut du fichier, un
// titre d'acte, et les deux longs textes du récit. Tout le reste du site vit
// dans des listes — les piliers, les propositions, les témoignages, les étapes
// d'une offre, les questions d'une FAQ — et restait hors de portée.
//
// Un chemin les nomme tous : « coeur_titre », « piliers.2.nom », « faq.0.r ».
//
// Ce module ne fait qu'une chose : dire sur quelle ligne du fichier se trouve
// la clé visée. Lire sa valeur et la réécrire, le reste du code sait déjà le
// faire à partir d'une ligne. On travaille sur les lignes et jamais sur l'objet
// YAML : relire et réécrire le fichier entier réaligne les guillemets, replie
// les textes longs et efface les retours à la ligne du récit, qui portent du sens.

const CREUX = (l) => l.match(/^ */)[0].length;

// Une clé peut être citée dans le fichier : « 'n': », pour échapper au « n »
// que YAML lirait sans cela comme un non.
const cite = (cle) => '["\']?' + cle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\']?';

// La fin de la zone ouverte par la ligne `debut` : la première ligne qui
// revient au même creux ou plus à gauche. Les lignes vides ne ferment rien.
function finDeZone(lignes, debut, creux, plafond) {
  let fin = debut + 1;
  for (; fin < plafond; fin++) {
    const l = lignes[fin];
    if (!l.trim()) continue;
    if (CREUX(l) <= creux) break;
  }
  return fin;
}

// Les entrées d'une liste, dans la tranche donnée, au creux donné.
function entrees(lignes, debut, fin, creux) {
  const tirets = [];
  for (let i = debut; i < fin; i++) {
    const m = lignes[i].match(/^( *)- /);
    if (m && m[1].length === creux) tirets.push(i);
  }
  return tirets.map((i, k) => ({ debut: i, fin: k + 1 < tirets.length ? tirets[k + 1] : fin }));
}

// La ligne où se pose cette clé, dans la tranche donnée, au creux donné.
// La première clé d'une entrée de liste partage la ligne du tiret, deux crans
// à gauche : dans « piliers:\n  - nom: … », le « nom » est à deux et non à quatre.
function ligneDeCle(lignes, debut, fin, creux, cle) {
  const nu = new RegExp('^ {' + creux + '}' + cite(cle) + ':( |$)');
  const tiret = creux >= 2 ? new RegExp('^ {' + (creux - 2) + '}- +' + cite(cle) + ':( |$)') : null;
  for (let i = debut; i < fin; i++) {
    if (nu.test(lignes[i]) || (tiret && tiret.test(lignes[i]))) return i;
  }
  return -1;
}

// Sur quelle ligne se trouve ce chemin. Lève si la route se perd.
export function situer(lignes, chemin) {
  const pas = String(chemin).split('.').filter(Boolean);
  if (!pas.length) throw new Error('chemin vide');

  // L'en-tête seulement : le corps du fichier n'est pas adressable ainsi.
  const ouvre = lignes[0] === '---' ? 1 : 0;
  const ferme = lignes.indexOf('---', ouvre);
  let debut = ouvre;
  let fin = ferme < 0 ? lignes.length : ferme;
  let creux = 0;
  let ligne = -1;

  for (let k = 0; k < pas.length; k++) {
    const p = pas[k];
    const route = pas.slice(0, k + 1).join('.');

    if (/^\d+$/.test(p)) {
      const liste = entrees(lignes, debut, fin, creux);
      const e = liste[Number(p)];
      if (!e) throw new Error('« ' + route + ' » : il n\'y a que ' + liste.length + ' entrées');
      debut = e.debut;
      fin = e.fin;
      creux += 2; // le contenu d'une entrée est décalé de la largeur du tiret
      continue;
    }

    ligne = ligneDeCle(lignes, debut, fin, creux, p);
    if (ligne < 0) throw new Error('« ' + route + ' » introuvable');
    if (k === pas.length - 1) return ligne;

    // On descend d'un cran.
    debut = ligne + 1;
    fin = finDeZone(lignes, ligne, CREUX(lignes[ligne]), fin);
    creux = CREUX(lignes[ligne]) + 2;
    // Une liste peut s'écrire au même creux que sa clé : « piliers:\n- nom: … »
    const premier = lignes.slice(debut, fin).find((l) => l.trim());
    if (premier && /^ *- /.test(premier)) creux = CREUX(premier);
  }

  throw new Error('chemin incomplet : ' + chemin);
}
