// Dev-only: prints the WCAG 2.2 contrast ratio for every text/background pair used on the site.
// Exits with code 1 if any pair fails. Run: node tools/contrast-check.mjs
const lum = hex => {
  const [r, g, b] = hex.replace('#', '').match(/../g).map(h => parseInt(h, 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const BG = { page: '#FFFBF2', ivory: '#FFF3D6', cream: '#F8E8C8', white: '#FFFFFF', greenDeep: '#0F4A37', pink: '#8E1F5A', indigo: '#22306B', maroon: '#7D263A', teal: '#0B5B63', blue: '#1D4A78', saffron: '#E8A52A', green: '#176B50', red: '#A83232', goldText: '#8A6A10' };
// [label, foreground, background key, minimum ratio]
const pairs = [];
for (const bg of ['page', 'ivory', 'cream', 'white']) {
  pairs.push([`ink body text on ${bg}`, '#2A1A12', bg, 4.5], [`ink-soft text on ${bg}`, '#5A4636', bg, 4.5],
    [`blue link on ${bg}`, '#245A91', bg, 4.5], [`gold-text eyebrow on ${bg}`, '#7A5C0C', bg, 4.5]);
}
for (const bg of ['greenDeep', 'pink', 'indigo', 'maroon', 'teal', 'blue']) {
  pairs.push([`white text on ${bg}`, '#FFFFFF', bg, 4.5], [`band paragraph #FFF6E2 on ${bg}`, '#FFF6E2', bg, 4.5],
    [`light-gold accent #E9C55A on ${bg}`, '#E9C55A', bg, 4.5], [`breadcrumb link #FFE29A on ${bg}`, '#FFE29A', bg, 4.5]);
}
pairs.push(['ink on saffron button', '#2A1A12', 'saffron', 4.5], ['white on green chip', '#FFFFFF', 'green', 4.5],
  ['white badge on red', '#FFFFFF', 'red', 4.5], ['white badge on goldText', '#FFFFFF', 'goldText', 4.5],
  ['indigo stat number on white', '#22306B', 'white', 3], ['quote credit #FFE7C2 on maroon', '#FFE7C2', 'maroon', 4.5],
  ['footer text #F3EAD3 on greenDeep', '#F3EAD3', 'greenDeep', 4.5],
  ['(decorative only) south-gold on ivory', '#C49A24', 'ivory', 0], ['(decorative only) saffron on page', '#E8A52A', 'page', 0]);
let fail = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(fg, BG[bg]);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${label}`);
}
console.log(fail ? `\n${fail} pair(s) fail.` : '\nAll text pairs meet WCAG 2.2 AA.');
process.exit(fail ? 1 : 0);
