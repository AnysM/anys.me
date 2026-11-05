/**
 * Ce que les formulaires du site deviennent.
 *
 * Un message arrive ici, et repart vers quatre endroits à la fois :
 *   — Airtable, où il se range dans une ligne qu'on peut trier, filtrer, annoter ;
 *   — ntfy, qui le pose sur le téléphone en deux secondes ;
 *   — ta boîte mail, par Brevo, avec le « répondre à » réglé sur la personne :
 *     répondre depuis le mail lui écrit directement ;
 *   — Brevo, pour les inscriptions à la lettre, qui envoie la confirmation
 *     et porte le lien de désinscription au bas de chaque envoi.
 *
 * Un envoi jugé robot (voir `netlify/lib/spam.mjs`) ne va qu'à Airtable, avec
 * la raison écrite à côté. Ni téléphone, ni mail. Rien n'est jeté : une erreur
 * de jugement se retrouve dans la base, donc se voit et se corrige.
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

import { noter, estSpam } from '../lib/spam.mjs';

// On nettoie ce qui est collé à la main : une valeur copiée depuis une page web
// emporte souvent une espace, un retour à la ligne, parfois des guillemets. Un
// jeton ainsi décoré se fait refuser, et le message d'erreur ne dit pas pourquoi.
const propre = (v) => v?.trim().replace(/^["']|["']$/g, '') || undefined;

const AIRTABLE_TOKEN = propre(process.env.AIRTABLE_TOKEN);
const AIRTABLE_BASE = propre(process.env.AIRTABLE_BASE);
const NTFY_TOPIC = propre(process.env.NTFY_TOPIC);
const NTFY_SERVEUR = propre(process.env.NTFY_SERVEUR) ?? 'https://ntfy.sh';
const BREVO_API_KEY = propre(process.env.BREVO_API_KEY);
const BREVO_LISTE = propre(process.env.BREVO_LISTE);
// Avec un modèle de confirmation, l'adresse n'entre dans la liste qu'une fois le
// lien cliqué. Sans lui, elle entre directement et personne ne reçoit de mail.
const BREVO_DOI_MODELE = process.env.BREVO_DOI_MODELE;
// Ta boîte mail. Tant qu'elle n'est pas posée, aucun mail ne part et la
// notification du téléphone le dit : un silence vaudrait moins qu'une plainte.
const MAIL_VERS = propre(process.env.MAIL_VERS);
// L'adresse d'expédition. Brevo n'envoie que depuis un expéditeur qu'il a
// validé : reprends celui de la lettre, il l'est déjà. À défaut on expédie
// depuis l'adresse de destination, ce qui marche si elle est validée aussi.
const MAIL_DE = propre(process.env.MAIL_DE) ?? MAIL_VERS;
// Chez Brevo, une clé porte des droits précis. Celle de la lettre sait inscrire
// un contact sans avoir celui d'envoyer un mail, et le refus est alors un 403
// qui ne parle que de « transactional.email ». Deux chemins, au choix : donner
// ce droit à la clé existante, ou en faire une seconde et la poser ici. La
// seconde vaut mieux — une clé qui ne peut qu'envoyer ne peut pas vider ta
// liste de contacts si elle fuit un jour.
const BREVO_SMTP_KEY = propre(process.env.BREVO_SMTP_KEY) ?? BREVO_API_KEY;
// Là où renvoyer quelqu'un qui vient de confirmer son inscription. On le
// déduit de la requête elle-même : la variable d'environnement de Netlify
// garde l'ancienne adresse jusqu'au déploiement qui suit un changement de
// domaine, et enverrait alors les gens sur l'adresse technique du site.
const SITE_REPLI = process.env.URL ?? 'https://anysme.netlify.app';

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

/**
 * Pourquoi quelqu'un laisse son email. Une seule liste chez Brevo, et cette
 * envie posée à côté : on écrit ensuite à tout le monde, ou seulement à ceux
 * qui attendaient Quintessence. Vingt listes diraient la même chose en pire,
 * avec la même personne comptée plusieurs fois.
 */
function envieDe(source) {
  if (source.startsWith('attente-')) return 'Attente';
  if (source === 'artefacts' || source.startsWith('artefact-')) return 'Œuvres';
  if (source.startsWith('codex-')) return 'Codex';
  return 'Lettre';
}

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
  const poster = (fields) => fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(table)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  });

  let r = await poster(champs);
  let detail = r.ok ? '' : await r.text();
  // La colonne « Spam » est arrivée après coup. Sur une base qui ne l'a pas,
  // Airtable refuse la ligne entière : on la renvoie sans elle plutôt que de
  // perdre un message pour une colonne manquante.
  if (!r.ok && detail.includes('UNKNOWN_FIELD_NAME') && 'Spam' in champs) {
    const { Spam, ...sansSpam } = champs;
    console.error('[airtable] colonne « Spam » absente, ligne renvoyée sans elle');
    r = await poster(sansSpam);
    detail = r.ok ? '' : await r.text();
  }
  if (!r.ok) {
    // 401 : le jeton lui-même n'est pas reconnu. 403 ou 404 : il est valable
    // mais n'a pas cette base, ou pas la portée d'écriture. La nuance fait
    // gagner un quart d'heure, donc on la dit.
    const piste = r.status === 401
      ? ' — le jeton n’est pas reconnu : il doit commencer par « pat », et les anciennes clés « key… » ne marchent plus'
      : r.status === 403 || r.status === 404
        ? ' — jeton valable, mais sans accès à cette base ou sans la portée data.records:write'
        : '';
    throw new Error(`Airtable ${r.status}${piste} : ${detail}`);
  }
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

const echappe = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

/**
 * Le mail dans ta boîte, par Brevo, qui a déjà sa clé pour la lettre.
 *
 * Le « répondre à » porte l'adresse de la personne : tu réponds depuis ton
 * téléphone sans recopier son adresse ni rouvrir Airtable. L'expéditeur, lui,
 * reste le tien — c'est la seule adresse que Brevo accepte d'expédier, et un
 * mail prétendant venir de la personne serait refusé par les filtres.
 */
async function versMail({ sujet, lignes, repondreA, repondreNom }) {
  if (!BREVO_SMTP_KEY || !MAIL_VERS) return { saute: true };

  const texteBrut = lignes.filter((l) => l !== null).join('\n');
  const html = lignes
    .map((l) => (l === null
      ? '<hr style="border:none;border-top:1px solid #d8d2c4;margin:18px 0">'
      : `<p style="margin:0 0 10px">${echappe(l).replace(/\n/g, '<br>')}</p>`))
    .join('');

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_SMTP_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: MAIL_DE, name: 'Site anys.me' },
      to: [{ email: MAIL_VERS }],
      ...(repondreA ? { replyTo: { email: repondreA, ...(repondreNom ? { name: repondreNom } : {}) } } : {}),
      subject: sujet,
      textContent: texteBrut,
      htmlContent: `<div style="font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;max-width:34em">${html}</div>`,
    }),
  });
  if (!r.ok) {
    const detail = await r.text();
    // 400 avec « sender » dedans : l'adresse d'expédition n'est pas validée
    // chez Brevo. C'est l'erreur qu'on fait la première fois, et son message
    // d'origine ne le dit pas clairement.
    const piste = /transactional\.email|permission_denied/i.test(detail)
      ? ' — la clé Brevo n’a pas le droit d’envoyer des mails : donne-lui la portée « transactional.email », ou pose une seconde clé dans BREVO_SMTP_KEY'
      : /sender/i.test(detail)
        ? ` — l’expéditeur ${MAIL_DE} n’est pas validé chez Brevo (Réglages › Expéditeurs)`
        : '';
    throw new Error(`Mail ${r.status}${piste} : ${detail}`);
  }
  return { envoye: true };
}

/** Un contact dans la liste Brevo, qui lui envoie la confirmation. */
async function versBrevo({ email, prenom, source, envie, site }) {
  if (!BREVO_API_KEY || !BREVO_LISTE) return { saute: true };

  const doi = !!BREVO_DOI_MODELE;
  const envoyer = (attributs) => fetch(
    doi ? 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation' : 'https://api.brevo.com/v3/contacts',
    {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(doi
        ? {
            email,
            ...(attributs ? { attributes: attributs } : {}),
            includeListIds: [Number(BREVO_LISTE)],
            templateId: Number(BREVO_DOI_MODELE),
            redirectionUrl: `${site ?? SITE_REPLI}/merci?pour=lettre`,
          }
        : {
            email,
            ...(attributs ? { attributes: attributs } : {}),
            listIds: [Number(BREVO_LISTE)],
            updateEnabled: true,
          }),
    },
  );

  let r = await envoyer({
    ...(prenom ? { PRENOM: prenom } : {}),
    ...(source ? { SOURCE: source } : {}),
    ...(envie ? { ENVIE: envie } : {}),
  });
  // Un compte Brevo en anglais nomme ses champs FIRSTNAME, et SOURCE n'existe
  // que si on l'a créé. Plutôt que de perdre l'inscription sur un nom de
  // colonne, on réessaie sans rien : l'adresse entre dans la liste, et le
  // journal dit ce qui a été refusé.
  if (r.status === 400) {
    const refus = await r.text();
    console.error('[brevo] attributs refusés, nouvelle tentative sans :', refus);
    r = await envoyer(null);
  }
  // 204 quand le contact existait déjà et vient d'être mis à jour.
  if (!r.ok && r.status !== 204) throw new Error(`Brevo ${r.status} : ${await r.text()}`);
  return { ajoute: true, doi };
}

export default async function handler(request) {
  if (request.method !== 'POST') return new Response('Méthode non autorisée', { status: 405 });

  // La première garde : un envoi vient bien d'une page du site. Un navigateur
  // envoie son origine sur un POST de formulaire ; un script lancé d'ailleurs
  // en envoie une autre, ou aucune. Les suivantes sont plus bas.
  const origine = request.headers.get('origin');
  if (origine) {
    const ici = new URL(request.url).host;
    // Une origine illisible compte comme étrangère : un navigateur en envoie
    // toujours une, et une seule. Deux en-têtes collés ou une valeur tordue
    // viennent d'un outil, pas d'une page du site.
    const la = (() => { try { return new URL(origine).host; } catch { return null; } })();
    if (la !== ici) return new Response('Origine inattendue', { status: 403 });
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

  // La note du filtre. Un envoi jugé robot suit exactement le même chemin
  // jusqu'à Airtable, où la raison s'écrit dans la colonne « Spam ». On ne
  // refuse rien : refuser apprendrait au robot à recommencer autrement, et
  // ferait disparaître un vrai message mal noté.
  const note = noter(champs);
  const robot = estSpam(note);
  const pourquoi = note.raisons.join(' · ');

  const email = texte(champs.email);
  if (!email || !email.includes('@')) return new Response('Email manquant', { status: 400 });

  const nom = texte(champs.nom) || texte(champs.prenom);
  const message = texte(champs.message);
  const interet = texte(champs.interet);
  const source = texte(champs.source);
  const page = texte(champs.page);

  const envie = envieDe(source || 'site');
  const marque = robot ? { Spam: `${note.score} pts · ${pourquoi}` } : {};
  const ligne = quel === 'lettre'
    ? { Prénom: nom, Email: email, Source: source || 'site', Envie: envie, Reçu: new Date().toISOString(), ...marque }
    : {
        Nom: nom,
        Email: email,
        ...(APPELS[interet] ? { 'Ce qui appelle': APPELS[interet] } : {}),
        Message: message,
        Page: page,
        Reçu: new Date().toISOString(),
        ...marque,
      };

  const soucis = [];
  let range = false;
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE) {
    soucis.push(`Airtable non configuré (jeton ${AIRTABLE_TOKEN ? 'posé' : 'absent'}, base ${AIRTABLE_BASE ? AIRTABLE_BASE : 'absente'})`);
  }
  try {
    const r = await versAirtable(forme.table, ligne);
    range = !r.saute;
  } catch (e) {
    soucis.push(String(e.message ?? e));
  }

  // Un robot n'entre pas dans la liste de la lettre, et ne sonne pas. La ligne
  // est rangée, la raison écrite à côté, et on s'arrête là. Le navigateur reçoit
  // la même page de remerciement : un robot à qui l'on dit non revient déguisé.
  if (robot) {
    console.warn(`[${quel}] robot · ${note.score} pts · ${pourquoi} · ${email}`);
    if (!range) console.error(`[${quel}] ROBOT PAS RANGÉ`, JSON.stringify(ligne));
    return redirige(forme.retour);
  }

  // Brevo passe avant la notification : sinon son refus arriverait trop tard
  // pour être dit, et il faudrait aller le lire dans le journal de Netlify.
  if (quel === 'lettre') {
    // Le silence est pire que l'erreur : sans ces deux variables, l'inscription
    // ne part nulle part et rien ne le signale. On le dit.
    if (!BREVO_API_KEY || !BREVO_LISTE) {
      soucis.push(`Brevo non configuré (clé ${BREVO_API_KEY ? 'posée' : 'absente'}, liste ${BREVO_LISTE ?? 'absente'})`);
    }
    try {
      await versBrevo({ email, prenom: nom, source: source || 'site', envie,
        site: new URL(request.url).origin });
    } catch (e) {
      soucis.push(String(e.message ?? e));
    }
  }

  // Le mail. Le sujet commence par le nom du site pour qu'une règle de tri
  // l'attrape, et `null` dessine un trait de séparation dans la version HTML.
  const courrier = quel === 'lettre'
    ? {
        sujet: `[anys.me] ${envie === 'Lettre' ? 'Inscription à la lettre' : `Inscription · ${envie}`}${nom ? ` — ${nom}` : ''}`,
        lignes: [
          `${nom ? `${nom} — ` : ''}${email}`,
          source && `Depuis : ${source}`,
          envie !== 'Lettre' && `Envie : ${envie}`,
        ].filter(Boolean),
      }
    : {
        sujet: `[anys.me] Message de ${nom || email}`,
        repondreA: email,
        repondreNom: nom || undefined,
        lignes: [
          message || '(sans message)',
          null,
          `De : ${nom || '—'} · ${email}`,
          APPELS[interet] && `Ce qui appelle : ${APPELS[interet]}`,
          page && `Depuis la page : ${page}`,
          null,
          'Réponds à ce mail : ta réponse part directement à cette personne.',
        ].filter((l) => l !== false && l !== undefined && l !== ''),
      };
  // Les indices restés sous le seuil voyagent avec le message. Trois envois de
  // suite marqués « deux points » disent qu'il faut regarder le seuil de plus
  // près, et c'est une information qu'on n'a pas si elle reste dans le journal.
  if (note.score) courrier.lignes.push(`(Indices de robot, sous le seuil : ${pourquoi})`);
  if (soucis.length) courrier.lignes.push(null, `⚠️ Pas rangé dans Airtable.\n${soucis.join('\n')}`);
  // Sans cette variable aucun mail ne part, et une boîte muette ne se
  // remarque pas : on le dit, pour que le téléphone le porte.
  if (BREVO_SMTP_KEY && !MAIL_VERS) soucis.push('Mail non envoyé : MAIL_VERS absent chez Netlify');

  // Le mail part avant la notification, pour la même raison que Brevo : son
  // refus arriverait sinon trop tard pour être dit, et une boîte mail muette
  // ne se remarque pas. Ici, le téléphone porte l'erreur.
  try {
    await versMail(courrier);
  } catch (e) {
    soucis.push(String(e.message ?? e));
  }

  const notif = quel === 'lettre'
    ? { titre: `${envie === 'Lettre' ? 'Inscription à la lettre' : `Inscription · ${envie}`}${nom ? ` — ${nom}` : ''}`, corps: `${email}${source ? `\nDepuis : ${source}` : ''}`, etiquettes: 'envelope' }
    : {
        titre: `Message de ${nom || email}`,
        corps: [message || '(sans message)', '', email, interet && `Ce qui appelle : ${APPELS[interet] ?? interet}`].filter(Boolean).join('\n'),
        priorite: 'high',
        etiquettes: 'speech_balloon',
      };
  // La notification porte ce qui a raté, et dit quoi : sans le message d'origine
  // il faut aller fouiller le journal de Netlify pour apprendre qu'un jeton est
  // périmé, qu'une colonne manque ou qu'un expéditeur n'est pas validé. Et si
  // c'est le rangement qui a échoué, elle emporte la ligne entière : le message
  // existe alors sur ton téléphone, et nulle part ailleurs.
  if (soucis.length) {
    notif.corps += `\n\n⚠️ ${range ? 'Rangé, mais' : 'Pas rangé.'}\n${soucis.join('\n')}`;
    if (!range) notif.corps += `\n\n${JSON.stringify(ligne)}`;
    notif.priorite = 'urgent';
  }

  try {
    await versNtfy(notif);
  } catch (e) {
    soucis.push(String(e.message ?? e));
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
