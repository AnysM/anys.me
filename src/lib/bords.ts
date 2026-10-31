import REGLAGES from '../data/separateurs.json';

// Le format de chaque bord de pinceau, mesuré sur le masque.
// La bande de séparation s'y conforme : la forme n'est jamais déformée.
export const BORDS: Record<number, { l: number; h: number }> = {
  1: { l: 2200, h: 619 },
  2: { l: 2200, h: 660 },
  3: { l: 2200, h: 595 },
  4: { l: 2200, h: 700 },
};

/**
 * La hauteur qu'un bord de pinceau occupe sur la page, plus un peu d'air.
 * Sert à dégager le contenu qui passerait sous la brosse.
 */
export function airSousBord(id: string, marge = 'clamp(1.6rem, 3.2vw, 3.2rem)'): string {
  const r = (REGLAGES as Record<string, { bord?: number; hauteur?: number }>)[id];
  if (!r) return marge;
  const f = BORDS[r.bord ?? 1] ?? BORDS[1];
  const k = (f.h * ((r.hauteur ?? 100) / 100)) / f.l;
  return `calc(100vw * ${k.toFixed(4)} + ${marge})`;
}
