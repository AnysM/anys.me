// Marquer un texte comme modifiable dans l'atelier.
//
// Une page pose `{...ed('coeur_titre')}` sur la balise qui porte le texte, et
// l'atelier sait quoi écrire, et où. Le chemin nomme le champ dans le fichier
// de contenu : « coeur_titre », « piliers.2.nom », « faq.0.r ».
//
// En production la fonction ne rend rien : aucun attribut ne part dans le site
// publié, et l'atelier n'y est pas chargé.
//
// `ed` pour une valeur d'une ligne, `edLong` pour un texte à paragraphes.

export const ed = (chemin) => (import.meta.env.DEV
  ? { 'data-edit': 'chemin', 'data-chemin': chemin }
  : {});

export const edLong = (chemin) => (import.meta.env.DEV
  ? { 'data-edit': 'chemin', 'data-chemin': chemin, 'data-long': '' }
  : {});
