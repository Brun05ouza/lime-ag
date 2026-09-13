import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? walk(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    ),
  );
  return files.flat();
}
const files = await walk(root);
const pages = files.filter((file) => file.endsWith('.html'));
const reports = [];
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const relative = path.relative(root, file).replaceAll('\\', '/');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `H1: ${relative}`);
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/(?!localhost)[^"]+"/);
  assert.match(html, /<meta property="og:image"/);
  assert.match(html, /<html lang="pt-BR"/);
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const [pathname, fragment] = href.split('#');
    let target = path.join(root, decodeURIComponent(pathname.split('?')[0]));
    if (pathname.endsWith('/')) target = path.join(target, 'index.html');
    assert.ok(files.includes(target), `Missing asset/link ${href} in ${relative}`);
    if (fragment && target.endsWith('.html')) {
      assert.ok(
        (await readFile(target, 'utf8')).includes(`id="${fragment}"`),
        `Missing anchor ${href}`,
      );
    }
  }
  reports.push({
    page: relative,
    bytes: Buffer.byteLength(html),
    h1: 1,
    localLinks: 'pass',
    metadata: 'pass',
  });
}
const home = await readFile(path.join(root, 'index.html'), 'utf8');
for (const value of ['30+', '50+', '40+', '20+', '05+', '100M+', '5M+', '1.5M+', '400K+'])
  assert.ok(home.includes(value));
for (const name of ['Carol Melo', 'Julia Lima', 'Comunicação', 'Performance', 'Inteligência'])
  assert.ok(home.includes(name));
assert.ok(home.includes('aria-expanded="true"'), 'Services are expanded in initial HTML');
for (const asset of [
  'og/default.jpg',
  'robots.txt',
  'sitemap.xml',
  'sitemap-index.xml',
  'sitemap-0.xml',
])
  assert.ok((await stat(path.join(root, asset))).size > 0);
const images = await Promise.all(
  files
    .filter((file) => /\.(avif|webp)$/.test(file))
    .map(async (file) => ({ name: path.basename(file), bytes: (await stat(file)).size })),
);
await mkdir('artifacts', { recursive: true });
await writeFile(
  'artifacts/build-audit.json',
  JSON.stringify({ pages: reports, images, status: 'passed' }, null, 2),
);
console.log(
  `Passed: ${pages.length} pages, local links/assets, metadata, initial content, ${images.length} optimized images.`,
);
