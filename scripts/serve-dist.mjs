// @ts-check
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const basePath = process.env.BASE_PATH ?? '/';
if (!/^\/(?:[^/]+\/)*$/.test(basePath)) throw new Error(`Invalid BASE_PATH: ${basePath}`);
const prefix = basePath === '/' ? '' : basePath.slice(0, -1);
const types = new Map([
  ['.html', 'text/html'], ['.js', 'text/javascript'], ['.css', 'text/css'],
  ['.json', 'application/json'], ['.svg', 'image/svg+xml'], ['.txt', 'text/plain'],
  ['.xml', 'application/xml'], ['.webmanifest', 'application/manifest+json'],
]);

/** @param {import('node:http').IncomingMessage} request @param {import('node:http').ServerResponse} response */
async function serve(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405).end('Method not allowed'); return; }
  const url = new URL(request.url ?? '/', 'http://127.0.0.1:4173');
  if (prefix && url.pathname === prefix) { response.writeHead(308, { Location: `${basePath}${url.search}` }).end(); return; }
  if (!url.pathname.startsWith(`${prefix}/`)) { response.writeHead(404).end('Not found'); return; }
  const path = resolve(directory, `.${decodeURIComponent(url.pathname.slice(prefix.length))}`);
  if (path !== directory && !path.startsWith(`${directory}${sep}`)) { response.writeHead(404).end('Not found'); return; }
  const info = await stat(path);
  if (info.isDirectory() && !url.pathname.endsWith('/')) {
    response.writeHead(308, { Location: `${url.pathname}/${url.search}` }).end();
    return;
  }
  const file = info.isDirectory() ? resolve(path, 'index.html') : path;
  const body = await readFile(file);
  response.writeHead(200, { 'Content-Type': types.get(extname(file)) ?? 'application/octet-stream' });
  response.end(request.method === 'HEAD' ? undefined : body);
}

const server = createServer((request, response) => {
  serve(request, response).catch((error) => {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') { response.writeHead(404).end('Not found'); return; }
    console.error('Static test server request failed', error);
    response.writeHead(500).end('Internal server error');
  });
});
server.listen(4173, '127.0.0.1', () => console.log(`Serving built site at http://127.0.0.1:4173${basePath}`));
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
