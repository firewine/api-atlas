import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { parse } from 'yaml';

const cases = [
  ['eodhd-dividend-delay-cache-refresh', 'EODHD missing dividend data: handle delayed updates and cache refreshes'],
  ['seibro-dividend-pagination-count-mismatch', 'SEIBRO dividend API pagination: reconcile count and collected rows'],
  ['ecos-usd-currency-identity-validation', 'ECOS exchange rate API: prevent selecting a non-USD currency'],
  ['llm-retry-fallback-shared-timeout-budget', 'LLM API retries and fallback: avoid applying timeout budgets twice'],
  ['llm-structured-output-fallback-response-format', 'LLM structured output: preserve response_format through fallback'],
];

for (const [slug, title] of cases) {
  test(`published ${slug} code passes positive and negative synthetic fixtures`, async () => {
    const markdown = await readFile(new URL(`../src/data/guides/${slug}.md`, import.meta.url), 'utf8');
    const metadata = parse(markdown.match(/^---\n([\s\S]*?)\n---/)[1]);
    assert.equal(metadata.title, title);
    assert.equal(metadata.h1, title);
    assert.equal(metadata.caseStudy.slug, slug);
    const code = markdown.match(/```python\n([\s\S]*?)\n```/)?.[1];
    assert.ok(code, 'The published guide contains an executable reduced Python example');
    const fixture = fileURLToPath(new URL('./fixtures/check-getbeta-cases.py', import.meta.url));
    const result = spawnSync('python3', [fixture], {
      input: JSON.stringify({ [slug]: code }), encoding: 'utf8', timeout: 10000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(result.stdout.trim(), `${slug}: synthetic fixture passed`);
  });
}
