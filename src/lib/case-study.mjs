// @ts-check
import { z } from 'astro/zod';
import { isVerificationDate } from './provider-provenance.mjs';

const text = z.string().trim().min(1);
const date = text.refine(isVerificationDate, 'Use an actual YYYY-MM-DD verification date');
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const https = z.url().refine((value) => new URL(value).protocol === 'https:', 'Use HTTPS evidence');
const keyword = z.object({ term: text, sourcePhrase: text, evidenceIds: z.array(text).min(1) }).strict();

export const CASE_SECTIONS = Object.freeze(['Symptoms', 'Cause', 'Safe resolution', 'Verification', 'Limitations']);
export const caseStudySchema = z.object({
  slug,
  problemId: slug,
  titleParts: z.object({ api: text, problem: text, solution: text }).strict(),
  linkLabel: z.string().trim().min(10),
  providers: z.array(slug).min(1),
  searchIntent: z.object({
    primary: keyword,
    related: z.array(keyword).min(3).max(5),
    // No keyword-volume claim is inferred from source code. Analytics belongs to a separate receipt.
    status: z.literal('keyword-candidate'),
  }).strict(),
  evidence: z.array(z.object({
    id: slug,
    kind: z.enum(['code', 'documentation', 'test', 'execution']),
    url: https,
    checkedAt: date,
    snapshot: text.regex(/^case-studies\/evidence\/[a-zA-Z0-9/_-]+\.[a-z0-9]+$/),
    sha256: text.regex(/^[a-f0-9]{64}$/),
    excerpt: text,
  }).strict()).min(2),
  technicalDetails: z.array(z.object({
    kind: z.enum(['field', 'error-code', 'sdk-version']), value: text, evidenceId: text,
  }).strict()).min(1),
  verification: z.object({
    level: z.enum(['source-review', 'synthetic-test', 'live-test']),
    note: text, evidenceIds: z.array(text).min(1),
  }).strict(),
  review: z.object({
    author: text, authorType: z.enum(['Person', 'Organization']), checkedAt: date,
    // A human must assess meaning; validators cannot establish it from keyword overlap.
    titleMatchesBody: z.literal(true), distinctProblem: text, noInventedResults: z.literal(true),
  }).strict(),
}).strict().superRefine((study, context) => {
  const issue = (/** @type {string} */ message) => context.addIssue({ code: 'custom', message });
  const ids = study.evidence.map((item) => item.id);
  const apiName = normalizeCaseText(study.titleParts.api.split(/\s+/)[0]);
  if (!normalizeCaseText(study.linkLabel).includes(apiName)) issue('Descriptive case link must name the provider/API');
  if (new Set(ids).size !== ids.length) issue('Evidence IDs must be unique');
  const terms = [study.searchIntent.primary, ...study.searchIntent.related];
  if (new Set(terms.map((item) => normalizeCaseText(item.term))).size !== terms.length) issue('Search expressions must be distinct');
  const refs = [...terms.flatMap((item) => item.evidenceIds), ...study.verification.evidenceIds];
  if (refs.some((id) => !ids.includes(id))) issue('Search intent and verification must reference declared evidence');
  for (const term of terms) {
    if (!term.evidenceIds.some((id) => study.evidence.some((source) => source.id === id && source.excerpt.includes(term.sourcePhrase)))) {
      issue(`Search expression lacks its source phrase in the referenced evidence: ${term.term}`);
    }
  }
  if (!study.evidence.some((item) => item.kind === 'code')) issue('A practical case requires code evidence');
  for (const detail of study.technicalDetails) {
    const source = study.evidence.find((item) => item.id === detail.evidenceId);
    if (!source?.excerpt.includes(detail.value)) issue(`Technical detail lacks an exact evidence excerpt: ${detail.value}`);
  }
  if (study.verification.level !== 'source-review' && !study.verification.evidenceIds.some((id) =>
    study.evidence.some((item) => item.id === id && item.kind === 'execution'))) issue('Test execution claims require an execution receipt');
  const reviewDate = study.review.checkedAt;
  if (study.evidence.some((item) => item.checkedAt > reviewDate)) issue('Evidence cannot be checked after the article review date');
  const latestPossibleDate = new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (reviewDate > latestPossibleDate) issue('Review date cannot be in the future');
});

/** @typedef {import('astro/zod').infer<typeof caseStudySchema>} CaseStudy */
/** @param {CaseStudy['titleParts']} parts */
export const caseTitle = (parts) => `${parts.api} ${parts.problem}: ${parts.solution}`;
/** @param {string} value */
export const normalizeCaseText = (value) => value.normalize('NFKC').toLocaleLowerCase().replace(/[\p{P}\p{Z}\s]/gu, '');

export const caseInputSchema = z.object({
  title: text, h1: text, description: text, summary: text,
  order: z.number().int().positive(), updatedAt: date,
  tags: z.array(text).default([]),
  caseStudy: caseStudySchema,
  sections: z.object({ symptoms: text, cause: text, solution: text, verification: text, limitations: text }).strict(),
}).strict().superRefine((input, context) => {
  const issue = (/** @type {string} */ message) => context.addIssue({ code: 'custom', message });
  if (input.title !== caseTitle(input.caseStudy.titleParts) || input.h1 !== input.title) issue('Title and H1 must match API + concrete problem + solution');
  if (input.updatedAt !== input.caseStudy.review.checkedAt) issue('updatedAt must be the actual article review date');
  const body = Object.values(input.sections).join('\n');
  if (!/```[a-z]+\n[\s\S]+?\n```/.test(input.sections.solution)) issue('Solution must include a fenced, language-labelled code example');
  if (/^#{1,2}\s/m.test(body)) issue('Sections cannot insert competing H1/H2 headings');
  if (/<\/?[a-z!]|\]\(\s*(?:javascript|data):/i.test(body)) issue('Use Markdown, not executable HTML or links');
  if (!input.sections.verification.includes(input.caseStudy.verification.note)) issue('Verification body must state the recorded verification scope');
  for (const detail of input.caseStudy.technicalDetails) {
    if (!body.includes(detail.value)) issue(`Body must explain the evidenced technical detail: ${detail.value}`);
  }
});

/** @param {import('astro/zod').infer<typeof caseInputSchema>} input */
export function caseMarkdown(input) {
  return CASE_SECTIONS.map((heading, index) => `## ${heading}\n\n${Object.values(input.sections)[index]}\n`).join('\n');
}

/** @param {{slug: string, title: string, description: string, summary: string, body: string, problemId?: string}[]} records */
export function duplicateCaseIssues(records) {
  /** @type {string[]} */
  const errors = [];
  for (const field of /** @type {const} */ (['slug', 'title', 'description', 'problemId'])) {
    const seen = new Map();
    for (const record of records) {
      const value = record[field];
      if (!value) continue;
      const normalized = normalizeCaseText(value);
      if (seen.has(normalized)) errors.push(`Duplicate ${field}: ${seen.get(normalized)} and ${record.slug}`);
      seen.set(normalized, record.slug);
    }
  }
  const cases = records.filter((record) => record.problemId);
  for (let i = 0; i < cases.length; i += 1) {
    const tokens = (/** @type {string} */ value) => new Set(value.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? []);
    const a = tokens(cases[i].body);
    for (const b of cases.slice(i + 1)) {
      const other = tokens(b.body);
      const overlap = [...a].filter((token) => other.has(token)).length;
      if (overlap / new Set([...a, ...other]).size >= 0.9) errors.push(`Substantially duplicated case body: ${cases[i].slug} and ${b.slug}`);
    }
  }
  return errors;
}
