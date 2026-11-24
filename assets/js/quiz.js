import { getJSON, el, skillImage, skillUrl, findUrl } from './data.js';
import { tally, rank } from './quiz-engine.js';
import { save, load, remove } from './storage.js';
import { recordActivity } from './streak.js';

const root = document.getElementById('quiz');
const live = document.getElementById('quiz-live');
const [{ skills }, quiz] = await Promise.all([getJSON('skills'), getJSON('quiz')]);
const Q = quiz.questions;
let step = 0;
let answers = [];

function renderQuestion() {
  const q = Q[step];
  root.replaceChildren();
  const pct = Math.round((step / Q.length) * 100);
  const bar = el('span');
  bar.style.width = `${pct}%`;
  const prog = el('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(Q.length), 'aria-valuenow': String(step), 'aria-label': 'Quiz progress' }, bar);
  const fs = el('fieldset', { class: 'options' }, el('legend', { id: 'q-legend', tabindex: '-1', text: q.q }));
  q.options.forEach((o, i) => {
    const input = el('input', { type: 'radio', name: `q${step}`, value: String(i) });
    if (answers[step] === i) input.checked = true;
    input.addEventListener('change', () => { answers[step] = i; next.disabled = false; });
    fs.append(el('label', { class: 'option' }, input, el('span', { text: o.label })));
  });
  const back = el('button', { type: 'button', class: 'btn btn-secondary', text: 'Back' });
  back.disabled = step === 0;
  back.addEventListener('click', () => { step--; renderQuestion(); });
  const next = el('button', { type: 'submit', class: 'btn btn-primary', text: step === Q.length - 1 ? 'See my matches' : 'Next' });
  next.disabled = answers[step] === undefined;
  const form = el('form', {}, el('p', { class: 'source', text: `Question ${step + 1} of ${Q.length}` }), prog, fs, el('div', { class: 'quiz-nav' }, back, next));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (answers[step] === undefined) return;
    if (step < Q.length - 1) { step++; renderQuestion(); } else finish();
  });
  root.append(form);
  root.querySelector('#q-legend').focus();
}

function finish() {
  const ranked = rank(skills, tally(Q, answers)).slice(0, 3);
  save('quiz', { top: ranked.map(r => r.skill.id), reason: ranked[0].reason, date: new Date().toISOString().slice(0, 10) });
  recordActivity();
  showResults(ranked);
}

function resultCard(r, i) {
  const s = r.skill;
  const reason = quiz.reasons[r.reason] || 'This matches your answers';
  return el('article', { class: `result${i === 0 ? ' top' : ''}` },
    el('p', { class: 'eyebrow left', text: i === 0 ? 'Your top match' : 'Also try' }),
    el('div', { class: 'arch-figure' }, skillImage(s)),
    el('h3', { text: s.name }),
    el('p', { text: `${reason}, so try ${s.name}.` }),
    el('div', { class: 'btn-row' },
      el('a', { class: 'btn btn-primary', href: skillUrl(s.id), text: 'Learn it' }),
      el('a', { class: 'btn btn-secondary', href: findUrl(s.id), text: 'Find it near me' })));
}

function showResults(ranked) {
  root.replaceChildren();
  const h = el('h2', { tabindex: '-1', text: 'Your matches' });
  const retake = el('button', { type: 'button', class: 'btn btn-secondary', text: 'Retake the quiz' });
  retake.addEventListener('click', () => { answers = []; step = 0; renderQuestion(); });
  const clear = el('button', { type: 'button', class: 'linklike', text: 'Clear my saved result' });
  clear.addEventListener('click', () => { remove('quiz'); live.textContent = 'Your saved quiz result has been cleared from this device.'; });
  root.append(h, el('div', { class: 'results' }, ...ranked.map(resultCard)), el('div', { class: 'btn-row' }, retake, clear));
  live.textContent = `Your top match is ${ranked[0].skill.name}. Runners-up: ${ranked[1].skill.name} and ${ranked[2].skill.name}.`;
  h.focus();
}

const start = document.getElementById('quiz-start');
start?.addEventListener('click', () => { document.getElementById('quiz-intro').hidden = true; root.hidden = false; renderQuestion(); });
const saved = load('quiz');
const savedNote = document.getElementById('quiz-saved');
if (saved?.top && savedNote) {
  const s = skills.find(k => k.id === saved.top[0]);
  if (s) { savedNote.hidden = false; savedNote.querySelector('a').href = skillUrl(s.id); savedNote.querySelector('a').textContent = s.name; }
}
