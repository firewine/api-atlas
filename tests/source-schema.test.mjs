import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { stripVTControlCharacters } from 'node:util';

test('Astro rejects undeclared source provenance during source sync, before any build', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'atlas-source-contract-'));
  const repository = fileURLToPath(new URL('../', import.meta.url));
  try {
    await mkdir(join(directory, 'src/lib'), { recursive: true });
    await mkdir(join(directory, 'src/data/apis'), { recursive: true });
    await mkdir(join(directory, 'src/data/guides'), { recursive: true });
    await mkdir(join(directory, 'src/data/comparisons'), { recursive: true });
    await symlink(join(repository, 'node_modules'), join(directory, 'node_modules'), 'junction');
    await copyFile(join(repository, 'src/content.config.ts'), join(directory, 'src/content.config.ts'));
    await copyFile(join(repository, 'src/lib/provider-provenance.mjs'), join(directory, 'src/lib/provider-provenance.mjs'));
    await writeFile(join(directory, 'package.json'), '{"type":"module"}\n');
    const source = await readFile(join(repository, 'src/data/apis/financial-modeling-prep.md'), 'utf8');
    const fixture = join(directory, 'src/data/apis/fixture.md');
    await writeFile(fixture, source);
    const astroPackage = JSON.parse(await readFile(join(repository, 'node_modules/astro/package.json'), 'utf8'));
    const cli = join(repository, 'node_modules/astro', astroPackage.bin.astro);
    const run = () => spawnSync(process.execPath, [cli, 'sync', '--root', directory], {
      encoding: 'utf8', timeout: 30000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', FORCE_COLOR: '1' },
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
