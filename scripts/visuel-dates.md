# Visuels de dates

Fiche à donner telle quelle dans un autre chat pour refabriquer, ou adapter, les
visuels des dates d'un atelier. Le script est [visuel-dates.mjs](visuel-dates.mjs).

## Ce que ça produit

| Format | Taille | Fichier | Usage |
| --- | --- | --- | --- |
| `post` | 1080 × 1350 | `.jpg` | publication Instagram |
| `story` | 1080 × 1920 | `.jpg` | story, texte dans la zone sûre |
| `calque` | 1080 × 1920 | `.png` transparent | à poser sur une vidéo ou une photo |
| `solo` | 1080 × 1350 | `.jpg` | une seule séance, annoncée en grand |
| `soloStory` | 1080 × 1920 | `.jpg` | la même, en story |

Les formats `solo` lisent l'objet `contenu.seance`, les autres lisent `contenu.seances`.

```bash
node scripts/visuel-dates.mjs --sortie ~/Desktop
```

```bash
node scripts/visuel-dates.mjs --format story --titre serif --photo arbre-en-fleurs.jpg --sortie ~/Desktop
```

Options : `--format post|story|calque` (sans rien, les trois), `--titre manuscrit|serif`,
`--photo <nom dans public/img>`, `--sortie <dossier>`.

## Les polices, le point qui coince

Le rendu passe par `sharp`, qui s'appuie sur les polices **installées dans le système**.
Il ne sait pas lire les `.woff2` de `public/fonts`. Les équivalences retenues :

| Sur le site | Au rendu | D'où elle vient |
| --- | --- | --- |
| Jost | **Futura** | fournie par macOS, Jost en est une relecture |
| EB Garamond | **Cormorant Garamond** | déjà dans `~/Library/Fonts` |
| Biloxi Script | **Biloxi Script** | copiée du dépôt vers `~/Library/Fonts` |

Si le manuscrit sort en Helvetica, c'est que la police manque :

```bash
cp public/fonts/Biloxi_Script.ttf ~/Library/Fonts/
```

## La grammaire visuelle

- 🎨 **Couleurs** : navy `#0A0F20`, crème `#ECE7DE`, or `#E0AE5E`, gris clair `#A6ADC4`, corail `#F07A5F`
- 🖼️ **Photo** en bandeau haut, fondue vers le navy par un dégradé. `photoH` fixe la part
  d'image dans le visuel et prime sur le cadrage : la photo remplit le bandeau, quitte à être
  recadrée. Baisser `photoH` fait remonter le navy, ce qui déséquilibre le visuel.
- ✍️ **Titre** en manuscrit, corps 146, ou en serif italique, corps 96, crème, centré,
  posé à 92 px du bas du bandeau : juste sur le dégradé, les fleurs transparaissent derrière
- 🔠 **Sous-titre** en capitales Futura dorées, corps 28, interlettrage 4, pleine largeur
- 🗓️ **Mois** seul en capitales espacées, corps 26, interlettrage 12, gris clair, sans filet au-dessus
- 🕖 **Dates** : jour à gauche en crème, heure à droite en or, même corps 39, un filet blanc à 13 % entre chaque
- 🔴 **Mention exceptionnelle** en capitales corail, corps 21, sous le jour concerné
- 📍 **Pied** : lieu en gris clair, tarifs en crème, adresse du site en or

Tout ce qui porte une information pratique est en sans serif. Le serif italique ne sert
qu'aux accents, jamais aux horaires : c'est ce qui les rendait illisibles au premier essai.

## Changer de mois, ou d'atelier

Tout est dans l'objet `contenu`, en haut du script. Les dates font foi dans
`src/content/agenda/<atelier>.md`, jamais dans un export de textes.

```js
const contenu = {
  titre: 'Infloressence',
  sousTitre: 'MÉDITATION  ·  DANSE BUTOH  ·  VOYAGE SONORE',
  mois: 'NOVEMBRE',
  seances: [
    { jour: 'VENDREDI 6', heure: '19h → 20h30', note: 'HORAIRE EXCEPTIONNEL' },
  ],
  lieu: 'CHANKA STUDIO  ·  51 QUAI SAINT-VINCENT  ·  LYON',
  tarifs: '20 € la séance  ·  60 € le mois',
  site: 'ANYS.ME',
};
```

Les repères verticaux de chaque format sont dans l'objet `formats` : `titreY`, `sousY`,
`moisY`, `ligneY`, `pas`, `piedY`. En ajouter ou retirer une séance décale le pied, il
faut alors reprendre `pas` ou `piedY` pour garder l'air en bas.

## Poser le calque sur une vidéo

```bash
ffmpeg -i source.mp4 -i infloressence-novembre-calque.png -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v];[v][1:v]overlay=0:0[out]" -map "[out]" -map 0:a? -c:a copy sortie.mp4
```

Le voile du calque est un dégradé qui part de transparent et descend à 94 % de navy :
le haut de la vidéo reste visible, le bas porte le texte.
