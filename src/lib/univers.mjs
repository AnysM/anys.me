// Les cinq univers : la structure du monde. Chaque fiche du Codex en porte un ou plusieurs.
// Symboles dessinés à l'encre (brouillons originaux, en attendant les pictos dessinés à la main).
export const UNIVERS = [
  { id: 'presence', nom: 'La présence', icon: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="11" r="2.8" fill="currentColor" stroke="none"/><path d="M11 21c1.5 11.5 24.5 11.5 26 0"/><path d="M8 38c10-2 22-2 32 0"/><circle cx="5.5" cy="25" r="1.5" fill="currentColor" stroke="none"/><circle cx="42.5" cy="25" r="1.5" fill="currentColor" stroke="none"/></svg>' },
  { id: 'connaissance', nom: 'La connaissance de soi', icon: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 9C7.5 15.5 7.5 32.5 18 39"/><path d="M30 9c10.5 6.5 10.5 23.5 0 30"/><circle cx="24" cy="15.5" r="1.6" fill="currentColor" stroke="none"/><circle cx="24" cy="24" r="2.9" fill="currentColor" stroke="none"/><circle cx="24" cy="32.5" r="1.6" fill="currentColor" stroke="none"/></svg>' },
  { id: 'mouvement', nom: 'Le mouvement', icon: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M26 15c-6.5 4-6.5 10 0 14s6.5 10 0 14"/><path d="M10 23c5-4.5 10.5-4.8 15.5-1.8"/><path d="M26.5 25.5c4 3.2 9 3.4 12.5 0"/><circle cx="27" cy="7.5" r="3" fill="currentColor" stroke="none"/><circle cx="8" cy="37" r="1.6" fill="currentColor" stroke="none"/><circle cx="41" cy="14" r="1.6" fill="currentColor" stroke="none"/></svg>' },
  { id: 'vivant', nom: 'Le lien au vivant', icon: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 42c9-3.4 21-3.4 30 0"/><path d="M19.5 39.5c-2.6-10.5-1.4-19.5 4.8-25.3 5.6-5.2 13.7-2.8 13.7 4.3 0 5.2-5.1 7.4-8.3 5.2-2.6-1.8-1.9-5.6 1.2-5.8"/><circle cx="11" cy="27" r="1.7" fill="currentColor" stroke="none"/><circle cx="38.5" cy="33.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="13" cy="15" r="1.2" fill="currentColor" stroke="none"/></svg>' },
  { id: 'art', nom: 'L’art et l’expression créative', icon: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M33.5 10.5C24 4.5 9.5 10 9 23.5 8.5 35.5 19.5 42 29.5 39c7-2 10.5-8.5 9.5-15.5"/><circle cx="24" cy="24" r="3" fill="currentColor" stroke="none"/><circle cx="40.5" cy="12" r="1.7" fill="currentColor" stroke="none"/></svg>' },
];
export const UNIVERS_IDS = UNIVERS.map((u) => u.id);
export const univers = (id) => UNIVERS.find((u) => u.id === id);

// Les types de fiches du Codex.
export const TYPES = [
  { id: 'pratique', label: 'Pratique', pluriel: 'Pratiques' },
  { id: 'notion', label: 'Notion', pluriel: 'Notions' },
  { id: 'rencontre', label: 'Rencontre', pluriel: 'Rencontres' },
  { id: 'realisation', label: 'Réalisation', pluriel: 'Réalisations intérieures' },
  { id: 'allie', label: 'Allié', pluriel: 'Alliés' },
];
export const TYPE_IDS = TYPES.map((t) => t.id);
export const typeLabel = (id) => TYPES.find((t) => t.id === id)?.label ?? id;

// Les trois seuils : du premier pas à la transformation.
export const SEUILS = [
  { id: 'decouvrir', num: 'I', nom: 'Découvrir', format: 'une soirée, un cercle' },
  { id: 'approfondir', num: 'II', nom: 'Approfondir', format: 'un soin, une lecture' },
  { id: 'transformer', num: 'III', nom: 'Se transformer', format: 'un chemin, une immersion' },
];
export const SEUIL_IDS = SEUILS.map((s) => s.id);
const SEUIL_PAR_CATEGORIE = {
  atelier: 'decouvrir', 'voyage-sonore': 'decouvrir', cercle: 'decouvrir',
  soin: 'approfondir',
  accompagnement: 'transformer', retraite: 'transformer', immersion: 'transformer', residence: 'transformer',
};
export const seuilDe = (data) => data.seuil ?? SEUIL_PAR_CATEGORIE[data.categorie] ?? 'approfondir';
export const seuil = (id) => SEUILS.find((s) => s.id === id);

// Tina enregistre les références sous forme de chemin ("src/content/offres/x.md") : on garde l'identifiant.
export const refId = (r) => (r ?? '').split('/').pop().replace(/\.mdx?$/, '');
