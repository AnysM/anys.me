/**
 * Pose chez Brevo le modèle de confirmation d'inscription à la lettre.
 *
 *     node scripts/modele-doi.mjs
 *
 * Le contenu vient de mail-confirmation-lettre.html, à la racine : le fichier
 * reste la source, on le modifie et on relance. Relancé, le script retrouve le
 * modèle par son nom et le met à jour, plutôt que d'en empiler des copies.
 *
 * Deux conditions que Brevo ne pardonne pas, et que le script vérifie :
 *   — le modèle doit porter l'étiquette « optin », sinon l'API d'inscription
 *     refuse de s'en servir ;
 *   — le lien de confirmation s'écrit {{ params.DOIurl }}. C'est la balise de
 *     l'API doubleOptinConfirmation, celle que la fonction du site appelle.
 *     « {{ doubleoptin }} », qu'on trouve ailleurs, vient d'intégrations
 *     tierces et ne serait pas remplacé ici.
 *
 * La clé se lit dans .env, qui ne part pas sur GitHub. Elle ne traverse rien
 * d'autre que l'appel à Brevo.
 */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOM = 'Lettre — confirmation d’inscription';
const OBJET = 'Confirme ton inscription à la lettre';
const EXPEDITEUR_VOULU = 'contact@anys.me';

// Un .env se lit en trois lignes ; une dépendance pour ça serait du luxe.
async function env() {
  let brut = '';
  try { brut = await readFile(join(RACINE, '.env'), 'utf8'); } catch { return {}; }
  return Object.fromEntries(brut.split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    }));
}

const e = await env();
const CLE = e.BREVO_MAIL_KEY || e.BREVO_API_KEY || process.env.BREVO_MAIL_KEY || process.env.BREVO_API_KEY;

if (!CLE) {
  console.error('Aucune clé. Crée un fichier .env à la racine avec :\n\n  BREVO_API_KEY=xkeysib-…\n');
  process.exit(1);
}
if (!CLE.startsWith('xkeysib-')) {
  console.error('Cette clé ne commence pas par « xkeysib- » : c’est une clé SMTP (le relais), pas une clé API v3.');
  console.error('Brevo › SMTP & API › onglet « Clés API ».');
  process.exit(1);
}

const brevo = async (chemin, options = {}) => {
  const r = await fetch(`https://api.brevo.com/v3${chemin}`, {
    ...options,
    headers: { 'api-key': CLE, 'Content-Type': 'application/json', accept: 'application/json', ...options.headers },
  });
  const texte = await r.text();
  if (!r.ok) throw new Error(`Brevo ${r.status} sur ${chemin} : ${texte}`);
  return texte ? JSON.parse(texte) : {};
};

// L'expéditeur se lit chez Brevo plutôt que de s'écrire ici : l'API des
// modèles n'accepte qu'une adresse déclarée et active, et le refus qu'elle
// renvoie sinon — « Sender is invalid / inactive » — ne dit pas lesquelles le
// sont. On prend celle qu'on veut si elle existe, sinon une autre du domaine.
const { senders = [] } = await brevo('/senders');
const actifs = senders.filter((s) => s.active);
const expediteur = actifs.find((s) => s.email === EXPEDITEUR_VOULU)
  ?? actifs.find((s) => s.email.endsWith('@anys.me'));

if (!expediteur) {
  console.error(`Aucun expéditeur actif sur anys.me. Déclarés : ${senders.map((s) => `${s.email}${s.active ? '' : ' (inactif)'}`).join(', ') || 'aucun'}`);
  console.error('Brevo › Expéditeurs, domaines & IP › Expéditeurs.');
  process.exit(1);
}
console.log(`Expéditeur : ${expediteur.name} <${expediteur.email}>`);

const html = await readFile(join(RACINE, 'mail-confirmation-lettre.html'), 'utf8');

if (!html.includes('{{ params.DOIurl }}')) {
  console.error('Le fichier ne contient pas {{ params.DOIurl }} : sans lui, personne ne pourrait confirmer.');
  process.exit(1);
}

// Brevo n'offre pas de recherche par nom : on parcourt la liste, qui tient
// largement en une page pour un compte de cette taille.
const { templates = [] } = await brevo('/smtp/templates?limit=200&sort=desc');
const existant = templates.find((t) => t.name === NOM);

const corps = {
  templateName: NOM,
  subject: OBJET,
  sender: { name: expediteur.name, email: expediteur.email },
  htmlContent: html,
  isActive: true,
  tag: 'optin',
};

let id;
if (existant) {
  await brevo(`/smtp/templates/${existant.id}`, { method: 'PUT', body: JSON.stringify(corps) });
  id = existant.id;
  console.log(`Modèle ${id} mis à jour (« ${NOM} »).`);
} else {
  ({ id } = await brevo('/smtp/templates', { method: 'POST', body: JSON.stringify(corps) }));
  console.log(`Modèle ${id} créé (« ${NOM} »).`);
}

// La vérification qui compte : Brevo dit lui-même s'il le reconnaît comme un
// modèle de double opt-in. Sans ce drapeau, l'inscription échouerait au premier
// visiteur, et on ne l'apprendrait que par une notification sur le téléphone.
const fiche = await brevo(`/smtp/templates/${id}`);
console.log(`  expéditeur  : ${fiche.sender?.email ?? '?'}`);
console.log(`  actif       : ${fiche.isActive ? 'oui' : 'NON'}`);
console.log(`  double opt-in reconnu : ${fiche.doiTemplate ? '✅ oui' : '❌ NON'}`);

if (!fiche.doiTemplate) {
  console.error('\nBrevo ne le reconnaît pas comme modèle de double opt-in.');
  console.error('Ouvre-le dans Brevo et vérifie qu’il porte bien l’étiquette « optin ».');
  process.exit(1);
}

console.log(`\nÀ poser chez Netlify :  BREVO_DOI_MODELE = ${id}`);
console.log('Puis redéployer — une variable n’atteint la fonction qu’au déploiement suivant.');
