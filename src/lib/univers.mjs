// Les cinq univers : la structure du monde. Chaque fiche du Codex en porte un ou plusieurs.
export const UNIVERS = [
  { id: 'presence', nom: 'La présence', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" opacity="0.4"/></svg>' },
  { id: 'connaissance', nom: 'La connaissance de soi', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M12 3l2.1 6.1L20 11l-5.9 1.9L12 19l-2.1-6.1L4 11l5.9-1.9z"/></svg>' },
  { id: 'mouvement', nom: 'Le mouvement', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M3 15c3 0 3-6 6-6s3 6 6 6 3-6 6-6"/></svg>' },
  { id: 'vivant', nom: 'Le lien au vivant', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-8"/><path d="M12 13c0-3.5 2.3-5.5 6.5-5.5C18.5 12 16 14 12 13z"/><path d="M12 16c0-2.5-2.1-4.5-5.5-4.5C6.5 15.5 8.6 17 12 16z"/></svg>' },
  { id: 'art', nom: 'L’art et l’expression créative', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4l5 5-9 9H6v-5z"/><path d="M12 7l5 5"/></svg>' },
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
