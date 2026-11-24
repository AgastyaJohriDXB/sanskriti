import { load, save } from './storage.js';
const boxes = [...document.querySelectorAll('[data-pledge]')];
const status = document.getElementById('pledge-status');
const saved = load('pledges', {}) || {};
const update = () => {
  const n = boxes.filter(b => b.checked).length;
  status.textContent = n === boxes.length ? 'You have taken all four pledges. Thank you!' : `${n} of ${boxes.length} pledges taken.`;
};
boxes.forEach(b => {
  b.checked = !!saved[b.value];
  b.addEventListener('change', () => { saved[b.value] = b.checked; save('pledges', saved); update(); });
});
document.addEventListener('sanskriti:cleared', () => { boxes.forEach(b => (b.checked = false)); Object.keys(saved).forEach(k => delete saved[k]); update(); });
update();
