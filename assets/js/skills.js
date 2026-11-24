// Explore Skills: filters the pre-rendered cards (cards are in the HTML, so it reads fine without JS).
const cards = [...document.querySelectorAll('[data-skill-card]')];
const status = document.getElementById('filter-status');
const form = document.getElementById('filters');
form.hidden = false;
const params = new URLSearchParams(location.search);
const setFrom = (name, val) => { const i = form.querySelector(`input[name="${name}"][value="${CSS.escape(val)}"]`); if (i) i.checked = true; };
if (params.get('category')) setFrom('category', params.get('category'));
if (params.get('zone')) setFrom('zone', params.get('zone'));

function apply() {
  const cat = form.querySelector('input[name="category"]:checked')?.value || 'all';
  const zone = form.querySelector('input[name="zone"]:checked')?.value || 'all';
  let shown = 0;
  for (const c of cards) {
    const ok = (cat === 'all' || c.dataset.category === cat) && (zone === 'all' || c.dataset.zone === zone);
    c.hidden = !ok; if (ok) shown++;
  }
  status.textContent = shown ? `Showing ${shown} tradition${shown === 1 ? '' : 's'}.` : 'No traditions match both filters yet. Try another region or "All".';
}
form.addEventListener('change', apply);

document.getElementById('filter-reset')?.addEventListener('click', () => { setFrom('category', 'all'); setFrom('zone', 'all'); apply(); });
apply();
