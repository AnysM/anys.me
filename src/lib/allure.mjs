// L'allure d'un paragraphe du récit : la règle, écrite une seule fois.
//
// La page publiée et l'éditeur de l'atelier s'en servent tous les deux. Tant
// qu'elle vivait en double, ce qu'on voyait en écrivant n'était pas tout à
// fait ce que le site rendait — et c'est exactement ce qu'un éditeur ne doit
// jamais faire.
//
// `par` est le HTML d'un paragraphe, tel que le rendu le produit.
export function allure(par) {
  const nu = String(par).trim();
  // Un paragraphe peut tenir sur plusieurs lignes. Chaque ligne porte alors
  // sa propre balise, et c'est l'ensemble qui décide de l'allure : un souffle
  // de deux lignes reste un souffle.
  const lignes = nu.split(/<br\s*\/?>/).map((l) => l.trim()).filter(Boolean);
  const partout = (motif) => lignes.length > 0 && lignes.every((l) => motif.test(l));
  const mots = nu.replace(/<[^>]+>/g, '');
  // Entièrement en gras : la réalisation. Un seul corps, quelle que soit la
  // longueur — pour en rapetisser une, on lui pose une taille à la main.
  if (partout(/^<strong>[^<]*<\/strong>$/)) return 'souffle';
  // Entièrement à la main : sa voix, qui garde sa place à elle.
  if (partout(/^<span class="script">[^<]*<\/span>$/)) return 'main-levee';
  // Une phrase courte laissée seule dans son paragraphe : du silence autour
  // d'elle, rien d'autre. C'est ce qui donne au texte son rythme respiré.
  if (lignes.length === 1 && mots.length <= 90) return 'seule';
  return null;
}
