import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { copyFile, mkdir, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { stripVTControlCharacters } from 'node:util';
import { createAstroProject } from './fixtures/astro-project.mjs';

/** @param {Awaited<ReturnType<typeof createAstroProject>>} project */
function build(project) {
  const started = performance.now();
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [project.cli, 'build', '--root', project.root], {
      cwd: project.root, timeout: 60000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    });
    let output = '';
    child.stdout.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
    child.stderr.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
    child.once('error', reject);
    child.once('close', (status, signal) => resolve({ status, signal, output: stripVTControlCharacters(output), started, finished: performance.now(), pid: child.pid }));
  });
}

test('three parallel Astro projects retain only their own provider IDs across rebuilds', async (context) => {
  const projects = [];
  try {
    for (let index = 0; index < 3; index++) {
      const project = await createAstroProject(`atlas-parallel-${index}-`);
      projects.push(project);
      for (const path of ['src/lib', 'src/pages', ...['apis', 'guides', 'comparisons'].flatMap((kind) => [`src/data/${kind}`, `src/data/ko/${kind}`])]) await mkdir(join(project.root, path), { recursive: true });
      for (const path of ['src/content.config.ts', 'src/lib/case-study.mjs', 'src/lib/provider-provenance.mjs', 'src/lib/translation-schema.mjs']) await copyFile(join(project.repository, path), join(project.root, path));
      await writeFile(join(project.root, 'src/pages/providers.json.ts'), `
import { getCollection } from 'astro:content';
export async function GET() {
  const ids = (await getCollection('apis')).map((entry) => entry.id).sort();
  console.error('[astro-fixture-collections] ' + JSON.stringify({ apis: ids }));
  return new Response(JSON.stringify({ ids, site: import.meta.env.SITE, base: import.meta.env.BASE_URL }));
}
`);
    }
    for (const round of ['first', 'second']) {
      for (const [index, project] of projects.entries()) {
        if (round === 'second') await rm(join(project.root, `src/data/apis/provider-${index}-first.md`));
        await copyFile(join(project.repository, 'src/data/apis/openai.md'), join(project.root, `src/data/apis/provider-${index}-${round}.md`));
      }
      const results = await Promise.allSettled(projects.map(build));
      const runs = results.map((result) => {
        assert.equal(result.status, 'fulfilled', result.status === 'rejected' ? String(result.reason) : '');
        return result.value;
      });
      assert.ok(Math.max(...runs.map((run) => run.started)) < Math.min(...runs.map((run) => run.finished)), 'all three native build subprocesses must overlap');
      for (const [index, project] of projects.entries()) {
        const run = runs[index];
        assert.equal(run.status, 0, run.output);
        assert.equal(run.signal, null, run.output);
        const catalog = JSON.parse(await readFile(join(project.outDir, 'providers.json'), 'utf8'));
        assert.deepEqual(catalog, { ids: [`provider-${index}-${round}`], site: project.site, base: project.base }, run.output);
        const pathsLine = run.output.match(/^\[astro-fixture-paths\] (.+)$/m);
        assert.notEqual(pathsLine, null, run.output);
        const paths = JSON.parse(pathsLine[1]);
        assert.deepEqual(paths, {
          root: project.root, cwd: project.root, outDir: project.outDir, cacheDir: project.cacheDir,
          contentStore: join(project.cacheDir, 'data-store.json'), dotAstroDir: join(project.root, '.astro'),
          site: project.site, base: project.base, sourceIDs: [`apis/provider-${index}-${round}.md`],
        }, run.output);
        const vitePaths = [...run.output.matchAll(/^\[astro-fixture-vite\] (.+)$/gm)].map((match) => JSON.parse(match[1]));
        assert.ok(vitePaths.length > 0, run.output);
        for (const paths of vitePaths) assert.deepEqual(paths, { root: project.root, cacheDir: project.viteCacheDir }, run.output);
        assert.equal(await realpath(join(project.cacheDir, 'data-store.json')), join(project.cacheDir, 'data-store.json'));
        assert.equal((await stat(join(project.root, '.astro/content.d.ts'))).isFile(), true);
        context.diagnostic(JSON.stringify({ round, pid: run.pid, root: project.root, cacheDir: paths.cacheDir, viteCacheDir: project.viteCacheDir, ...catalog }));
      }
    }
  } finally {
    await Promise.all(projects.map((project) => rm(project.root, { recursive: true, force: true })));
  }
});
