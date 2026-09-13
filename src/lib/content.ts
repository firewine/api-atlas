import type { CollectionEntry } from 'astro:content';

export type ApiEntry = CollectionEntry<'apis'>;

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);

export const sortApis = (apis: ApiEntry[]) =>
  [...apis].sort((a, b) => a.data.name.localeCompare(b.data.name));

export function apiToJson(api: ApiEntry) {
  return {
    id: api.id,
    name: api.data.name,
    provider: api.data.provider,
    category: api.data.category,
    status: api.data.status,
    summary: api.data.summary,
    homepage: api.data.homepage,
    officialDocs: api.data.officialDocs,
    baseUrl: api.data.baseUrl,
    auth: api.data.auth,
    versioning: api.data.versioning,
    resourceGroups: api.data.resourceGroups,
    pagination: api.data.pagination,
    errors: api.data.errors,
    webhooks: api.data.webhooks,
    sdks: api.data.sdks,
    pricing: api.data.pricing,
    rateLimit: api.data.rateLimit,
    formats: api.data.formats,
    protocols: api.data.protocols,
    bestFor: api.data.bestFor,
    cautions: api.data.cautions,
    tags: api.data.tags,
    verifiedAt: formatDate(api.data.verifiedAt),
    sourceUrls: api.data.sourceUrls,
    mutableFacts: api.data.mutableFacts.map((fact) => ({
      ...fact,
      verifiedAt: formatDate(fact.verifiedAt),
    })),
    humanUrl: `/apis/${api.id}/`,
    jsonUrl: `/api/providers/${api.id}.json`,
  };
}
