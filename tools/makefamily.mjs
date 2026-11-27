// Saves assets/family/<id>.glb for the people without a scan, and writes their bind data to js/xmas/procbinds.js.
// usage: LIB=<dir with three-0.170.0/package> node tools/makefamily.mjs   (three.js is served from there, not the CDN)
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright'); import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), LIB = process.env.LIB;
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); r.end(d); }); });
await new Promise(r => srv.listen(0, r));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const pg = await b.newPage();
pg.on('pageerror', e => console.log('PAGEERR', e.message));
await pg.route('https://cdn.jsdelivr.net/**', (rt) => { const m = rt.request().url().match(/three@0\.170\.0\/(.*)$/); return m ? rt.fulfill({ path: LIB + '/three-0.170.0/package/' + m[1], contentType: 'text/javascript' }) : rt.abort(); });
await pg.goto(`http://localhost:${srv.address().port}/tools/makefamily.html`); await pg.waitForFunction(() => document.title === 'ready', null, { timeout: 120000 });
const fam = await pg.evaluate(() => window.FAMILY); const binds = {};
for (const [id, f] of Object.entries(fam)) { fs.writeFileSync(path.join(root, 'assets/family', id + '.glb'), Buffer.from(f.glb, 'base64')); binds[id] = { h: f.h, bind: f.bind }; console.log(id, f.tris, 'tris'); }
fs.mkdirSync(path.join(root, 'js/xmas'), { recursive: true });
fs.writeFileSync(path.join(root, 'js/xmas/procbinds.js'), '// made by tools/makefamily.mjs: the joints of the procedural people (metres, facing +Z)\nexport const PROC_BINDS = ' + JSON.stringify(binds, null, 1) + ';\n');
await b.close(); srv.close();
