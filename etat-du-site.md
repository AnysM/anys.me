# anys.me est en ligne — 4 novembre 2026

La bascule est faite. `anys.me` sert le site neuf, et le WordPress ne répond
plus à personne.

```
📬 MX  mx1/mx2/mx3.mail.ovh.net   intacts · contact@anys.me reçoit toujours
🔑 SPF + DKIM                      intacts · tes mails restent signés
🅰️ anys.me → 75.2.60.5             Netlify
🚫 AAAA                            supprimé
🔒 Let's Encrypt                   anys.me + www.anys.me, renouvelé seul
```

Pour revérifier à tout moment :

```bash
cd /Users/anys/Code/anys.me && ./verifier-bascule.sh
```

---

## 🔴 Il te reste une chose

- [ ] 🧹 **Brevo** · supprimer deux contacts de test
      · `TEST BASCULE` — `test-bascule-lettre@example.com`
      · `ESSAI APRES DEPLOY` — `essai-deploy-lettre@example.com`
      · je n'ai pas la clé API en local, Airtable est déjà nettoyé

> 💡 Au passage : l'envoi du **formulaire de contact** n'est pas arrivé chez
> Brevo, et c'est voulu. Écrire un message n'abonne pas à la lettre. Seul le
> formulaire de la lettre inscrit à la liste.

---

## ✅ Vérifié en vrai sur anys.me

Un message et une inscription envoyés depuis le vrai domaine, de bout en bout :

```
contact ──▶ 303 → https://anys.me/merci              ✓
lettre  ──▶ 303 → https://anys.me/merci?pour=lettre  ✓
origine étrangère ──▶ 403                            ✓ les robots sont refusés
```

Les deux notifications sont arrivées sur ton téléphone, accents compris, et les
lignes se sont rangées dans Airtable avant que je les efface.

Le reste, page par page : accueil, à propos, agenda, contact, soins, codex,
artefacts, le sitemap, et les redirections depuis l'ancien WordPress.

---

## 🕐 Si tu vois encore l'ancien site

C'est ta machine, pas le site. Elle garde l'ancienne adresse jusqu'à une heure,
l'IPv6 comprise — et c'est l'IPv6 qu'elle essaie en premier.

Le script le dit dans sa dernière section : il distingue ce que sert OVH, qui
fait foi, de ce que joint ta machine.

Pour vérifier sans attendre : [anysme.netlify.app](https://anysme.netlify.app)
affiche exactement la même chose que `anys.me`.

---

## ✅ Fait dans la foulée

- 🔍 **Search Console** · domaine vérifié par enregistrement TXT, sitemap soumis
- 🧭 **Contact** dans la barre du haut, en version bureau
- 📱 **Icône écran d'accueil** + `manifest.json` — le site s'ouvre sans barre de
      navigateur quand on l'ajoute à l'écran d'accueil
- ⚡ **Images adaptatives** · cinq largeurs par photo, le téléphone prend la
      plus petite qui lui suffit, le PC garde la pleine définition
- 🛡️ **Les robots du formulaire** · rangés à part, sans sonner
- 🔏 **`anys.me` authentifié chez Brevo** · 7 novembre. Le `brevo-code`, les
      deux CNAME `brevo1/brevo2._domainkey` et un `_dmarc` en `p=none` ont été
      ajoutés ; les MX, le SPF et les DKIM d'OVH n'ont pas bougé. Ta lettre
      part désormais signée au nom du domaine, ce qui la fait mieux arriver.
      Le `De :` des messages du formulaire est `contact@anys.me`.
- 📨 **Les messages par mail** · vérifié de bout en bout le 5 novembre.
      `dkim=pass · spf=pass · dmarc=pass`, boîte de réception, et le
      « répondre à » porte l'adresse de la personne : tu réponds au mail, ta
      réponse lui arrive.

## 🟡 Ce qui reste

- [ ] 📖 **Relire tous les contenus** page par page · c'est ton travail
- [ ] ✍️ **Finaliser `a-propos-court`**, puis supprimer les trois autres
      brouillons (`a-propos`, `-2`, `-bref`)
- [ ] 📬 Le mail de confirmation d'inscription · créer un modèle **double
      opt-in** chez Brevo, noter son ID, le poser dans `BREVO_DOI_MODELE` chez
      Netlify, **puis redéployer**
> ⚠️ **Ne clique pas sur « Se désabonner »** en haut d'un de ces mails. Brevo
> l'ajoute d'office, et il mettrait ton adresse sur sa liste noire : tu ne
> recevrais plus aucun message du formulaire, sans que rien ne te prévienne.

---

## 🛡️ Le spam du formulaire

Un envoi jugé robot se range dans Airtable avec la raison écrite dans la
colonne **Spam**, et s'arrête là : ni téléphone, ni mail, ni inscription chez
Brevo. Il reçoit quand même la page de remerciement — un robot à qui l'on dit
non revient déguisé.

| Garde | Ce qu'elle arrête |
|---|---|
| Origine de la requête | un script qui poste depuis ailleurs |
| Deux champs invisibles | un robot qui remplit tout, dont un nommé `url` |
| Temps passé sur la page | un formulaire rempli en moins de deux secondes |
| Contenu | liens, HTML, cyrillique, mots de démarchage, anglais sans un mot de français |

Le contenu se compte en points, et **trois points** rangent à part. Un seul
indice ne suffit presque jamais : quelqu'un peut vouloir te montrer son site.

Pour voir tes vrais messages dans Airtable : filtre **« Spam est vide »**.

Pour éprouver le filtre après une retouche :

```bash
cd /Users/anys/Code/anys.me && node scripts/essai-spam.mjs
```

Il contient onze vraies personnes et douze robots écrits à la main, et échoue
si une vraie personne se fait ranger à part.

## ⚡ Les performances, mesurées

| Écran | Gain sur les images |
|---|---|
| Téléphone à densité 2 | −68 % sur `/accompagnement` (2582 Ko → 848) |
| iPhone Pro (densité 3) | −17 à −38 % selon la page |
| PC | cartes allégées, aucune perte de qualité |

Coût : 62 Mo de tailles supplémentaires stockées, et un build de 2 min au lieu
d'1 min 30. Rien de visible pour tes visiteurs.

**Vérifié aussi :** aucun débordement horizontal sur téléphone, CLS à 0 (la page
ne saute pas au chargement), aucun lien cassé, aucun texte provisoire dans le
contenu.

---

## 🧰 L'état des lieux, pour mémoire

```
Formulaire ──▶ netlify/functions/formulaire ──┬──▶ 📊 Airtable  ✅
                                              ├──▶ 📱 ntfy      ✅
                                              └──▶ ✉️ Brevo     ✅
```

Les six variables sont posées chez Netlify :
`AIRTABLE_TOKEN`, `AIRTABLE_BASE`, `NTFY_TOPIC`, `BREVO_API_KEY`,
`BREVO_LISTE`, `PUBLIC_UMAMI_ID`.

**À retenir :** une variable posée dans Netlify n'atteint une fonction qu'au
déploiement suivant. Si tu en ajoutes une, redéploie.

Le calendrier s'entretient seul : une séance passée disparaît de l'agenda, de
l'accueil, du Codex, des pages d'offre et du sitemap, mais garde son adresse
avec la mention « C'est passé ». L'early bird expire à sa date.

### Les redirections depuis l'ancien WordPress

| Ancienne adresse | Mène à |
|---|---|
| `/a-propos/` `/agenda/` `/ateliers/` `/contact/` `/soins/` | natif, même nom |
| `/agenda-2/` | `/agenda` |
| `/immersions` · `/immersions-2` | `/in-carne` |
| `/form/…` | `/contact` |
| `/sitemap_index.xml` | `/sitemap-index.xml` |
| `/hello-world` · `/sample-page` · `/category/…` | `/` |
| `/wp-admin/…` · `/wp-login.php` · `/wp-content/…` | `/` |
