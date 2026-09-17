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
        label: "Pages du site",
        path: "src/content/pages",
        format: "md",
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
      }
    ]
  }
});
export {
  config_default as default
};
