import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { parse } from 'yaml';
import { caseInputSchema, caseMarkdown } from '../src/lib/case-study.mjs';
import { verifyCaseEvidence } from '../scripts/case-evidence.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const slug = 'alpaca-api-recent-sip-data-error-iex';

test('Alpaca review, public evidence, and generated guide remain synchronized', async () => {
  const recipe = caseInputSchema.parse(JSON.parse(await readFile(new URL(`../case-studies/reviews/${slug}.json`, import.meta.url), 'utf8')));
  await verifyCaseEvidence(root, recipe.caseStudy);
  const markdown = await readFile(new URL(`../src/data/guides/${slug}.md`, import.meta.url), 'utf8');
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  assert.ok(match);
  const { sections, ...metadata } = recipe;
  assert.deepEqual(parse(match[1]), metadata);
  assert.equal(match[2], caseMarkdown(recipe));
  assert.deepEqual(recipe.caseStudy.providers, ['alpaca']);
  assert.equal(recipe.caseStudy.verification.level, 'source-review');
  assert.equal(recipe.caseStudy.review.author, '차도녀 gpt may');
});

test('published Alpaca request planner preserves feeds and rejects unsafe windows offline', async () => {
  const markdown = await readFile(new URL(`../src/data/guides/${slug}.md`, import.meta.url), 'utf8');
  const code = markdown.match(/```python\n([\s\S]*?)\n```/)?.[1];
  assert.ok(code);
  const checks = `
import json, sys
from datetime import datetime, timedelta, timezone
ns = {}
exec(json.load(sys.stdin), ns)
plan = ns['stock_bar_request']
now = datetime(2026, 10, 16, 14, 30, tzinfo=timezone.utc)
base = dict(symbols=['AAPL'], start=now-timedelta(hours=1), end=now-timedelta(minutes=16), feed='sip', now=now)
p = plan(**base)
assert p['params']['feed'] == 'sip'
assert p['params']['end'] == '2026-10-16T14:14:00Z'
assert p['coverage'] == 'consolidated SIP'
assert plan(**(base | {'end': now-timedelta(minutes=15)}))['params']['feed'] == 'sip'
recent = now-timedelta(minutes=14, seconds=59)
iex = plan(**(base | {'end': recent, 'feed': 'iex'}))
assert iex['coverage'] == 'IEX only'
assert iex['params']['feed'] == 'iex'
assert iex['params']['end'] == '2026-10-16T14:15:01Z'
assert plan(**(base | {'start': base['start'].astimezone(timezone(timedelta(hours=9)))})) == p
invalid = [
    {'end': recent}, {'feed': None}, {'feed': 'auto'},
    {'start': now.replace(tzinfo=None)}, {'end': now.replace(tzinfo=None)},
    {'now': now.replace(tzinfo=None)}, {'end': now+timedelta(seconds=1), 'feed': 'iex'},
    {'start': now}, {'symbols': []}, {'symbols': ['']}
]
for changes in invalid:
    try:
        plan(**(base | changes))
    except ValueError:
        pass
    else:
        raise AssertionError(changes)
try:
    plan(**{k: v for k, v in base.items() if k != 'feed'})
except TypeError:
    pass
else:
    raise AssertionError('omitted feed accepted')
print('Alpaca: positive, boundary, explicit-IEX, timezone and 11 rejection controls passed; no network')
`;
  const result = spawnSync('python3', ['-c', checks], { input: JSON.stringify(code), encoding: 'utf8', timeout: 10000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /no network/);
});
