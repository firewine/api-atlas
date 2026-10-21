// @ts-check
import { createHash } from 'node:crypto';
import { z } from 'astro/zod';
import { CASE_SECTIONS_BY_LOCALE, caseStudySchema, normalizeCaseText } from './case-study.mjs';
import { isVerificationDate } from './provider-provenance.mjs';

const text = z.string().trim().min(1);
const fields = {
  locale: z.literal('ko'),
  sourceId: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sourceRevision: text.regex(/^[a-f0-9]{64}$/, 'Use the SHA256 of the original Markdown bytes'),
  translationReviewedAt: text.refine(isVerificationDate, 'Use a valid YYYY-MM-DD translation review date')
    .refine((value) => value <= new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString().slice(0, 10), 'Translation review date cannot be in the future'),
  title: text, h1: text, description: text, summary: text,
};

/** @param {{ title: string, h1: string }} value */
const matchingHeading = (value) => value.title === value.h1;
export const koreanApiSchema = z.object(fields).strict().refine(matchingHeading, 'Translation title and H1 must match');
export const koreanComparisonSchema = koreanApiSchema;
export const koreanGuideSchema = z.object({
  ...fields, verificationNote: text.optional(), linkLabel: text.min(10).optional(),
}).strict().refine(matchingHeading, 'Translation title and H1 must match');

/** @typedef {z.infer<typeof koreanGuideSchema>} KoreanGuideData */
/** @typedef {z.infer<typeof koreanApiSchema>} KoreanApiData */
/** @typedef {z.infer<typeof koreanComparisonSchema>} KoreanComparisonData */
/** @typedef {'guides' | 'apis' | 'comparisons'} TranslationKind */
/** @typedef {{ updatedAt?: string | Date, verifiedAt?: string | Date, mutableFacts?: { verifiedAt: string | Date }[], caseStudy?: import('./case-study.mjs').CaseStudy }} SourceData */
/** @typedef {{ id: string, data: SourceData, bytes: Uint8Array | string }} TranslationSource */
/** @typedef {{ id: string, data: unknown, body?: string }} TranslationEntry */

/** Hash original bytes, including frontmatter, whitespace and line endings.
 * @param {Uint8Array | string} bytes
 */
export const sourceRevision = (bytes) => createHash('sha256').update(bytes).digest('hex');

/** @param {string | Date | undefined} value */
const dateString = (value) => value instanceof Date ? value.toISOString().slice(0, 10) : value;

/** @param {KoreanGuideData} data @param {string} body @param {import('./case-study.mjs').CaseStudy} study */
function caseTranslationIssues(data, body, study) {
  const errors = [];
  if (!data.verificationNote) errors.push('Case translation requires verificationNote');
  if (!data.linkLabel) errors.push('Case translation requires linkLabel');
  const apiName = normalizeCaseText(study.titleParts.api.split(/\s+/)[0]);
  if (data.linkLabel && !normalizeCaseText(data.linkLabel).includes(apiName)) errors.push('Descriptive translated case link must name the provider/API');
  const prose = body.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  const headings = [...prose.matchAll(/^##\s+([^\r\n]+)\r?$/gm)].map((match) => match[1].trim());
  if (JSON.stringify(headings) !== JSON.stringify(CASE_SECTIONS_BY_LOCALE.ko)) errors.push('Korean case sections must be 증상 → 원인 → 안전한 해결 → 검증 → 한계');
  if (/^#\s/m.test(prose)) errors.push('Translation body cannot insert a competing H1');
  const solution = body.split(/^##\s+안전한 해결\s*$/m)[1]?.split(/^##\s/m)[0] ?? '';
  if (!/```[a-z]+\r?\n[\s\S]+?\r?\n```/.test(solution)) errors.push('Translated solution must include a fenced, language-labelled code example');
  const verification = body.split(/^##\s+검증\s*$/m)[1]?.split(/^##\s/m)[0] ?? '';
  if (data.verificationNote && !verification.includes(data.verificationNote)) errors.push('Verification body must state the translated verificationNote');
  for (const detail of study.technicalDetails) {
    if (!body.includes(detail.value)) errors.push(`Translation must preserve exact technical detail: ${detail.value}`);
  }
  return errors;
}

/** Shared by Astro's build-time loader and the output validator; overlays never merge into source metadata.
 * @param {TranslationKind} kind
 * @param {TranslationSource[]} sources
 * @param {TranslationEntry[]} translations
 * @returns {string[]}
 */
export function translationRegistryIssues(kind, sources, translations) {
  /** @type {string[]} */
  const errors = [];
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  if (sourceMap.size !== sources.length) errors.push(`Duplicate original ${kind} source IDs`);
  const seen = new Set();
  for (const translation of translations) {
    const parsed = (kind === 'guides' ? koreanGuideSchema : koreanApiSchema).safeParse(translation.data);
    const prefix = `ko/${kind}/${translation.id}`;
    if (!parsed.success) {
      errors.push(...parsed.error.issues.map((issue) => `${prefix}: ${issue.path.join('.')}: ${issue.message}`));
      continue;
    }
    const data = parsed.data;
    if (seen.has(data.sourceId)) errors.push(`${prefix}: Duplicate translation sourceId: ${data.sourceId}`);
    seen.add(data.sourceId);
    if (translation.id !== data.sourceId) errors.push(`${prefix}: Translation filename must match sourceId`);
    const source = sourceMap.get(data.sourceId);
    if (!source) {
      errors.push(`${prefix}: Missing original source: ${data.sourceId}`);
      continue;
    }
    if (data.sourceRevision !== sourceRevision(source.bytes)) errors.push(`${prefix}: Stale sourceRevision for ${data.sourceId}`);
    const study = source.data.caseStudy;
    const dates = [source.data.updatedAt, source.data.verifiedAt, ...(source.data.mutableFacts ?? []).map((fact) => fact.verifiedAt),
      study?.review.checkedAt, ...(study?.evidence ?? []).map((item) => item.checkedAt)].map(dateString).filter((date) => date !== undefined);
    if (dates.some((date) => date > data.translationReviewedAt)) errors.push(`${prefix}: Translation review date precedes source review/evidence dates`);
    if (!translation.body?.trim()) errors.push(`${prefix}: Translation requires a Markdown body`);
    if (!study || kind !== 'guides') continue;
    const reviewed = caseStudySchema.safeParse(study);
    if (!reviewed.success) {
      errors.push(`${prefix}: Invalid original case evidence: ${reviewed.error.message}`);
      continue;
    }
    errors.push(...caseTranslationIssues(data, translation.body ?? '', reviewed.data).map((issue) => `${prefix}: ${issue}`));
  }
  return errors;
}
