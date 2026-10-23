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
const slug = 'openai-responses-parse-commentary-final-answer';
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const split = (markdown) => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  assert.ok(match);
  return { data: parse(match[1]), body: match[2] };
};

test('OpenAI phase review and Korean overlay preserve evidence, authorship and source-review scope', async () => {
  const recipe = caseInputSchema.parse(JSON.parse(await read(`case-studies/reviews/${slug}.json`)));
  await verifyCaseEvidence(root, recipe.caseStudy);
  const bytes = await read(`src/data/guides/${slug}.md`);
  const original = split(bytes);
  const translation = split(await read(`src/data/ko/guides/${slug}.md`));
  const { sections, ...metadata } = recipe;
  assert.deepEqual(original.data, metadata);
  assert.equal(original.body, caseMarkdown(recipe));
  assert.deepEqual(recipe.caseStudy.providers, ['openai']);
  assert.equal(recipe.caseStudy.verification.level, 'source-review');
  assert.equal(recipe.caseStudy.review.author, '차도녀 gpt may');
  assert.equal(translation.data.sourceRevision, sourceRevision(bytes));
  assert.deepEqual(translationRegistryIssues('guides', [{ id: slug, data: original.data, bytes }], [{ id: slug, ...translation }]), []);
  assert.match(original.body, /2026-09-15/);
  assert.match(original.body, /not reproduced here/);
});

test('both published acceptance guards reject incomplete, refused and absent results offline', async () => {
  const english = await read(`src/data/guides/${slug}.md`);
  const korean = await read(`src/data/ko/guides/${slug}.md`);
  const code = (text) => text.match(/```python\n([\s\S]*?)\n```/)?.[1];
  assert.ok(code(english));
  assert.equal(code(korean), code(english));
  const controls = `
import json, sys
from types import SimpleNamespace as NS
ns = {}
exec(json.load(sys.stdin), ns)
accept = ns['require_structured_result']
class ParsedResponse:
    def __init__(self, result, output, status='completed'):
        self.status, self.output, self.output_parsed = status, output, result
    @property
    def output_text(self):
        raise AssertionError('combined commentary text must not be consumed')
def message(phase='final_answer', kind='output_text'):
    return NS(type='message', phase=phase, content=[NS(type=kind)])
final = {'answer': 'final'}
assert accept(ParsedResponse(final, [message('commentary'), message()])) is final
assert accept(ParsedResponse(final, [message(None)])) is final
assert accept(ParsedResponse(final, [NS(type='message', content=[])])) is final
assert accept(ParsedResponse(final, [NS(type='function_call'), message('unknown'), message()])) is final
assert accept(ParsedResponse(False, [message()])) is False
assert accept(ParsedResponse(0, [message()])) == 0
assert accept(ParsedResponse({}, [message()])) == {}
assert accept(ParsedResponse(final, [message('commentary', 'refusal'), message()])) is final
for response, expected in [
    (ParsedResponse(final, [message()], 'incomplete'), 'not completed'),
    (ParsedResponse(final, [message()], 'failed'), 'not completed'),
    (ParsedResponse(None, [message('commentary')]), 'No structured result'),
    (ParsedResponse(None, None), 'No structured result'),
    (ParsedResponse(final, [message(kind='refusal')]), 'refused'),
    (ParsedResponse(final, [message(None, 'refusal')]), 'refused'),
]:
    try:
        accept(response)
    except ValueError as error:
        assert expected in str(error)
    else:
        raise AssertionError('negative control was accepted')
print('8 positive and 6 rejection controls passed; application guard only; no SDK or network')
`;
  const result = spawnSync('python3', ['-c', controls], { input: JSON.stringify(code(english)), encoding: 'utf8', timeout: 10000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /application guard only; no SDK or network/);
});
