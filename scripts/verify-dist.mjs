import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const site = new URL(process.env.SITE_URL ?? 'https://api-atlas.pages.dev');
const basePath = process.env.BASE_PATH ?? '/';
if (!/^\/(?:[^/]+\/)*$/.test(basePath)) throw new Error(`Invalid BASE_PATH: ${basePath}`);
const prefix = basePath === '/' ? '' : basePath.slice(0, -1);
const siteRoot = new URL(`${prefix}/`, site).href;
const catalog = JSON.parse(await readFile(new URL('api/catalog.json', dist), 'utf8'));
const providerSlugs = catalog.providers.map((provider) => provider.id);
const sourceSlugs = async (kind) => (await readdir(new URL(`../src/data/${kind}/`, import.meta.url)))
  .filter((name) => name.endsWith('.md')).map((name) => name.slice(0, -3));
const [comparisonSlugs, guideSlugs] = await Promise.all([sourceSlugs('comparisons'), sourceSlugs('guides')]);
const [koApiSlugs, koGuideSlugs, koComparisonSlugs] = await Promise.all([sourceSlugs('ko/apis'), sourceSlugs('ko/guides'), sourceSlugs('ko/comparisons')]);
const categorySlugs = [...new Set(catalog.providers.map((provider) => provider.category))];
const required = [
  'index.html', 'apis/index.html', 'categories/index.html', 'compare/index.html', 'guides/index.html',
  'changes/index.html', 'sources/index.html', 'about/index.html', 'search/index.html', '404.html',
  'api/catalog.json', 'api/changes.json', 'api/guides.json', 'robots.txt', 'sitemap.xml', 'llms.txt',
  'scripts/compare.js', 'scripts/search.js', 'pagefind/pagefind.js', 'pagefind/pagefind-ui.js', 'pagefind/pagefind-ui.css',
  ...providerSlugs.flatMap((slug) => [`apis/${slug}/index.html`, `api/providers/${slug}.json`]),
  ...comparisonSlugs.map((slug) => `compare/${slug}/index.html`),
  ...guideSlugs.map((slug) => `guides/${slug}/index.html`),
  ...categorySlugs.map((slug) => `categories/${slug}/index.html`),
  'ko/index.html', 'ko/guides/index.html', 'ko/search/index.html',
  ...koApiSlugs.map((slug) => `ko/apis/${slug}/index.html`),
  ...koGuideSlugs.map((slug) => `ko/guides/${slug}/index.html`),
  ...koComparisonSlugs.map((slug) => `ko/compare/${slug}/index.html`),
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

function outputFile(pathname) {
  const relative = pathname.slice(prefix.length).replace(/^\//, '');
  if (!relative) return new URL('index.html', dist);
  if (pathname.endsWith('/')) return new URL(`${relative}index.html`, dist);
  if (extname(pathname)) return new URL(relative, dist);
  return new URL(`${relative}/index.html`, dist);
}

const files = await walk(dist.pathname);
const htmlFiles = files.filter((file) => extname(file) === '.html');
const forbiddenAdCode = /adsbygoogle|googlesyndication|doubleclick|data-ad-client/i;
const anchorDocuments = new Map();
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const relative = file.slice(dist.pathname.length);
  const pagePath = relative === 'index.html' ? '/' : relative.endsWith('/index.html')
    ? `/${relative.slice(0, -'index.html'.length)}` : `/${relative}`;
  const publicUrl = new URL(`${prefix}${pagePath}`, site);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (canonical?.[1] !== publicUrl.href) errors.push(`${relative}: canonical must be ${publicUrl.href}`);
  if (forbiddenAdCode.test(html)) errors.push(`${relative}: forbidden advertising code detected`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (reference.startsWith('//')) {
      errors.push(`${relative}: protocol-relative URL ${reference}`);
      continue;
    }
    if (/^(?:mailto:|tel:|data:)/.test(reference)) continue;
    if (reference === 'https://getbeta.app' || reference === 'https://getbeta.app/') continue;
    let url;
    try { url = new URL(reference, publicUrl); }
    catch { errors.push(`${relative}: invalid URL ${reference}`); continue; }
    if (url.origin !== site.origin) continue;
    // These existing GetBeta explanations/tools are deliberate cross-product links.
    if (url.origin === 'https://getbeta.app' && !url.search && !url.hash &&
      ['https://getbeta.app/learn/payment-vs-ex-date', 'https://getbeta.app/learn/ttm-yield',
        'https://getbeta.app/tools/dividend-calculator'].includes(reference)) continue;
    if (!url.pathname.startsWith(`${prefix}/`)) {
      errors.push(`${relative}: URL escapes BASE_PATH: ${reference}`);
      continue;
    }
    const target = outputFile(url.pathname);
    if (!existsSync(target)) {
      errors.push(`${relative}: broken internal URL ${reference}`);
      continue;
    }
    if (url.hash) {
      if (!anchorDocuments.has(target.href)) anchorDocuments.set(target.href, await readFile(target, 'utf8'));
      const ids = [...anchorDocuments.get(target.href).matchAll(/\b(?:id|name)="([^"]*)"/g)].map((entry) => entry[1]);
      if (!ids.includes(decodeURIComponent(url.hash.slice(1)))) errors.push(`${relative}: broken internal anchor ${reference}`);
    }
  }
  const schema = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  if (!schema) {
    errors.push(`${relative}: missing JSON-LD`);
  } else {
    try {
      const schemas = JSON.parse(schema[1]);
      const website = schemas.find((item) => item['@type'] === 'WebSite');
      const localizedRoot = relative.startsWith('ko/') ? `${siteRoot}ko/` : siteRoot;
      if (website?.url !== localizedRoot || website?.potentialAction?.target !== `${localizedRoot}search/?q={search_term_string}`) {
        errors.push(`${relative}: WebSite JSON-LD has wrong site or search URL`);
      }
      for (const item of schemas) {
        if (item.mainEntityOfPage && item.mainEntityOfPage !== publicUrl.href) {
          errors.push(`${relative}: JSON-LD mainEntityOfPage does not match canonical`);
        }
      }
    } catch { errors.push(`${relative}: invalid JSON-LD`); }
  }
}

for (const provider of catalog.providers) {
  const relative = `apis/${provider.id}/index.html`;
  const html = await readFile(new URL(relative, dist), 'utf8');
  if (!html.includes('Verified facts, visible sources') || !html.includes(provider.verifiedAt)) {
    errors.push(`${relative}: missing visible fact provenance or verified date ${provider.verifiedAt}`);
  }
  if (provider.humanUrl !== `${prefix}/apis/${provider.id}/` || provider.jsonUrl !== `${prefix}/api/providers/${provider.id}.json`) {
    errors.push(`catalog.json: wrong URLs for ${provider.id}`);
  }
}

const robots = await readFile(new URL('robots.txt', dist), 'utf8');
for (const agent of ['OAI-SearchBot', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'Google-Extended']) {
  if (!robots.includes(`User-agent: ${agent}`)) errors.push(`robots.txt: missing ${agent} policy`);
}
if (!robots.includes(`Sitemap: ${siteRoot}sitemap.xml`)) errors.push('robots.txt: wrong sitemap URL');
const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (locations.some((location) => !location.startsWith(siteRoot))) errors.push('sitemap.xml: URL escapes site root');
if (locations.some((location) => /\/(?:api|search)\//.test(new URL(location).pathname))) errors.push('sitemap.xml: machine or noindex route included');
for (const slug of providerSlugs) {
  if (!locations.includes(`${siteRoot}apis/${slug}/`)) errors.push(`sitemap.xml: missing provider ${slug}`);
}
if (new Set(locations).size !== locations.length) errors.push('sitemap.xml: duplicate canonical URLs');
for (const slug of guideSlugs) {
  if (!locations.includes(`${siteRoot}guides/${slug}/`)) errors.push(`sitemap.xml: missing guide ${slug}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log(`Distribution verification passed: ${required.length} required outputs and ${htmlFiles.length} HTML pages checked at ${siteRoot}.`);
