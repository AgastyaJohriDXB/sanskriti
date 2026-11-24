import { getJSON, el, skillImage, findUrl } from './data.js';
import { recordActivity } from './streak.js';
import { load, save } from './storage.js';

const root = document.getElementById('skill');
const { skills, categories } = await getJSON('skills');
const id = new URLSearchParams(location.search).get('id');
const s = skills.find(k => k.id === id);

if (!s) {
  root.replaceChildren(el('h1', { text: 'Skill not found' }), el('p', { text: 'We could not find that tradition. ' }, el('a', { href: 'skills.html', text: 'Browse all skills' })));
} else {
  const cat = categories.find(c => c.id === s.category)?.name || '';
  document.title = `${s.name} – Sanskriti`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', s.blurb);
  document.getElementById('crumb-current').textContent = s.name;
  const section = (title, ...kids) => el('section', { class: 'narrow' }, el('h2', { text: title }), ...kids);
  const list = (items, cls) => el(cls === 'steps' ? 'ol' : 'ul', { class: cls || '' }, ...items.map(t => el('li', { text: t })));
  const img = skillImage(s);
  img.loading = 'eager'; img.setAttribute('fetchpriority', 'high');
  root.replaceChildren(
    el('div', { class: 'container detail-hero' },
      el('div', { class: 'arch-figure' }, img),
      el('div', {},
        el('p', { class: 'eyebrow left', text: `${cat} · ${s.zone[0].toUpperCase()}${s.zone.slice(1)} India` }),
        el('h1', { text: s.name }),
        el('p', { class: 'lead', text: s.blurb }),
        el('p', { class: 'source', text: `Image: ${s.image.credit} (${s.image.licence}).` }),
        el('div', { class: 'btn-row' },
          el('a', { class: 'btn btn-primary', href: findUrl(s.id), text: 'Find this near me' }),
          el('a', { class: 'btn btn-secondary', href: 'skills.html', text: 'All skills' })))),
    section('Where it comes from', el('p', { text: s.history }), el('p', {}, el('strong', { text: 'Regions: ' }), s.regions.join('; '))),
    section('Who practised it', el('p', { text: s.practisedBy })),
    section('How it is done – the basics', list(s.techniqueSteps, 'steps'), el('p', { class: 'note', text: 'Always try new tools, heat or cooking with an adult.' })),
    section('Why it matters', el('p', { text: s.whyItMatters })),
    section('Learn more from trusted sources',
      el('ul', {}, ...s.learnMore.map(l => el('li', {}, el('a', { href: l.url, text: l.label })))),
      el('p', { class: 'source' }, 'Sources: ', ...s.sources.flatMap((x, i) => [i ? '; ' : '', el('a', { href: x.url, text: x.label })]))));
  recordActivity();
  const recent = (load('recent', []) || []).filter(r => r !== s.id);
  save('recent', [s.id, ...recent].slice(0, 5));
  // external-link marking for injected links
  root.querySelectorAll('a[href^="http"]').forEach(a => {
    a.target = '_blank'; a.rel = 'noopener noreferrer'; a.classList.add('ext');
    a.append(el('span', { class: 'visually-hidden', text: ' (opens in a new tab)' }));
  });
}
