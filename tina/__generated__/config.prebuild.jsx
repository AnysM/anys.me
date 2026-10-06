// tina/config.ts
import { defineConfig } from "tinacms";
var UNIV = [{ value: "presence", label: "La pr\xE9sence" }, { value: "connaissance", label: "La connaissance de soi" }, { value: "mouvement", label: "Le mouvement" }, { value: "vivant", label: "Le lien au vivant" }, { value: "art", label: "L'art et l'expression cr\xE9ative" }];
var branch = process.env.BRANCH || process.env.HEAD || process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "tina";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "ac005920-bdf5-45df-a7d6-5d99cc50423a",
  token: process.env.TINA_TOKEN || "",
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "img", publicFolder: "public" } },
  schema: {
    collections: [
      {
        name: "agenda",
        label: "Agenda \u2014 \xE9v\xE9nements",
        path: "src/content/agenda",
        format: "md",
        fields: [
          { type: "string", name: "titre", label: "Titre", isTitle: true, required: true },
          {
            type: "string",
            name: "categorie",
            label: "Cat\xE9gorie",
            required: true,
            options: ["soin", "atelier", "retraite", "immersion", "voyage-sonore", "accompagnement", "cercle", "residence"]
          },
          { type: "datetime", name: "date", label: "Date", ui: { dateFormat: "YYYY-MM-DD" } },
          { type: "datetime", name: "date_fin", label: "Date de fin", ui: { dateFormat: "YYYY-MM-DD" } },
          { type: "string", name: "rythme", label: "Rythme (si pas de date)" },
          { type: "string", name: "heure", label: "Heure" },
          { type: "string", name: "lieu", label: "Lieu" },
          { type: "string", name: "prix", label: "Prix" },
          { type: "string", name: "earlybird", label: "Early bird \u2014 date limite" },
          {
            type: "object",
            name: "seances",
            label: "S\xE9ances (rendez-vous r\xE9guliers)",
            list: true,
            description: "Les dates des prochaines s\xE9ances : la prochaine s'affiche sur la carte, toutes s'affichent sur la page.",
            ui: { itemProps: (i) => ({ label: i?.date ? `${String(i.date).slice(0, 10)} ${i.heure ?? ""}` : "S\xE9ance" }) },
            fields: [
              { type: "datetime", name: "date", label: "Date", ui: { dateFormat: "YYYY-MM-DD" } },
              { type: "string", name: "heure", label: "Horaire", description: "Ex. : 19h - 20h30" },
              { type: "string", name: "note", label: "Note", description: "Ex. : horaire exceptionnel" }
            ]
          },
          {
            type: "object",
            name: "tarifs",
            label: "Formules (s\xE9ance, mois, ann\xE9e\u2026)",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.label ? `${i.label} \u2014 ${i.prix ?? ""}` : "Formule" }) },
            fields: [
              { type: "string", name: "label", label: "Formule" },
              { type: "string", name: "prix", label: "Prix" },
              { type: "string", name: "detail", label: "D\xE9tail" },
              { type: "boolean", name: "avant", label: "Mettre en avant (\xAB Recommand\xE9 \xBB)" }
            ]
          },
          { type: "string", name: "cta", label: "Texte du bouton" },
          { type: "string", name: "site", label: "Lien direct de la carte" },
          { type: "string", name: "lien", label: "Lien de r\xE9servation" },
          { type: "string", name: "resume", label: "R\xE9sum\xE9", ui: { component: "textarea" } },
          {
            type: "object",
            name: "citations",
            label: "Respirations (1 : sous le titre \xB7 2 : apr\xE8s les s\xE9ances \xB7 3 : avant l'invitation)",
            list: true,
            ui: { itemProps: (item) => ({ label: item?.texte }) },
            fields: [
              { type: "string", name: "texte", label: "Phrase", ui: { component: "textarea" } },
              { type: "string", name: "source", label: "Source" },
              { type: "image", name: "image", label: "Photo (par d\xE9faut celle de l'\xE9v\xE9nement)" }
            ]
          },
          { type: "image", name: "image", label: "Image" },
          { type: "image", name: "image_hero", label: "Image du grand bandeau (par d\xE9faut, l'image)" },
          { type: "string", name: "accroche", label: "Accroche du bandeau, en capitales (\xAB | \xBB pour aller \xE0 la ligne)" },
          { type: "boolean", name: "reservable", label: "R\xE9servable" },
          { type: "number", name: "ordre", label: "Ordre d'affichage" },
          { type: "boolean", name: "publie", label: "Publi\xE9" },
          {
            type: "object",
            name: "temoignages",
            label: "T\xE9moignages (affich\xE9s avant les tarifs)",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.n ?? "T\xE9moignage" }) },
            fields: [
              { type: "string", name: "t", label: "Texte", ui: { component: "textarea" } },
              { type: "string", name: "n", label: "Pr\xE9nom" },
              { type: "string", name: "c", label: "Contexte (ex. : Accompagnement 3 mois)" }
            ]
          },
          {
            type: "object",
            name: "faq",
            label: "Questions fr\xE9quentes",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.q ?? "Question" }) },
            fields: [
              { type: "string", name: "q", label: "Question" },
              { type: "string", name: "r", label: "R\xE9ponse", ui: { component: "textarea" } }
            ]
          },
          { type: "boolean", name: "accueil", label: "\xC0 la une sur l'accueil", description: "Coche 1 ou 2 propositions par seuil au maximum : l'accueil doit rester simple. Tout reste visible dans l'agenda et les pages d\xE9di\xE9es." },
          { type: "string", name: "seuil", label: "Seuil", description: "Laisser vide pour le choix automatique selon la cat\xE9gorie.", options: [{ value: "decouvrir", label: "I \xB7 D\xE9couvrir" }, { value: "approfondir", label: "II \xB7 Approfondir" }, { value: "transformer", label: "III \xB7 Se transformer" }] },
          { type: "rich-text", name: "body", label: "Contenu de la page", isBody: true }
        ]
      },
      {
        name: "offres",
        label: "Soins & accompagnements",
        path: "src/content/offres",
        format: "md",
        fields: [
          { type: "string", name: "titre", label: "Titre", isTitle: true, required: true },
          { type: "string", name: "categorie", label: "Cat\xE9gorie", required: true, options: ["soin", "accompagnement"] },
          { type: "string", name: "tag", label: "\xC9tiquette" },
          { type: "string", name: "resume", label: "R\xE9sum\xE9", ui: { component: "textarea" } },
          { type: "string", name: "accroche", label: "Phrase du bandeau (\xAB | \xBB avant la note)", ui: { component: "textarea" } },
          { type: "string", name: "prix", label: "Prix" },
          { type: "string", name: "duree", label: "Dur\xE9e" },
          { type: "string", name: "format", label: "Format" },
          {
            type: "object",
            name: "tarifs",
            label: "Tarifs (formules)",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.label ? `${i.label} \u2014 ${i.prix ?? ""}` : "Formule" }) },
            fields: [
              { type: "string", name: "label", label: "Formule" },
              { type: "string", name: "prix", label: "Prix" },
              { type: "string", name: "detail", label: "D\xE9tail" },
              { type: "string", name: "groupe", label: "Groupe (ex. : En ligne, Immersion)", description: "Les formules d'un m\xEAme groupe s'affichent ensemble." },
              { type: "boolean", name: "avant", label: "Mettre en avant (\xAB Recommand\xE9 \xBB)", description: "Sinon, dans un groupe de 3 formules, celle du milieu est mise en avant." }
            ]
          },
          {
            type: "object",
            name: "etapes",
            label: "Comment \xE7a se passe (\xE9tapes)",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.titre ?? "\xC9tape" }) },
            fields: [
              { type: "string", name: "titre", label: "Titre de l'\xE9tape" },
              { type: "string", name: "texte", label: "Texte", ui: { component: "textarea" } },
              { type: "string", name: "picto", label: "Pictogramme", options: [
                { value: "accueil", label: "Accueil (porte)" },
                { value: "souffle", label: "Souffle / pr\xE9sence" },
                { value: "mains", label: "Soin / toucher" },
                { value: "son", label: "Chant / son" },
                { value: "parole", label: "Parole / \xE9change" },
                { value: "carte", label: "Lecture / carte" },
                { value: "chemin", label: "Chemin / dur\xE9e" },
                { value: "graine", label: "Int\xE9gration / apr\xE8s" },
                { value: "plume", label: "\xC9crit / \u0153uvre" },
                { value: "date", label: "Date / naissance" },
                { value: "etoile", label: "\xC9toile / r\xE9v\xE9lation" }
              ] }
            ]
          },
          { type: "image", name: "image", label: "Image" },
          { type: "string", name: "lien", label: "Lien" },
          { type: "boolean", name: "reservable", label: "R\xE9servable" },
          { type: "number", name: "ordre", label: "Ordre d'affichage" },
          { type: "boolean", name: "publie", label: "Publi\xE9" },
          {
            type: "object",
            name: "temoignages",
            label: "T\xE9moignages (affich\xE9s avant les tarifs)",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.n ?? "T\xE9moignage" }) },
            fields: [
              { type: "string", name: "t", label: "Texte", ui: { component: "textarea" } },
              { type: "string", name: "n", label: "Pr\xE9nom" },
              { type: "string", name: "c", label: "Contexte (ex. : Accompagnement 3 mois)" }
            ]
          },
          {
            type: "object",
            name: "faq",
            label: "Questions fr\xE9quentes",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.q ?? "Question" }) },
            fields: [
              { type: "string", name: "q", label: "Question" },
              { type: "string", name: "r", label: "R\xE9ponse", ui: { component: "textarea" } }
            ]
          },
          { type: "string", name: "benefices", label: "Ce que tu y trouves (liste)", list: true },
          { type: "string", name: "pourqui_titre", label: "Pour qui \u2014 titre", description: "Par d\xE9faut : C'est *pour toi* si\u2026" },
          { type: "string", name: "pourqui", label: "C'est pour toi si\u2026 (situations)", list: true },
          { type: "string", name: "pourtoi", label: "C'est pour toi si\u2026 (page d\xE9di\xE9e)", list: true, description: "La phrase, puis \xAB | \xBB et le nom du masque. Ex. : Tu donnes tout\u2026 | le chic type" },
          { type: "string", name: "pourtoi_note", label: "C'est pour toi si\u2026 \u2014 phrase de fin" },
          { type: "string", name: "places", label: "Places (\xE0 c\xF4t\xE9 du bouton)", description: "Ex. : **3** places pour entrer en novembre 2026" },
          { type: "string", name: "pourtoi_contre_titre", label: "C'est pour toi si\u2026 \u2014 titre du second groupe" },
          { type: "string", name: "pourtoi_contre", label: "C'est pour toi si\u2026 \u2014 ce qui te retient", list: true },
          { type: "string", name: "masques_titre", label: "Les masques \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "masques", label: "Les masques", list: true, description: "Nom | description" },
          { type: "string", name: "chemin_eyebrow", label: "Le chemin \u2014 sur-titre" },
          { type: "string", name: "chemin_titre", label: "Le chemin \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "chemin", label: "Le chemin \u2014 texte", ui: { component: "textarea" } },
          { type: "string", name: "chemin_appuis", label: "Le chemin \u2014 les appuis", list: true, description: "Nom | lien (ex. : Les arch\xE9types | /codex/archetypes)" },
          { type: "string", name: "approche_eyebrow", label: "Approche \u2014 sur-titre", description: "Par d\xE9faut : Mon approche" },
          { type: "string", name: "approche_titre", label: "Approche \u2014 titre", description: "Par d\xE9faut : *Comment* on avance" },
          { type: "string", name: "approche_intro", label: "Mon approche \u2014 introduction", ui: { component: "textarea" }, description: "**mot** = en valeur" },
          {
            type: "object",
            name: "approche",
            label: "Mon approche \u2014 les piliers",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.titre ?? "Pilier" }) },
            fields: [{ type: "string", name: "titre", label: "Titre" }, { type: "string", name: "cadence", label: "Cadence", description: "Ex. : toutes les 2 semaines" }, { type: "string", name: "texte", label: "Texte", ui: { component: "textarea" } }]
          },
          { type: "string", name: "cap_eyebrow", label: "\xC9tapes \u2014 sur-titre", description: "Par d\xE9faut : Par \xE9tapes" },
          { type: "string", name: "cap_titre", label: "\xC9tapes \u2014 titre", description: "Par d\xE9faut : *Ce vers quoi* on va" },
          {
            type: "object",
            name: "cap",
            label: "Les \xE9tapes du chemin",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.titre ?? "\xC9tape" }) },
            fields: [
              { type: "string", name: "titre", label: "Titre" },
              { type: "string", name: "posture", label: "Posture", description: "Ex. : Je suis ancr\xE9" },
              { type: "string", name: "texte", label: "Texte", ui: { component: "textarea" } }
            ]
          },
          { type: "string", name: "cadre", label: "Le cadre", ui: { component: "textarea" }, description: "**mot** = en valeur" },
          {
            type: "object",
            name: "cadre_items",
            label: "Les rendez-vous (page d\xE9di\xE9e)",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.titre ?? "Rendez-vous" }) },
            fields: [{ type: "string", name: "titre", label: "Titre" }, { type: "string", name: "texte", label: "Texte", ui: { component: "textarea" } }]
          },
          { type: "string", name: "explore", label: "Ce qu'on explore ensemble", list: true, description: "Titre | description. Ex. : Ton rythme | ce qui te nourrit, ce qui t'\xE9puise" },
          { type: "string", name: "action", label: "Bouton principal", options: [{ value: "appel", label: "Appel d\xE9couverte" }, { value: "rdv", label: "Prendre rendez-vous" }, { value: "reserver", label: "R\xE9server directement" }], description: "Par d\xE9faut : appel d\xE9couverte pour les accompagnements, rendez-vous pour les soins." },
          { type: "string", name: "cta", label: "Texte du bouton", description: "Ex. : R\xE9server ma lecture" },
          { type: "image", name: "logo", label: "Logo de l'offre", description: "Affich\xE9 \xE0 c\xF4t\xE9 de l'explication du nom." },
          { type: "string", name: "page", label: "Page d\xE9di\xE9e", description: "Ex. : /in-carne. L'offre est alors pr\xE9sent\xE9e sur sa propre page." },
          { type: "string", name: "intention_eyebrow", label: "Note d'intention \u2014 sur-titre", description: "Par d\xE9faut : Note d'intention" },
          { type: "string", name: "intention", label: "Note d'intention (texte du c\u0153ur)", ui: { component: "textarea" }, description: "Paragraphes s\xE9par\xE9s par une ligne vide. **mot** = en valeur." },
          { type: "string", name: "nom_titre", label: "Le nom \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "nom_texte", label: "Le nom \u2014 texte", ui: { component: "textarea" } },
          { type: "string", name: "cap_note", label: "\xC9tapes \u2014 phrase de fin", ui: { component: "textarea" } },
          { type: "string", name: "temoins_titre", label: "T\xE9moignages \u2014 titre", description: "Par d\xE9faut : *Ils et elles* l'ont travers\xE9" },
          { type: "string", name: "invite_titre", label: "Fin de page \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "invite_texte", label: "Fin de page \u2014 texte", ui: { component: "textarea" } },
          { type: "boolean", name: "accueil", label: "\xC0 la une sur l'accueil", description: "Coche 1 ou 2 propositions par seuil au maximum : l'accueil doit rester simple. Tout reste visible dans l'agenda et les pages d\xE9di\xE9es." },
          { type: "string", name: "seuil", label: "Seuil", description: "Laisser vide pour le choix automatique selon la cat\xE9gorie.", options: [{ value: "decouvrir", label: "I \xB7 D\xE9couvrir" }, { value: "approfondir", label: "II \xB7 Approfondir" }, { value: "transformer", label: "III \xB7 Se transformer" }] },
          { type: "rich-text", name: "body", label: "Contenu de la page", isBody: true }
        ]
      },
      {
        name: "codex",
        label: "Codex \u2014 le paysage int\xE9rieur",
        path: "src/content/codex",
        format: "md",
        ui: { filename: { slugify: (v) => (v?.titre || "fiche").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } },
        fields: [
          { type: "string", name: "titre", label: "Titre", isTitle: true, required: true },
          {
            type: "string",
            name: "type",
            label: "Type",
            required: true,
            options: [{ value: "notion", label: "Notion" }, { value: "pratique", label: "Pratique" }, { value: "rencontre", label: "Rencontre (personne, lieu, peuple)" }, { value: "realisation", label: "R\xE9alisation int\xE9rieure" }, { value: "magique", label: "Rencontre magique (esprit, arch\xE9type, animal, d\xE9it\xE9)" }, { value: "allie", label: "Alli\xE9 (partenaire)" }]
          },
          { type: "string", name: "univers", label: "Univers", list: true, options: UNIV },
          { type: "string", name: "question", label: "La question \xE0 laquelle r\xE9pond la fiche", description: "Pour Google : formule-la comme on la taperait (ex. : Qu'est-ce que la danse But\xF4 ?). Elle devient le titre dans Google et le premier intertitre." },
          { type: "string", name: "resume", label: "R\xE9sum\xE9 (une phrase)", ui: { component: "textarea" } },
          {
            type: "string",
            name: "alias",
            label: "Mots qui m\xE8nent ici",
            list: true,
            description: "Quand un de ces mots appara\xEEt dans le r\xE9cit ou une page, il devient un lien vers cette fiche. Du plus pr\xE9cis au plus court (ex. : danse But\xF4, But\xF4)."
          },
          {
            type: "object",
            name: "offres",
            label: "Pour y go\xFBter \u2014 soins & accompagnements",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.offre?.split("/").pop()?.replace(".md", "") ?? "Proposition" }) },
            fields: [{ type: "reference", name: "offre", label: "Proposition", collections: ["offres"] }]
          },
          {
            type: "object",
            name: "agenda",
            label: "Pour y go\xFBter \u2014 \xE9v\xE9nements",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.evenement?.split("/").pop()?.replace(".md", "") ?? "\xC9v\xE9nement" }) },
            fields: [{ type: "reference", name: "evenement", label: "\xC9v\xE9nement", collections: ["agenda"] }]
          },
          {
            type: "object",
            name: "liens",
            label: "Fiches reli\xE9es",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.fiche?.split("/").pop()?.replace(".md", "") ?? "Fiche" }) },
            fields: [{ type: "reference", name: "fiche", label: "Fiche", collections: ["codex"] }]
          },
          { type: "image", name: "image", label: "Image (fond)" },
          { type: "string", name: "lien_externe", label: "Lien externe (site d'un alli\xE9, d'une personne)" },
          { type: "image", name: "logo", label: "Logo (alli\xE9s)" },
          { type: "boolean", name: "logo_blanc", label: "Logo \xE0 passer en blanc" },
          { type: "datetime", name: "date", label: "Date de publication", ui: { dateFormat: "YYYY-MM-DD" } },
          { type: "string", name: "seo_titre", label: "R\xE9f\xE9rencement \u2014 titre Google (facultatif)", description: "Par d\xE9faut : le titre de la fiche. Id\xE9alement 50 \xE0 60 caract\xE8res, avec les mots que les gens chercheraient." },
          { type: "string", name: "seo_description", label: "R\xE9f\xE9rencement \u2014 description Google (facultatif)", description: "Par d\xE9faut : le r\xE9sum\xE9, compl\xE9t\xE9 par le d\xE9but du texte. Id\xE9alement 140 \xE0 160 caract\xE8res.", ui: { component: "textarea" } },
          { type: "number", name: "ordre", label: "Ordre d'affichage" },
          { type: "boolean", name: "publie", label: "Publi\xE9" },
          { type: "rich-text", name: "body", label: "Texte de la fiche", isBody: true, description: "\xC9cris-la comme un article : plusieurs paragraphes, avec des intertitres si besoin. Sous 200 caract\xE8res, la fiche reste visible sur le site mais n\u2019est pas propos\xE9e \xE0 Google." }
        ]
      },
      {
        name: "artefacts",
        label: "Artefacts \u2014 les \u0153uvres du chemin",
        path: "src/content/artefacts",
        format: "md",
        fields: [
          { type: "string", name: "titre", label: "Titre de l'\u0153uvre", isTitle: true, required: true },
          { type: "string", name: "sous_titre", label: "Sous-titre (une phrase)" },
          { type: "image", name: "images", label: "Photos (la premi\xE8re est la principale)", list: true },
          { type: "string", name: "naissance", label: "N\xE9 de\u2026 (\xE9v\xE9nement, r\xE9alisation)", description: "Ex. : C\xE9r\xE9monie avec les Noke Ko\xEE, 2025" },
          { type: "string", name: "annee", label: "Ann\xE9e" },
          { type: "string", name: "technique", label: "Technique" },
          { type: "string", name: "dimensions", label: "Dimensions" },
          {
            type: "object",
            name: "codex",
            label: "Fiches du Codex li\xE9es",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.fiche?.split("/").pop()?.replace(".md", "") ?? "Fiche" }) },
            fields: [{ type: "reference", name: "fiche", label: "Fiche", collections: ["codex"] }]
          },
          { type: "string", name: "original", label: "L'original", options: [
            { value: "non-disponible", label: "Pas \xE0 vendre" },
            { value: "disponible", label: "Disponible" },
            { value: "acquis", label: "D\xE9j\xE0 acquis" }
          ] },
          { type: "string", name: "original_prix", label: "Prix de l'original" },
          { type: "string", name: "lien_boutique", label: "Lien vers l'\u0153uvre sur enoqii.art", description: "D\xE8s qu'il est rempli, le bouton principal devient \xAB Acqu\xE9rir sur enoqii.art \xBB." },
          { type: "string", name: "tirages_statut", label: "Reproductions", options: [
            { value: "aucun", label: "Aucune" },
            { value: "bientot", label: "Bient\xF4t (liste d'attente)" },
            { value: "disponible", label: "Disponibles" }
          ] },
          {
            type: "object",
            name: "tirages",
            label: "Formats de reproduction",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.format ? `${i.format} \u2014 ${i.prix ?? ""}` : "Format" }) },
            fields: [
              { type: "string", name: "format", label: "Format (ex. : A3, tirage d'art sign\xE9)" },
              { type: "string", name: "prix", label: "Prix" },
              { type: "string", name: "detail", label: "D\xE9tail (papier, \xE9dition limit\xE9e\u2026)" }
            ]
          },
          { type: "number", name: "ordre", label: "Ordre d'affichage" },
          { type: "boolean", name: "publie", label: "Publi\xE9" },
          { type: "rich-text", name: "body", label: "Le r\xE9cit de l'\u0153uvre", isBody: true }
        ]
      },
      {
        name: "pages",
        label: "Accueil",
        path: "src/content/pages",
        format: "md",
        match: { include: "accueil" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "hero_eyebrow", label: "Hero \u2014 sur-titre" },
          { type: "string", name: "hero_titre", label: "Hero \u2014 titre (sans-serif)" },
          { type: "image", name: "hero_image", label: "Fond du hero" },
          { type: "image", name: "portrait_image", label: "Photo \u2014 Qui je suis" },
          { type: "image", name: "resp1_image", label: "Respiration 1 (fond)" },
          { type: "image", name: "resp2_image", label: "Respiration 2 (fond)" },
          { type: "image", name: "resp3_image", label: "Respiration bas (fond)" },
          { type: "image", name: "danse_image", label: "Photo derriere Apprendre a danser" },
          { type: "image", name: "seuils_image", label: "Photo derriere Par ou entrer" },
          { type: "image", name: "contact_image", label: "Photo derriere Ecris-moi" },
          { type: "image", name: "art_fond", label: "Oeuvre de fond (pleine page)" },
          { type: "image", name: "art_fonds", label: "Oeuvres de fond (elles se succedent)", list: true },
          { type: "string", name: "art_phrase", label: "La phrase", ui: { component: "textarea" } },
          { type: "image", name: "art1_image", label: "Oeuvre 1" },
          { type: "image", name: "art2_image", label: "Oeuvre 2" },
          { type: "image", name: "art3_image", label: "Oeuvre 3" },
          { type: "image", name: "art4_image", label: "Oeuvre 4" },
          { type: "string", name: "hero_accent", label: "Hero \u2014 accent manuscrit" },
          { type: "string", name: "hero_paragraphe", label: "Hero \u2014 paragraphe", description: "Entoure un mot de *etoiles* pour la manuscrite, de **deux** pour le dore.", ui: { component: "textarea" } },
          { type: "string", name: "hero_cta", label: "Hero \u2014 bouton" },
          { type: "string", name: "parcours_titre", label: "Qui je suis \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "parcours_texte", label: "Qui je suis \u2014 texte", description: "*mot* = italique mis en valeur", ui: { component: "textarea" } },
          { type: "string", name: "parcours_cta", label: "Qui je suis \u2014 bouton" },
          { type: "string", name: "coeur_eyebrow", label: "Coeur a coeur \u2014 sur-titre" },
          { type: "string", name: "coeur_titre", label: "Coeur a coeur \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "coeur", label: "Coeur a coeur \u2014 texte", description: "**dore**, *manuscrite*, paragraphes = ligne vide", ui: { component: "textarea" } },
          { type: "string", name: "venir_eyebrow", label: "Pourquoi on vient me voir \u2014 sur-titre" },
          { type: "string", name: "venir_titre", label: "Pourquoi on vient me voir \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "venir_items", label: "Pourquoi on vient me voir \u2014 raisons", list: true, description: "L'action | ce \xE0 quoi elle m\xE8ne. Le \xAB | \xBB s\xE9pare les deux : l'action en capitales fines, la finalit\xE9 en grand italique." },
          { type: "string", name: "posture", label: "Ma posture (citation)", ui: { component: "textarea" } },
          { type: "string", name: "difference_eyebrow", label: "Mon approche \u2014 sur-titre" },
          { type: "string", name: "difference_titre", label: "Mon approche \u2014 titre", description: "*mot* = manuscrite" },
          {
            type: "object",
            name: "difference",
            label: "Mon approche \u2014 les pi\xE8ges et ce que j'apporte",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.titre ?? "Diff\xE9rence" }) },
            fields: [
              { type: "string", name: "titre", label: "Titre court" },
              { type: "string", name: "piege", label: "Le pi\xE8ge (une phrase)", ui: { component: "textarea" } },
              { type: "string", name: "texte", label: "Ce que j'apporte (deux phrases)", ui: { component: "textarea" } }
            ]
          },
          { type: "string", name: "piliers_eyebrow", label: "Piliers \u2014 sur-titre" },
          { type: "string", name: "agenda_eyebrow", label: "Agenda \u2014 sur-titre" },
          { type: "string", name: "agenda_titre", label: "Agenda \u2014 titre (* pour le manuscrit)" },
          { type: "string", name: "art_eyebrow", label: "Art \u2014 sur-titre" },
          { type: "string", name: "art_titre", label: "Art \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "temoins_eyebrow", label: "Temoignages \u2014 sur-titre" },
          { type: "image", name: "temoins_image", label: "T\xE9moignages \u2014 photo de fond" },
          { type: "string", name: "avis_note", label: "Avis Google \u2014 note (ex. : 4,9)" },
          { type: "number", name: "avis_nombre", label: "Avis Google \u2014 nombre d'avis" },
          { type: "string", name: "avis_lien", label: "Avis Google \u2014 lien vers la fiche" },
          {
            type: "object",
            name: "temoins",
            label: "Temoignages",
            list: true,
            ui: { itemProps: (i) => ({ label: i && i.n ? i.n : "Temoignage" }) },
            fields: [
              { type: "string", name: "t", label: "Texte", ui: { component: "textarea" } },
              { type: "string", name: "n", label: "Nom" },
              { type: "string", name: "c", label: "Contexte" }
            ]
          },
          { type: "string", name: "form_eyebrow", label: "Formulaire \u2014 sur-titre" },
          { type: "string", name: "piliers_titre", label: "Piliers \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "piliers_centre", label: "Sch\xE9ma des univers \u2014 mot au centre", description: "Par d\xE9faut : Quintessence" },
          {
            type: "object",
            name: "piliers",
            label: "Piliers (les 5 univers)",
            list: true,
            ui: { itemProps: (i) => ({ label: i && i.nom ? i.nom : "Pilier" }) },
            fields: [
              { type: "string", name: "nom", label: "Nom" },
              { type: "string", name: "note", label: "Note (sous le nom)" },
              { type: "image", name: "picto", label: "Picto dessin\xE9 (facultatif)", description: "PNG ou SVG blanc sur fond transparent. Remplace l'ic\xF4ne au trait dans le sch\xE9ma." }
            ]
          },
          { type: "string", name: "citation1", label: "Citation 1 (apr\xE8s le texte c\u0153ur \xE0 c\u0153ur, sur la respiration 1)", description: "*mot* = manuscrite, <br> = retour \xE0 la ligne" },
          { type: "string", name: "seuils_eyebrow", label: "Seuils \u2014 sur-titre" },
          { type: "string", name: "seuils_titre", label: "Seuils \u2014 titre", description: "*mot* = manuscrite" },
          {
            type: "object",
            name: "seuils",
            label: "Les trois seuils (D\xE9couvrir, Approfondir, Se transformer)",
            list: true,
            description: "Les propositions se rangent d'elles-m\xEAmes sous chaque seuil (champ \xAB Seuil \xBB d'un soin ou d'un \xE9v\xE9nement).",
            ui: { itemProps: (i) => ({ label: i?.titre ?? "Seuil" }) },
            fields: [
              { type: "string", name: "titre", label: "Titre" },
              { type: "string", name: "texte", label: "Texte", ui: { component: "textarea" } }
            ]
          },
          { type: "string", name: "codex_eyebrow", label: "Codex \u2014 sur-titre" },
          { type: "string", name: "codex_titre", label: "Codex \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "codex_texte", label: "Codex \u2014 texte", ui: { component: "textarea" } },
          { type: "string", name: "citation2", label: "Citation 2 (apr\xE8s \xAB Pourquoi on vient me voir \xBB, sur la respiration 2)", description: "*mot* = manuscrite, <br> = retour \xE0 la ligne" },
          { type: "string", name: "citation3", label: "Citation 3 (avant \xAB Par o\xF9 entrer \xBB, sur la respiration bas)", description: "*mot* = manuscrite, <br> = retour \xE0 la ligne" },
          { type: "string", name: "citation_contact", label: "Contact \u2014 phrase" },
          { type: "string", name: "form_titre", label: "Formulaire \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "form_intro", label: "Formulaire \u2014 intro", ui: { component: "textarea" } }
        ]
      },
      {
        name: "page_apropos",
        label: "\xC0 propos",
        path: "src/content/pages",
        format: "md",
        match: { include: "a-propos" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "hero_eyebrow", label: "Sur-titre" },
          { type: "string", name: "hero_titre", label: "Titre" },
          { type: "image", name: "hero_image", label: "Fond du hero" },
          {
            type: "object",
            name: "chapitres",
            label: "Chapitres",
            list: true,
            ui: { itemProps: (i) => ({ label: i && i.titre ? i.titre : "Chapitre" }) },
            fields: [
              { type: "string", name: "titre", label: "Titre du chapitre" },
              { type: "string", name: "texte", label: "Texte (paragraphes separes par une ligne vide)", ui: { component: "textarea" } },
              { type: "image", name: "image", label: "Photo du chapitre" },
              {
                type: "object",
                name: "echos",
                label: "\xC9chos dans le Codex (en plus des mots d\xE9tect\xE9s dans le texte)",
                list: true,
                ui: { itemProps: (i) => ({ label: i?.fiche?.split("/").pop()?.replace(".md", "") ?? "Fiche" }) },
                fields: [{ type: "reference", name: "fiche", label: "Fiche", collections: ["codex"] }]
              }
            ]
          }
        ]
      },
      {
        name: "page_soins",
        label: "Page Soins",
        path: "src/content/pages",
        format: "md",
        match: { include: "soins" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "hero_eyebrow", label: "Sur-titre" },
          { type: "string", name: "hero_titre", label: "Titre" },
          { type: "image", name: "hero_image", label: "Fond du hero" },
          { type: "image", name: "portrait_image", label: "Portrait" },
          { type: "string", name: "coeur", label: "Texte d'intro (coeur a coeur)", description: "**mot** = dore, *mot* = manuscrite. Paragraphes separes par une ligne vide.", ui: { component: "textarea" } },
          { type: "string", name: "soins_eyebrow", label: "Section soins \u2014 sur-titre" },
          { type: "string", name: "soins_titre", label: "Section soins \u2014 titre" },
          { type: "string", name: "soins_intro", label: "Section soins \u2014 intro", ui: { component: "textarea" } }
        ]
      },
      {
        name: "page_accompagnement",
        label: "Page Accompagnement",
        path: "src/content/pages",
        format: "md",
        match: { include: "accompagnement" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "hero_eyebrow", label: "Sur-titre" },
          { type: "string", name: "hero_titre", label: "Titre" },
          { type: "string", name: "coeur", label: "Texte coeur a coeur", description: "**dore**, *manuscrite*, paragraphes = ligne vide", ui: { component: "textarea" } },
          { type: "image", name: "hero_image", label: "Fond du hero" },
          { type: "image", name: "portrait_image", label: "Portrait" },
          { type: "image", name: "outils_image", label: "Image des outils" },
          { type: "string", name: "pourqui_eyebrow", label: "Pour qui \u2014 sur-titre" },
          { type: "string", name: "pourqui_titre", label: "Pour qui \u2014 titre" },
          { type: "string", name: "pourqui_texte", label: "Pour qui \u2014 texte", ui: { component: "textarea" } },
          { type: "string", name: "outils_eyebrow", label: "Outils \u2014 sur-titre" },
          { type: "string", name: "outils_titre", label: "Outils \u2014 titre" },
          { type: "string", name: "outils", label: "Outils (liste)", list: true },
          { type: "string", name: "passage", label: "Phrase mise en avant", ui: { component: "textarea" } },
          { type: "string", name: "formules_eyebrow", label: "Formules \u2014 sur-titre" },
          { type: "string", name: "formules_titre", label: "Formules \u2014 titre" }
        ]
      },
      {
        name: "page_quintessence",
        label: "Page Quintessence",
        path: "src/content/pages",
        format: "md",
        match: { include: "quintessence" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "hero_eyebrow", label: "Sur-titre" },
          { type: "string", name: "hero_titre", label: "Titre" },
          { type: "string", name: "hero_lead", label: "Accroche" },
          { type: "image", name: "hero_image", label: "Fond du hero" },
          { type: "image", name: "silence_image", label: "Photo \u2014 Le silence" },
          { type: "image", name: "crea_image", label: "Photo \u2014 La creativite" },
          { type: "image", name: "resp_image", label: "Respiration (fond)" },
          { type: "image", name: "fin_image", label: "Fond de fin" },
          { type: "string", name: "passage", label: "Passage", ui: { component: "textarea" } },
          { type: "string", name: "citation", label: "Citation", description: "*mot* = manuscrite" },
          { type: "string", name: "silence_titre", label: "Silence \u2014 titre" },
          { type: "string", name: "silence_texte", label: "Silence \u2014 texte", ui: { component: "textarea" } },
          { type: "string", name: "crea_titre", label: "Creativite \u2014 titre" },
          { type: "string", name: "crea_texte", label: "Creativite \u2014 texte", ui: { component: "textarea" } },
          { type: "string", name: "pratiques_eyebrow", label: "Pratiques \u2014 sur-titre" },
          { type: "string", name: "pratiques_titre", label: "Pratiques \u2014 titre" },
          { type: "string", name: "pratiques", label: "Pratiques (liste)", list: true },
          { type: "string", name: "cta_texte", label: "Phrase de fin" }
        ]
      },
      {
        name: "page_contact",
        label: "Page Contact",
        path: "src/content/pages",
        format: "md",
        match: { include: "contact" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "hero_eyebrow", label: "Sur-titre" },
          { type: "string", name: "hero_titre", label: "Titre" },
          { type: "image", name: "hero_image", label: "Fond du hero" },
          { type: "string", name: "intro", label: "Introduction", ui: { component: "textarea" } },
          { type: "string", name: "appel_eyebrow", label: "Appel \u2014 sur-titre" },
          { type: "string", name: "appel_texte", label: "Appel \u2014 texte", ui: { component: "textarea" } },
          { type: "string", name: "appel_cta", label: "Appel \u2014 bouton" },
          { type: "string", name: "appel_lien", label: "Appel \u2014 lien de r\xE9servation (Calendly, etc.)", description: "Tant que ce champ est vide, le bloc \xAB appel \xBB est masqu\xE9." },
          { type: "string", name: "appel_mention", label: "Appel \u2014 mention sous le bouton", description: "Ex. \xAB 30 min \xB7 offert \xBB. Vide : pas de mention." }
        ]
      },
      {
        name: "page_agenda",
        label: "Page Agenda",
        path: "src/content/pages",
        format: "md",
        match: { include: "agenda" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "hero_eyebrow", label: "Sur-titre" },
          { type: "string", name: "hero_titre", label: "Titre" },
          { type: "image", name: "hero_image", label: "Fond du hero" }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
