import type { APIRoute } from 'astro';
import { changeEvents } from '../../data/changes';

export const prerender = true;
export const GET: APIRoute = () => new Response(JSON.stringify({ schemaVersion: '1.0', changes: changeEvents }, null, 2), {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
