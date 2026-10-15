// @ts-check
/** @type {readonly ['base-url', 'authentication', 'pricing', 'rate-limits']} */
export const CORE_FACT_KEYS = Object.freeze(['base-url', 'authentication', 'pricing', 'rate-limits']);

/** @typedef {{ key?: string, label: string, value: string, sourceUrl: string, verifiedAt: string | Date }} MutableFact */
/** @typedef {{ officialDocs: string, sourceUrls: string[], verifiedAt: string | Date, mutableFacts: MutableFact[] }} ProviderProvenance */
/** @typedef {{ path: (string | number)[], message: string }} ProvenanceIssue */

/** @param {string | Date} value */
export function isVerificationDate(value) {
  if (value instanceof Date) return Number.isFinite(value.getTime());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** @param {string} value */
function isHttpsUrl(value) {
  try { return new URL(value).protocol === 'https:'; }
  catch { return false; }
}

/**
 * Shared by source schema validation and the built JSON validator.
 * Labels are editorial text; only keys identify the four required facts.
 * @param {ProviderProvenance} provider
 * @returns {ProvenanceIssue[]}
 */
export function validateProviderProvenance(provider) {
  /** @type {ProvenanceIssue[]} */
  const issues = [];
  if (!isVerificationDate(provider.verifiedAt)) issues.push({ path: ['verifiedAt'], message: 'Use a valid YYYY-MM-DD verification date' });
  if (provider.sourceUrls.length < 2) issues.push({ path: ['sourceUrls'], message: 'Declare at least two official source URLs' });
  if (!provider.sourceUrls.includes(provider.officialDocs)) issues.push({ path: ['officialDocs'], message: 'officialDocs must appear in sourceUrls' });
  const declaredSources = new Set(provider.sourceUrls);
  if (declaredSources.size !== provider.sourceUrls.length) issues.push({ path: ['sourceUrls'], message: 'Source URLs must be unique' });
  provider.sourceUrls.forEach((url, index) => {
    if (!isHttpsUrl(url)) issues.push({ path: ['sourceUrls', index], message: 'Use an absolute HTTPS source URL' });
  });

  const keys = provider.mutableFacts.map((fact) => fact.key);
  for (const key of CORE_FACT_KEYS) {
    const count = keys.filter((candidate) => candidate === key).length;
    if (count !== 1) issues.push({ path: ['mutableFacts'], message: `Expected exactly one fact with key "${key}"; found ${count}` });
  }
  provider.mutableFacts.forEach((fact, index) => {
    const path = ['mutableFacts', index];
    if (fact.key !== undefined && !CORE_FACT_KEYS.some((key) => key === fact.key)) {
      issues.push({ path: [...path, 'key'], message: `Unknown core fact key "${fact.key}"; omit key for additional editorial facts` });
    }
    if (!fact.label.trim() || !fact.value.trim()) issues.push({ path, message: 'Facts require a non-empty label and value' });
    if (!declaredSources.has(fact.sourceUrl)) issues.push({ path: [...path, 'sourceUrl'], message: `Fact source is not declared in sourceUrls: ${fact.sourceUrl}` });
    if (!isVerificationDate(fact.verifiedAt)) issues.push({ path: [...path, 'verifiedAt'], message: 'Use a valid YYYY-MM-DD verification date' });
  });
  return issues;
}
