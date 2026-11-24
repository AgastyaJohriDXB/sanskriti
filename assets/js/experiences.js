import { getJSON, el, skillUrl } from './data.js';
import { cleanCity, isValidCity, matchPlaces, mapsQuery, mapsEmbedUrl, mapsOpenUrl } from './experiences-engine.js';

const form = document.getElementById('find-form');
const cityInput = document.getElementById('city');
const skillSel = document.getElementById('skill-select');
const err = document.getElementById('city-error');
const out = document.getElementById('find-results');
const status = document.getElementById('find-status');
const [{ skills }, { places }] = await Promise.all([getJSON('skills'), getJSON('experiences')]);

for (const s of skills) skillSel.append(el('option', { value: s.id, text: s.name }));
const pre = new URLSearchParams(location.search).get('skill');
if (pre && skills.some(s => s.id === pre)) skillSel.value = pre;

function placeCard(p) {
  const s = el('article', { class: 'place' },
    el('p', { class: 'meta', text: `${p.type[0].toUpperCase()}${p.type.slice(1)} · ${p.city}` }),
    el('h3', { text: p.name }),
    el('p', { text: p.description }),
    el('p', {}, el('a', { href: p.url, target: '_blank', rel: 'noopener noreferrer', class: 'ext' }, 'Official website', el('span', { class: 'visually-hidden', text: ' (opens in a new tab)' }))),
    el('p', { class: 'meta', text: `Checked ${p.verified.date}. Always check times before you go.` }));
  return s;
}

function mapBlock(q) {
  const wrap = el('div', { class: 'map-wrap' });
  const show = el('button', { type: 'button', class: 'btn btn-primary', text: 'Show map' });
  wrap.append(el('div', { class: 'map-facade' }, el('div', {},
    el('p', { text: 'The live map loads from Google Maps. Google may see your search and set its own cookies once you press the button.' }), show)));
  show.addEventListener('click', () => {
    const f = el('iframe', { title: `Google Maps search: ${q}`, src: mapsEmbedUrl(q), loading: 'lazy', referrerpolicy: 'strict-origin-when-cross-origin' });
    wrap.replaceChildren(f);
    f.focus();
  });
  const open = el('a', { href: mapsOpenUrl(q), target: '_blank', rel: 'noopener noreferrer', class: 'ext' }, 'Open this search in Google Maps', el('span', { class: 'visually-hidden', text: ' (opens in a new tab)' }));
  return el('section', { 'aria-labelledby': 'live-h' }, el('h2', { id: 'live-h', text: 'Live map search' }), el('p', { text: `Searching for: ${q}` }), wrap, el('p', {}, open));
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const city = cleanCity(cityInput.value);
  if (!isValidCity(city)) {
    err.textContent = 'Please type the name of a city, for example Jaipur.';
    cityInput.setAttribute('aria-invalid', 'true');
    cityInput.focus();
    return;
  }
  err.textContent = ''; cityInput.removeAttribute('aria-invalid');
  cityInput.value = city;
  const skill = skills.find(s => s.id === skillSel.value) || null;
  const { exact, others } = matchPlaces(places, city, skill);
  out.replaceChildren();
  const h = el('h2', { tabindex: '-1', text: `Places in ${city}` });
  out.append(h);
  if (exact.length) out.append(el('div', { class: 'grid' }, ...exact.map(placeCard)));
  else out.append(el('p', { class: 'note', text: `No curated places for ${skill ? skill.name : 'that'} in ${city} yet, but here's a live map search.` }));
  if (others.length) out.append(el('h3', { text: `Other traditions to explore in ${city}` }), el('div', { class: 'grid' }, ...others.map(placeCard)));
  if (skill) out.append(el('p', {}, 'Before you go, read about it: ', el('a', { href: skillUrl(skill.id), text: skill.name })));
  out.append(mapBlock(mapsQuery(skill?.name, city)));
  status.textContent = exact.length ? `${exact.length} curated place${exact.length > 1 ? 's' : ''} found in ${city}.` : `No curated places found in ${city}. A live map search is available.`;
  h.focus();
});
