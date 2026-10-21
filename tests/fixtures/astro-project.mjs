import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Create an Astro project whose writable state stays outside shared dependencies.
 * @param {string} prefix
 * @param {{ site?: string, base?: string }} [options]
 */
export async function createAstroProject(prefix, {
  site = process.env.SITE_URL ?? 'https://api-atlas.pages.dev',
  base = process.env.BASE_PATH ?? '/',
} = {}) {
  const repository = fileURLToPath(new URL('../../', import.meta.url));
  const root = await mkdtemp(join(tmpdir(), prefix));
  const outDir = join(root, 'dist');
  const cacheDir = join(root, '.fixture-cache/astro');
  const viteCacheDir = join(root, '.fixture-cache/vite');
  try {
    for (const directory of [outDir, cacheDir, viteCacheDir, join(root, '.astro')]) await mkdir(directory, { recursive: true });
    await symlink(join(repository, 'node_modules'), join(root, 'node_modules'), 'junction');
    await writeFile(join(root, 'package.json'), '{"type":"module"}\n');
    await writeFile(join(root, 'astro.config.mjs'), `
import { defineConfig } from 'astro/config';
import { readdirSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const paths = ${JSON.stringify({ root, outDir, cacheDir, site, base })};
const resolved = (value) => realpathSync(value instanceof URL ? fileURLToPath(value) : value);
export default defineConfig({
  ...paths,
  output: 'static',
  vite: {
    cacheDir: ${JSON.stringify(viteCacheDir)},
    plugins: [{ name: 'fixture-paths', configResolved(config) {
      console.error('[astro-fixture-vite] ' + JSON.stringify({ root: resolved(config.root), cacheDir: resolved(config.cacheDir) }));
    } }],
  },
  integrations: [{ name: 'fixture-paths', hooks: {
    'astro:config:done': ({ config }) => {
      const root = resolved(config.root);
      const sourceIDs = readdirSync(new URL('src/data/', config.root), { recursive: true }).filter((path) => path.endsWith('.md')).sort();
      console.error('[astro-fixture-paths] ' + JSON.stringify({
        root, cwd: realpathSync(process.cwd()), outDir: resolved(config.outDir), cacheDir: resolved(config.cacheDir),
        contentStore: fileURLToPath(new URL('data-store.json', config.cacheDir)),
        dotAstroDir: resolved(new URL('.astro/', config.root)), site: config.site, base: config.base, sourceIDs,
      }));
    },
  } }],
});
`);
    const astro = JSON.parse(await readFile(join(repository, 'node_modules/astro/package.json'), 'utf8'));
    return { root, repository, outDir, cacheDir, viteCacheDir, site, base, cli: join(repository, 'node_modules/astro', astro.bin.astro) };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}
