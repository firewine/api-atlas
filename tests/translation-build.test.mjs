import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { stripVTControlCharacters } from 'node:util';
import { sourceRevision } from '../src/lib/translation-schema.mjs';
import { koreanGuidePair, markdown } from './fixtures/korean-overlay.mjs';
import { createAstroProject } from './fixtures/astro-project.mjs';

test('Astro resolves overlays, safely renders breadcrumb labels and rejects invalid source inheritance', async () => {
  const { root, repository, cli, site, base } = await createAstroProject('atlas-korean-build-');
  const guide = koreanGuidePair();
  try {
    for (const path of ['src/lib', 'src/pages', 'src/components', ...['apis', 'guides', 'comparisons'].flatMap((kind) => [`src/data/${kind}`, `src/data/ko/${kind}`])]) await mkdir(join(root, path), { recursive: true });
    for (const path of ['src/content.config.ts', 'src/components/Breadcrumbs.astro', 'src/lib/case-study.mjs', 'src/lib/provider-provenance.mjs', 'src/lib/translation-schema.mjs', 'src/lib/translations.ts']) await copyFile(join(repository, path), join(root, path));
    await writeFile(join(root, 'src/pages/index.astro'), `---
import { getCollection } from 'astro:content';
import { getKoreanApis, getKoreanGuides, getKoreanComparisons } from '../lib/translations';
import Breadcrumbs from '../components/Breadcrumbs.astro';
const sourceIDs = Object.fromEntries(await Promise.all(['apis', 'guides', 'comparisons'].map(async (kind) => [kind, (await getCollection(kind)).map((entry) => entry.id).sort()])));
console.error('[astro-fixture-collections] ' + JSON.stringify(sourceIDs));
const entries = await Promise.all([getKoreanGuides(), getKoreanApis(), getKoreanComparisons()]);
const base = import.meta.env.BASE_URL.replace(/\\/$/, '');
const guideLink = base + '/ko/guides/' + entries[0][0].source.id + '/';
const providerLink = base + '/ko/apis/' + entries[1][0].source.id + '/';
---
<html><body><Breadcrumbs lang="ko" items={[{label: entries[0][0].translation.data.title, href: guideLink}]} /><p id="counts">{entries.map((items) => items.length).join(',')}</p><p id="provider-ids">{sourceIDs.apis.join(',')}</p><a id="provider-link" href={providerLink}>Provider</a></body></html>
`);
    const originalGuidePath = join(root, `src/data/guides/${guide.source.id}.md`);
    const overlayGuidePath = join(root, `src/data/ko/guides/${guide.source.id}.md`);
    await writeFile(originalGuidePath, guide.source.bytes);
    const closingScriptLabel = '한글 </script><script>0</script> 제목';
    await writeFile(overlayGuidePath, markdown({ ...guide.translation.data, title: closingScriptLabel, h1: closingScriptLabel }, guide.translation.body));
    const { verificationNote, linkLabel, ...display } = guide.translation.data;
    const apiBytes = await readFile(join(repository, 'src/data/apis/openai.md'));
    const comparisonId = 'fsc-data-go-kr-vs-bok-ecos';
    const comparisonBytes = await readFile(join(repository, `src/data/comparisons/${comparisonId}.md`));
    const overlays = [
      ['apis', 'openai', apiBytes], ['comparisons', comparisonId, comparisonBytes],
    ];
    for (const [kind, id, bytes] of overlays) {
      await writeFile(join(root, `src/data/${kind}/${id}.md`), bytes);
      await writeFile(join(root, `src/data/ko/${kind}/${id}.md`), markdown({ ...display, sourceId: id, sourceRevision: sourceRevision(bytes), translationReviewedAt: '2026-10-21' }, '한국어 설명입니다. 원문 확인 범위를 유지합니다.'));
    }
    const run = () => {
      const result = spawnSync(process.execPath, [cli, 'build', '--root', root], {
        cwd: root, encoding: 'utf8', timeout: 60000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      });
      assert.ifError(result.error);
      return { status: result.status, output: stripVTControlCharacters(result.stdout + result.stderr) };
    };
    const valid = run();
    assert.equal(valid.status, 0, valid.output);
    const html = await readFile(join(root, 'dist/index.html'), 'utf8');
    assert.match(html, /id="counts">1,1,1<\/p>/);
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 1, 'translation text cannot create an executable script');
    assert.equal(JSON.parse(scripts[0][1]).itemListElement[0].name, closingScriptLabel);
    assert.match(html, /\\u003c\/script>/);
    const basePath = base.replace(/\/$/, '');
    const guideLink = `${basePath}/ko/guides/${guide.source.id}/`;
    assert.equal(JSON.parse(scripts[0][1]).itemListElement[0].item, new URL(guideLink, site).href);
    assert.equal(html.match(/<a href="([^"]+)"/)[1], guideLink);
    assert.equal(html.match(/<a id="provider-link" href="([^"]+)"/)[1], `${basePath}/ko/apis/openai/`);
    assert.match(html, /id="provider-ids">openai<\/p>/);
    await writeFile(overlayGuidePath, markdown(guide.translation.data, guide.translation.body));
    const rejected = (pattern) => { const result = run(); assert.equal(result.status, 1, result.output); assert.match(result.output, pattern); };
    await writeFile(originalGuidePath, Buffer.concat([guide.source.bytes, Buffer.from('\n')]));
    rejected(/Stale sourceRevision/);
    await writeFile(originalGuidePath, guide.source.bytes);
    await rm(originalGuidePath);
    rejected(/Missing original source/);
    await writeFile(originalGuidePath, guide.source.bytes);
    const { verificationNote: note, ...missingNote } = guide.translation.data;
    await writeFile(overlayGuidePath, markdown(missingNote, guide.translation.body));
    rejected(/requires verificationNote/);
    await writeFile(overlayGuidePath, markdown(guide.translation.data, guide.translation.body));
    const alias = join(root, 'src/data/ko/guides/alias.md');
    await writeFile(alias, markdown(guide.translation.data, guide.translation.body));
    rejected(/Duplicate translation sourceId/);
    await rm(alias);
    const comparisonPath = join(root, `src/data/comparisons/${comparisonId}.md`);
    await writeFile(comparisonPath, Buffer.concat([comparisonBytes, Buffer.from('\n')]));
    rejected(/Stale sourceRevision/);
    await writeFile(comparisonPath, comparisonBytes);
    await writeFile(overlayGuidePath, markdown({ ...guide.translation.data, caseStudy: guide.source.data.caseStudy }, guide.translation.body));
    rejected(/Unrecognized key.*caseStudy/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
