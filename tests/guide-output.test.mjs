import assert from 'node:assert/strict';
import { test } from 'node:test';
import { guideOutputIssues, hasDescriptiveLink } from '../scripts/guide-output.mjs';
import { caseRecipe } from './fixtures/case-recipe.mjs';

test('built HTML checks visible SEO, body structure, technical details and structured-data parity', () => {
  const { sections, ...guide } = caseRecipe(); guide.slug = guide.caseStudy.slug; guide.body = '';
  const canonical = 'https://getbeta.app/api-atlas/guides/fixture-empty-page/';
  const schema = [{ '@type': 'TechArticle', headline: guide.title, description: guide.description,
    dateModified: guide.updatedAt, mainEntityOfPage: canonical, author: { '@type': 'Person', name: guide.caseStudy.review.author }, citation: guide.caseStudy.evidence.map((e) => e.url) }];
  const html = `<title>${guide.title} · API Atlas</title><meta name="description" content="${guide.description}"><link rel="canonical" href="${canonical}"><h1>${guide.h1}</h1><p class="lede">${guide.summary}</p><span data-guide-author>${guide.caseStudy.review.author}</span><time datetime="${guide.updatedAt}">${guide.updatedAt}</time><div data-guide-body><h2>Symptoms</h2><p>Symptoms</p><h2>Cause</h2><p>Cause</p><h2>Safe resolution</h2><pre><code>empty_page</code></pre><h2>Verification</h2><p>${guide.caseStudy.verification.note}</p><h2>Limitations</h2><p>Limitations</p></div><script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  assert.deepEqual(guideOutputIssues(guide, html, canonical), []);
  for (const [old, replacement, message] of [
    ['<title>', '<invalid-title>', 'title'],
    ['name="description"', 'name="invalid"', 'description'],
    ['<h1>', '<h1>wrong ', 'H1'],
    ['class="lede"', 'class="missing"', 'summary'],
    ['rel="canonical"', 'rel="invalid"', 'canonical'],
    ['<h2>Symptoms</h2>', '<h2>Cause</h2>', 'sections'],
    ['<pre>', '<div>', 'code'],
    ['<code>empty_page', '<code>invented', 'technical'],
    ['<span data-guide-author>', '<span data-guide-author>Other ', 'author'],
    ['"dateModified":"2026-10-15"', '"dateModified":"2026-10-16"', 'date'],
  ]) {
    const changed = html.replace(old, replacement);
    assert.notEqual(changed, html);
    assert.ok(guideOutputIssues(guide, changed, canonical).some((error) => error.toLowerCase().includes(message.toLowerCase())), message);
  }
  assert.equal(hasDescriptiveLink('<a href="/api-atlas/guides/test/">EODHD 배당 누락과 캐시 갱신 해결 사례</a>', '/api-atlas/guides/test/', 'EODHD 배당 누락'), true);
  assert.equal(hasDescriptiveLink('<a href="/guides/test/">여기</a>', '/api-atlas/guides/test/', 'EODHD 배당 누락'), false);
});
