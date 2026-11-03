// Ce qui est derrière nous. Un rendez-vous dont la dernière date est passée garde
// son adresse — les liens déjà partagés continuent de mener quelque part — mais il
// sort des moteurs de recherche et du plan du site : sinon Google proposerait
// encore un atelier d'octobre à quelqu'un qui cherche en novembre.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const DIR = join(process.cwd(), 'src/content/agenda');
const minuit = () => new Date(new Date().toDateString());
const jour = (v) => (v ? new Date(v) : null);

/** Un rendez-vous est passé quand sa date de fin, ou sa dernière séance, est derrière nous. */
export function estPasse(d, le = minuit()) {
  const fin = jour(d.date_fin) ?? jour(d.date);
  if (fin) return fin < le;
  const seances = (d.seances ?? []).map((s) => jour(s.date)).filter(Boolean);
  if (seances.length) return seances.every((s) => s < le);
  return false; // ni date ni séance : il s'annonce, il n'est pas passé
}

/**
 * L'early bird court-il encore ? Sans date limite, il n'y en a pas : le tarif
 * réduit et son badge disparaissent d'eux-mêmes le lendemain de l'échéance.
 */
export function earlyBirdOuvert(d, le = minuit()) {
  const fin = jour(d.earlybird);
  return !!fin && fin >= le;
}

/** La date limite de l'early bird, telle qu'elle s'écrit. */
export function dateEarlyBird(d) {
  const fin = jour(d.earlybird);
  return fin ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(fin) : null;
}

/** Les identifiants des rendez-vous passés, pour les retirer du plan du site. */
export function agendaPasse() {
  let files = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.md')); } catch { return []; }
  return files
    .map((f) => ({ id: f.replace(/\.md$/, ''), data: matter(readFileSync(join(DIR, f), 'utf8')).data }))
    .filter((e) => estPasse(e.data))
    .map((e) => e.id);
}
