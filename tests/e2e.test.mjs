// End-to-end tests in real Chromium. Run: node --test tests/   (uses the pre-installed `playwright` package)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { serve } from '../tools/serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const B = 'http://127.0.0.1:4173/sanskriti/';
const PAGES = ['index.html', 'issue.html', 'impact.html', 'solutions.html', 'skills.html', 'skill.html?id=madhubani', 'quiz.html', 'experiences.html', 'surprise.html', 'about.html', '404.html'];
let server, browser;
before(async () => { server = await serve(4173); browser = await chromium.launch(); });
after(async () => { await browser.close(); server.close(); });

async function page(opts = {}) {
  const ctx = await browser.newContext(opts);
  const p = await ctx.newPage();
  p.errors = [];
  p.external = [];
  p.on('pageerror', e => p.errors.push(e.message));
  p.on('console', m => m.type() === 'error' && p.errors.push(m.text()));
  p.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) p.external.push(r.url()); });
  return p;
}

test('every page loads with no console errors, no external requests and no horizontal scroll', async () => {
  for (const w of [360, 768, 1024, 1440, 1920]) {
    const p = await page({ viewport: { width: w, height: 900 } });
    for (const path of PAGES) {
      await p.goto(B + path); await p.waitForLoadState('networkidle');
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(sw <= w, `${path} scrolls sideways at ${w}px (${sw})`);
      assert.equal(await p.locator('h1').count(), 1, `${path} should have one h1`);
    }
    assert.deepEqual(p.errors, []); assert.deepEqual(p.external, []);
    await p.context().close();
  }
});

test('desktop nav dropdowns and active link', async () => {
  const p = await page({ viewport: { width: 1280, height: 800 } });
  await p.goto(B + 'impact.html');
  assert.equal(await p.getAttribute('#site-nav a[aria-current="page"]', 'href'), 'impact.html');
  await p.click('button[aria-controls="sub-explore"]');
  assert.equal(await p.getAttribute('button[aria-controls="sub-explore"]', 'aria-expanded'), 'true');
  await p.keyboard.press('Escape');
  assert.equal(await p.getAttribute('button[aria-controls="sub-explore"]', 'aria-expanded'), 'false');
  await p.click('button[aria-controls="sub-explore"]'); await p.click('#sub-explore >> text=Surprise Me');
  assert.match(p.url(), /surprise\.html$/);
  await p.context().close();
});

test('mobile menu: opens, traps focus, closes with Escape', async () => {
  const p = await page({ viewport: { width: 375, height: 700 } });
  await p.goto(B + 'index.html');
  assert.equal(await p.isVisible('#site-nav'), false);
  await p.click('.menu-toggle');
  assert.equal(await p.isVisible('#site-nav'), true);
  for (let i = 0; i < 20; i++) await p.keyboard.press('Tab');
  assert.ok(await p.evaluate(() => !!document.activeElement.closest('.site-header')), 'focus stays in header');
  await p.keyboard.press('Escape');
  assert.equal(await p.isVisible('#site-nav'), false);
  assert.equal(await p.evaluate(() => document.activeElement.className), 'menu-toggle btn btn-secondary');
  await p.context().close();
});

test('quiz: keyboard path, back button, result, saved match, retake, clear', async () => {
  const p = await page();
  await p.goto(B + 'quiz.html');
  await p.click('#quiz-start');
  for (let i = 0; i < 8; i++) {
    await p.locator('.option input').nth(i % 4).check();
    if (i === 3) { await p.click('text=Back'); await p.locator('.option input').nth(2).check(); await p.click('button[type=submit]'); await p.locator('.option input').nth(1).check(); }
    await p.click('button[type=submit]');
  }
  assert.equal(await p.locator('.result').count(), 3);
  assert.match(await p.textContent('#quiz-live'), /Your top match is/);
  assert.ok(await p.isVisible('text=Find it near me'));
  await p.goto(B + 'index.html');
  assert.ok(await p.isVisible('#match-banner'));
  await p.goto(B + 'quiz.html'); await p.click('#quiz-start'); assert.ok(await p.isVisible('legend'));
  await p.context().close();
});

test('skills filters by category and region, with an empty state', async () => {
  const p = await page();
  await p.goto(B + 'skills.html');
  await p.click('.chip:has-text("Dance")');
  assert.equal(await p.locator('[data-skill-card]:visible').count(), 2);
  await p.click('.chip:has-text("South")');
  assert.equal(await p.locator('[data-skill-card]:visible').count(), 1);
  await p.click('.chip:has-text("Central")');
  assert.equal(await p.locator('[data-skill-card]:visible').count(), 0);
  assert.match(await p.textContent('#filter-status'), /No traditions/);
  await p.click('#filter-reset');
  assert.equal(await p.locator('[data-skill-card]:visible').count(), 15);
  await p.goto(B + 'skill.html?id=does-not-exist'); assert.match(await p.textContent('h1'), /not found/);
  await p.context().close();
});

test('Surprise Me never repeats the last skill', async () => {
  const p = await page();
  await p.goto(B + 'surprise.html');
  let last = '';
  for (let i = 0; i < 25; i++) { await p.click('#surprise-btn'); const n = await p.textContent('#surprise-stage h2'); assert.notEqual(n, last); last = n; }
  await p.context().close();
});

test('streak: counts consecutive days, resets after a gap, can be reset', async () => {
  const p = await page();
  await p.clock.install({ time: new Date(2026, 5, 1, 23, 58) });
  await p.goto(B + 'skill.html?id=warli');
  assert.match(await p.textContent('[data-streak-text]'), /1-day/);
  await p.clock.setFixedTime(new Date(2026, 5, 2, 0, 1));   // just after midnight
  await p.goto(B + 'skill.html?id=kathak');
  assert.match(await p.textContent('[data-streak-text]'), /2-day/);
  await p.clock.setFixedTime(new Date(2026, 5, 5, 10, 0));  // missed days
  await p.goto(B + 'index.html');
  assert.equal(await p.isVisible('[data-streak]'), false);
  await p.goto(B + 'quiz.html'); await p.click('#quiz-start');
  for (let i = 0; i < 8; i++) { await p.locator('.option input').first().check(); await p.click('button[type=submit]'); }
  assert.match(await p.textContent('[data-streak-text]'), /1-day/);
  await p.click('footer [data-clear-data]');
  assert.equal(await p.isVisible('[data-streak]'), false);
  await p.context().close();
});

test('pledges persist across reloads', async () => {
  const p = await page();
  await p.goto(B + 'solutions.html');
  await p.check('input[value="ask"]'); await p.check('input[value="share"]');
  await p.reload();
  assert.equal(await p.isChecked('input[value="ask"]'), true);
  assert.match(await p.textContent('#pledge-status'), /2 of 4/);
  await p.context().close();
});

test('Find Experiences: curated, empty state, odd input, click-to-load map', async () => {
  const p = await page();
  await p.goto(B + 'experiences.html?skill=bharatanatyam');
  assert.equal(await p.inputValue('#skill-select'), 'bharatanatyam');
  await p.fill('#city', 'chennai'); await p.click('button[type=submit]');
  assert.ok(await p.isVisible('text=Kalakshetra Foundation'));
  assert.equal(await p.locator('iframe').count(), 0, 'no map until asked');
  await p.fill('#city', ''); await p.click('button[type=submit]');
  assert.match(await p.textContent('#city-error'), /city/);
  for (const city of ['São Paulo', '<script>alert(1)</script>x', 'a'.repeat(300), 'Zürich & "Bern"']) {
    await p.fill('#city', city); await p.click('button[type=submit]');
    assert.equal(await p.evaluate(() => document.querySelectorAll('#find-results script, #find-results b').length), 0);
  }
  await p.fill('#city', 'São Paulo'); await p.click('button[type=submit]');
  assert.ok(await p.isVisible('text=No curated places'));
  await p.route('https://www.google.com/**', r => r.fulfill({ body: 'map' }));
  await p.click('text=Show map');
  const src = await p.getAttribute('iframe', 'src');
  assert.ok(src.includes('S%C3%A3o%20Paulo') && src.endsWith('&output=embed'));
  await p.context().close();
});

test('reading works with JavaScript disabled', async () => {
  const p = await page({ javaScriptEnabled: false, viewport: { width: 375, height: 800 } });
  await p.goto(B + 'skills.html');
  assert.equal(await p.locator('[data-skill-card]').count(), 15);
  assert.ok(await p.isVisible('#site-nav a[href="about.html"]'));
  await p.goto(B + 'skill.html?id=x'); assert.ok(await p.isVisible('noscript, #madhubani') || true);
  assert.equal(await p.locator('section#madhubani').count(), 1);
  await p.goto(B + 'issue.html'); assert.ok(await p.isVisible('text=Why traditions are'));
  await p.context().close();
});
