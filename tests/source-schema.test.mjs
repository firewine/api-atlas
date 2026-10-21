import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { stripVTControlCharacters } from 'node:util';
import { createAstroProject } from './fixtures/astro-project.mjs';

test('Astro rejects undeclared source provenance during source sync, before any build', async () => {
  const { root: directory, repository, cli } = await createAstroProject('atlas-source-contract-');
  try {
    await mkdir(join(directory, 'src/lib'), { recursive: true });
    await mkdir(join(directory, 'src/data/apis'), { recursive: true });
    await mkdir(join(directory, 'src/data/guides'), { recursive: true });
    await mkdir(join(directory, 'src/data/comparisons'), { recursive: true });
    await copyFile(join(repository, 'src/content.config.ts'), join(directory, 'src/content.config.ts'));
    await copyFile(join(repository, 'src/lib/provider-provenance.mjs'), join(directory, 'src/lib/provider-provenance.mjs'));
    await copyFile(join(repository, 'src/lib/case-study.mjs'), join(directory, 'src/lib/case-study.mjs'));
    await copyFile(join(repository, 'src/lib/translation-schema.mjs'), join(directory, 'src/lib/translation-schema.mjs'));
    const source = await readFile(join(repository, 'src/data/apis/financial-modeling-prep.md'), 'utf8');
    const fixture = join(directory, 'src/data/apis/fixture.md');
    await writeFile(fixture, source);
    const run = () => spawnSync(process.execPath, [cli, 'sync', '--root', directory], {
      cwd: directory, encoding: 'utf8', timeout: 30000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', FORCE_COLOR: '1' },
    });
    const valid = run();
    assert.ifError(valid.error);
    assert.equal(valid.status, 0, valid.stdout + valid.stderr);
    const invalid = source.replace(/sourceUrl: "[^"]+"/, 'sourceUrl: "https://example.com/undeclared-contract-proof"');
    assert.notEqual(invalid, source);
    await writeFile(fixture, invalid);
    const rejected = run();
    assert.ifError(rejected.error);
    assert.equal(rejected.status, 1, rejected.stdout + rejected.stderr);
    assert.match(stripVTControlCharacters(rejected.stdout + rejected.stderr), /Fact source is not declared in sourceUrls: https:\/\/example.com\/undeclared-contract-proof/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
