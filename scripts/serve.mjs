import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/plain' };
http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    let name = decodeURIComponent(url.pathname);
    if (name === '/') name = '/examples/index.html';
    if (name.split('/').some(part => part.startsWith('.')) || !types[path.extname(name)] || !['GET', 'HEAD'].includes(request.method)) throw Error();
    const filename = path.resolve(root, `.${name}`);
    if (!filename.startsWith(root)) throw Error();
    const data = await readFile(filename);
    response.writeHead(200, { 'Content-Type': `${types[path.extname(name)]}; charset=utf-8`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`WebMCPLite examples: http://127.0.0.1:${port}`));
