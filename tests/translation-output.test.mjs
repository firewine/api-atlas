import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { sourceRevision } from '../src/lib/translation-schema.mjs';
import { loadKoreanRegistry } from '../scripts/translation-content.mjs';
import { apiTranslationOutputIssues, translationClusterIssues, validateKoreanOutput } from '../scripts/validate-translations.mjs';
import { codeSnapshot, docSnapshot } from './fixtures/case-recipe.mjs';
import { escape, koreanGuideHtml, koreanGuidePair, markdown } from './fixtures/korean-overlay.mjs';

function referencePair(kind) {
  const id = kind === 'apis' ? 'openai' : 'first-vs-second';
  const data = { summary: 'Original reference summary', verifiedAt: '2026-10-15', sourceUrls: ['https://example.com/docs', 'https://example.com/pricing'],
    ...(kind === 'apis' ? { mutableFacts: [{ key: 'pricing', label: 'Pricing', value: 'Original conditional pricing', sourceUrl: 'https://example.com/pricing', verifiedAt: '2026-10-15' }] } : { providers: ['openai', 'other'], verdict: 'Original verdict' }) };
  const body = 'Original reference Markdown.';
  const source = { id, data, body, bytes: Buffer.from(markdown(data, body)) };
  const translation = { id, data: { locale: 'ko', sourceId: id, sourceRevision: sourceRevision(source.bytes), translationReviewedAt: '2026-10-16',
    title: kind === 'apis' ? '공급자 확인 정보' : '두 공급자 비교', h1: kind === 'apis' ? '공급자 확인 정보' : '두 공급자 비교',
    description: '원문에서 확인한 범위와 이용 조건을 안내합니다.', summary: '최신 확인 날짜를 새로 만들지 않는 번역입니다.' }, body: '공식 출처의 검증 범위를 확인하세요.' };
  return { source, translation };
}

function referenceHtml(pair, canonical) {
  const { source, translation: { data } } = pair;
  const schema = [{ '@type': 'TechArticle', headline: data.title, description: data.description, inLanguage: 'ko',
    dateModified: source.data.verifiedAt, mainEntityOfPage: canonical, citation: source.data.sourceUrls }];
  return `<html lang="ko"><title>${data.title} · API Atlas</title><meta name="description" content="${data.description}"><link rel="canonical" href="${canonical}"><h1>${data.h1}</h1><p class="lede">${data.summary}</p><time datetime="${source.data.verifiedAt}">${source.data.verifiedAt}</time><time datetime="${data.translationReviewedAt}">${data.translationReviewedAt}</time><div data-translation-body><p>원문을 한국어로 설명하는 검토 본문입니다.</p></div>${(source.data.mutableFacts ?? []).map((fact) => `<p>${escape(fact.value)}</p><a href="${fact.sourceUrl}">출처</a><time datetime="${fact.verifiedAt}">${fact.verifiedAt}</time>`).join('')}<script type="application/ld+json">${JSON.stringify(schema)}</script></html>`;
}

const route = (kind) => kind === 'comparisons' ? 'compare' : kind;
const cluster = (path, locale, base, site) => `<link rel="alternate" hreflang="en" href="${site}${base}/${path}"><link rel="alternate" hreflang="ko" href="${site}${base}/ko/${path}"><a class="language-switch" href="${base}/${locale === 'en' ? 'ko/' : ''}${path}">언어 전환</a>`;

test('provider and comparison output uses translated display and inherits original dates, citations and facts', () => {
  for (const kind of ['apis', 'comparisons']) {
    const pair = referencePair(kind);
    const canonical = `https://getbeta.app/api-atlas/ko/${route(kind)}/${pair.source.id}/`;
    const html = referenceHtml(pair, canonical);
    assert.deepEqual(apiTranslationOutputIssues(pair, html, canonical), []);
    for (const [from, to, message] of [
      ['lang="ko"', 'lang="en"', 'language'], ['<h1>', '<h1>불일치 ', 'H1'],
      ['"inLanguage":"ko"', '"inLanguage":"en"', 'structured data'],
      ['"dateModified":"2026-10-15"', '"dateModified":"2026-10-16"', 'verification date'],
      ['https://example.com/docs', 'https://example.com/invented', 'citations'],
      ['data-translation-body', 'wrong-body', 'Korean Markdown'],
      ['datetime="2026-10-16"', 'datetime="2099-01-01"', 'source/translation date'],
      ...(kind === 'apis' ? [['Original conditional pricing', 'Invented free pricing', 'original provenance']] : []),
    ]) {
      const changed = html.replace(from, to);
      assert.notEqual(changed, html);
      assert.ok(apiTranslationOutputIssues(pair, changed, canonical).some((issue) => issue.includes(message)), message);
    }
  }
});

test('hreflang clusters require reciprocal actual siblings, self canonical, indexability and language switches', () => {
  const pair = { en: 'https://getbeta.app/api-atlas/guides/', ko: 'https://getbeta.app/api-atlas/ko/guides/' };
  const html = `<html lang="ko"><link rel="canonical" href="${pair.ko}">${cluster('guides/', 'ko', '/api-atlas', 'https://getbeta.app')}</html>`;
  assert.deepEqual(translationClusterIssues(html, 'ko', pair.ko, pair), []);
  for (const [from, to, pattern] of [
    ['hreflang="ko"', 'hreflang="en"', /reciprocal/],
    ['rel="alternate" hreflang="en"', 'rel="invalid" hreflang="en"', /reciprocal/],
    ['href="https://getbeta.app/api-atlas/guides/"', 'href="https://getbeta.app/guides/"', /reciprocal/],
    ['<html lang="ko">', '<html lang="ko"><meta name="robots" content="noindex,follow">', /noindex/],
    ['class="language-switch"', 'class="missing"', /Language switch/],
  ]) assert.match(translationClusterIssues(html.replace(from, to), 'ko', pair.ko, pair).join('\n'), pattern);
});

async function fixture(root, base) {
  const guide = koreanGuidePair();
  const api = referencePair('apis');
  const comparison = referencePair('comparisons');
  const site = base ? 'https://getbeta.app' : 'https://api-atlas.pages.dev';
  const write = async (path, value) => { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), value); };
  const url = (path) => `${site}${base}/${path}`;
  for (const [kind, pair] of [['guides', guide], ['apis', api], ['comparisons', comparison]]) {
    await write(`src/data/${kind}/${pair.source.id}.md`, pair.source.bytes);
    await write(`src/data/ko/${kind}/${pair.source.id}.md`, markdown(pair.translation.data, pair.translation.body));
    const path = `${route(kind)}/${pair.source.id}/`;
    const html = kind === 'guides' ? koreanGuideHtml(pair, url(`ko/${path}`)) : referenceHtml(pair, url(`ko/${path}`));
    const links = kind === 'guides' ? `<a href="${base}/ko/apis/openai/">openai 공식 출처</a>`
      : `<a href="${base}/ko/guides/${guide.source.id}/">${guide.translation.data.linkLabel}</a>`;
    await write(`dist/ko/${path}index.html`, html + links + cluster(path, 'ko', base, site));
    await write(`dist/${path}index.html`, `<html lang="en"><link rel="canonical" href="${url(path)}">${cluster(path, 'en', base, site)}</html>`);
  }
  await write('case-studies/evidence/fixture-code.txt', codeSnapshot);
  await write('case-studies/evidence/fixture-doc.txt', docSnapshot);
  for (const path of ['', 'guides/']) {
    for (const locale of ['en', 'ko']) {
      const localized = locale === 'ko' ? `ko/${path}` : path;
      await write(`dist/${localized}index.html`, `<html lang="${locale}"><link rel="canonical" href="${url(localized)}">${cluster(path, locale, base, site)}<main><h1>가이드</h1><a href="${base}/ko/guides/${guide.source.id}/">${guide.translation.data.linkLabel}</a></main></html>`);
    }
  }
  for (const locale of ['en', 'ko']) await write(`dist/${locale === 'ko' ? 'ko/' : ''}search/index.html`, `<html lang="${locale}"><meta name="robots" content="noindex,follow"><a class="language-switch" href="${base}/${locale === 'en' ? 'ko/' : ''}search/">언어 전환</a></html>`);
  await write('dist/sitemap.xml', `<urlset>${[['guides', guide], ['apis', api], ['comparisons', comparison]].map(([kind, pair]) => `<url><loc>${url(`ko/${route(kind)}/${pair.source.id}/`)}</loc><lastmod>${pair.translation.data.translationReviewedAt}</lastmod></url>`).join('')}${['ko/', 'ko/guides/'].map((path) => `<url><loc>${url(path)}</loc><lastmod>2026-10-16</lastmod></url>`).join('')}</urlset>`);
  return { guide, api, comparison, options: { root, base: `${base}/`, site }, write };
}

test('source-loaded runtime validates root/subpath output without a translation endpoint and rejects tampering', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atlas-korean-output-'));
  try {
    for (const base of ['', '/api-atlas']) {
      const { guide, api, comparison, options, write } = await fixture(root, base);
      assert.deepEqual(await validateKoreanOutput(options), { guides: 1, apis: 1, comparisons: 1 });
      const registry = await loadKoreanRegistry(root);
      assert.equal(registry.guides[0].source.data.caseStudy.verification.level, 'source-review');
      const guideFile = `dist/ko/guides/${guide.source.id}/index.html`;
      const originalHtml = await readFile(join(root, guideFile), 'utf8');
      for (const [from, to, pattern] of [
        ['empty_page', 'invented_error', /technical detail/],
        ['rel="canonical"', 'rel="wrong"', /canonical/],
        ['"dateModified":"2026-10-15"', '"dateModified":"2026-10-16"', /reviewed evidence/],
      ]) {
        await write(guideFile, originalHtml.replace(from, to));
        await assert.rejects(validateKoreanOutput(options), pattern);
      }
      await write(guideFile, originalHtml);
      const sitemap = await readFile(join(root, 'dist/sitemap.xml'), 'utf8');
      await write('dist/sitemap.xml', sitemap.replace('<lastmod>2026-10-16</lastmod>', '<lastmod>2026-10-15</lastmod>'));
      await assert.rejects(validateKoreanOutput(options), /wrong translation review date/);
      await write('dist/sitemap.xml', sitemap);
      await write('case-studies/evidence/fixture-code.txt', `${codeSnapshot}changed snapshot`);
      await assert.rejects(validateKoreanOutput(options), /Evidence hash mismatch/);
      await write('case-studies/evidence/fixture-code.txt', codeSnapshot);
      for (const [kind, pair] of [['guides', guide], ['apis', api], ['comparisons', comparison]]) {
        const path = `src/data/${kind}/${pair.source.id}.md`;
        await write(path, Buffer.concat([pair.source.bytes, Buffer.from('\n')]));
        await assert.rejects(validateKoreanOutput(options), /Stale sourceRevision/);
        await write(path, pair.source.bytes);
        await rm(join(root, path));
        await assert.rejects(validateKoreanOutput(options), /Missing original source/);
        await write(path, pair.source.bytes);
        const overlayPath = `src/data/ko/${kind}/${pair.source.id}.md`;
        await write(overlayPath, markdown({ ...pair.translation.data, verifiedAt: '2026-10-16' }, pair.translation.body));
        await assert.rejects(validateKoreanOutput(options), /Unrecognized key/);
        await write(overlayPath, markdown(pair.translation.data, pair.translation.body));
        await write(`src/data/ko/${kind}/duplicate.md`, markdown(pair.translation.data, pair.translation.body));
        await assert.rejects(validateKoreanOutput(options), /Duplicate translation sourceId/);
        await rm(join(root, `src/data/ko/${kind}/duplicate.md`));
        await write(`dist/ko/${route(kind)}/orphan/index.html`, 'Unregistered content');
        await assert.rejects(validateKoreanOutput(options), /Unregistered Korean output/);
        await rm(join(root, `dist/ko/${route(kind)}/orphan`), { recursive: true });
      }
      const englishIndex = await readFile(join(root, 'dist/index.html'), 'utf8');
      await write('dist/index.html', englishIndex.replace('hreflang="ko"', 'hreflang="unknown"'));
      await assert.rejects(validateKoreanOutput(options), /reciprocal hreflang ko/);
      await write('dist/index.html', englishIndex);
      const search = await readFile(join(root, 'dist/ko/search/index.html'), 'utf8');
      for (const [html, pattern] of [
        [search.replace('noindex,follow', 'index,follow'), /Search must be noindex/],
        [search + '<link rel="alternate" hreflang="en" href="https://example.com/search/">', /Search must not emit hreflang/],
      ]) {
        await write('dist/ko/search/index.html', html);
        await assert.rejects(validateKoreanOutput(options), pattern);
      }
      await write('dist/ko/search/index.html', search);
      await write('dist/sitemap.xml', sitemap + `<url><loc>${options.site}${base}/ko/search/</loc></url>`);
      await assert.rejects(validateKoreanOutput(options), /Search must not appear in sitemap/);
      await write('dist/sitemap.xml', sitemap);
      assert.deepEqual(await validateKoreanOutput(options), { guides: 1, apis: 1, comparisons: 1 });
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('a translated case requires a backlink from an untranslated English provider', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atlas-korean-fallback-'));
  try {
    const { options, guide, api, write } = await fixture(root, '/api-atlas');
    await rm(join(root, `src/data/ko/apis/${api.source.id}.md`));
    await rm(join(root, `dist/ko/apis/${api.source.id}`), { recursive: true });
    const englishProvider = `<a href="/api-atlas/ko/guides/${guide.source.id}/">${guide.translation.data.linkLabel}</a>`;
    await write(`dist/apis/${api.source.id}/index.html`, englishProvider);
    const guidePath = `dist/ko/guides/${guide.source.id}/index.html`;
    await write(guidePath, (await readFile(join(root, guidePath), 'utf8')).replace('/api-atlas/ko/apis/openai/', '/api-atlas/apis/openai/'));
    const sitemap = await readFile(join(root, 'dist/sitemap.xml'), 'utf8');
    await write('dist/sitemap.xml', sitemap.replace(/<url><loc>[^<]+\/ko\/apis\/openai\/<\/loc>[\s\S]*?<\/url>/, ''));
    assert.deepEqual(await validateKoreanOutput(options), { guides: 1, apis: 0, comparisons: 1 });
    await write(`dist/apis/${api.source.id}/index.html`, englishProvider.replace('href=', 'data-wrong='));
    await assert.rejects(validateKoreanOutput(options), /Missing descriptive Korean backlink from provider openai/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
