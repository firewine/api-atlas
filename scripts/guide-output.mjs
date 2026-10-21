// @ts-check
import { CASE_SECTIONS_BY_LOCALE } from '../src/lib/case-study.mjs';

/** @param {string} value */
export function htmlText(value) {
  const named = new Map([['amp', '&'], ['lt', '<'], ['gt', '>'], ['quot', '"'], ['apos', "'"], ['#39', "'"]]);
  return value.replace(/<[^>]*>/g, '').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|#39);/gi, (full, entity) => {
    if (named.has(entity)) return named.get(entity) ?? full;
    return String.fromCodePoint(entity.startsWith('#x') ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
  }).replace(/\s+/g, ' ').trim();
}

/** @typedef {{slug: string, title: string, h1: string, description: string, summary: string, updatedAt: string, body: string, caseStudy?: import('../src/lib/case-study.mjs').CaseStudy, locale?: 'en' | 'ko', sourceId?: string, verificationNote?: string, translationReviewedAt?: string}} GuideRecord */

/** Checks actual generated HTML, not merely the source metadata.
 * @param {GuideRecord} guide @param {string} html @param {string} canonical
 */
export function guideOutputIssues(guide, html, canonical) {
  /** @type {string[]} */
  const errors = [];
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? '';
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  const lead = html.match(/<p\s+class="lede"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '';
  if (!guide.title || htmlText(title) !== `${guide.title} · API Atlas`) errors.push('Missing or mismatched title');
  if (!guide.description || htmlText(description) !== guide.description) errors.push('Missing or mismatched meta description');
  if (headings.length !== 1 || htmlText(headings[0]?.[1] ?? '') !== guide.h1) errors.push('Missing or mismatched single H1');
  if (!guide.summary || htmlText(lead) !== guide.summary) errors.push('Missing or mismatched first summary paragraph');
  const canonicals = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]*)"/g)];
  if (canonicals.length !== 1 || htmlText(canonicals[0]?.[1] ?? '') !== canonical) errors.push('Wrong or non-unique canonical');
  if (/<meta\s+name="robots"[^>]*content="[^"]*noindex/.test(html)) errors.push('Guide must be indexable');
  let schemas;
  try {
    schemas = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '[]');
  } catch {
    errors.push('Invalid Article structured data JSON');
    schemas = [];
  }
  if (!Array.isArray(schemas)) { errors.push('Article structured data must be an array'); schemas = []; }
  const article = schemas.find((/** @type {Record<string, unknown>} */ item) => ['Article', 'TechArticle'].includes(String(item['@type'])));
  if (guide.locale && (html.match(/<html\b[^>]*\blang="([^"]+)"/)?.[1] !== guide.locale || article?.inLanguage !== guide.locale)) errors.push('HTML and Article language must match guide locale');
  const author = htmlText(html.match(/<span\s+data-guide-author[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '');
  if (!author || article?.author?.name !== author || article?.headline !== guide.title || article?.description !== guide.description ||
    article?.dateModified !== guide.updatedAt || article?.mainEntityOfPage !== canonical) errors.push('Article structured data differs from visible author/date/content');
  if (!html.includes(`datetime="${guide.updatedAt}"`)) errors.push('Missing visible review date');
  if (guide.translationReviewedAt && !html.includes(`datetime="${guide.translationReviewedAt}"`)) errors.push('Missing visible translation review date');
  if (!guide.caseStudy) return errors;
  const study = guide.caseStudy;
  if (study.slug !== guide.slug) errors.push('Case slug does not match its route');
  const body = html.match(/<div\s+data-guide-body[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';
  const sections = [...body.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((match) => htmlText(match[1]));
  if (JSON.stringify(sections) !== JSON.stringify(CASE_SECTIONS_BY_LOCALE[guide.locale ?? 'en'])) errors.push('Case sections must be symptoms → cause → solution code → verification → limitations in the guide locale');
  if (!/<pre\b[\s\S]*?<code\b/.test(body)) errors.push('Missing static solution code');
  if (/\b(?:hidden|aria-hidden)\s*=|<script\b|<iframe\b/i.test(body)) errors.push('Case body must be static, visible HTML');
  const verificationNote = guide.locale === 'ko' ? guide.verificationNote : study.verification.note;
  if (!verificationNote || !htmlText(body).includes(verificationNote)) errors.push('Missing visible verification scope');
  for (const detail of study.technicalDetails) {
    if (!htmlText(body).includes(detail.value)) errors.push(`Missing technical detail in body: ${detail.value}`);
  }
  if (article?.author?.name !== study.review.author || article?.author?.['@type'] !== study.review.authorType || article?.dateModified !== study.review.checkedAt) errors.push('Case author/date differs from reviewed evidence');
  if (JSON.stringify(article?.citation) !== JSON.stringify(study.evidence.map((item) => item.url))) errors.push('Case citations differ from reviewed evidence');
  return errors;
}

/** @param {string} html @param {string} href @param {string} label */
export function hasDescriptiveLink(html, href, label) {
  return [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .some((match) => htmlText(match[1]) === href && htmlText(match[2]).includes(label));
}
