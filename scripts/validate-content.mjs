import { readFile } from 'node:fs/promises';
import { validateProviderProvenance } from '../src/lib/provider-provenance.mjs';

const requiredSeedSlugs = ['alpha-vantage', 'anthropic', 'bok-ecos', 'currencylayer', 'eodhd', 'fsc-data-go-kr', 'gemini', 'massive', 'openai', 'yfinance'];
const catalog = JSON.parse(await readFile(new URL('../dist/api/catalog.json', import.meta.url), 'utf8'));
const errors = [];

if (catalog.schemaVersion !== '1.0') errors.push('catalog schemaVersion must be 1.0');
if (catalog.providerCount !== catalog.providers.length) errors.push('providerCount must match providers length');
if (catalog.providerCount < 25) errors.push(`expected at least 25 providers, found ${catalog.providerCount}`);
const slugs = catalog.providers.map((provider) => provider.id).sort();
for (const slug of requiredSeedSlugs) if (!slugs.includes(slug)) errors.push(`missing required seed provider: ${slug}`);
if (new Set(slugs).size !== slugs.length) errors.push('provider IDs must be unique');

for (const provider of catalog.providers) {
  const context = `provider ${provider.id}`;
  for (const key of ['name', 'provider', 'category', 'summary', 'baseUrl', 'auth', 'pricing', 'rateLimit', 'versioning', 'pagination', 'errors', 'webhooks']) {
    if (typeof provider[key] !== 'string' || provider[key].trim() === '') errors.push(`${context}: ${key} is required`);
  }
  for (const key of ['homepage', 'officialDocs']) {
    if (!provider[key]?.startsWith('https://')) errors.push(`${context}: ${key} must be HTTPS`);
  }
  if (!Array.isArray(provider.resourceGroups) || provider.resourceGroups.length === 0) errors.push(`${context}: resourceGroups must not be empty`);
  if (!Array.isArray(provider.formats) || provider.formats.length === 0) errors.push(`${context}: formats must not be empty`);
  for (const issue of validateProviderProvenance(provider)) {
    errors.push(`${context}: ${issue.path.join('.')}: ${issue.message}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Content validation passed for ${catalog.providerCount} providers and ${catalog.providers.reduce((total, provider) => total + provider.mutableFacts.length, 0)} sourced facts.`);
