import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const readGuide = (slug) => readFile(new URL(`../src/data/guides/${slug}.md`, import.meta.url), 'utf8');
const codeBlock = (markdown, language) => markdown.match(new RegExp('```' + language + '\\n([\\s\\S]*?)\\n```'))?.[1];

test('Gemini synthetic fixture preserves one ordered model Content and the first-part signature', async () => {
  const markdown = await readGuide('gemini-thought-signature-parallel-tool-calls');
  const example = codeBlock(markdown, 'json');
  assert.ok(example, 'JSON fixture exists');
  const { contents } = JSON.parse(example);
  assert.deepEqual(contents.map((content) => content.role), ['user', 'model', 'user']);
  const calls = contents[1].parts;
  assert.deepEqual(calls.map((part) => part.functionCall.args.city), ['Paris', 'London']);
  assert.equal(calls[0].thoughtSignature, 'SIGNATURE_FROM_THIS_RESPONSE');
  assert.equal(Object.hasOwn(calls[1], 'thoughtSignature'), false);
  assert.deepEqual(contents[2].parts.map((part) => part.functionResponse.response.city), ['Paris', 'London']);
});

test('Massive synthetic pages reach the final next_url and reject loops and foreign hosts', async () => {
  const markdown = await readGuide('massive-polygon-missing-aggregate-bars');
  const example = codeBlock(markdown, 'python');
  assert.ok(example, 'Python fixture exists');
  const fixture = `
first = "https://api.massive.com/first"
second = "https://api.massive.com/second"
pages = {
    first: {"status": "OK", "results": [{"t": 1}], "next_url": second},
    second: {"status": "OK", "results": [{"t": 2}]},
}
visited = []
def fetch(url):
    visited.append(url)
    return pages[url]
assert [bar["t"] for bar in collect_bars(first, fetch)] == [1, 2]
assert visited == [first, second]
pages[first]["next_url"] = first
try:
    collect_bars(first, fetch)
    raise AssertionError("loop was accepted")
except ValueError as error:
    assert str(error) == "Pagination loop"
pages[first]["next_url"] = "https://elsewhere.example/next"
try:
    collect_bars(first, fetch)
    raise AssertionError("foreign host was accepted")
except ValueError as error:
    assert str(error) == "Unexpected pagination host"
print("synthetic pagination fixture passed")
`;
  const result = spawnSync('python3', ['-c', `${example}\n${fixture}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /synthetic pagination fixture passed/);
});
