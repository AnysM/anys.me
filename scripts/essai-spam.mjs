/**
 * Met le filtre à l'épreuve sur des envois écrits à la main.
 *
 * Les vrais messages comptent plus que les faux : laisser passer un spam coûte
 * un coup d'œil, bloquer quelqu'un coûte une rencontre. Chaque ligne « humain »
 * qui serait rangée à part est donc une erreur grave, et le script sort en
 * échec si une seule apparaît.
 *
 *     node scripts/essai-spam.mjs
 */
import { noter, estSpam, SEUIL } from '../netlify/lib/spam.mjs';

// Un humain qui prend le temps d'écrire reste quelques dizaines de secondes.
const LENT = { duree: '48000' };

const HUMAINS = [
  ['message simple', { ...LENT, nom: 'Camille Durand', email: 'camille.durand@gmail.com', message: 'Bonjour Anys, je t’ai vu au cours de Kung-Fu et j’aimerais prendre un soin. Est-ce que tu as de la place en novembre ? Merci !' }],
  ['message très court', { ...LENT, nom: 'Léa', email: 'lea@orange.fr', message: 'Bonjour, quels sont tes tarifs ?' }],
  ['sans message du tout', { ...LENT, nom: 'Marc Bonnet', email: 'm.bonnet@free.fr', message: '' }],
  ['inscription à la lettre', { ...LENT, prenom: 'Sophie', email: 'sophie@laposte.net' }],
  ['tout en minuscules, sans accents', { ...LENT, nom: 'thomas', email: 'thomas@sfr.fr', message: 'salut je voudrais savoir si le voyage sonore est ouvert aux debutants, je nai jamais fait ca' }],
  ['quelqu’un qui partage son site', { ...LENT, nom: 'Claire Petit', email: 'claire@exemple.fr', message: 'Bonjour, je suis sophrologue à Lyon et j’aimerais échanger avec toi. Tu peux voir ce que je fais sur https://claire-sophro.fr — au plaisir.' }],
  ['un anglophone de bonne foi', { ...LENT, nom: 'Sarah Miller', email: 'sarah.miller@gmail.com', message: 'Hello Anys, I live in Lyon and I am looking for an energy practitioner who speaks English. Would you be able to receive me for a session in December? Thank you so much.' }],
  ['message long et personnel', { ...LENT, nom: 'Julien Mercier', email: 'julien.mercier@gmail.com', message: 'Bonjour, je sors d’un burnout et je ne sais plus trop où j’en suis. J’ai lu ta page sur l’accompagnement et quelque chose m’a parlé, surtout le passage sur le corps. Je ne cherche pas une méthode, je cherche quelqu’un qui tienne le cadre. Est-ce qu’on peut se parler au téléphone avant de décider ?' }],
  ['envoi rapide mais humain', { duree: '9000', nom: 'Inès', email: 'ines@gmail.com', message: 'Bonjour, est-ce qu’il reste des places pour Infloressence ?' }],
  ['navigateur sans JavaScript', { nom: 'Paul Girard', email: 'paul.girard@wanadoo.fr', message: 'Bonjour Anys, je voudrais réserver un massage à l’huile. Quelles sont tes disponibilités la semaine prochaine ?' }],
  ['un prénom composé avec un chiffre', { ...LENT, nom: 'Jean-Luc 2', email: 'jl@exemple.fr', message: 'Bonjour, je m’intéresse au Prisme Origine, pourrais-tu m’en dire plus ?' }],
];

const ROBOTS = [
  ['piège rempli', { ...LENT, 'bot-field': 'x', nom: 'Bob', email: 'bob@x.ru', message: 'hello' }],
  ['piège « url » rempli', { ...LENT, url: 'http://casino.example', nom: 'Bob', email: 'bob@x.ru', message: 'hi' }],
  ['démarchage SEO classique', { duree: '600', nom: 'Rajesh', email: 'rajesh@seoexpert.biz', message: 'Dear Sir, I came across your website anys.me and noticed it is not ranking on the first page of Google. We offer SEO and link building services that will increase your traffic. Reply for our price list.' }],
  ['liens en rafale', { ...LENT, nom: 'Mike', email: 'mike@x.com', message: 'check this out http://spam1.example and http://spam2.example and www.spam3.example' }],
  ['BBCode', { ...LENT, nom: 'Anna', email: 'anna@x.com', message: 'Nice site! [url=http://pills.example]cheap cialis[/url] visit now' }],
  ['HTML injecté', { ...LENT, nom: 'x', email: 'x@x.com', message: '<a href="http://x.example">click here</a> <script>alert(1)</script>' }],
  ['cyrillique', { ...LENT, nom: 'Иван', email: 'ivan@mail.ru', message: 'Привет, посмотрите наш сайт' }],
  ['lien dans le nom', { ...LENT, nom: 'https://buy-now.example', email: 'a@b.com', message: 'bonjour' }],
  ['rempli en une seconde', { duree: '400', nom: 'John Smith', email: 'john@x.com', message: 'Hello, I would like more information about your services please.' }],
  ['durée remplie n’importe comment', { duree: 'duree', nom: 'Bot', email: 'b@b.com', message: 'hello there' }],
  ['démarchage crypto', { duree: '1200', nom: 'Trading Pro', email: 'pro@forex.biz', message: 'Hello, we help people make money from home with bitcoin and forex. Risk free, no obligation. Click here to start earning today, limited time offer.' }],
  ['développement web au rabais', { duree: '1500', nom: 'Priya', email: 'priya@webdev.in', message: 'Hi, I was browsing your website and I think we can help. We do web design, web development and app development at low cost. Please reply with your requirements.' }],
];

let fuites = 0;
let faux = 0;

const ligne = (quoi, note, attendu) => {
  const verdict = estSpam(note);
  const ok = verdict === attendu;
  const marque = ok ? '  ' : '❌';
  const etiquette = verdict ? 'rangé à part' : 'passe';
  console.log(`${marque} ${String(note.score).padStart(2)} · ${etiquette.padEnd(12)} · ${quoi}`);
  if (!ok || note.score) console.log(`        ${note.raisons.join(' · ') || '—'}`);
  return ok;
};

console.log(`\nSeuil : ${SEUIL} points.\n`);
console.log('── De vraies personnes (aucune ne doit être rangée à part) ──');
for (const [quoi, champs] of HUMAINS) {
  if (!ligne(quoi, noter(champs), false)) faux++;
}

console.log('\n── Des robots (toutes doivent être rangées à part) ──');
for (const [quoi, champs] of ROBOTS) {
  if (!ligne(quoi, noter(champs), true)) fuites++;
}

console.log('');
if (faux) console.log(`❌ ${faux} vraie(s) personne(s) seraient rangées à part. C'est grave.`);
if (fuites) console.log(`⚠️ ${fuites} robot(s) passeraient. Moins grave : le piège et l'origine en arrêtent déjà beaucoup.`);
if (!faux && !fuites) console.log(`✅ ${HUMAINS.length} vraies personnes passent, ${ROBOTS.length} robots sont rangés à part.`);
process.exit(faux ? 1 : 0);
