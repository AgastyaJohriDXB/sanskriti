// Dev-only: renders PNG favicons and the 1200x630 share image with the pre-installed Playwright Chromium.
// Run: node tools/make-icons.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../', import.meta.url);
const fav = readFileSync(new URL('assets/icons/favicon.svg', root), 'utf8');
const font = f => readFileSync(new URL(`assets/fonts/${f}`, root)).toString('base64');
const b = await chromium.launch();
const p = await b.newPage();
for (const [size, file] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<style>body{margin:0}</style>${fav.replace('<svg ', `<svg width="${size}" height="${size}" `)}`);
  await p.screenshot({ path: new URL(`assets/icons/${file}`, root).pathname, omitBackground: true });
}
const art = id => readFileSync(new URL(`assets/img/skills/${id}.svg`, root), 'utf8').replace('<svg ', '<svg width="100%" height="100%" ');
await p.setViewportSize({ width: 1200, height: 630 });
await p.setContent(`<style>
@font-face{font-family:C;src:url(data:font/woff2;base64,${font('cormorant-garamond-latin-600-normal.woff2')})}
@font-face{font-family:CI;src:url(data:font/woff2;base64,${font('cormorant-garamond-latin-600-italic.woff2')})}
@font-face{font-family:I;src:url(data:font/woff2;base64,${font('inter-latin-600-normal.woff2')})}
body{margin:0;width:1200px;height:630px;background:#0F4A37;color:#fff;font-family:I;display:flex;align-items:center;gap:40px;padding:0 70px;box-sizing:border-box}
h1{font:600 82px/1.05 C;margin:20px 0}em{font-family:CI;color:#E9C55A}
.w{letter-spacing:.35em;font-size:28px}.t{letter-spacing:.25em;color:#E9C55A;font-size:16px}
.a{display:flex;gap:16px;align-items:end}.a div{width:120px;border-radius:999px 999px 10px 10px;overflow:hidden;border:4px solid #C49A24}
</style><div><div class="w">SANSKRITI</div><div class="t">INDIA'S LIVING TRADITIONS</div><h1>Discover the Art of <em>India's</em> Traditions</h1><div class="t">DISCOVER · LEARN · FIND · EXPERIENCE</div></div>
<div class="a"><div style="height:300px">${art('terracotta')}</div><div style="height:380px">${art('madhubani')}</div><div style="height:300px">${art('sitar-tabla')}</div></div>`);
await p.waitForTimeout(300);
await p.screenshot({ path: new URL('assets/img/share.png', root).pathname });
await b.close();
console.log('icons + share image written');
