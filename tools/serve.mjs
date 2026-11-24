// Dev-only static server that mimics GitHub Pages: serves this folder under /sanskriti/ and uses 404.html.
// Run: node tools/serve.mjs  → http://localhost:4173/sanskriti/
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain' };
export function serve(port = 4173) {
  const server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/sanskriti') { res.writeHead(301, { location: '/sanskriti/' }); return res.end(); }
    if (!path.startsWith('/sanskriti/')) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
    path = path.slice('/sanskriti/'.length) || 'index.html';
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(root, path));
    if (!file.startsWith(root) || /(^|\/)\.git(\/|$)/.test(path)) { res.writeHead(403); return res.end(); }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': types['.html'] });
      res.end(await readFile(join(root, '404.html')));
    }
  });
  return new Promise(r => server.listen(port, '127.0.0.1', () => r(server)));
}
if (import.meta.url === `file://${process.argv[1]}`) serve().then(() => console.log('http://localhost:4173/sanskriti/'));
