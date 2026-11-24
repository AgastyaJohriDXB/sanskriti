// Runs on every page.
import { initNav } from './nav.js';
import { renderBadge, resetStreak } from './streak.js';
import { clearAll } from './storage.js';

initNav();
renderBadge();

// Mark external links: safe rel + "opens in a new tab" text for screen readers.
for (const a of document.querySelectorAll('a[href^="http"]')) {
  if (a.host === location.host) continue;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.classList.add('ext');
  if (!a.querySelector('.visually-hidden')) {
    const s = document.createElement('span');
    s.className = 'visually-hidden';
    s.textContent = ' (opens in a new tab)';
    a.append(s);
  }
}

// "Clear my saved data" / "Reset my progress" buttons.
for (const btn of document.querySelectorAll('[data-clear-data]')) {
  btn.hidden = false;
  btn.addEventListener('click', () => {
    clearAll(); resetStreak();
    const msg = document.getElementById('clear-status');
    if (msg) msg.textContent = 'Done – everything Sanskriti saved on this device has been cleared.';
    document.dispatchEvent(new CustomEvent('sanskriti:cleared'));
  });
}

// Light reveal-on-scroll (skipped entirely under reduced motion via CSS).
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -40px' }) : null;
document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));
