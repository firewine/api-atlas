import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CORE_FACT_KEYS, isVerificationDate, validateProviderProvenance } from './lib/provider-provenance.mjs';
import { caseStudySchema, caseTitle } from './lib/case-study.mjs';

const verificationDate = z.string().refine(isVerificationDate, 'Use a valid YYYY-MM-DD date')
  .transform((value) => new Date(`${value}T00:00:00Z`));

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
    verifiedAt: verificationDate,
    sourceUrls: z.array(z.url()).min(2),
    mutableFacts: z.array(
      z.object({
        key: z.enum(CORE_FACT_KEYS).optional(),
        label: z.string().trim().min(1),
        value: z.string().trim().min(1),
        sourceUrl: z.url(),
        verifiedAt: verificationDate,
      }),
    ).min(1),
    tags: z.array(z.string()).default([]),
  }).superRefine((provider, context) => {
    for (const issue of validateProviderProvenance(provider)) {
      context.addIssue({ code: 'custom', path: issue.path, message: issue.message });
    }
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/guides' }),
  schema: z.object({
    title: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    h1: z.string().trim().min(1).optional(),
    caseStudy: caseStudySchema.optional(),
    order: z.number().int().positive(),
    updatedAt: verificationDate,
    tags: z.array(z.string()).default([]),
  }).superRefine((guide, context) => {
    if (!guide.caseStudy) return;
    const issue = (message: string) => context.addIssue({ code: 'custom', message });
    if (!guide.description || guide.h1 !== guide.title || guide.title !== caseTitle(guide.caseStudy.titleParts)) {
      issue('Case requires description and matching title/H1: API + concrete problem + solution');
    }
    if (guide.updatedAt.toISOString().slice(0, 10) !== guide.caseStudy.review.checkedAt) {
      issue('Case updatedAt must match its actual review date');
    }
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
    verifiedAt: verificationDate,
    sourceUrls: z.array(z.url()).min(2),
  }),
});

export const collections = { apis, guides, comparisons };
