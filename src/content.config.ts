import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      client: z.string(),
      year: z.number(),
      services: z.array(z.string()),
      excerpt: z.string(),
      cover: image(),
      ogImage: z.string().optional(),
      featured: z.boolean().default(false),
      overview: z.string(),
      challenge: z.string(),
      strategy: z.string(),
      execution: z.string(),
      metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      gallery: z.array(z.object({ image: image(), alt: z.string() })).default([]),
    }),
});
export const collections = { cases };
