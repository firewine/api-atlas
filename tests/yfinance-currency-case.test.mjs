import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { parse } from 'yaml';
import { caseInputSchema, caseMarkdown } from '../src/lib/case-study.mjs';
import { sourceRevision, translationRegistryIssues } from '../src/lib/translation-schema.mjs';
import { verifyCaseEvidence } from '../scripts/case-evidence.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const slug = 'yfinance-repair-pence-pound-currency-unit-mismatch';
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const split = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  assert.ok(m);
  return {data: parse(m[1]), body: m[2]};
};
test('yfinance unit case preserves reviewed evidence and Korean source linkage', async () => {
  const recipe = caseInputSchema.parse(JSON.parse(await read(`case-studies/reviews/${slug}.json`)));
  await verifyCaseEvidence(root, recipe.caseStudy);
  const bytes = await read(`src/data/guides/${slug}.md`);
  const original = split(bytes);
  const translated = split(await read(`src/data/ko/guides/${slug}.md`));
  const {sections, ...metadata} = recipe;
  assert.deepEqual(original.data, metadata);
  assert.equal(original.body, caseMarkdown(recipe));
  assert.equal(recipe.caseStudy.verification.level, 'source-review');
  assert.equal(recipe.caseStudy.review.author, '차도녀 gpt may');
  assert.equal(translated.data.sourceRevision, sourceRevision(bytes));
  assert.deepEqual(translationRegistryIssues('guides', [{id:slug,data:original.data,bytes}], [{id:slug,...translated}]), []);
  assert.match(original.body, /open and unmerged/);
  assert.match(original.body, /No Yahoo request or live price comparison/);
});
test('published unit helper normalizes exactly once and rejects unknown units offline', async () => {
  const en = await read(`src/data/guides/${slug}.md`);
  const ko = await read(`src/data/ko/guides/${slug}.md`);
  const code = text => text.match(/```python\n([\s\S]*?)\n```/)?.[1];
  assert.ok(code(en));
  assert.equal(code(en), code(ko));
  const controls = `
assert quotation_to_gbp('6201', 'GBp') == Decimal('62.01')
assert quotation_to_gbp('6201', 'GBX') == Decimal('62.01')
assert quotation_to_gbp('62.01', 'GBP') == Decimal('62.01')
assert quotation_to_gbp('0', 'GBP') == Decimal('0')
for value, unit in [('6201', None), ('6201', 'gbp'), ('6201', 'USD'), ('NaN', 'GBP'), ('Infinity', 'GBp')]:
    try:
        quotation_to_gbp(value, unit)
    except ValueError:
        pass
    else:
        raise AssertionError('invalid input accepted')
print('4 positive and 5 rejection controls; no yfinance or network')
`;
  const result = spawnSync('python3', ['-c', code(en)+'\n'+controls], {encoding:'utf8',timeout:10000});
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout+result.stderr);
  assert.match(result.stdout, /no yfinance or network/);
});
