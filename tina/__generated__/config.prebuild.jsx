// tina/config.ts
import { defineConfig } from "tinacms";
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
          { type: "string", name: "cta", label: "Texte du bouton" },
          { type: "string", name: "site", label: "Lien direct de la carte" },
          { type: "string", name: "lien", label: "Lien de r\xE9servation" },
          { type: "string", name: "resume", label: "R\xE9sum\xE9", ui: { component: "textarea" } },
          { type: "image", name: "image", label: "Image" },
          { type: "boolean", name: "reservable", label: "R\xE9servable" },
          { type: "number", name: "ordre", label: "Ordre d'affichage" },
          { type: "boolean", name: "publie", label: "Publi\xE9" },
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
              { type: "string", name: "detail", label: "D\xE9tail" }
            ]
          },
          { type: "image", name: "image", label: "Image" },
          { type: "string", name: "lien", label: "Lien" },
          { type: "boolean", name: "reservable", label: "R\xE9servable" },
          { type: "number", name: "ordre", label: "Ordre d'affichage" },
          { type: "boolean", name: "publie", label: "Publi\xE9" },
          { type: "rich-text", name: "body", label: "Contenu de la page", isBody: true }
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
          { type: "string", name: "hero_accent", label: "Hero \u2014 accent manuscrit" },
          { type: "string", name: "hero_paragraphe", label: "Hero \u2014 paragraphe", description: "Entoure un mot de *etoiles* pour la manuscrite, de **deux** pour le dore.", ui: { component: "textarea" } },
          { type: "string", name: "hero_cta", label: "Hero \u2014 bouton" },
          { type: "string", name: "piliers_titre", label: "Piliers \u2014 titre", description: "*mot* = manuscrite" },
          { type: "string", name: "citation1", label: "Citation 1", description: "*mot* = manuscrite" },
          { type: "string", name: "propositions_titre", label: "Propositions \u2014 titre", description: "*mot* = manuscrite" },
          {
            type: "object",
            name: "propositions",
            label: "Propositions",
            list: true,
            ui: { itemProps: (i) => ({ label: i && i.titre ? i.titre : "Proposition" }) },
            fields: [
              { type: "string", name: "titre", label: "Titre" },
              { type: "string", name: "texte", label: "Texte", ui: { component: "textarea" } },
              { type: "string", name: "cta", label: "Bouton" }
            ]
          },
          { type: "string", name: "citation2", label: "Citation 2", description: "*mot* = manuscrite" },
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
          {
            type: "object",
            name: "chapitres",
            label: "Chapitres",
            list: true,
            ui: { itemProps: (i) => ({ label: i && i.titre ? i.titre : "Chapitre" }) },
            fields: [
              { type: "string", name: "titre", label: "Titre du chapitre" },
              { type: "string", name: "texte", label: "Texte (paragraphes separes par une ligne vide)", ui: { component: "textarea" } }
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
          { type: "string", name: "intro", label: "Introduction", ui: { component: "textarea" } }
        ]
      },
      {
        name: "images",
        label: "Photos du site",
        path: "src/data",
        format: "json",
        match: { include: "images" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "image", name: "hero_accueil", label: "Fond \u2014 Accueil" },
          { type: "image", name: "hero_soins", label: "Fond \u2014 Soins" },
          { type: "image", name: "hero_accomp", label: "Fond \u2014 Accompagnement" },
          { type: "image", name: "hero_agenda", label: "Fond \u2014 Agenda" },
          { type: "image", name: "hero_apropos", label: "Fond \u2014 A propos" },
          { type: "image", name: "hero_quintessence", label: "Fond \u2014 Quintessence" },
          { type: "image", name: "hero_partenaires", label: "Fond \u2014 Partenaires" },
          { type: "image", name: "hero_contact", label: "Fond \u2014 Contact" },
          { type: "image", name: "accueil_portrait", label: "Accueil \u2014 portrait (Qui je suis)" },
          { type: "image", name: "accueil_ateliers", label: "Accueil \u2014 bloc Ateliers" },
          { type: "image", name: "accueil_soins", label: "Accueil \u2014 bloc Soins" },
          { type: "image", name: "accueil_accomp", label: "Accueil \u2014 bloc Accompagnement" },
          { type: "image", name: "accueil_immersions", label: "Accueil \u2014 bloc Immersions" },
          { type: "image", name: "resp_01", label: "Accueil \u2014 respiration 1" },
          { type: "image", name: "resp_02", label: "Accueil \u2014 respiration 2 (art)" },
          { type: "image", name: "resp_03", label: "Accueil \u2014 respiration bas de page" },
          { type: "image", name: "art_01", label: "Accueil \u2014 oeuvre 1" },
          { type: "image", name: "art_02", label: "Accueil \u2014 oeuvre 2" },
          { type: "image", name: "art_03", label: "Accueil \u2014 oeuvre 3" },
          { type: "image", name: "art_04", label: "Accueil \u2014 oeuvre 4" },
          { type: "image", name: "apropos_01", label: "A propos \u2014 chapitre 1" },
          { type: "image", name: "apropos_02", label: "A propos \u2014 chapitre 2" },
          { type: "image", name: "apropos_03", label: "A propos \u2014 chapitre 3" },
          { type: "image", name: "apropos_04", label: "A propos \u2014 chapitre 4" },
          { type: "image", name: "apropos_05", label: "A propos \u2014 chapitre 5" },
          { type: "image", name: "apropos_06", label: "A propos \u2014 chapitre 6" },
          { type: "image", name: "apropos_07", label: "A propos \u2014 chapitre 7" },
          { type: "image", name: "apropos_08", label: "A propos \u2014 chapitre 8" },
          { type: "image", name: "apropos_09", label: "A propos \u2014 chapitre 9" },
          { type: "image", name: "soins_portrait", label: "Soins \u2014 portrait" },
          { type: "image", name: "accomp_portrait", label: "Accompagnement \u2014 portrait" },
          { type: "image", name: "accomp_univers", label: "Accompagnement \u2014 image outils" },
          { type: "image", name: "quint_silence", label: "Quintessence \u2014 le silence" },
          { type: "image", name: "quint_crea", label: "Quintessence \u2014 la creativite" },
          { type: "image", name: "quint_resp", label: "Quintessence \u2014 respiration" },
          { type: "image", name: "quint_end", label: "Quintessence \u2014 fond de fin" },
          { type: "image", name: "part_meiso", label: "Partenaire \u2014 Meiso" },
          { type: "image", name: "part_chanka", label: "Partenaire \u2014 Chanka" },
          { type: "image", name: "part_blast", label: "Partenaire \u2014 Blast" },
          { type: "image", name: "part_tamakeapa", label: "Partenaire \u2014 TAMAKEAPA" },
          { type: "image", name: "part_espriterre", label: "Partenaire \u2014 Espriterre" },
          { type: "image", name: "part_koom", label: "Partenaire \u2014 Koom" }
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
      },
      {
        name: "page_partenaires",
        label: "Page Partenaires",
        path: "src/content/pages",
        format: "md",
        match: { include: "partenaires" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "hero_eyebrow", label: "Sur-titre" },
          { type: "string", name: "hero_titre", label: "Titre" },
          { type: "image", name: "hero_image", label: "Fond du hero" },
          {
            type: "object",
            name: "partenaires",
            label: "Partenaires",
            list: true,
            ui: { itemProps: (i) => ({ label: i && i.n ? i.n : "Partenaire" }) },
            fields: [
              { type: "string", name: "n", label: "Nom" },
              { type: "string", name: "d", label: "Description" },
              { type: "string", name: "lien", label: "Lien" },
              { type: "image", name: "logo", label: "Logo" },
              { type: "boolean", name: "logoWhite", label: "Logo a mettre en blanc" },
              { type: "image", name: "image", label: "Photo (fond de carte)" }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
