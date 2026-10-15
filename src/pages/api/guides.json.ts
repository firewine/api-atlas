import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { formatDate } from '../../lib/content';

export const prerender = true;
export const GET: APIRoute = async () => new Response(JSON.stringify((await getCollection('guides')).map((guide) => ({
  slug: guide.id,
  title: guide.data.title,
  h1: guide.data.h1 ?? guide.data.title,
  description: guide.data.description ?? guide.data.summary,
  summary: guide.data.summary,
  updatedAt: formatDate(guide.data.updatedAt),
  body: guide.body ?? '',
  caseStudy: guide.data.caseStudy,
})), null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
