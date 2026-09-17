import { defineConfig } from "tinacms";

const branch =
  process.env.BRANCH ||
  process.env.HEAD ||
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  "tina";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "ae2b91fd-6332-4b65-98f1-ca0a428d27e3",
  token: process.env.TINA_TOKEN || "",
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "img", publicFolder: "public" } },
  schema: {
    collections: [
      {
        name: "agenda",
        label: "Agenda — événements",
        path: "src/content/agenda",
        format: "md",
        fields: [
          { type: "string", name: "titre", label: "Titre", isTitle: true, required: true },
          { type: "string", name: "categorie", label: "Catégorie", required: true,
            options: ["soin", "atelier", "retraite", "immersion", "voyage-sonore", "accompagnement", "cercle", "residence"] },
          { type: "datetime", name: "date", label: "Date", ui: { dateFormat: "YYYY-MM-DD" } },
          { type: "datetime", name: "date_fin", label: "Date de fin", ui: { dateFormat: "YYYY-MM-DD" } },
          { type: "string", name: "rythme", label: "Rythme (si pas de date)" },
          { type: "string", name: "heure", label: "Heure" },
          { type: "string", name: "lieu", label: "Lieu" },
          { type: "string", name: "prix", label: "Prix" },
          { type: "string", name: "earlybird", label: "Early bird — date limite" },
          { type: "string", name: "cta", label: "Texte du bouton" },
          { type: "string", name: "site", label: "Lien direct de la carte" },
          { type: "string", name: "lien", label: "Lien de réservation" },
          { type: "string", name: "resume", label: "Résumé", ui: { component: "textarea" } },
          { type: "image", name: "image", label: "Image" },
          { type: "boolean", name: "reservable", label: "Réservable" },
          { type: "number", name: "ordre", label: "Ordre d'affichage" },
          { type: "boolean", name: "publie", label: "Publié" },
          { type: "rich-text", name: "body", label: "Contenu de la page", isBody: true },
        ],
      },
      {
        name: "offres",
        label: "Soins & accompagnements",
        path: "src/content/offres",
        format: "md",
        fields: [
          { type: "string", name: "titre", label: "Titre", isTitle: true, required: true },
          { type: "string", name: "categorie", label: "Catégorie", required: true, options: ["soin", "accompagnement"] },
          { type: "string", name: "tag", label: "Étiquette" },
          { type: "string", name: "resume", label: "Résumé", ui: { component: "textarea" } },
          { type: "string", name: "prix", label: "Prix" },
          { type: "string", name: "duree", label: "Durée" },
          { type: "string", name: "format", label: "Format" },
          { type: "object", name: "tarifs", label: "Tarifs (formules)", list: true,
            ui: { itemProps: (i) => ({ label: i?.label ? `${i.label} — ${i.prix ?? ""}` : "Formule" }) },
            fields: [
              { type: "string", name: "label", label: "Formule" },
              { type: "string", name: "prix", label: "Prix" },
              { type: "string", name: "detail", label: "Détail" },
            ],
          },
          { type: "image", name: "image", label: "Image" },
          { type: "string", name: "lien", label: "Lien" },
          { type: "boolean", name: "reservable", label: "Réservable" },
          { type: "number", name: "ordre", label: "Ordre d'affichage" },
          { type: "boolean", name: "publie", label: "Publié" },
          { type: "rich-text", name: "body", label: "Contenu de la page", isBody: true },
        ],
      },
    ],
  },
});

// redeploy 18:59 — schema register (branche par defaut = tina)
