import assert from 'node:assert/strict';
import { test } from 'node:test';
import { caseMarkdown, CASE_SECTIONS, CASE_SECTIONS_BY_LOCALE, duplicateCaseIssues } from '../src/lib/case-study.mjs';
import { koreanApiSchema, koreanComparisonSchema, koreanGuideSchema, sourceRevision, translationRegistryIssues } from '../src/lib/translation-schema.mjs';
import { sourceGuideRecord, translatedGuideRecord } from '../scripts/translation-content.mjs';
import { guideOutputIssues } from '../scripts/guide-output.mjs';
import { caseRecipe } from './fixtures/case-recipe.mjs';
import { koreanGuideHtml, koreanGuidePair } from './fixtures/korean-overlay.mjs';

test('strict Korean overlays allow display text only, matching H1 and real non-future review dates', () => {
  const { data } = koreanGuidePair().translation;
  assert.equal(koreanGuideSchema.safeParse(data).success, true);
  const { verificationNote, linkLabel, ...api } = data;
  assert.equal(koreanApiSchema.safeParse(api).success, true);
  assert.equal(koreanComparisonSchema.safeParse(api).success, true);
  for (const field of ['caseStudy', 'evidence', 'technicalDetails', 'searchIntent', 'verification', 'review', 'verifiedAt', 'updatedAt', 'sourceUrls', 'mutableFacts', 'facts', 'providers', 'pricing', 'rateLimit', 'order', 'tags', 'verdict']) {
    for (const [schema, input] of [[koreanGuideSchema, data], [koreanApiSchema, api], [koreanComparisonSchema, api]]) {
      assert.equal(schema.safeParse({ ...input, [field]: caseRecipe().caseStudy }).success, false, field);
    }
  }
  for (const [field, value] of [
    ['h1', 'Different title'], ['locale', 'en'], ['sourceId', '../outside'], ['sourceRevision', 'a'.repeat(63)],
    ['translationReviewedAt', '2026-02-30'], ['translationReviewedAt', '2099-01-01'], ['translationReviewedAt', '2026-10-16T00:00:00Z'],
    ['title', ''], ['description', ''], ['summary', ''],
  ]) assert.equal(koreanGuideSchema.safeParse({ ...data, [field]: value }).success, false, `${field}: ${value}`);
  assert.equal(koreanApiSchema.safeParse({ ...api, verificationNote }).success, false);
  assert.equal(koreanApiSchema.safeParse({ ...api, linkLabel }).success, false);
});

test('registry rejects missing/stale sources, aliases and duplicate IDs and hashes original bytes', () => {
  const { source, translation } = koreanGuidePair();
  const check = (sources, translations) => translationRegistryIssues('guides', sources, translations);
  assert.deepEqual(check([source], [translation]), []);
  assert.match(check([], [translation]).join('\n'), /Missing original source/);
  assert.match(check([{ ...source, bytes: Buffer.concat([source.bytes, Buffer.from('\n')]) }], [translation]).join('\n'), /Stale sourceRevision/);
  assert.notEqual(sourceRevision(source.bytes), sourceRevision(source.bytes.toString().replaceAll('\n', '\r\n')));
  assert.match(check([source], [translation, translation]).join('\n'), /Duplicate translation sourceId/);
  assert.match(check([source, source], [translation]).join('\n'), /Duplicate original guides source IDs/);
  assert.match(check([source], [{ ...translation, id: 'alias' }]).join('\n'), /filename must match sourceId/);
  assert.match(check([source], [{ ...translation, body: '' }]).join('\n'), /Markdown body/);
});

test('translations cannot predate source review, provider facts or case evidence or replace their dates', () => {
  const { source, translation } = koreanGuidePair();
  const original = structuredClone(source.data);
  for (const data of [
    { ...source.data, updatedAt: '2026-10-17' },
    { ...source.data, updatedAt: new Date('2026-10-17T00:00:00Z') },
    { ...source.data, caseStudy: { ...source.data.caseStudy, review: { ...source.data.caseStudy.review, checkedAt: '2026-10-17' } } },
    { ...source.data, caseStudy: { ...source.data.caseStudy, evidence: source.data.caseStudy.evidence.map((item) => ({ ...item, checkedAt: '2026-10-17' })) } },
  ]) assert.match(translationRegistryIssues('guides', [{ ...source, data }], [translation]).join('\n'), /precedes source review\/evidence dates/);
  const { verificationNote, linkLabel, ...api } = translation.data;
  for (const data of [
    { verifiedAt: '2026-10-17' },
    { verifiedAt: '2026-10-15', mutableFacts: [{ verifiedAt: '2026-10-17' }] },
  ]) assert.match(translationRegistryIssues('apis', [{ ...source, data }], [{ ...translation, data: api }]).join('\n'), /precedes source review\/evidence dates/);
  const guide = translatedGuideRecord({ source, translation });
  assert.equal(guide.updatedAt, '2026-10-15');
  assert.equal(guide.translationReviewedAt, '2026-10-16');
  assert.equal(guide.caseStudy, source.data.caseStudy);
  assert.deepEqual(source.data, original);
});

test('case overlay requires localized scope/link, ordered headings, solution code and exact evidenced technical details', () => {
  const pair = koreanGuidePair();
  const check = (translation) => translationRegistryIssues('guides', [pair.source], [translation]).join('\n');
  for (const field of ['verificationNote', 'linkLabel']) {
    const translation = structuredClone(pair.translation);
    delete translation.data[field];
    assert.match(check(translation), new RegExp(`requires ${field}`));
  }
  assert.match(check({ ...pair.translation, data: { ...pair.translation.data, linkLabel: '관련 공급자가 없는 설명적인 문구입니다' } }), /must name the provider/);
  for (const [from, to, pattern] of [
    ['## 증상', '## Symptoms', /sections/], ['## 검증', '## 한계', /sections/],
    ['```python', '```', /language-labelled/], ['empty_page', 'EMPTY_PAGE', /exact technical detail/],
    [pair.translation.data.verificationNote, '실제로 호출했습니다.', /verificationNote/],
  ]) {
    const body = pair.translation.body.replaceAll(from, to);
    assert.notEqual(body, pair.translation.body);
    assert.match(check({ ...pair.translation, body }), pattern);
  }
  const invalidEvidence = structuredClone(pair.source);
  invalidEvidence.data.caseStudy.technicalDetails[0].value = 'invented_field';
  assert.match(translationRegistryIssues('guides', [invalidEvidence], [pair.translation]).join('\n'), /Invalid original case evidence/);
  assert.equal(CASE_SECTIONS_BY_LOCALE.en, CASE_SECTIONS);
  assert.match(caseMarkdown(caseRecipe()), /^## Symptoms/);
});

test('only exact source/translation identity permits cross-language duplicates; same-language duplicates still fail', () => {
  const pair = koreanGuidePair();
  const record = (guide) => ({ ...guide, problemId: guide.caseStudy?.problemId });
  const en = record(sourceGuideRecord(pair.source));
  const ko = record(translatedGuideRecord(pair));
  assert.deepEqual(duplicateCaseIssues([en, ko]), []);
  assert.deepEqual(duplicateCaseIssues([ko, en]), []);
  for (const field of ['slug', 'title', 'description', 'problemId']) {
    assert.ok(duplicateCaseIssues([en, ko, { ...ko }]).some((error) => error.includes(`Duplicate ${field}`)), field);
  }
  assert.match(duplicateCaseIssues([en, { ...ko, sourceId: 'unrelated' }]).join('\n'), /Invalid translation identity/);
  assert.match(duplicateCaseIssues([en, { ...ko, sourceId: undefined }]).join('\n'), /Duplicate slug/);
  assert.match(duplicateCaseIssues([en, { ...ko, problemId: 'unrelated' }]).join('\n'), /Invalid translation identity/);
  assert.match(duplicateCaseIssues([en, { ...ko, locale: 'en' }]).join('\n'), /Duplicate problemId/);
  assert.match(duplicateCaseIssues([ko]).join('\n'), /Invalid translation identity/);
  const secondSource = { ...en, slug: 'different-source', problemId: 'different-problem', title: 'Other title', description: 'Other description', body: 'Independent source body' };
  const unexpected = { ...ko, slug: secondSource.slug, sourceId: secondSource.slug, problemId: secondSource.problemId, title: '다른 한국어 제목', description: '독립적인 설명', body: en.body };
  assert.match(duplicateCaseIssues([en, secondSource, unexpected]).join('\n'), /Substantially duplicated case body/);
  assert.match(duplicateCaseIssues([en, secondSource, { ...unexpected, title: en.title }]).join('\n'), /Duplicate title/);
});

test('actual Korean case HTML must retain original evidence, dates and exact technical spelling', () => {
  const pair = koreanGuidePair();
  const guide = translatedGuideRecord(pair);
  const canonical = `https://getbeta.app/api-atlas/ko/guides/${guide.slug}/`;
  const html = koreanGuideHtml(pair, canonical);
  assert.deepEqual(guideOutputIssues(guide, html, canonical), []);
  for (const [from, to, message] of [
    ['<html lang="ko">', '<html lang="en">', 'language'], ['"inLanguage":"ko"', '"inLanguage":"en"', 'language'],
    ['<h2>증상</h2>', '<h2>Symptoms</h2>', 'sections'], ['empty_page', 'EMPTY_PAGE', 'technical'],
    [guide.verificationNote, '검증 범위 생략', 'verification scope'], ['<pre>', '<div>', 'code'],
    ['"dateModified":"2026-10-15"', '"dateModified":"2026-10-16"', 'date'],
    ['https://example.com/synthetic/code', 'https://example.com/invented', 'citations'],
    ['datetime="2026-10-16"', 'datetime="2026-10-15"', 'translation review date'],
    ['<div data-guide-body>', '<div data-guide-body><script>hidden()</script>', 'static'],
  ]) {
    const changed = html.replace(from, to);
    assert.notEqual(changed, html);
    assert.ok(guideOutputIssues(guide, changed, canonical).some((error) => error.includes(message)), message);
  }
});
