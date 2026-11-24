// Loads JSON from data/ using a path relative to the page (works under /sanskriti/ on GitHub Pages).
const cache = {};
export async function getJSON(name) {
  if (!cache[name]) cache[name] = fetch(new URL(`data/${name}.json`, document.baseURI)).then(r => {
    if (!r.ok) throw new Error(`Could not load ${name}`);
    return r.json();
  });
  return cache[name];
}
export const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v);
  }
  n.append(...kids.filter(Boolean));
  return n;
};
export function skillImage(skill, cls = '') {
  const img = el('img', { src: skill.image.src, alt: skill.image.alt, width: '400', height: '300', loading: 'lazy', decoding: 'async' });
  if (cls) img.className = cls;
  return img;
}
export function skillUrl(id) { return `skill.html?id=${encodeURIComponent(id)}`; }
export function findUrl(id) { return `experiences.html?skill=${encodeURIComponent(id)}`; }
