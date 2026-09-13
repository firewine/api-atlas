import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { apiToJson, sortApis } from '../../lib/content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const providers = sortApis(await getCollection('apis')).map(apiToJson);
  return new Response(JSON.stringify({
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    providerCount: providers.length,
    providers,
  }, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
