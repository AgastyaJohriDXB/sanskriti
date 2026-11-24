// Unit tests for pure logic. Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nextStreak, dayDiff, localDateString, streakMessage } from '../assets/js/streak.js';
import { tally, rank } from '../assets/js/quiz-engine.js';
import { cleanCity, isValidCity, matchPlaces, mapsEmbedUrl, mapsQuery } from '../assets/js/experiences-engine.js';
const skills = JSON.parse(readFileSync(new URL('../data/skills.json', import.meta.url))).skills;
const quiz = JSON.parse(readFileSync(new URL('../data/quiz.json', import.meta.url)));
const places = JSON.parse(readFileSync(new URL('../data/experiences.json', import.meta.url))).places;

test('streak: first visit, same day, next day, missed day', () => {
  let s = nextStreak(null, '2026-03-01'); assert.deepEqual(s, { last: '2026-03-01', count: 1 });
  assert.equal(nextStreak(s, '2026-03-01').count, 1);
  s = nextStreak(s, '2026-03-02'); assert.equal(s.count, 2);
  assert.equal(nextStreak(s, '2026-03-05').count, 1);
});
test('streak: month/year boundaries and DST are whole days', () => {
  assert.equal(dayDiff('2026-02-28', '2026-03-01'), 1);
  assert.equal(dayDiff('2024-02-28', '2024-02-29'), 1);
  assert.equal(dayDiff('2026-12-31', '2027-01-01'), 1);
  assert.equal(dayDiff('2026-03-28', '2026-03-29'), 1); // EU DST change
  assert.equal(dayDiff('2026-11-01', '2026-11-02'), 1); // US DST change
});
test('streak: local date just before and after midnight', () => {
  assert.equal(localDateString(new Date(2026, 0, 1, 23, 59, 59)), '2026-01-01');
  assert.equal(localDateString(new Date(2026, 0, 2, 0, 0, 1)), '2026-01-02');
});
test('streak: corrupt stored data resets gently', () => {
  assert.equal(nextStreak({ last: 'garbage', count: 9 }, '2026-01-01').count, 1);
  assert.equal(nextStreak({ last: 5 }, '2026-01-01').count, 1);
  assert.match(streakMessage(0), /start/);
  assert.doesNotMatch(streakMessage(1) + streakMessage(5), /lost|failed|broke/i);
});
test('quiz: every one of the possible answer paths gives three distinct results', () => {
  const Q = quiz.questions;
  // exhaustive over first 4 questions x random for rest, plus all-same-index paths
  let n = 0;
  const check = answers => {
    const r = rank(skills, tally(Q, answers)).slice(0, 3);
    assert.equal(r.length, 3); assert.equal(new Set(r.map(x => x.skill.id)).size, 3);
    assert.ok(r[0].score > 0, 'top match should have a positive score'); assert.ok(quiz.reasons[r[0].reason]);
    n++;
  };
  const sizes = Q.map(q => q.options.length);
  const total = sizes.reduce((a, b) => a * b, 1);
  for (let i = 0; i < total; i++) { let x = i; check(sizes.map(s => { const v = x % s; x = Math.floor(x / s); return v; })); }
  assert.equal(n, total);
  console.log(`  checked all ${total} answer combinations`);
});
test('quiz: every skill can be someone\'s top match', () => {
  const tops = new Set();
  const Q = quiz.questions, sizes = Q.map(q => q.options.length), total = sizes.reduce((a, b) => a * b, 1);
  for (let i = 0; i < total; i++) { let x = i; tops.add(rank(skills, tally(Q, sizes.map(s => { const v = x % s; x = Math.floor(x / s); return v; })))[0].skill.id); }
  const missing = skills.filter(s => !tops.has(s.id)).map(s => s.id);
  assert.deepEqual(missing, [], `never top: ${missing}`);
});
test('experiences: city input is cleaned and validated', () => {
  assert.equal(cleanCity('  São   Paulo '), 'São Paulo');
  assert.equal(cleanCity('<script>alert(1)</script>'), 'scriptalert(1)/script');
  assert.equal(cleanCity('x'.repeat(500)).length, 60);
  assert.equal(isValidCity(''), false); assert.equal(isValidCity('12'), false); assert.equal(isValidCity('Pune'), true);
  assert.equal(isValidCity(cleanCity('<>')), false);
});
test('experiences: matching and URL encoding', () => {
  const bagru = skills.find(s => s.id === 'bagru');
  assert.equal(matchPlaces(places, 'jaipur', bagru).exact.length, 1);
  assert.equal(matchPlaces(places, 'Delhi', bagru).exact.length, 1); // "New Delhi" ≈ "Delhi"
  assert.equal(matchPlaces(places, 'Atlantis', bagru).exact.length, 0);
  const u = mapsEmbedUrl(mapsQuery('Bagru block printing', 'São Paulo & <b>'));
  assert.ok(u.startsWith('https://www.google.com/maps?q='));
  assert.ok(!/[<>& ]/.test(u.split('?q=')[1].replace('&output=embed', '')));
});
test('data: every skill has required fields and a local image', () => {
  for (const s of skills) {
    for (const k of ['id', 'name', 'category', 'zone', 'blurb', 'history', 'practisedBy', 'techniqueSteps', 'whyItMatters', 'image', 'sources', 'learnMore', 'quizWeights']) assert.ok(s[k], `${s.id} missing ${k}`);
    assert.ok(readFileSync(new URL(`../${s.image.src}`, import.meta.url)).length > 0);
  }
});
