// @ts-check
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { caseStudySchema, duplicateCaseIssues } from '../src/lib/case-study.mjs';
import { verifyCaseEvidence } from './case-evidence.mjs';
import { guideOutputIssues, hasDescriptiveLink } from './guide-output.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = new URL('../dist/', import.meta.url);
const base = (process.env.BASE_PATH ?? '/').replace(/\/$/, '');
const site = new URL(process.env.SITE_URL ?? 'https://api-atlas.pages.dev');
const siteRoot = new URL(`${base}/`, site).href;
if (site.origin === 'https://getbeta.app' && base !== '/api-atlas') throw new Error('GetBeta production builds require BASE_PATH=/api-atlas/');
/** @type {import('./guide-output.mjs').GuideRecord[]} */
const guides = JSON.parse(await readFile(new URL('api/guides.json', dist), 'utf8'));
const errors = duplicateCaseIssues(guides.map((guide) => ({ ...guide, problemId: guide.caseStudy?.problemId })));
const index = await readFile(new URL('guides/index.html', dist), 'utf8');
const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
const sitemapEntries = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)];
for (const guide of guides) {
  const href = `${base}/guides/${guide.slug}/`;
  const canonical = new URL(href, site).href;
  const html = await readFile(new URL(`guides/${guide.slug}/index.html`, dist), 'utf8');
  const issues = guideOutputIssues(guide, html, canonical);
  const entries = sitemapEntries.filter((entry) => entry[1] === canonical);
  if (entries.length !== 1 || entries[0]?.[2] !== guide.updatedAt) issues.push('Missing/duplicate sitemap entry or changed review date');
  if (!hasDescriptiveLink(index, href, guide.caseStudy?.linkLabel ?? guide.title)) issues.push('Missing descriptive Guides index link');
  if (guide.caseStudy) {
    const study = caseStudySchema.parse(guide.caseStudy);
    await verifyCaseEvidence(root, study);
    for (const id of study.providers) {
      const provider = await readFile(new URL(`apis/${id}/index.html`, dist), 'utf8');
      if (!hasDescriptiveLink(provider, href, study.linkLabel)) issues.push(`Missing descriptive backlink from provider ${id}`);
      if (!hasDescriptiveLink(html, `${base}/apis/${id}/`, id)) issues.push(`Missing related provider link ${id}`);
    }
  }
  errors.push(...issues.map((issue) => `${guide.slug}: ${issue}`));
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Guide verification passed: ${guides.length} guides, ${guides.filter((guide) => guide.caseStudy).length} reviewed cases at ${siteRoot}.`);
