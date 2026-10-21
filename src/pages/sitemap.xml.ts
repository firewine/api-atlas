import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { categories } from '../data/categories';
import { formatDate } from '../lib/content';
import { getKoreanApis, getKoreanGuides, getKoreanComparisons } from '../lib/translations';
import { route } from '../lib/i18n';

export const prerender = true;

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://api-atlas.pages.dev');
  const abs = (p: string) => new URL(p.startsWith('/ko/') ? route(p.slice(4), 'ko') : route(p.slice(1)), origin).href;
  const [apis, guides, comparisons] = await Promise.all([
    getCollection('apis'),
    getCollection('guides'),
    getCollection('comparisons'),
  ]);
  const allDates = [
    ...apis.map((entry) => entry.data.verifiedAt),
    ...guides.map((entry) => entry.data.updatedAt),
    ...comparisons.map((entry) => entry.data.verifiedAt),
  ];
  const catalogDate = new Date(Math.max(...allDates.map((date) => date.getTime())));
  const [koApis, koGuides, koComparisons] = await Promise.all([getKoreanApis(), getKoreanGuides(), getKoreanComparisons()]);
  const translations = [...koApis, ...koGuides, ...koComparisons];
  const translationDate = new Date(Math.max(...translations.map(({translation}) => new Date(translation.data.translationReviewedAt).getTime())));
  const entries = [
    ...['/', '/apis/', '/categories/', '/compare/', '/guides/', '/changes/', '/sources/', '/about/']
      .map((path) => ({ path, modified: catalogDate })),
    ...apis.map((entry) => ({ path: `/apis/${entry.id}/`, modified: entry.data.verifiedAt })),
    ...Object.keys(categories).map((slug) => ({ path: `/categories/${slug}/`, modified: catalogDate })),
    ...comparisons.map((entry) => ({ path: `/compare/${entry.id}/`, modified: entry.data.verifiedAt })),
    ...guides.map((entry) => ({ path: `/guides/${entry.id}/`, modified: entry.data.updatedAt })),
    ...['/ko/', '/ko/guides/'].map((path) => ({path, modified: translationDate})),
    ...koApis.map(({source,translation}) => ({path:`/ko/apis/${source.id}/`, modified:new Date(translation.data.translationReviewedAt)})),
    ...koGuides.map(({source,translation}) => ({path:`/ko/guides/${source.id}/`, modified:new Date(translation.data.translationReviewedAt)})),
    ...koComparisons.map(({source,translation}) => ({path:`/ko/compare/${source.id}/`, modified:new Date(translation.data.translationReviewedAt)})),
  ];
  const urls = entries.map(({ path, modified }) => [
    '  <url>',
    `    <loc>${escapeXml(abs(path))}</loc>`,
    `    <lastmod>${formatDate(modified)}</lastmod>`,
    '  </url>',
  ].join('\n')).join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
