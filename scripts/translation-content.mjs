// @ts-check
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { z } from 'astro/zod';
import { caseStudySchema } from '../src/lib/case-study.mjs';
import { isVerificationDate } from '../src/lib/provider-provenance.mjs';
import { koreanApiSchema, koreanComparisonSchema, koreanGuideSchema, translationRegistryIssues } from '../src/lib/translation-schema.mjs';

const date = z.string().refine(isVerificationDate);
const sourceMetadata = z.looseObject({
  title: z.string().optional(), h1: z.string().optional(), description: z.string().optional(), summary: z.string(),
  updatedAt: date.optional(), verifiedAt: date.optional(), caseStudy: caseStudySchema.optional(),
  sourceUrls: z.array(z.string()).optional(),
  mutableFacts: z.array(z.looseObject({ value: z.string(), sourceUrl: z.string(), verifiedAt: date })).optional(),
});

/** @typedef {{id: string, bytes: Buffer, body: string, data: z.infer<typeof sourceMetadata>}} MarkdownSource */
/** @typedef {{source: MarkdownSource, translation: {id: string, body: string, data: import('../src/lib/translation-schema.mjs').KoreanGuideData}}} GuideTranslationPair */
/** @typedef {{source: MarkdownSource, translation: {id: string, body: string, data: import('../src/lib/translation-schema.mjs').KoreanApiData}}} ApiTranslationPair */
/** @typedef {{source: MarkdownSource, translation: {id: string, body: string, data: import('../src/lib/translation-schema.mjs').KoreanComparisonData}}} ComparisonTranslationPair */

/** @param {string} directory @param {boolean} optional */
async function markdownFiles(directory, optional) {
  try {
    return (await readdir(directory, { recursive: true })).filter((file) => file.endsWith('.md')).sort();
  } catch (error) {
    if (optional && error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }
}

/** YAML is read from source; no public translation JSON endpoint or fact copy is needed.
 * @param {string} directory @param {boolean} [optional]
 */
async function readMarkdown(directory, optional = false) {
  return Promise.all((await markdownFiles(directory, optional)).map(async (file) => {
    const bytes = await readFile(resolve(directory, file));
    const markdown = bytes.toString('utf8');
    const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!frontmatter) throw new Error(`Missing frontmatter: ${directory}/${file}`);
    /** @type {unknown} */
    const data = parse(frontmatter[1]);
    return { id: file.slice(0, -3), bytes, body: markdown.slice(frontmatter[0].length), data };
  }));
}

/** @param {string} root @param {import('../src/lib/translation-schema.mjs').TranslationKind} kind */
async function readRegistry(root, kind) {
  const [originals, translations] = await Promise.all([
    readMarkdown(resolve(root, 'src/data', kind)), readMarkdown(resolve(root, 'src/data/ko', kind), true),
  ]);
  const sources = originals.map((entry) => ({ ...entry, data: sourceMetadata.parse(entry.data) }));
  const issues = translationRegistryIssues(kind, sources, translations);
  if (issues.length) throw new Error(issues.join('\n'));
  return { sources, translations };
}

/** @param {MarkdownSource[]} sources @param {string} id */
function sourceFor(sources, id) {
  const source = sources.find((entry) => entry.id === id);
  if (!source) throw new Error(`Missing original source: ${id}`);
  return source;
}

/** @param {string} root */
export async function loadKoreanRegistry(root) {
  const [guides, apis, comparisons] = await Promise.all([readRegistry(root, 'guides'), readRegistry(root, 'apis'), readRegistry(root, 'comparisons')]);
  const guidePairs = guides.translations.map((entry) => {
    const translation = { ...entry, data: koreanGuideSchema.parse(entry.data) };
    return { source: sourceFor(guides.sources, translation.data.sourceId), translation };
  });
  const apiPairs = apis.translations.map((entry) => {
    const translation = { ...entry, data: koreanApiSchema.parse(entry.data) };
    return { source: sourceFor(apis.sources, translation.data.sourceId), translation };
  });
  const comparisonPairs = comparisons.translations.map((entry) => {
    const translation = { ...entry, data: koreanComparisonSchema.parse(entry.data) };
    return { source: sourceFor(comparisons.sources, translation.data.sourceId), translation };
  });
  return { guides: guidePairs, apis: apiPairs, comparisons: comparisonPairs,
    guideSources: guides.sources, apiSources: apis.sources, comparisonSources: comparisons.sources };
}

/** @param {MarkdownSource} source @returns {import('./guide-output.mjs').GuideRecord} */
export function sourceGuideRecord(source) {
  const data = source.data;
  if (!data.title || !data.updatedAt) throw new Error(`Original guide requires title and updatedAt: ${source.id}`);
  return { slug: source.id, title: data.title, h1: data.h1 ?? data.title, description: data.description ?? data.summary,
    summary: data.summary, updatedAt: data.updatedAt, body: source.body, caseStudy: data.caseStudy };
}

/** Inherit evidence and original review dates explicitly; never merge overlay objects into source data.
 * @param {GuideTranslationPair} pair @returns {import('./guide-output.mjs').GuideRecord}
 */
export function translatedGuideRecord({ source, translation }) {
  const original = sourceGuideRecord(source);
  const data = translation.data;
  return { slug: source.id, title: data.title, h1: data.h1, description: data.description, summary: data.summary,
    body: translation.body, updatedAt: original.updatedAt, caseStudy: original.caseStudy,
    locale: 'ko', sourceId: source.id, verificationNote: data.verificationNote, translationReviewedAt: data.translationReviewedAt };
}
