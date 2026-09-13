import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const apis = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/apis' }),
  schema: z.object({
    name: z.string(),
    provider: z.string(),
    category: z.string(),
    status: z.enum(['active', 'legacy', 'research']),
    officialDocs: z.string().url(),
    auth: z.string(),
    summary: z.string(),
    verifiedAt: z.coerce.date(),
    sourceUrls: z.array(z.string().url()).min(1),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { apis };
