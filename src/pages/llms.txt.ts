import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { sortApis } from '../lib/content';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://api-atlas.pages.dev');
  const apis = sortApis(await getCollection('apis'));
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  const lines = [
    '# API Atlas',
    '',
    '> A concise, static, source-backed catalog of APIs. Mutable facts show official sources and verification dates.',
    '',
    '## Machine-readable indexes',
    `- [Catalog JSON](${new URL('/api/catalog.json', origin).href}): Normalized provider catalog`,
    `- [Changes JSON](${new URL('/api/changes.json', origin).href}): Meaningful catalog and policy changes`,
    '',
    '## Provider profiles',
    ...apis.map((api) => `- [${api.data.name}](${new URL(`/apis/${api.id}/`, origin).href}): ${api.data.summary}`),
    '',
    '## Guides',
    ...guides.map((guide) => `- [${guide.data.title}](${new URL(`/guides/${guide.id}/`, origin).href}): ${guide.data.summary}`),
    '',
    '## Policies',
    `- [Source and crawler policy](${new URL('/sources/', origin).href})`,
    `- [About API Atlas](${new URL('/about/', origin).href})`,
    '',
    'Official vendor documentation remains authoritative. API Atlas does not mirror full vendor docs.',
  ];
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
