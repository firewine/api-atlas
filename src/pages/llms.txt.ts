import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { sortApis } from '../lib/content';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://api-atlas.pages.dev');
  const baseHref = origin.href.endsWith('/') ? origin.href : origin.href + '/';
  const abs = (p: string) => baseHref + p.replace(/^\//, '');
  const apis = sortApis(await getCollection('apis'));
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  const comparisons = (await getCollection('comparisons')).sort((a, b) => a.data.order - b.data.order);
  const lines = [
    '# API Atlas',
    '',
    '> A concise, static, source-backed catalog of APIs. Mutable facts show official sources and verification dates.',
    '',
    '## Machine-readable indexes',
    `- [Catalog JSON](${abs('/api/catalog.json')}): Normalized provider catalog`,
    `- [Changes JSON](${abs('/api/changes.json')}): Meaningful catalog and policy changes`,
    '',
    '## Provider profiles',
    ...apis.map((api) => `- [${api.data.name}](${abs(`/apis/${api.id}/`)}): ${api.data.summary}`),
    '',
    '## Comparisons',
    ...comparisons.map(
      (c) => `- [${c.data.title}](${abs(`/compare/${c.id}/`)}): ${c.data.verdict}`,
    ),
    '',
    '## Guides',
    ...guides.map((guide) => `- [${guide.data.title}](${abs(`/guides/${guide.id}/`)}): ${guide.data.summary}`),
    '',
    '## Policies',
    `- [Source and crawler policy](${abs('/sources/')})`,
    `- [About API Atlas](${abs('/about/')})`,
    '',
    'Official vendor documentation remains authoritative. API Atlas does not mirror full vendor docs.',
  ];
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
