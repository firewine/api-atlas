import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const providerSlugs = ['alpha-vantage', 'anthropic', 'bok-ecos', 'currencylayer', 'eodhd', 'fsc-data-go-kr', 'gemini', 'massive', 'openai', 'yfinance'];
const comparisonSlugs = ['eodhd-vs-alpha-vantage', 'eodhd-vs-massive', 'massive-vs-alpha-vantage', 'openai-vs-anthropic', 'openai-vs-gemini'];
const guideSlugs = ['api-key-safety', 'choose-llm-api', 'choose-stock-market-data-api', 'consume-openapi-specification', 'rest-pagination-patterns', 'retry-and-backoff', 'verify-api-rate-limits'];
const categorySlugs = ['ai', 'market-data', 'public-data', 'currency-data'];
const required = [
  'index.html', 'apis/index.html', 'categories/index.html', 'compare/index.html', 'guides/index.html',
  'changes/index.html', 'sources/index.html', 'about/index.html', 'search/index.html', '404.html',
  'api/catalog.json', 'api/changes.json', 'robots.txt', 'sitemap.xml', 'llms.txt',
  'pagefind/pagefind.js', 'pagefind/pagefind-ui.js', 'pagefind/pagefind-ui.css',
  ...providerSlugs.flatMap((slug) => [`apis/${slug}/index.html`, `api/providers/${slug}.json`]),
  ...comparisonSlugs.map((slug) => `compare/${slug}/index.html`),
  ...guideSlugs.map((slug) => `guides/${slug}/index.html`),
  ...categorySlugs.map((slug) => `categories/${slug}/index.html`),
];
const errors = [];

for (const relativePath of required) {
  if (!existsSync(new URL(relativePath, dist))) errors.push(`missing required output: ${relativePath}`);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }))).flat();
}

const files = await walk(dist.pathname);
const htmlFiles = files.filter((file) => extname(file) === '.html');
const forbiddenAdCode = /adsbygoogle|googlesyndication|doubleclick|data-ad-client/i;

function resolvesToFile(href) {
  const pathname = href.split(/[?#]/, 1)[0];
  const relative = pathname.replace(/^\//, '');
  if (!relative) return new URL('index.html', dist);
  if (pathname.endsWith('/')) return new URL(`${relative}index.html`, dist);
  if (extname(pathname)) return new URL(relative, dist);
  return new URL(`${relative}/index.html`, dist);
}

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const relative = file.slice(dist.pathname.length);
  if (!/<link rel="canonical" href="https:\/\//.test(html)) errors.push(`${relative}: missing absolute HTTPS canonical`);
  if (forbiddenAdCode.test(html)) errors.push(`${relative}: forbidden advertising code detected`);
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    if (!existsSync(resolvesToFile(href))) errors.push(`${relative}: broken internal link ${href}`);
  }
}

for (const slug of providerSlugs) {
  const html = await readFile(new URL(`apis/${slug}/index.html`, dist), 'utf8');
  if (!html.includes('Verified facts, visible sources') || !html.includes('2026-09-13')) errors.push(`apis/${slug}: missing visible fact provenance or verified date`);
}

const robots = await readFile(new URL('robots.txt', dist), 'utf8');
for (const agent of ['OAI-SearchBot', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'Google-Extended']) {
  if (!robots.includes(`User-agent: ${agent}`)) errors.push(`robots.txt: missing ${agent} policy`);
}
if (!robots.includes('/sitemap.xml')) errors.push('robots.txt: sitemap URL must point to /sitemap.xml');
const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
if (sitemap.includes('/api/') || sitemap.includes('/search/')) errors.push('sitemap.xml: machine or noindex routes must be excluded');
for (const slug of providerSlugs) {
  if (!sitemap.includes(`/apis/${slug}/`)) errors.push(`sitemap.xml: missing provider ${slug}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Distribution verification passed: ${required.length} required outputs and ${htmlFiles.length} HTML pages checked.`);
