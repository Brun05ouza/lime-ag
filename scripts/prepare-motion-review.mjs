import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
const root = 'artifacts/motion-preview';
await mkdir(root, { recursive: true });
await cp('dist', root, { recursive: true });
const force = (q) =>
  q
    .replace(/\(prefers-reduced-motion:\s*reduce\)/g, '(max-width:0px)')
    .replace(/\(prefers-reduced-motion:\s*no-preference\)/g, '(min-width:0px)');
for (const f of await readdir(root + '/_astro'))
  if (f.endsWith('.css'))
    await writeFile(root + '/_astro/' + f, force(await readFile(root + '/_astro/' + f, 'utf8')));
const html = await readFile('dist/index.html', 'utf8');
const script = `<script>const nativeMatchMedia=window.matchMedia.bind(window);window.matchMedia=query=>nativeMatchMedia(query.replace(/\\(prefers-reduced-motion:\\s*reduce\\)/g,'(max-width:0px)').replace(/\\(prefers-reduced-motion:\\s*no-preference\\)/g,'(min-width:0px)'));</script>`;
await writeFile(root + '/index.html', html.replace('<head>', '<head>' + script));
await writeFile(root + '/no-js.html', html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''));
console.log('Independent full-motion review in ' + root);
