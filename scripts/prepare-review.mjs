// Temporary review copies of the production HTML. Rebuilding removes these files.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const html = await readFile('dist/index.html', 'utf8');
await mkdir('dist/__review', { recursive: true });
const noScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
await writeFile('dist/__review/no-js.html', noScripts);
const reduced = `<script>const nativeMatchMedia=window.matchMedia.bind(window);window.matchMedia=(query)=>nativeMatchMedia(query.includes('prefers-reduced-motion: reduce')?'(min-width: 0px)':query.includes('prefers-reduced-motion: no-preference')?'not all':query);</script><style>html{scroll-behavior:auto!important}*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}.cursor{display:none!important}</style>`;
await writeFile('dist/__review/reduced.html', html.replace('<head>', `<head>${reduced}`));
const metrics = `<script>
let cls=0;
new PerformanceObserver(list=>{for(const e of list.getEntries())console.info('LIME-QA LCP',Math.round(e.startTime),e.element?.textContent?.trim().slice(0,80))}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)cls+=e.value;console.info('LIME-QA CLS',cls)}).observe({type:'layout-shift',buffered:true});
new PerformanceObserver(list=>{for(const e of list.getEntries())console.info('LIME-QA interaction duration',e.duration)}).observe({type:'event',buffered:true,durationThreshold:16});
</script>`;
await writeFile('dist/__review/metrics.html', html.replace('</head>', `${metrics}</head>`));
console.log('Created temporary no-script, simulated-reduced-motion and performance review pages.');
