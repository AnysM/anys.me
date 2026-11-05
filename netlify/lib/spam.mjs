/**
 * Reconnaître un envoi de robot, sans jamais barrer la route à quelqu'un.
 *
 * Deux principes tiennent tout le fichier.
 *
 * Le premier : on ne refuse pas, on note. Un formulaire qui dit « non » à un
 * humain coûte un client ; un message rangé à part coûte un coup d'œil. Chaque
 * indice ajoute des points, et ce qui dépasse le seuil est rangé sans prévenir
 * le téléphone ni la boîte mail. Rien n'est jeté : la ligne existe dans
 * Airtable avec la raison écrite à côté, donc une erreur de jugement se voit
 * et se corrige.
 *
 * Le second : les indices vraiment sûrs valent cher, les autres pas. Un lien
 * dans un message ne suffit pas — quelqu'un peut vouloir montrer son site. Un
 * lien dans le champ « nom », si : personne ne s'appelle https://. C'est la
 * somme qui décide, jamais un indice seul, sauf les deux pièges du bas, qu'un
 * humain ne peut pas remplir puisqu'il ne les voit pas.
 */

/** Au-delà, c'est rangé à part. Trois = un indice sûr, ou deux moyens. */
export const SEUIL = 3;

// Deux fois le même motif, et c'est voulu : un drapeau `g` garde en mémoire où
// il s'est arrêté, si bien qu'un `test` répété sur le même objet répond
// alternativement vrai et faux. Celui qui cherche compte, celui qui teste ne
// compte pas, et aucun des deux ne dérange l'autre.
const MOTIF_LIEN = 'https?:\\/\\/|www\\.[a-z0-9-]+\\.[a-z]{2,}|\\[url|\\[link|bit\\.ly';
const LIEN = new RegExp(MOTIF_LIEN, 'i');
const LIENS = new RegExp(MOTIF_LIEN, 'gi');
const BALISE_HTML = /<\/?(a|script|iframe|img|div|span|strong|b|p|br)\b[^>]*>/i;

// Cyrillique, chinois, japonais, coréen. L'arabe et l'hébreu n'y sont pas :
// quelqu'un peut écrire un mot dans sa langue au milieu d'un vrai message.
const AUTRE_ECRITURE = /[Ѐ-ӿ一-鿿぀-ヿ가-힯]/;

// Ce que vend le spam de formulaire : du référencement, de la crypto, du
// développement web au rabais. Comparé mot entier, pour que « seo » ne se
// déclenche pas sur « Seoul » ni « loan » sur un mot plus long.
const APPATS = [
  'seo', 'backlink', 'backlinks', 'link building', 'guest post', 'guest posting',
  'ranking', 'rankings', 'rank higher', 'google ranking', 'first page of google',
  'web design', 'website design', 'web development', 'app development',
  'wordpress developer', 'digital marketing', 'lead generation',
  'crypto', 'cryptocurrency', 'bitcoin', 'forex', 'nft', 'binary options',
  'casino', 'viagra', 'cialis', 'payday', 'escort', 'porn', 'xxx',
  'dear sir', 'dear owner', 'dear admin', 'dear webmaster',
  'to whom it may concern', 'i came across your website',
  'i was browsing your', 'i noticed your website', 'i visited your website',
  'increase your traffic', 'increase your sales', 'boost your sales',
  'make money', 'work from home', 'risk free', 'no obligation',
  'limited time offer', 'act now', 'click here', 'unsubscribe',
  'telegram', 'bulk email', 'email list', 'buy now',
];
const APPAT = new RegExp(
  '(?:^|[^a-z])(' + APPATS.map((m) => m.replace(/ /g, '[ -]')).join('|') + ')(?![a-z])',
  'gi',
);

// Les mots qu'un texte français ne peut pas éviter. Leur absence sur vingt mots
// dit que le message n'est pas écrit en français — un indice, pas un verdict :
// quelqu'un peut t'écrire en anglais pour de bonnes raisons.
const FRANCAIS = /(?:^|[^a-zà-ÿ])(je|tu|vous|nous|on|le|la|les|un|une|des|du|de|et|est|sont|que|qui|quoi|pour|dans|avec|sur|chez|ce|cet|cette|mon|ma|mes|ton|ta|tes|votre|vos|son|sa|ses|ne|pas|plus|très|bien|merci|bonjour|salut|aimerais|voudrais|souhaite|peux|peut|serait|suis|ai|as|avez|fait|être|avoir)(?![a-zà-ÿ])/i;

const texte = (v) => (typeof v === 'string' ? v.trim() : '');
const compte = (s, re) => (s.match(re) ?? []).length;

/**
 * Note un envoi. Rend `{ score, raisons, piege }` — `piege` vrai quand un champ
 * invisible a été rempli, ce qu'aucun humain ne peut faire.
 *
 * @param champs les champs du formulaire, tels qu'ils arrivent
 */
export function noter(champs = {}) {
  const raisons = [];
  let score = 0;
  const ajoute = (points, raison) => { score += points; raisons.push(raison); };

  // Les deux pièges. Le premier est caché par l'attribut `hidden`, le second
  // posé hors de l'écran et nommé « url », ce qu'un robot à liens ne sait pas
  // laisser vide. Les remplir n'est pas un indice : c'est une signature.
  const piege = !!(texte(champs['bot-field']) || texte(champs.url));
  if (piege) return { score: 99, raisons: ['champ invisible rempli'], piege: true };

  const nom = texte(champs.nom) || texte(champs.prenom);
  const message = texte(champs.message);
  const email = texte(champs.email);

  // Combien de temps la page est restée ouverte, en millisecondes, écrit par le
  // navigateur au moment d'envoyer. On mesure le temps écoulé et non l'heure :
  // une horloge déréglée ne change rien au résultat.
  const brut = texte(champs.duree);
  if (!brut) {
    ajoute(1, 'durée absente');
  } else if (!/^\d{1,9}$/.test(brut)) {
    ajoute(3, 'durée remplie n’importe comment');
  } else {
    const ms = Number(brut);
    if (ms < 2000) ajoute(3, `envoyé en ${(ms / 1000).toFixed(1)} s`);
    else if (ms < 4000) ajoute(1, `envoyé en ${(ms / 1000).toFixed(1)} s`);
  }

  // Un nom n'est pas une adresse web. Celui-là est net.
  if (LIEN.test(nom)) ajoute(3, 'lien dans le nom');
  if (/\d{3,}/.test(nom)) ajoute(1, 'suite de chiffres dans le nom');

  if (message) {
    const n = compte(message, LIENS);
    if (n >= 2) ajoute(3, `${n} liens dans le message`);
    else if (n === 1) ajoute(2, 'un lien dans le message');

    if (BALISE_HTML.test(message)) ajoute(3, 'balises HTML dans le message');

    // On lit le groupe et non la trouvaille entière : le motif commence par le
    // caractère qui précède le mot, pour exiger un mot entier, et ce caractère
    // n'a rien à faire dans la raison affichée.
    const appats = [...new Set([...message.matchAll(APPAT)].map((m) => m[1].toLowerCase()))];
    if (appats.length) {
      ajoute(Math.min(4, appats.length * 2), `mots de démarchage : ${appats.join(', ')}`);
    }

    const mots = message.split(/\s+/).length;
    if (mots >= 20 && !FRANCAIS.test(message)) ajoute(2, 'vingt mots sans un mot de français');

    const lettres = message.replace(/[^a-zà-ÿ]/gi, '');
    if (lettres.length > 30 && lettres === lettres.toUpperCase()) ajoute(1, 'tout en majuscules');
  }

  if (AUTRE_ECRITURE.test(`${nom} ${message}`)) ajoute(3, 'écriture non latine');
  if (AUTRE_ECRITURE.test(email) || LIEN.test(email)) ajoute(3, 'adresse mail bizarre');

  return { score, raisons, piege: false };
}

/** Vrai quand l'envoi part au panier plutôt que sur le téléphone. */
export function estSpam(note) {
  return note.score >= SEUIL;
}
