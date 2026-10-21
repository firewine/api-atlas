import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { translationRegistryIssues } from './translation-schema.mjs';

export type KoreanGuide = { source: CollectionEntry<'guides'>; translation: CollectionEntry<'koGuides'> };
export type KoreanApi = { source: CollectionEntry<'apis'>; translation: CollectionEntry<'koApis'> };
export type KoreanComparison = { source: CollectionEntry<'comparisons'>; translation: CollectionEntry<'koComparisons'> };

async function originalBytes(kind: 'guides' | 'apis' | 'comparisons', id: string) {
  try {
    return await readFile(resolve(process.cwd(), 'src/data', kind, `${id}.md`));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`Missing original source: ${kind}/${id}`, { cause: error });
    }
    throw error;
  }
}

async function validateRegistry(
  kind: 'guides' | 'apis' | 'comparisons',
  sources: (CollectionEntry<'guides'> | CollectionEntry<'apis'> | CollectionEntry<'comparisons'>)[],
  translations: (CollectionEntry<'koGuides'> | CollectionEntry<'koApis'> | CollectionEntry<'koComparisons'>)[],
) {
  const originals = await Promise.all(sources.map(async (source) => ({
    ...source,
    bytes: await originalBytes(kind, source.id),
  })));
  const issues = translationRegistryIssues(kind, originals, translations);
  if (issues.length) throw new Error(issues.join('\n'));
}

export async function getKoreanGuides(): Promise<KoreanGuide[]> {
  const [sources, translations] = await Promise.all([getCollection('guides'), getCollection('koGuides')]);
  await validateRegistry('guides', sources, translations);
  const byId = new Map(sources.map((source) => [source.id, source]));
  return translations.map((translation) => {
    const source = byId.get(translation.data.sourceId);
    if (!source) throw new Error(`Missing original guide: ${translation.data.sourceId}`);
    return { source, translation };
  }).sort((a, b) => a.source.data.order - b.source.data.order);
}

export async function getKoreanApis(): Promise<KoreanApi[]> {
  const [sources, translations] = await Promise.all([getCollection('apis'), getCollection('koApis')]);
  await validateRegistry('apis', sources, translations);
  const byId = new Map(sources.map((source) => [source.id, source]));
  return translations.map((translation) => {
    const source = byId.get(translation.data.sourceId);
    if (!source) throw new Error(`Missing original provider: ${translation.data.sourceId}`);
    return { source, translation };
  }).sort((a, b) => a.source.data.name.localeCompare(b.source.data.name));
}

export async function getKoreanComparisons(): Promise<KoreanComparison[]> {
  const [sources, translations] = await Promise.all([getCollection('comparisons'), getCollection('koComparisons')]);
  await validateRegistry('comparisons', sources, translations);
  const byId = new Map(sources.map((source) => [source.id, source]));
  return translations.map((translation) => {
    const source = byId.get(translation.data.sourceId);
    if (!source) throw new Error(`Missing original comparison: ${translation.data.sourceId}`);
    return { source, translation };
  }).sort((a, b) => a.source.data.order - b.source.data.order);
}
