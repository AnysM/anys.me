import { defineConfig } from "tinacms";

const branch =
  process.env.BRANCH ||
  process.env.HEAD ||
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  "tina";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "ac005920-bdf5-45df-a7d6-5d99cc50423a",
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
      {
        name: "pages",
        label: "Pages du site",
        path: "src/content/pages",
        format: "md",
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "hero_eyebrow", label: "Hero — sur-titre" },
          { type: "string", name: "hero_titre", label: "Hero — titre (sans-serif)" },
          { type: "string", name: "hero_accent", label: "Hero — accent manuscrit" },
          { type: "string", name: "hero_paragraphe", label: "Hero — paragraphe", description: "Entoure un mot de *etoiles* pour la manuscrite, de **deux** pour le dore.", ui: { component: "textarea" } },
          { type: "string", name: "hero_cta", label: "Hero — bouton" },
          { type: "string", name: "piliers_titre", label: "Piliers — titre", description: "*mot* = manuscrite" },
          { type: "string", name: "citation1", label: "Citation 1", description: "*mot* = manuscrite" },
          { type: "string", name: "propositions_titre", label: "Propositions — titre", description: "*mot* = manuscrite" },
          { type: "object", name: "propositions", label: "Propositions", list: true,
            ui: { itemProps: (i) => ({ label: i && i.titre ? i.titre : "Proposition" }) },
            fields: [
              { type: "string", name: "titre", label: "Titre" },
              { type: "string", name: "texte", label: "Texte", ui: { component: "textarea" } },
              { type: "string", name: "cta", label: "Bouton" },
            ] },
          { type: "string", name: "citation2", label: "Citation 2", description: "*mot* = manuscrite" },
          { type: "string", name: "citation_contact", label: "Contact — phrase" },
          { type: "string", name: "form_titre", label: "Formulaire — titre", description: "*mot* = manuscrite" },
          { type: "string", name: "form_intro", label: "Formulaire — intro", ui: { component: "textarea" } },
        ],
      },
    ],
  },
});

// redeploy 18:59 — schema register (branche par defaut = tina)
