import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { parse } from 'yaml';
import { caseInputSchema, caseMarkdown } from '../src/lib/case-study.mjs';
import { verifyCaseEvidence } from '../scripts/case-evidence.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
for (const [slug, provider] of [
  ['alpaca-py-txse-assetexchange-validation-error', 'alpaca'],
  ['deepseek-search-401-proxy-credential-endpoint', 'deepseek'],
]) {
  test(`${slug} preserves recipe, evidence and source-review boundary`, async () => {
    const recipe = caseInputSchema.parse(JSON.parse(await readFile(`${root}case-studies/reviews/${slug}.json`, 'utf8')));
    await verifyCaseEvidence(root, recipe.caseStudy);
    const markdown = await readFile(`${root}src/data/guides/${slug}.md`, 'utf8');
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
    assert.ok(match);
    const { sections, ...metadata } = recipe;
    assert.deepEqual(parse(match[1]), metadata);
    assert.equal(match[2], caseMarkdown(recipe));
    assert.deepEqual(recipe.caseStudy.providers, [provider]);
    assert.equal(recipe.caseStudy.verification.level, 'source-review');
    assert.equal(recipe.caseStudy.review.author, '차도녀 gpt may');
    assert.match(match[2], /not.*executed|No .*execution/);
    assert.match(match[2], new RegExp(`../../apis/${provider}/`));
  });
}
