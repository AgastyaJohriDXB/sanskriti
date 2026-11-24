// Dev-only: lists every external URL in the HTML and data files with its HTTP status.
// Run: node tools/check-links.mjs   (needs internet access)
import { readFileSync, readdirSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const files = [...readdirSync(root).filter(f => f.endsWith('.html')), ...readdirSync(new URL('data/', root)).map(f => `data/${f}`)];
const urls = new Set();
for (const f of files) for (const m of readFileSync(new URL(f, root), 'utf8').matchAll(/https?:\/\/[^\s"'<>)]+/g)) urls.add(m[0].replace(/[.,]$/, ''));
const skip = u => /schema\.org|w3\.org|google\.com\/maps|example/.test(u);
let bad = 0;
for (const u of [...urls].sort()) {
  if (skip(u)) continue;
  let status;
  try { status = (await fetch(u, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 (link check)' } })).status; }
  catch (e) { status = `ERROR ${e.cause?.code || e.name}`; }
  if (status !== 200) bad++;
  console.log(`${String(status).padEnd(12)} ${u}`);
}
console.log(`\n${urls.size} unique URLs, ${bad} not returning 200 (review manually; some sites block automated checks).`);
