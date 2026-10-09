# Avant la mise en ligne

État au 8 octobre 2026, branche `refonte-univers`.
Le site compile : 63 pages en 53 s, 126 images converties en WebP (89 Mo → 30 Mo).

## Les quatre choses sans lesquelles on ne met pas en ligne

**Aucune page 404.** Une adresse inconnue tombe sur la page par défaut de Netlify.
À créer : `src/pages/404.astro`, dans l'habillage du site.

**Les deux formulaires n'ont jamais été envoyés pour de vrai.** Contact et Lettre
portent `data-netlify`, mais Netlify ne les détecte qu'au déploiement. À tester une
fois en ligne, et à vérifier que les notifications arrivent.

**La lettre n'a pas d'outil d'emailing.** Les inscriptions tombent dans Netlify
Forms et s'arrêtent là : rien ne part, personne n'est désinscrit en un clic malgré
ce que dit la mention sous le bouton. Il faut brancher Brevo, MailerLite ou
équivalent — ou retirer la promesse en attendant.

**TinaCloud ne connaît pas les URLs du site.** L'admin refuse de s'ouvrir sur les
préversions. À ajouter dans Configuration → Site URLs, sur app.tina.io :
`https://anys.me`, l'URL de la branche `tina`, et celle de `refonte-univers`.

## Ta relecture, page par page

Ce que tu voulais faire toi-même, avec ce qui manque de mon côté :

**À propos** — deux chapitres sur neuf n'ont pas d'image : « L'ingénieur qui avait
tout » et « Dharamsala ».

**Soins** — la page est à jour : en-tête, tes mots, les deux soins. Le champ
`portrait_image` existe encore dans le contenu mais la page ne s'en sert plus.
Son titre dit « Deux chemins pour le corps » juste sous un sur-titre « Le corps ».

**Codex** — cinq fiches sont vides ou presque : `tamakeapa` (rien du tout),
`koom`, `espriterre`, `meiso`, `blast`. Soit les écrire, soit les dépublier.
Les vingt-trois autres font 200 à 350 signes, ce qui est court mais tenable.

**Artefacts** — une seule fiche. C'est la page qui a le plus besoin de toi.

**Quintessence** — cinq emplacements d'image vides : la tête, silence, créa,
respiration, fin. La page la moins avancée du site.

**Contact** — pas d'image de tête.

## Les décisions qui restent

**Les témoignages.** Le contenu désigne une photo (`temoins_image`), la page la met
à `null`. Ton choix dans l'atelier n'a donc aucun effet. À trancher : photo ou fond
uni.

**Trois offres n'ont pas de prix** : accompagnement individuel, IN CARNE,
Prisme Origine.

**Les cadrages mobiles** ont été réglés pour les photos d'avant. Tu en as changé
plusieurs depuis.

**Les cinq ateliers partent dans le site** : `/ateliers`, `/reglages`,
`/essais-photos`, `/essais-signes` et `/essais`, le vieux banc d'essai. Hors menu,
hors plan du site, en `noindex`, et l'enregistrement n'y marche pas sans le serveur
local — mais ils restent atteignables par leur adresse. À exclure du build de
production si tu préfères.

## Le poids

Le site construit fait 48 Mo. Neuf photos importées pendant les essais ne servent
plus : `dscf1389`, `dscf1807`, `dscf1836`, `dscf1870`, `dscf1886`, `dscf1908`,
`dscf1915`, `dscf2313`, `dscf2487` — environ 14 Mo. Trois images remplacées non plus :
`soin-massage.jpg`, `soin-energetique.jpg`, `accompagnement-echange.jpg`,
et `IMG_8825.PNG`.

## La mise en ligne elle-même

1. Fusionner `refonte-univers` dans `tina`.
2. Vérifier la préversion Netlify de `tina` en entier, téléphone compris.
3. Poser `PUBLIC_PLAUSIBLE_DOMAIN` dans les variables Netlify, après avoir créé le
   site sur Plausible — sans elle la mesure d'audience ne tourne pas.
4. Basculer le DNS d'`anys.me`.
5. Tester les deux formulaires et le paiement des offres depuis le site en ligne.
6. Vérifier le sitemap et demander l'indexation dans la Search Console.
