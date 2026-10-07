# Avant la mise en ligne

État au 7 octobre 2026, branche `refonte-univers`.

## Ce qui bloque

**Aucune page 404.** Une adresse inconnue tombe sur la page par défaut de Netlify.
À créer : `src/pages/404.astro`, dans l'habillage du site.

**La mesure d'audience ne tourne pas.** Le code est en place dans `Base.astro`, mais
il attend `PUBLIC_PLAUSIBLE_DOMAIN` et aucune variable n'est définie. Il faut créer
le site sur Plausible, puis poser la variable dans les réglages Netlify.

**TinaCloud ne connaît pas les URLs du site.** L'admin refuse de s'ouvrir sur les
préversions. À ajouter dans Configuration → Site URLs, sur app.tina.io :
`https://anys.me`, l'URL de la branche `tina`, et celle de `refonte-univers`.

**Les deux formulaires n'ont jamais été envoyés pour de vrai.** Contact et Lettre
portent `data-netlify`, mais Netlify ne les détecte qu'au déploiement. À tester une
fois en ligne, et à vérifier que les notifications arrivent bien.

## Le contenu à finir

**Cinq fiches du Codex sont vides ou presque** : `tamakeapa` (rien du tout),
`koom`, `espriterre`, `meiso`, `blast`. Soit les écrire, soit les dépublier pour
qu'elles ne sortent pas dans le Codex.

**Trois offres n'ont pas de prix** : l'accompagnement individuel, IN CARNE et
Prisme Origine. Les cartes affichent « dès … » à partir d'ailleurs, à vérifier.

**Des images de tête manquent** : la page Contact, et la page Quintessence qui a en
plus quatre emplacements d'image vides. Deux chapitres d'À propos n'ont pas d'image
non plus — « L'ingénieur qui avait tout » et « Dharamsala ».

**Les pages Soins, Accompagnement, Contact, Agenda et Artefacts n'ont aucune photo
de toi.** Soins et Accompagnement réutilisent le portrait de l'accueil.

## Les incohérences à trancher

**Les témoignages.** Le contenu désigne une photo (`temoins_image`), mais la page la
met à `null` — ton choix dans l'atelier n'a donc aucun effet. À décider : photo ou
fond uni.

**Les cadrages mobiles sont à refaire.** Ils ont été réglés pour les photos d'avant,
et tu en as changé trois depuis dans l'atelier : le contact, la danse et les
témoignages.

**Les deux ateliers sont publiés.** `/reglages` et `/essais-photos` partent dans le
site. Ils sont hors menu, hors plan du site et en `noindex`, et l'enregistrement
n'y marche pas sans le serveur local — mais ils restent atteignables. À exclure du
build de production si tu préfères.

## Le poids

`public/img/photos` pèse 27 Mo, dont environ 16 Mo de photos importées pendant tes
essais et qui ne servent plus : `dscf1389`, `dscf1794`, `dscf1886`, `dscf1908`,
`dscf1915`, `dscf1836`, `dscf1870`, `dscf1873`, `dscf2313`, `dscf2487`, `dscf1640`.
Le site construit fait 47 Mo. Quelques images dépassent 1 Mo même en WebP.

## La mise en ligne elle-même

1. Fusionner `refonte-univers` dans `tina`.
2. Vérifier la préversion Netlify de `tina` en entier, sur téléphone compris.
3. Poser les variables d'environnement sur Netlify.
4. Basculer le DNS d'`anys.me`.
5. Tester les deux formulaires et le paiement des offres depuis le site en ligne.
6. Vérifier le sitemap et demander l'indexation dans la Search Console.
