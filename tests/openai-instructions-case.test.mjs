import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { parse } from 'yaml';
import { caseInputSchema, caseMarkdown } from '../src/lib/case-study.mjs';
import { sourceRevision, translationRegistryIssues } from '../src/lib/translation-schema.mjs';
import { verifyCaseEvidence } from '../scripts/case-evidence.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const slug = 'openai-responses-previous-response-id-instructions';
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const split = (text) => {
  const match = text.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  assert.ok(match);
  return { data: parse(match[1]), body: match[2] };
};
test('Responses instructions case has reviewed sources, translation and discovery link', async () => {
  const recipe = caseInputSchema.parse(JSON.parse(await read(`case-studies/reviews/${slug}.json`)));
  await verifyCaseEvidence(root, recipe.caseStudy);
  const bytes = await read(`src/data/guides/${slug}.md`);
  const original = split(bytes), translation = split(await read(`src/data/ko/guides/${slug}.md`));
  const { sections, ...metadata } = recipe;
  assert.deepEqual(original.data, metadata);
  assert.equal(original.body, caseMarkdown(recipe));
  assert.equal(recipe.caseStudy.verification.level, 'source-review');
  assert.equal(recipe.caseStudy.review.author, '차도녀 gpt may');
  assert.equal(translation.data.sourceRevision, sourceRevision(bytes));
  assert.deepEqual(translationRegistryIssues('guides', [{ id: slug, data: original.data, bytes }], [{ id: slug, ...translation }]), []);
  assert.match(original.body, /documented request contract, not an API bug/);
  assert.match(original.body, /No OpenAI request or live model test was performed/);
  assert.match(original.body, /not the release that introduced instruction semantics/);
  assert.match(await read('src/data/guides/choose-llm-api.md'), new RegExp(`\\(../${slug}/\\)`));
});
test('published EN and KO request builders preserve instructions without SDK or network', async () => {
  const en = await read(`src/data/guides/${slug}.md`), ko = await read(`src/data/ko/guides/${slug}.md`);
  const code = (s) => s.match(/```javascript\n([\s\S]*?)\n```/)?.[1];
  assert.ok(code(en)); assert.equal(code(en), code(ko));
  const build = runInNewContext(`${code(en)}; buildResponseRequest`, {}, { timeout: 1000 });
  const args = { model: 'fixture-model', instructions: 'Reply in Korean.', input: 'First turn' };
  const first = build(args), next = build({ ...args, input: 'Next turn', previousResponseId: 'resp_fixture' });
  assert.equal(first.instructions, args.instructions);
  assert.equal(Object.hasOwn(first, 'previous_response_id'), false);
  assert.equal(next.instructions, first.instructions);
  assert.equal(next.previous_response_id, 'resp_fixture');
  assert.equal(Object.hasOwn(next, 'conversation'), false);
  assert.equal(build({ ...args, instructions: 'Reply briefly.', previousResponseId: 'resp_fixture' }).instructions, 'Reply briefly.');
  const broken = { model: args.model, input: 'Next turn', previous_response_id: 'resp_fixture' };
  assert.equal(Object.hasOwn(broken, 'instructions'), false);
  for (const patch of [{ instructions: undefined }, { instructions: '' }, { instructions: ' ' }, { model: '' }, { input: '' }, { previousResponseId: '' }, { previousResponseId: null }, { previousResponseId: 42 }]) {
    assert.throws(() => build({ ...args, ...patch }), /required|requires|nonempty/);
  }
  assert.deepEqual(args, { model: 'fixture-model', instructions: 'Reply in Korean.', input: 'First turn' });
});
