import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIRoute } from 'astro';
import { apiToJson } from '../../../lib/content';

export const prerender = true;

export async function getStaticPaths() {
  const apis = await getCollection('apis');
  return apis.map((api) => ({ params: { slug: api.id }, props: { api } }));
}

export const GET: APIRoute = ({ props }) => {
  const api = props.api as CollectionEntry<'apis'>;
  return new Response(JSON.stringify({ schemaVersion: '1.0', provider: apiToJson(api) }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
