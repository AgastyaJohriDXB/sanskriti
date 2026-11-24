import { load } from './storage.js';
import { getJSON, skillUrl } from './data.js';
const banner = document.getElementById('match-banner');
const saved = load('quiz');
if (banner && saved?.top?.length) {
  const { skills } = await getJSON('skills');
  const s = skills.find(k => k.id === saved.top[0]);
  if (s) {
    const a = banner.querySelector('a');
    a.href = skillUrl(s.id); a.textContent = s.name;
    banner.classList.add('is-on');
  }
}
