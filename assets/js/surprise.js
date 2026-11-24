import { getJSON, el, skillImage, skillUrl, findUrl } from './data.js';
import { load, save } from './storage.js';

const { skills } = await getJSON('skills');
const stage = document.getElementById('surprise-stage');
const btn = document.getElementById('surprise-btn');
btn.hidden = false;

export function pickRandom(list, lastId, rnd = Math.random) {
  const pool = list.length > 1 ? list.filter(s => s.id !== lastId) : list;
  return pool[Math.floor(rnd() * pool.length)];
}
btn.addEventListener('click', () => {
  const s = pickRandom(skills, load('lastSurprise'));
  save('lastSurprise', s.id);
  const card = el('article', { class: 'result top pop' },
    el('div', { class: 'arch-figure' }, skillImage(s)),
    el('h2', { text: s.name }),
    el('p', { text: s.blurb }),
    el('div', { class: 'btn-row' },
      el('a', { class: 'btn btn-primary', href: skillUrl(s.id), text: 'Learn it' }),
      el('a', { class: 'btn btn-secondary', href: findUrl(s.id), text: 'Find it near me' })));
  stage.replaceChildren(card);
  btn.textContent = 'Surprise me again';
});
