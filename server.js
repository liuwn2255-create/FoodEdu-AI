import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const requested = normalize(join(root, pathname === '/' ? 'index.html' : pathname));
  if (!requested.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const info = await stat(requested);
    const file = info.isDirectory() ? join(requested, 'index.html') : requested;
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('找不到此頁面');
  }
}).listen(port, () => console.log(`FoodEdu AI 已啟動：http://localhost:${port}`));
