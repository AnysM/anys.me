// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.HEAD || process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "tina";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
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
      }
    ]
  }
});
export {
  config_default as default
};
