// @ts-check
import { readFile, readdir, realpath } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { duplicateCaseIssues } from '../src/lib/case-study.mjs';
import { verifyCaseEvidence } from './case-evidence.mjs';
import { guideOutputIssues, hasDescriptiveLink, htmlText } from './guide-output.mjs';
import { loadKoreanRegistry, sourceGuideRecord, translatedGuideRecord } from './translation-content.mjs';

/** @param {string} html @param {string} marker */
const bodyHtml = (html, marker) => html.match(new RegExp(`<div\\s+${marker}[^>]*>([\\s\\S]*?)<\\/div>`))?.[1] ?? '';

/** @param {string} html */
const alternates = (html) => [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => ({
  rel: tag.match(/\brel="([^"]*)"/)?.[1], language: tag.match(/\bhreflang="([^"]*)"/)?.[1],
  href: htmlText(tag.match(/\bhref="([^"]*)"/)?.[1] ?? ''),
})).filter((link) => link.rel === 'alternate' && link.language);

/** @param {string} html @param {string} href */
const languageSwitch = (html, href) => [...html.matchAll(/<a\b[^>]*>/g)].some(([tag]) =>
  /\bclass="[^"]*\blanguage-switch\b/.test(tag) && htmlText(tag.match(/\bhref="([^"]*)"/)?.[1] ?? '') === href);

/** @param {string} html @param {'en' | 'ko'} locale @param {string} canonical @param {{en: string, ko: string}} pair */
export function translationClusterIssues(html, locale, canonical, pair) {
  const issues = [];
  if (html.match(/<html\b[^>]*\blang="([^"]+)"/)?.[1] !== locale) issues.push('Cluster page has wrong HTML language');
  if (/<meta\s+name="robots"[^>]*content="[^"]*noindex/.test(html)) issues.push('Translation cluster cannot include noindex pages');
  const canonicals = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]*)"/g)];
  if (canonicals.length !== 1 || htmlText(canonicals[0]?.[1] ?? '') !== canonical) issues.push('Translation cluster requires a unique self canonical');
  const links = alternates(html);
  for (const language of /** @type {const} */ (['en', 'ko'])) {
    const matching = links.filter((link) => link.language === language);
    if (matching.length !== 1 || matching[0].href !== pair[language]) issues.push(`Missing/mismatched reciprocal hreflang ${language}`);
  }
  if (links.some((link) => !['en', 'ko', 'x-default'].includes(link.language ?? '') || (link.language === 'x-default' && link.href !== pair.en)) ||
    links.filter((link) => link.language === 'x-default').length > 1) issues.push('Unexpected hreflang cluster member');
  const other = locale === 'en' ? 'ko' : 'en';
  if (!languageSwitch(html, new URL(pair[other]).pathname)) issues.push('Language switch must link to the corresponding translation');
  return issues;
}

/** @param {Awaited<ReturnType<typeof loadKoreanRegistry>>} registry @param {string} dist @param {string} prefix @param {string} site @param {string} sitemap */
async function publicationIssues(registry, dist, prefix, site, sitemap) {
  const errors = [];
  const paths = ['', 'guides/', ...registry.guides.map((pair) => `guides/${pair.source.id}/`),
    ...registry.apis.map((pair) => `apis/${pair.source.id}/`), ...registry.comparisons.map((pair) => `compare/${pair.source.id}/`)];
  const output = await readdir(resolve(dist, 'ko'), { recursive: true });
  const expectedFiles = [...paths, 'search/'].map((path) => `${path}index.html`);
  errors.push(...output.filter((path) => path.endsWith('.html') && !expectedFiles.includes(path)).map((path) => `Unregistered Korean output: ko/${path}`));
  const expectedUrls = paths.map((path) => new URL(`${prefix}/ko/${path}`, site).href);
  const koreanRoot = new URL(`${prefix}/ko/`, site).href;
  for (const [, url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (url.startsWith(koreanRoot) && !expectedUrls.includes(url)) errors.push(`Unregistered Korean sitemap entry: ${url}`);
  }
  for (const path of paths) {
    const pair = { en: new URL(`${prefix}/${path}`, site).href, ko: new URL(`${prefix}/ko/${path}`, site).href };
    for (const locale of /** @type {const} */ (['en', 'ko'])) {
      const html = await readFile(resolve(dist, `${locale === 'ko' ? 'ko/' : ''}${path}index.html`), 'utf8');
      errors.push(...translationClusterIssues(html, locale, pair[locale], pair).map((issue) => `${pair[locale]}: ${issue}`));
      if (locale === 'ko' && (path === '' || path === 'guides/')) {
        const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
        if (!/[가-힣]/.test(htmlText(main))) errors.push(`${pair.ko}: Missing static Korean index content`);
        const entries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].filter((entry) => entry[1] === pair.ko);
        if (entries.length !== 1) errors.push(`${pair.ko}: Missing/duplicate Korean index sitemap entry`);
      }
    }
  }
  const originals = [
    ...registry.guideSources.map((source) => `guides/${source.id}/`), ...registry.apiSources.map((source) => `apis/${source.id}/`),
    ...registry.comparisonSources.map((source) => `compare/${source.id}/`),
  ];
  for (const path of originals.filter((path) => !paths.includes(path))) {
    const html = await readFile(resolve(dist, `${path}index.html`), 'utf8');
    if (alternates(html).length) errors.push(`${path}: Untranslated source advertises an unpublished translation`);
  }
  for (const locale of /** @type {const} */ (['en', 'ko'])) {
    const path = `${locale === 'ko' ? 'ko/' : ''}search/`;
    const href = new URL(`${prefix}/${path}`, site).href;
    const html = await readFile(resolve(dist, `${path}index.html`), 'utf8');
    if (!/<meta\s+name="robots"[^>]*content="[^"]*noindex/.test(html)) errors.push(`${path}: Search must be noindex`);
    if (alternates(html).length) errors.push(`${path}: Search must not emit hreflang`);
    if ([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].some((entry) => entry[1] === href)) errors.push(`${path}: Search must not appear in sitemap`);
    if (!languageSwitch(html, `${prefix}/${locale === 'en' ? 'ko/' : ''}search/`)) errors.push(`${path}: Missing corresponding search language switch`);
    if (html.match(/<html\b[^>]*\blang="([^"]+)"/)?.[1] !== locale) errors.push(`${path}: Wrong search language`);
  }
  return errors;
}

/** @param {string} html @param {string} marker @returns {string[]} */
function staticBodyIssues(html, marker) {
  const body = bodyHtml(html, marker);
  const issues = [];
  if (!/[가-힣]/.test(htmlText(body))) issues.push('Missing static Korean Markdown body');
  if (/\b(?:hidden|aria-hidden)\s*=|<script\b|<iframe\b/i.test(body)) issues.push('Translation body must be static, visible HTML');
  return issues;
}

/** @param {import('./translation-content.mjs').ApiTranslationPair} pair @param {string} html @param {string} canonical */
export function apiTranslationOutputIssues({ source, translation }, html, canonical) {
  const data = translation.data;
  const original = source.data;
  const errors = staticBodyIssues(html, 'data-translation-body');
  if (html.match(/<html\b[^>]*\blang="([^"]+)"/)?.[1] !== 'ko') errors.push('Provider HTML language must be ko');
  if (htmlText(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '') !== `${data.title} · API Atlas`) errors.push('Mismatched translated provider title');
  if (htmlText(html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? '') !== data.description) errors.push('Mismatched translated provider description');
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  if (headings.length !== 1 || htmlText(headings[0]?.[1] ?? '') !== data.h1) errors.push('Mismatched translated provider H1');
  if (htmlText(html.match(/<p\s+class="lede"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '') !== data.summary) errors.push('Mismatched translated provider summary');
  const canonicals = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]*)"/g)];
  if (canonicals.length !== 1 || htmlText(canonicals[0]?.[1] ?? '') !== canonical) errors.push('Wrong or non-unique translated provider canonical');
  if (/<meta\s+name="robots"[^>]*content="[^"]*noindex/.test(html)) errors.push('Translated provider must be indexable');
  let schemas;
  try { schemas = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '[]'); }
  catch { errors.push('Invalid provider structured data JSON'); schemas = []; }
  const article = Array.isArray(schemas) ? schemas.find((item) => item['@type'] === 'TechArticle') : undefined;
  if (article?.headline !== data.title || article?.description !== data.description || article?.inLanguage !== 'ko' ||
    article?.dateModified !== original.verifiedAt || article?.mainEntityOfPage !== canonical) errors.push('Provider structured data differs from translation or original verification date');
  if (JSON.stringify(article?.citation) !== JSON.stringify(original.sourceUrls)) errors.push('Provider citations differ from original sources');
  for (const date of [original.verifiedAt, data.translationReviewedAt]) {
    if (!date || !html.includes(`datetime="${date}"`)) errors.push(`Missing visible provider source/translation date: ${date}`);
  }
  const text = htmlText(html);
  for (const fact of original.mutableFacts ?? []) {
    if (!text.includes(htmlText(fact.value)) || !html.includes(`href="${fact.sourceUrl.replaceAll('&', '&amp;')}"`) || !html.includes(`datetime="${fact.verifiedAt}"`)) {
      errors.push(`Provider fact differs from original provenance: ${fact.value}`);
    }
  }
  return errors;
}

/** @param {{root: string, dist?: string, base?: string, site?: string}} options */
export async function validateKoreanOutput({ root, dist = resolve(root, 'dist'), base = '/', site = 'https://api-atlas.pages.dev' }) {
  const prefix = base.replace(/\/$/, '');
  if (new URL(site).origin === 'https://getbeta.app' && prefix !== '/api-atlas') throw new Error('GetBeta production builds require BASE_PATH=/api-atlas/');
  const registry = await loadKoreanRegistry(root);
  const originalGuides = registry.guideSources.map(sourceGuideRecord);
  const translatedGuides = registry.guides.map(translatedGuideRecord);
  const errors = duplicateCaseIssues([...originalGuides, ...translatedGuides].map((guide) => ({ ...guide, problemId: guide.caseStudy?.problemId })));
  const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
  const entries = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)];
  const index = registry.guides.length ? await readFile(resolve(dist, 'ko/guides/index.html'), 'utf8') : '';
  for (const pair of registry.guides) {
    const guide = translatedGuideRecord(pair);
    const href = `${prefix}/ko/guides/${guide.slug}/`;
    const canonical = new URL(href, site).href;
    const html = await readFile(resolve(dist, `ko/guides/${guide.slug}/index.html`), 'utf8');
    const issues = [...guideOutputIssues(guide, html, canonical), ...staticBodyIssues(html, 'data-guide-body')];
    const matching = entries.filter((entry) => entry[1] === canonical);
    if (matching.length !== 1 || matching[0]?.[2] !== pair.translation.data.translationReviewedAt) issues.push('Missing/duplicate Korean sitemap entry or wrong translation review date');
    const label = pair.translation.data.linkLabel ?? guide.title;
    if (!hasDescriptiveLink(index, href, label)) issues.push('Missing descriptive Korean Guides index link');
    if (guide.caseStudy) {
      await verifyCaseEvidence(root, guide.caseStudy);
      for (const id of guide.caseStudy.providers) {
        const localized = registry.apis.some((api) => api.source.id === id);
        const providerHref = `${prefix}/${localized ? 'ko/' : ''}apis/${id}/`;
        if (!hasDescriptiveLink(html, providerHref, id)) issues.push(`Missing related provider link ${id}`);
        const provider = await readFile(resolve(dist, `${localized ? 'ko/' : ''}apis/${id}/index.html`), 'utf8');
        if (!hasDescriptiveLink(provider, href, label)) issues.push(`Missing descriptive Korean backlink from provider ${id}`);
      }
    }
    errors.push(...issues.map((issue) => `ko/guides/${guide.slug}: ${issue}`));
  }
  for (const pair of registry.apis) {
    const canonical = new URL(`${prefix}/ko/apis/${pair.source.id}/`, site).href;
    const html = await readFile(resolve(dist, `ko/apis/${pair.source.id}/index.html`), 'utf8');
    const issues = apiTranslationOutputIssues(pair, html, canonical);
    const matching = entries.filter((entry) => entry[1] === canonical);
    if (matching.length !== 1 || matching[0]?.[2] !== pair.translation.data.translationReviewedAt) issues.push('Missing/duplicate Korean provider sitemap entry or wrong translation review date');
    errors.push(...issues.map((issue) => `ko/apis/${pair.source.id}: ${issue}`));
  }
  for (const pair of registry.comparisons) {
    const canonical = new URL(`${prefix}/ko/compare/${pair.source.id}/`, site).href;
    const html = await readFile(resolve(dist, `ko/compare/${pair.source.id}/index.html`), 'utf8');
    const issues = apiTranslationOutputIssues(pair, html, canonical).map((issue) => issue.replaceAll('provider', 'comparison').replaceAll('Provider', 'Comparison'));
    const matching = entries.filter((entry) => entry[1] === canonical);
    if (matching.length !== 1 || matching[0]?.[2] !== pair.translation.data.translationReviewedAt) issues.push('Missing/duplicate Korean comparison sitemap entry or wrong translation review date');
    errors.push(...issues.map((issue) => `ko/compare/${pair.source.id}: ${issue}`));
  }
  errors.push(...await publicationIssues(registry, dist, prefix, site, sitemap));
  if (errors.length) throw new Error(errors.join('\n'));
  return { guides: registry.guides.length, apis: registry.apis.length, comparisons: registry.comparisons.length };
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await validateKoreanOutput({ root: fileURLToPath(new URL('../', import.meta.url)), base: process.env.BASE_PATH, site: process.env.SITE_URL });
  console.log(`Korean translation verification passed: ${result.guides} guides, ${result.apis} providers, ${result.comparisons} comparisons.`);
}
