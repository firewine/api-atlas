import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { parse } from 'yaml';
import { caseInputSchema, caseMarkdown, duplicateCaseIssues } from '../src/lib/case-study.mjs';
import { generateCaseStudy } from '../scripts/generate-case-study.mjs';
import { verifyCaseEvidence } from '../scripts/case-evidence.mjs';
import { caseRecipe, codeSnapshot, docSnapshot } from './fixtures/case-recipe.mjs';

test('case schema requires one intent, 3–5 distinct sourced expressions and editorial SEO fields', () => {
  assert.equal(caseInputSchema.safeParse(caseRecipe()).success, true);
  const mutations = [
    (p) => { p.caseStudy.searchIntent.related.pop(); },
    (p) => { p.caseStudy.searchIntent.related.push(...Array.from({ length: 3 }, (_, i) => ({ term: `excess-${i}`, sourcePhrase: 'empty_page', evidenceIds: ['fixture-doc'] }))); },
    (p) => { delete p.caseStudy.searchIntent.primary; },
    (p) => { p.caseStudy.searchIntent.primary.evidenceIds = ['missing']; },
    (p) => { p.caseStudy.searchIntent.primary.sourcePhrase = 'invented phrase'; },
    (p) => { p.caseStudy.searchIntent.related[1] = p.caseStudy.searchIntent.related[0]; },
    (p) => { p.caseStudy.searchIntent.status = 'high-search-volume'; },
    (p) => { p.description = ''; },
    (p) => { p.h1 = 'Keyword list'; },
    (p) => { p.caseStudy.linkLabel = '여기'; },
    (p) => { p.caseStudy.linkLabel = '공급자 이름이 없는 설명적인 문구'; },
    (p) => { p.title = 'Keyword, Keyword, Keyword'; },
    (p) => { p.caseStudy.slug = '../../outside'; },
    (p) => { p.caseStudy.review.checkedAt = '2099-01-01'; },
    (p) => { p.updatedAt = '2026-10-16'; },
    (p) => { p.caseStudy.technicalDetails[0].value = 'UNOBSERVED_ERROR'; },
    (p) => { p.caseStudy.technicalDetails[0].kind = 'sdk-version'; p.caseStudy.technicalDetails[0].value = 'unknown-sdk@99'; },
    (p) => { p.caseStudy.verification.level = 'live-test'; },
    (p) => { p.sections.solution = 'No code'; },
    (p) => { p.sections.cause = '# Hidden second H1'; },
    (p) => { p.sections.symptoms = '<script>alert(1)</script>'; },
    (p) => { p.sections.verification = 'Unrecorded successful experiment'; },
  ];
  for (const mutate of mutations) {
    const recipe = caseRecipe(); mutate(recipe);
    assert.equal(caseInputSchema.safeParse(recipe).success, false, mutate.toString());
  }
});

test('duplicate titles, descriptions, slugs, problem identities and keyword-only cloned bodies are rejected', () => {
  const base = { slug: 'a', title: 'A problem: solution', description: 'One description', summary: 'One summary', body: caseMarkdown(caseRecipe()), problemId: 'one-problem' };
  for (const field of ['title', 'description', 'slug', 'problemId']) {
    const other = { slug: 'b', title: 'Other', description: 'Other description', summary: 'Other summary', body: 'Different issue', problemId: 'other-problem', [field]: base[field] };
    assert.ok(duplicateCaseIssues([base, other]).some((error) => error.includes(`Duplicate ${field}`)));
  }
  assert.ok(duplicateCaseIssues([base, { ...base, slug: 'keyword-variant', title: 'New title', description: 'New description', problemId: 'different-id', body: base.body.replaceAll('empty_page', 'blank_rows') }]).some((error) => error.includes('duplicated case body')));
  assert.deepEqual(duplicateCaseIssues([base, { slug: 'independent', title: 'Currency identity: choose USD', description: 'Validate the currency code', summary: 'Different issue', body: 'Currency identity validation for ITEM_CODE and USD in an exchange rate response.', problemId: 'currency-identity' }]), []);
});

test('generator checks snapshot hash/excerpt/provider and writes fixed dates without overwriting guides', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atlas-case-generator-'));
  try {
    await mkdir(join(root, 'case-studies/evidence'), { recursive: true });
    await mkdir(join(root, 'src/data/guides'), { recursive: true });
    await mkdir(join(root, 'src/data/apis'), { recursive: true });
    await writeFile(join(root, 'case-studies/evidence/fixture-code.txt'), codeSnapshot);
    await writeFile(join(root, 'case-studies/evidence/fixture-doc.txt'), docSnapshot);
    await writeFile(join(root, 'src/data/apis/openai.md'), 'fixture');
    const wrongHash = caseRecipe(); wrongHash.caseStudy.evidence[0].sha256 = '0'.repeat(64);
    await assert.rejects(generateCaseStudy(wrongHash, root), /hash mismatch/);
    const wrongExcerpt = caseRecipe(); wrongExcerpt.caseStudy.evidence[0].excerpt += 'unobserved';
    await assert.rejects(verifyCaseEvidence(root, wrongExcerpt.caseStudy), /excerpt not found/);
    const wrongProvider = caseRecipe(); wrongProvider.caseStudy.providers = ['unknown-provider'];
    await assert.rejects(generateCaseStudy(wrongProvider, root), /Unknown provider/);
    const target = await generateCaseStudy(caseRecipe(), root);
    const markdown = await readFile(target, 'utf8');
    const metadata = parse(markdown.match(/^---\n([\s\S]*?)\n---/)[1]);
    assert.equal(metadata.updatedAt, '2026-10-15');
    assert.deepEqual(metadata.caseStudy, caseRecipe().caseStudy);
    assert.match(markdown, /## Symptoms[\s\S]+## Cause[\s\S]+## Safe resolution[\s\S]+## Verification[\s\S]+## Limitations/);
    await assert.rejects(generateCaseStudy(caseRecipe(), root), /Duplicate slug/);
    assert.equal(await readFile(target, 'utf8'), markdown);
  } finally { await rm(root, { recursive: true, force: true }); }
});
