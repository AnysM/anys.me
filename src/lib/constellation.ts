// Place les fiches du Codex comme des étoiles : chacune est attirée vers le ou les
// univers qu'elle touche, reliée à ses fiches sœurs, et repoussée par les autres.
// Calcul déterministe fait au build (même entrée → même carte).
import { UNIVERS } from './univers.mjs';

export const W = 1000;
export const H = 640;
const CX = W / 2, CY = H / 2 + 10, RX = 330, RY = 225;

export const ancres = Object.fromEntries(
  UNIVERS.map((u, i) => {
    const a = (-90 + i * 72) * (Math.PI / 180);
    return [u.id, { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) }];
  }),
);

// Petit générateur pseudo-aléatoire déterministe à partir d'un texte
function graine(texte: string) {
  let h = 2166136261;
  for (const c of texte) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296);
}

type Fiche = { id: string; titre: string; univers: string[]; liens: string[] };

export function placer(fiches: Fiche[]) {
  const ids = new Set(fiches.map((f) => f.id));
  const aretes = new Map<string, [string, string]>();
  for (const f of fiches) for (const l of f.liens) if (ids.has(l) && l !== f.id) aretes.set([f.id, l].sort().join('|'), [f.id, l].sort() as [string, string]);

  const noeuds = fiches.map((f) => {
    const us = f.univers.filter((u) => ancres[u]);
    const cible = us.length
      ? { x: us.reduce((s, u) => s + ancres[u].x, 0) / us.length, y: us.reduce((s, u) => s + ancres[u].y, 0) / us.length }
      : { x: CX, y: CY };
    const r = graine(f.id);
    return { id: f.id, cible, x: cible.x + (r() - 0.5) * 120, y: cible.y + (r() - 0.5) * 120, vx: 0, vy: 0 };
  });
  const parId = new Map(noeuds.map((n) => [n.id, n]));

  for (let t = 0; t < 420; t++) {
    const chaleur = 1 - t / 420;
    for (const a of noeuds) {
      // attraction vers ses univers
      a.vx += (a.cible.x - a.x) * 0.05;
      a.vy += (a.cible.y - a.y) * 0.05;
      // répulsion (les libellés sont larges : on repousse davantage à l'horizontale)
      for (const b of noeuds) {
        if (a === b) continue;
        const dx = (a.x - b.x) / 1.9, dy = a.y - b.y;
        const d2 = Math.max(dx * dx + dy * dy, 25);
        if (d2 < 9000) { const f = 260 / d2; a.vx += dx * f; a.vy += dy * f; }
      }
    }
    // ressorts entre fiches reliées
    for (const [i, j] of aretes.values()) {
      const a = parId.get(i)!, b = parId.get(j)!;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
      const f = (d - 150) * 0.004;
      a.vx += dx * f * 0.04; a.vy += dy * f * 0.04;
      b.vx -= dx * f * 0.04; b.vy -= dy * f * 0.04;
    }
    for (const n of noeuds) {
      n.x += n.vx * 0.5 * chaleur; n.y += n.vy * 0.5 * chaleur;
      n.vx *= 0.6; n.vy *= 0.6;
      n.x = Math.min(W - 60, Math.max(60, n.x));
      n.y = Math.min(H - 40, Math.max(40, n.y));
    }
  }

  // Dernière passe : on écarte les étiquettes qui se chevauchent (largeur estimée du texte)
  const boite = (n: (typeof noeuds)[number]) => {
    const l = (fiches.find((f) => f.id === n.id)!.titre.length) * 7.4 + 18;
    const gauche = n.x > W * 0.6;
    return { x1: gauche ? n.x - l : n.x - 8, x2: gauche ? n.x + 8 : n.x + l, y1: n.y - 13, y2: n.y + 13 };
  };
  for (let t = 0; t < 300; t++) {
    let bouge = false;
    for (let i = 0; i < noeuds.length; i++) for (let j = i + 1; j < noeuds.length; j++) {
      const a = noeuds[i], b = noeuds[j], A = boite(a), B = boite(b);
      if (A.x1 < B.x2 && B.x1 < A.x2 && A.y1 < B.y2 && B.y1 < A.y2) {
        const pousse = (Math.min(A.y2, B.y2) - Math.max(A.y1, B.y1)) / 2 + 1;
        const sens = a.y <= b.y ? -1 : 1;
        a.y += sens * pousse; b.y -= sens * pousse;
        a.y = Math.min(H - 20, Math.max(20, a.y)); b.y = Math.min(H - 20, Math.max(20, b.y));
        bouge = true;
      }
    }
    if (!bouge) break;
  }

  const degre = new Map<string, number>();
  for (const [i, j] of aretes.values()) { degre.set(i, (degre.get(i) ?? 0) + 1); degre.set(j, (degre.get(j) ?? 0) + 1); }
  return {
    noeuds: noeuds.map((n) => ({ id: n.id, x: Math.round(n.x), y: Math.round(n.y), degre: degre.get(n.id) ?? 0, gauche: n.x > W * 0.6 })),
    aretes: [...aretes.values()],
  };
}
