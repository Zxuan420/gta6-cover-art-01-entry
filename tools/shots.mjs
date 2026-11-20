import { createServer } from 'node:http';
import { createReadStream, statSync, mkdirSync, unlinkSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join, normalize, sep, extname } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const root = resolve('./app');
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(root, normalize(pathname)));
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  try {
    const stats = statSync(file);
    if (!stats.isFile()) throw new Error();
    const ext = extname(file).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.js' || ext === '.mjs') contentType = 'text/javascript';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.ttf') contentType = 'font/ttf';

    res.writeHead(200, {
      'content-type': contentType,
      'cache-control': 'no-store'
    });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404).end('not found');
  }
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Server running at ${baseUrl}`);

  const shots = JSON.parse(readFileSync('./shots.json', 'utf8'));
  const chromePath = `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell`;

  mkdirSync('./screenshots', { recursive: true });
  mkdirSync('./out/screenshots', { recursive: true });

  const targetSizes = {
    '1-cover.jpg': [1280, 720],
    '2-editor.jpg': [1280, 720],
    '3-cover-square.jpg': [1024, 1024],
    '4-cover-tall.jpg': [1024, 1280]
  };

  for (const shot of shots) {
    const url = `${baseUrl}/index.html${shot.query || ''}`;
    const tmpPng = `./${shot.name.replace('.jpg', '.png')}`;
    if (existsSync(tmpPng)) unlinkSync(tmpPng);

    const cmd = `"${chromePath}" --headless --disable-gpu --no-sandbox --disable-dev-shm-usage --use-gl=swiftshader --hide-scrollbars --screenshot="${tmpPng}" --window-size=${shot.w},${shot.h} --virtual-time-budget=10000 "${url}"`;
    console.log(`Capturing ${shot.name}...`);
    try {
      await execAsync(cmd, { timeout: 15000 });
    } catch (err) {
      if (!existsSync(tmpPng)) {
        console.error(`Error capturing ${shot.name}:`, err);
        continue;
      }
    }

    if (!existsSync(tmpPng)) {
      console.error(`Screenshot file ${tmpPng} was not created.`);
      continue;
    }

    const [tw, th] = targetSizes[shot.name] || [1280, 720];
    const pyCmd = `python3 -c "
from PIL import Image
import os

img = Image.open('${tmpPng}').convert('RGB')
img = img.resize((${tw}, ${th}), Image.Resampling.LANCZOS)

out_paths = ['./screenshots/${shot.name}', './out/screenshots/${shot.name}']
quality = 82
while quality > 10:
    for op in out_paths:
        img.save(op, 'JPEG', quality=quality)
    sizes = [os.path.getsize(op) for op in out_paths]
    if all(s <= 256 * 1024 for s in sizes):
        break
    quality -= 5
print('Saved ${shot.name} with quality', quality, 'sizes:', [os.path.getsize(op) for op in out_paths])
"`;
    try {
      await execAsync(pyCmd);
      unlinkSync(tmpPng);
    } catch (err) {
      console.error(`Error converting ${shot.name}:`, err);
    }
  }

  server.close();
  console.log('All screenshots captured and converted successfully.');
});
