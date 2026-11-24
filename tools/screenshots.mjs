// Dev-only: saves screenshots of key pages at 360/768/1024/1440 into docs/screenshots/.
// Start `node tools/serve.mjs` first, then run: node tools/screenshots.mjs
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const out = new URL('../docs/screenshots/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const pages = ['index', 'issue', 'impact', 'solutions', 'skills', 'quiz', 'experiences', 'about'];
const b = await chromium.launch();
for (const w of [360, 768, 1024, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  for (const pg of pages) {
    await p.goto(`http://127.0.0.1:4173/sanskriti/${pg}.html`); await p.waitForLoadState('networkidle');
    await p.screenshot({ path: `${out}${pg}-${w}.png`, type: 'png' });
  }
  await p.close();
}
await b.close();
console.log('screenshots saved to docs/screenshots/');
