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
const slug = 'anthropic-mixed-tools-missing-result-400';
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const split = (markdown) => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  assert.ok(match);
  return { data: parse(match[1]), body: match[2] };
};

test('Anthropic mixed-tool case preserves reviewed evidence, translation and operational-fit discovery', async () => {
  const recipe = caseInputSchema.parse(JSON.parse(await read(`case-studies/reviews/${slug}.json`)));
  await verifyCaseEvidence(root, recipe.caseStudy);
  const bytes = await read(`src/data/guides/${slug}.md`);
  const original = split(bytes);
  const translation = split(await read(`src/data/ko/guides/${slug}.md`));
  const { sections, ...metadata } = recipe;
  assert.deepEqual(original.data, metadata);
  assert.equal(original.body, caseMarkdown(recipe));
  assert.deepEqual(recipe.caseStudy.providers, ['anthropic']);
  assert.equal(recipe.caseStudy.verification.level, 'source-review');
  assert.equal(recipe.caseStudy.review.author, '차도녀 gpt may');
  assert.equal(translation.data.sourceRevision, sourceRevision(bytes));
  assert.deepEqual(translationRegistryIssues('guides', [{ id: slug, data: original.data, bytes }], [{ id: slug, ...translation }]), []);
  assert.match(original.body, /No Anthropic API request was made/);
  assert.match(original.body, /Both issues were closed/);
  assert.match(original.body, /not a current recommended combination/);
  assert.match(original.body, /No GetBeta production fix is claimed or implemented/);
  assert.match(await read('src/data/guides/choose-llm-api.md'), new RegExp(`\\(../${slug}/\\)`));
});

test('both published mixed-tool examples preserve valid continuations and reject malformed outcomes offline', async () => {
  const english = await read(`src/data/guides/${slug}.md`);
  const korean = await read(`src/data/ko/guides/${slug}.md`);
  const code = (text) => text.match(/```python\n([\s\S]*?)\n```/)?.[1];
  assert.ok(code(english));
  assert.equal(code(korean), code(english));
  const controls = `
import json, sys
from copy import deepcopy
ns = {}
exec(json.load(sys.stdin), ns)
resume, track = ns['continuation_patch'], ns['pending_server_calls']
history = [{'role': 'user', 'content': 'Use both tools'}]
tools = [{'name': 'web_fetch', 'type': 'web_fetch_20260309', 'max_uses': 2}, {'name': 'lookup', 'input_schema': {'type': 'object'}}]
server = {'type': 'server_tool_use', 'id': 'srv_a', 'name': 'web_fetch', 'input': {'url': 'https://example.com'}}
client = {'type': 'tool_use', 'id': 'cli_a', 'name': 'lookup', 'input': {}, 'caller': {'type': 'direct'}}
client2 = dict(client, id='cli_b')
outcome = {'type': 'tool_result', 'tool_use_id': 'cli_a', 'content': [{'type': 'text', 'text': 'actual outcome'}]}
outcome2 = dict(outcome, tool_use_id='cli_b')
reply = {'stop_reason': 'tool_use', 'content': [server, client, client2]}
patch = resume(history, reply, tools, [outcome2, outcome])
assert patch['tools'] == tools and patch['messages'] == history + [{'role': 'assistant', 'content': reply['content']}, {'role': 'user', 'content': [outcome2, outcome]}]
assert track({}, reply) == {'srv_a': 'web_fetch'}
result = {'type': 'web_fetch_tool_result', 'tool_use_id': 'srv_a', 'content': {'type': 'web_fetch_result'}}
assert track(track({}, reply), {'content': [result]}) == {}
assert track({}, {'content': [result, server]}) == {}
assert track({'srv_a': 'web_fetch'}, {'content': [dict(result, tool_use_id='different')]}) == {'srv_a': 'web_fetch'}
assert track({}, {'content': [{'type': 'mcp_tool_use', 'id': 'mcp_a', 'name': 'remote'}, {'type': 'mcp_tool_result', 'tool_use_id': 'mcp_a'}]}) == {}
# Observed error result resolves an ID; it is not a success assertion.
error = dict(result, content={'type': 'web_fetch_tool_result_error', 'error_code': 'unavailable'})
assert track({'srv_a': 'web_fetch'}, {'content': [error]}) == {} and error['content']['type'].endswith('_error')
assert resume(history, dict(reply, content=[server, client]), tools, [dict(outcome, is_error=True)])['messages'][-1]['content'][0]['is_error'] is True
paused = {'stop_reason': 'pause_turn', 'content': [server]}
assert resume(history, paused, tools)['messages'][-1] == {'role': 'assistant', 'content': [server]}
programmatic = dict(client, caller={'type': 'code_execution_20260120', 'tool_id': 'srv_code'})
code_server = dict(server, id='srv_code', name='code_execution')
code_tools = [{'name': 'code_execution', 'type': 'code_execution_20260120'}, tools[1]]
program_reply = dict(reply, content=[code_server, programmatic], container={'id': 'container_test'})
first = resume(history, program_reply, code_tools, [outcome])
assert first['container'] == 'container_test' and first['messages'][-2]['content'][1]['caller'] == programmatic['caller']
second_reply = dict(program_reply, content=[dict(programmatic, id='cli_b')])
second = resume(first['messages'], second_reply, code_tools, [outcome2])
assert second['container'] == 'container_test' and len(second['messages']) == 5
pending = track(track({}, program_reply), second_reply)
assert pending == {'srv_code': 'code_execution'}
assert track(pending, {'content': [{'type': 'code_execution_tool_result', 'tool_use_id': 'srv_code'}]}) == {}
# Snapshots preserve non-text blocks and isolate later mutations.
rich = dict(reply, content=[{'type': 'thinking', 'thinking': 'opaque fixture', 'signature': 'fixture-signature'}, server, client])
copy = resume(history, rich, tools, [outcome])
rich['content'][0]['signature'] = 'changed'
copy['tools'][0]['max_uses'] = 99
copy['messages'][0]['content'] = 'changed'
copy['messages'][-1]['content'][0]['content'][0]['text'] = 'changed'
assert copy['messages'][-2]['content'][0]['signature'] == 'fixture-signature'
assert tools[0]['max_uses'] == 2 and history[0]['content'] == 'Use both tools'
assert outcome['content'][0]['text'] == 'actual outcome'
member = dict(client, toolset_name='browser')
assert resume(history, dict(reply, content=[member]), tools, [dict(outcome, toolset_name='browser')])['messages'][-1]['content'][0]['toolset_name'] == 'browser'
# Local guards, not assertions that the remote API returned a specific 400.
rejections = [
    (reply, [outcome, outcome2, {'type': 'text', 'text': 'continue'}], 'blocks only'),
    (reply, [{'type': 'text', 'text': 'results'}, outcome, outcome2], 'blocks only'),
    (reply, [outcome], 'exactly one'),
    (reply, [outcome, outcome], 'exactly one'),
    (reply, [outcome, dict(outcome2, tool_use_id='wrong')], 'exactly one'),
    (reply, [outcome, outcome2, dict(outcome, tool_use_id='srv_a')], 'exactly one'),
    (reply, [outcome, outcome2, result], 'blocks only'),
    (dict(reply, content=[server]), [], 'blocks only'),
    (paused, [outcome], 'pause_turn'),
    (dict(reply, stop_reason='pause_turn'), [], 'pause_turn'),
    (dict(program_reply, container=None), [outcome], 'container.id'),
    (dict(reply, stop_reason='end_turn'), [outcome, outcome2], 'separately'),
    (dict(reply, stop_reason='max_tokens'), [outcome, outcome2], 'separately'),
    (dict(reply, stop_reason='refusal'), [], 'separately'),
    (dict(reply, content=[member]), [outcome], 'toolset_name'),
]
for response, results, expected in rejections:
    try:
        resume(history, response, tools, results)
    except ValueError as error:
        assert expected in str(error)
    else:
        raise AssertionError('negative control was accepted')
print('15 rejection controls plus normal continuation, history and ID tracking controls passed; application example only; no SDK or network')
`;
  const result = spawnSync('python3', ['-c', controls], { input: JSON.stringify(code(english)), encoding: 'utf8', timeout: 10000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /15 rejection controls/);
  assert.match(result.stdout, /application example only; no SDK or network/);
});
