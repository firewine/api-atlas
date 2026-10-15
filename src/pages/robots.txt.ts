import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://api-atlas.pages.dev');
  const baseHref = origin.href.endsWith('/') ? origin.href : origin.href + '/';
  const abs = (p: string) => baseHref + p.replace(/^\//, '');
  const body = `# Search and retrieval crawlers are allowed; training controls are separate.
# Policy verified against official crawler documentation on 2026-09-13.
User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: ClaudeBot
Disallow: /

# Google-Extended covers Gemini training and grounding, but not Google Search.
User-agent: Google-Extended
Disallow: /

User-agent: *
Allow: /

Sitemap: ${abs('/sitemap.xml')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
