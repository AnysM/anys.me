/**
 * Ce que les formulaires du site deviennent.
 *
 * Un message arrive ici, et repart vers trois endroits à la fois :
 *   — Airtable, où il se range dans une ligne qu'on peut trier, filtrer, annoter ;
 *   — ntfy, qui le pose sur le téléphone en deux secondes ;
 *   — Brevo, pour les inscriptions à la lettre, qui envoie la confirmation
 *     et porte le lien de désinscription au bas de chaque envoi.
 *
 * Chaque destination est facultative : tant que sa variable d'environnement
 * n'existe pas, elle est sautée sans bruit. Le site peut donc se brancher
 * morceau par morceau, et rien ne casse entre-temps.
 *
 * Le formulaire poste ici directement, sans JavaScript, et on répond par une
 * redirection vers la page de remerciement. Si l'écriture dans Airtable échoue,
 * la notification part quand même avec le message entier : ce que quelqu'un a
 * pris le temps d'écrire ne doit pas disparaître dans un silo en panne.
 */

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE;
const NTFY_TOPIC = process.env.NTFY_TOPIC;
const NTFY_SERVEUR = process.env.NTFY_SERVEUR ?? 'https://ntfy.sh';
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LISTE = process.env.BREVO_LISTE;

/** Les deux formulaires du site, et la table Airtable de chacun. */
const FORMULAIRES = {
  contact: { table: 'Messages', retour: '/merci' },
  lettre: { table: 'Lettre', retour: '/merci?pour=lettre' },
};

/** Ce que le menu « Ce qui t'appelle » devient dans la colonne Airtable. */
const APPELS = {
  decouvrir: 'Premier pas',
  approfondir: 'Soin / Prisme',
  transformer: 'Accompagnement',
  autre: 'Autre',
};

const texte = (v) => (typeof v === 'string' ? v.trim() : '');

/** Lit le corps de la requête, qu'il arrive en formulaire ou en JSON. */
async function lireChamps(request) {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) return await request.json();
  return Object.fromEntries(await request.formData());
}

/** Une ligne dans Airtable. */
async function versAirtable(table, champs) {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE) return { saute: true };
  const r = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(table)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: [{ fields: champs }], typecast: true }),
  });
  if (!r.ok) throw new Error(`Airtable ${r.status} : ${await r.text()}`);
  return await r.json();
}

/** Une notification sur le téléphone. */
async function versNtfy({ titre, corps, priorite = 'default', etiquettes = '' }) {
  if (!NTFY_TOPIC) return { saute: true };
  // On publie en JSON plutôt qu'en en-têtes : un titre avec des accents passe
  // tel quel, là où l'en-tête Title les rendrait illisibles sur le téléphone.
  const r = await fetch(NTFY_SERVEUR, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: NTFY_TOPIC,
      title: titre,
      message: corps,
      priority: { min: 1, low: 2, default: 3, high: 4, urgent: 5 }[priorite] ?? 3,
      ...(etiquettes ? { tags: etiquettes.split(',') } : {}),
    }),
  });
  if (!r.ok) throw new Error(`ntfy ${r.status} : ${await r.text()}`);
  return { envoye: true };
}

/** Un contact dans la liste Brevo, qui lui envoie la confirmation. */
async function versBrevo({ email, prenom }) {
  if (!BREVO_API_KEY || !BREVO_LISTE) return { saute: true };
  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      email,
      ...(prenom ? { attributes: { PRENOM: prenom } } : {}),
      listIds: [Number(BREVO_LISTE)],
      updateEnabled: true,
    }),
  });
  // 204 quand le contact existait déjà et vient d'être mis à jour.
  if (!r.ok && r.status !== 204) throw new Error(`Brevo ${r.status} : ${await r.text()}`);
  return { ajoute: true };
}

export default async function handler(request) {
  if (request.method !== 'POST') return new Response('Méthode non autorisée', { status: 405 });

  // Netlify filtrait le spam à notre place. Ici, deux gardes suffisent pour
  // l'essentiel : le piège plus bas, et le fait qu'un envoi vienne bien d'une
  // page du site. Un navigateur envoie son origine sur un POST de formulaire ;
  // un script lancé d'ailleurs en envoie une autre, ou aucune.
  const origine = request.headers.get('origin');
  if (origine) {
    const ici = new URL(request.url).host;
    const la = (() => { try { return new URL(origine).host; } catch { return null; } })();
    if (la && la !== ici) return new Response('Origine inattendue', { status: 403 });
  }

  let champs;
  try {
    champs = await lireChamps(request);
  } catch {
    return new Response('Corps illisible', { status: 400 });
  }

  const quel = texte(champs['form-name']) || texte(champs.form);
  const forme = FORMULAIRES[quel];
  if (!forme) return new Response('Formulaire inconnu', { status: 400 });

  // Le piège : un robot remplit tout ce qu'il trouve, un humain ne voit pas ce
  // champ. On répond comme si de rien n'était, et on n'écrit rien.
  if (texte(champs['bot-field'])) return redirige(forme.retour);

  const email = texte(champs.email);
  if (!email || !email.includes('@')) return new Response('Email manquant', { status: 400 });

  const nom = texte(champs.nom) || texte(champs.prenom);
  const message = texte(champs.message);
  const interet = texte(champs.interet);
  const source = texte(champs.source);
  const page = texte(champs.page);

  const ligne = quel === 'lettre'
    ? { Prénom: nom, Email: email, Source: source || 'site', Reçu: new Date().toISOString() }
    : {
        Nom: nom,
        Email: email,
        ...(APPELS[interet] ? { 'Ce qui appelle': APPELS[interet] } : {}),
        Message: message,
        Page: page,
        Reçu: new Date().toISOString(),
      };

  const soucis = [];
  let range = false;
  try {
    const r = await versAirtable(forme.table, ligne);
    range = !r.saute;
  } catch (e) {
    soucis.push(String(e.message ?? e));
  }

  const notif = quel === 'lettre'
    ? { titre: `Inscription à la lettre${nom ? ` — ${nom}` : ''}`, corps: `${email}${source ? `\nDepuis : ${source}` : ''}`, etiquettes: 'envelope' }
    : {
        titre: `Message de ${nom || email}`,
        corps: [message || '(sans message)', '', email, interet && `Ce qui appelle : ${APPELS[interet] ?? interet}`].filter(Boolean).join('\n'),
        priorite: 'high',
        etiquettes: 'speech_balloon',
      };
  // Si Airtable n'a pas voulu, la notification porte tout : rien ne se perd.
  if (soucis.length) notif.corps += `\n\n⚠️ Pas rangé dans Airtable.\n${JSON.stringify(ligne)}`;

  try {
    await versNtfy(notif);
  } catch (e) {
    soucis.push(String(e.message ?? e));
  }

  if (quel === 'lettre') {
    try {
      await versBrevo({ email, prenom: nom });
    } catch (e) {
      soucis.push(String(e.message ?? e));
    }
  }

  // Dernier filet : si aucune destination n'est configurée, l'envoi n'irait
  // nulle part et personne ne le saurait. On le pose en entier dans le journal
  // de la fonction (Netlify › Logs › Functions), d'où il reste récupérable.
  if (!range && !NTFY_TOPIC) console.error(`[${quel}] AUCUNE DESTINATION`, JSON.stringify(ligne));
  if (soucis.length) console.error(`[${quel}] rangé: ${range} ·`, soucis.join(' | '));

  return redirige(forme.retour);
}

/** On répond au navigateur par la page de remerciement. */
function redirige(vers) {
  return new Response(null, { status: 303, headers: { Location: vers } });
}
