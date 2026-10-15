import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CORE_FACT_KEYS, isVerificationDate, validateProviderProvenance } from '../src/lib/provider-provenance.mjs';

function provider() {
  return {
    officialDocs: 'https://example.com/docs',
    sourceUrls: ['https://example.com/docs', 'https://example.com/pricing'],
    verifiedAt: '2026-10-15',
    mutableFacts: CORE_FACT_KEYS.map((key) => ({
      key, label: key, value: 'Verified value', sourceUrl: 'https://example.com/docs', verifiedAt: '2026-10-15',
    })),
  };
}

test('accepts a complete record and Date values supplied by the content schema', () => {
  const value = provider();
  assert.deepEqual(validateProviderProvenance(value), []);
  const fromSchema = {
    ...value, verifiedAt: new Date('2026-10-15'),
    mutableFacts: value.mutableFacts.map((fact) => ({ ...fact, verifiedAt: new Date(fact.verifiedAt) })),
  };
  assert.deepEqual(validateProviderProvenance(fromSchema), []);
});

test('changing a display label does not invalidate a sourced core fact', () => {
  const value = provider();
  value.mutableFacts[0].label = 'Current regional API URL';
  assert.deepEqual(validateProviderProvenance(value), []);
});

test('rejects each missing core fact even when other facts are present', () => {
  for (const key of CORE_FACT_KEYS) {
    const value = provider();
    value.mutableFacts = value.mutableFacts.filter((fact) => fact.key !== key);
    assert.ok(validateProviderProvenance(value).some((issue) => issue.message.includes(`"${key}"; found 0`)));
  }
});

test('a legacy label cannot disguise a missing key', () => {
  const value = provider();
  value.mutableFacts[0] = { ...value.mutableFacts[0], key: undefined, label: 'Base URL' };
  assert.ok(validateProviderProvenance(value).some((issue) => issue.message.includes('"base-url"; found 0')));
});

test('rejects duplicate and unknown core keys', () => {
  const value = provider();
  value.mutableFacts.push({ ...value.mutableFacts[0] });
  assert.ok(validateProviderProvenance(value).some((issue) => issue.message.includes('"base-url"; found 2')));
  value.mutableFacts[4].key = 'baseUrl';
  assert.ok(validateProviderProvenance(value).some((issue) => issue.path.at(-1) === 'key'));
});

test('rejects the undeclared fact source that caused the FMP CI failure', () => {
  const value = provider();
  value.mutableFacts[0].sourceUrl = 'https://example.com/docs/stable';
  const issues = validateProviderProvenance(value);
  assert.deepEqual(issues.map((issue) => issue.path), [['mutableFacts', 0, 'sourceUrl']]);
  value.sourceUrls.push('https://example.com/docs/stable');
  assert.deepEqual(validateProviderProvenance(value), []);
});

test('rejects missing officialDocs, duplicate sources and non-HTTPS sources', () => {
  const value = provider();
  value.sourceUrls = ['http://example.com/docs', 'http://example.com/docs'];
  const issues = validateProviderProvenance(value);
  assert.ok(issues.some((issue) => issue.path[0] === 'officialDocs'));
  assert.ok(issues.some((issue) => issue.message.includes('unique')));
  assert.equal(issues.filter((issue) => issue.message.includes('HTTPS')).length, 2);
});

test('rejects impossible calendar dates and empty fact values', () => {
  const value = provider();
  value.verifiedAt = '2026-02-30';
  value.mutableFacts[0].verifiedAt = '2026-13-01';
  value.mutableFacts[1].value = '  ';
  const issues = validateProviderProvenance(value);
  assert.ok(issues.some((issue) => issue.path.length === 1 && issue.path[0] === 'verifiedAt'));
  assert.ok(issues.some((issue) => issue.path.join('.') === 'mutableFacts.0.verifiedAt'));
  assert.ok(issues.some((issue) => issue.message.includes('non-empty')));
  assert.equal(isVerificationDate('2024-02-29'), true);
  assert.equal(isVerificationDate('2026-02-29'), false);
});
