import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const apis = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/apis' }),
  schema: z.object({
    name: z.string(),
    provider: z.string(),
    category: z.enum(['ai', 'market-data', 'public-data', 'currency-data', 'developer-platform', 'payments', 'communications', 'mapping-weather']),
    status: z.enum(['active', 'legacy', 'research']),
    officialDocs: z.url(),
    homepage: z.url(),
    baseUrl: z.string(),
    auth: z.string(),
    versioning: z.string(),
    resourceGroups: z.array(z.string()).min(1),
    pagination: z.string(),
    errors: z.string(),
    webhooks: z.string(),
    sdks: z.array(z.string()).default([]),
    summary: z.string(),
    pricing: z.string(),
    rateLimit: z.string(),
    formats: z.array(z.string()).min(1),
    protocols: z.array(z.string()).min(1),
    bestFor: z.array(z.string()).min(1),
    cautions: z.array(z.string()).default([]),
    verifiedAt: z.coerce.date(),
    sourceUrls: z.array(z.url()).min(2),
    mutableFacts: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        sourceUrl: z.url(),
        verifiedAt: z.coerce.date(),
      }),
    ).min(1),
    tags: z.array(z.string()).default([]),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/guides' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().int().positive(),
    updatedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

const comparisons = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/comparisons' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    providers: z.tuple([z.string(), z.string()]),
    verdict: z.string(),
    order: z.number().int().positive(),
    verifiedAt: z.coerce.date(),
    sourceUrls: z.array(z.url()).min(2),
  }),
});

export const collections = { apis, guides, comparisons };
