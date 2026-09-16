import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const agenda = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/agenda' }),
  schema: z.object({
    titre: z.string(),
    categorie: z.enum(['soin', 'atelier', 'retraite', 'immersion', 'voyage-sonore', 'accompagnement', 'residence']),
    date: z.coerce.date().optional(),
    lieu: z.string().optional(),
    prix: z.string().optional(),
    rythme: z.string().optional(),
    resume: z.string().optional(),
    image: z.string().optional(),
    lien: z.string().optional(),
    reservable: z.boolean().default(false),
    ordre: z.number().default(0),
    publie: z.boolean().default(true),
  }),
});

const offres = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/offres' }),
  schema: z.object({
    titre: z.string(),
    categorie: z.enum(['soin', 'accompagnement']),
    image: z.string().optional(),
    prix: z.string().optional(),
    tag: z.string().optional(),
    resume: z.string().optional(),
    lien: z.string().optional(),
    reservable: z.boolean().default(true),
    ordre: z.number().default(0),
    publie: z.boolean().default(true),
  }),
});

export const collections = { agenda, offres };
