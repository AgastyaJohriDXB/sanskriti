// Gentle day-streak. Stores only {last: "YYYY-MM-DD", count: n} using the LOCAL date.
import { load, save, remove } from './storage.js';

export function localDateString(d = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
// Whole-day difference between two YYYY-MM-DD strings (DST-safe: uses UTC midnights).
export function dayDiff(a, b) {
  const t = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((t(b) - t(a)) / 86400000);
}
// Pure function: next streak state given the previous one and today's date string.
export function nextStreak(prev, today) {
  if (!prev || typeof prev.last !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(prev.last)) return { last: today, count: 1 };
  const diff = dayDiff(prev.last, today);
  if (diff === 0) return prev;
  if (diff === 1) return { last: today, count: (Number(prev.count) || 0) + 1 };
  return { last: today, count: 1, restarted: diff > 1 };
}
export function recordActivity(now = new Date()) {
  const state = nextStreak(load('streak'), localDateString(now));
  save('streak', { last: state.last, count: state.count });
  renderBadge();
  return state;
}
export function currentStreak(now = new Date()) {
  const s = load('streak');
  if (!s || !s.last) return 0;
  const diff = dayDiff(s.last, localDateString(now));
  return diff <= 1 && diff >= 0 ? Number(s.count) || 0 : 0;
}
export function streakMessage(count) {
  if (count <= 0) return 'Explore a skill today to start a streak.';
  if (count === 1) return 'Day 1 – a great start! Come back tomorrow to keep it going.';
  return `${count} days in a row – lovely work! Every small discovery counts.`;
}
export function renderBadge() {
  const el = document.querySelector('[data-streak]');
  if (!el) return;
  const n = currentStreak();
  el.classList.toggle('is-on', n > 0);
  el.querySelector('[data-streak-text]').textContent = `${n}-day streak`;
  el.title = streakMessage(n);
}
export function resetStreak() { remove('streak'); renderBadge(); }
