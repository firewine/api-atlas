import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { stripVTControlCharacters } from 'node:util';
import { sourceRevision } from '../src/lib/translation-schema.mjs';
import { koreanGuidePair, markdown } from './fixtures/korean-overlay.mjs';

test('Astro resolves overlays, safely renders breadcrumb labels and rejects invalid source inheritance', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atlas-korean-build-'));
  const repository = fileURLToPath(new URL('../', import.meta.url));
  const guide = koreanGuidePair();
  try {
    for (const path of ['src/lib', 'src/pages', 'src/components', ...['apis', 'guides', 'comparisons'].flatMap((kind) => [`src/data/${kind}`, `src/data/ko/${kind}`])]) await mkdir(join(root, path), { recursive: true });
    await symlink(join(repository, 'node_modules'), join(root, 'node_modules'), 'junction');
    for (const path of ['src/content.config.ts', 'src/components/Breadcrumbs.astro', 'src/lib/case-study.mjs', 'src/lib/provider-provenance.mjs', 'src/lib/translation-schema.mjs', 'src/lib/translations.ts']) await copyFile(join(repository, path), join(root, path));
    await writeFile(join(root, 'package.json'), '{"type":"module"}\n');
    await writeFile(join(root, 'src/pages/index.astro'), `---\nimport { getKoreanApis, getKoreanGuides, getKoreanComparisons } from '../lib/translations';\nimport Breadcrumbs from '../components/Breadcrumbs.astro';\nconst entries = await Promise.all([getKoreanGuides(), getKoreanApis(), getKoreanComparisons()]);\n---\n<html><body><Breadcrumbs lang="ko" items={[{label: entries[0][0].translation.data.title}]} /><p id="counts">{entries.map((items) => items.length).join(',')}</p></body></html>\n`);
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
    const astro = JSON.parse(await readFile(join(repository, 'node_modules/astro/package.json'), 'utf8'));
    const run = () => {
      const result = spawnSync(process.execPath, [join(repository, 'node_modules/astro', astro.bin.astro), 'build'], {
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
