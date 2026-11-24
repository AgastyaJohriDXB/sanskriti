// Header navigation: mobile disclosure menu + dropdowns. Works as plain links without JS.
export function initNav() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const subs = [...document.querySelectorAll('.sub-toggle')];

  const closeSubs = except => subs.forEach(b => { if (b !== except) b.setAttribute('aria-expanded', 'false'); });
  subs.forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    closeSubs(btn);
    btn.setAttribute('aria-expanded', String(!open));
  }));

  const isMobile = () => window.matchMedia('(max-width: 899px)').matches;
  const setMenu = open => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('[data-label]').textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
    if (open) nav.querySelector('a, button')?.focus();
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const openSub = subs.find(b => b.getAttribute('aria-expanded') === 'true');
      if (openSub) { closeSubs(); openSub.focus(); return; }
      if (toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    }
    // Keep focus inside the open mobile menu (menu button + links).
    if (e.key === 'Tab' && isMobile() && toggle?.getAttribute('aria-expanded') === 'true') {
      const items = [toggle, ...nav.querySelectorAll('a, button')].filter(el => el.offsetParent !== null);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.has-sub')) closeSubs(); });
  window.matchMedia('(max-width: 899px)').addEventListener?.('change', () => setMenu(false));
}
