// Les lieux où se vit le travail, à Lyon : le studio, les partenaires, l'île.
export type Lieu = {
  id: string;
  nom: string;
  lat: number;
  lon: number;
  quoi: string;
  couleur: string;
  href?: string;
  externe?: boolean;
};

export const LIEUX: Lieu[] = [
  { id: 'chanka', nom: 'Chanka Studio', lat: 45.76785, lon: 4.82847, quoi: 'Ateliers Infloressence, soins', couleur: '#F07A5F', href: '/codex/chanka-studio' },
  { id: 'meiso', nom: 'Oāsis Meïsō', lat: 45.75113, lon: 4.82973, quoi: 'Soins, ateliers', couleur: '#5C7CFF', href: '/codex/meiso' },
  { id: 'blast', nom: 'Blast Art', lat: 45.77007, lon: 4.80418, quoi: 'Voyages sonores', couleur: '#FFC53D', href: '/codex/blast' },
  { id: 'ile-barbe', nom: 'Île Barbe', lat: 45.79795, lon: 4.83378, quoi: 'Soins en extérieur, pratiques au bord de l’eau', couleur: '#8FB3FF' },
];

export const lieuDe = (texte = '') => LIEUX.find((l) => texte.toLowerCase().includes(l.nom.toLowerCase().split(' ')[0].toLowerCase()));
