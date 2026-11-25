# Testing

Results below are real, measured on 2026-11-24 in the build environment (headless Chromium, local server that copies GitHub Pages' `/sanskriti/` sub-path). Tests that need people or physical devices have **blank tables for the student to fill in**. Nothing in them has been made up.

How to re-run everything:

```
node tools/serve.mjs                      # terminal 1
node --test tests/*.test.mjs              # unit + end-to-end (19 tests)
npx -y html-validate@9 *.html
node tools/contrast-check.mjs
node tools/check-links.mjs                # needs internet
CHROME_PATH=/path/to/chrome npx -y lighthouse@12 http://127.0.0.1:4173/sanskriti/index.html
```

## Results by specification point

### Aesthetics: colour, readability and navigation survey (10 students)
Needs people. Printable survey and results table: [docs/survey.md](docs/survey.md). **Status: to be completed by the student.**

### Cost: everything is free
- No `package.json`, no runtime dependencies, no build step. Dev tools run with `npx` and are never shipped.
- Hosting is GitHub Pages (free). The fonts are open source and self-hosted.
- **External requests on a clean load: none.** The e2e test records every network request on all 11 pages at 5 widths and asserts that the list of non-local requests is empty. Result: **pass (0 external requests)**. The only third-party request possible is Google Maps, and only after the user presses "Show map".

### Customer: ease of use by age group (8–12 and 13–18)
Needs people. See [docs/survey.md](docs/survey.md). **Status: to be completed by the student.**

### Environment: page weight and no heavy animation
Lighthouse (mobile, simulated slow 4G), total transfer for the first load:

| Page | Weight | LCP | CLS |
|---|---|---|---|
| Home | 179 KB | 2.0 s | 0.000 |
| About the Issue | 162 KB | 2.0 s | 0.000 |
| Impact | 166 KB | 1.9 s | 0.000 |
| Awareness & Solutions | 160 KB | 2.0 s | 0.000 |
| Explore Skills | 189 KB | 2.2 s | 0.000 |
| Skill (Kathak) | 163 KB | 2.0 s | 0.000 |
| Quiz | 185 KB | 2.0 s | 0.000 |
| Find Experiences | 186 KB | 2.0 s | 0.000 |
| Surprise Me | 177 KB | 2.0 s | 0.000 |
| About Me | 160 KB | 1.8 s | 0.000 |

All pages are under the 500 KB budget. Total blocking time is 0 ms on every page, so INP risk is very low. The only animations are a small hover lift, a scroll nudge and the Surprise Me pop. All of them are turned off under `prefers-reduced-motion`.

### Size: laptop, iPad and phone
Automated: the e2e test loads every page at **360, 768, 1024, 1440 and 1920px** and checks there is no sideways scroll. Result: **pass**. Screenshots at 360/768/1024/1440 are in [docs/screenshots/](docs/screenshots/).

Real devices (student to complete):

| Device | Browser | Pages look right? | Menu works? | Quiz works? | Find Experiences works? | Notes |
|---|---|---|---|---|---|---|
| Laptop | Chrome | | | | | |
| Laptop | Firefox / Edge | | | | | |
| iPad | Safari | | | | | |
| Phone | Safari (iOS) | | | | | |
| Phone | Chrome (Android) | | | | | |

### Safety: age-appropriate content and trustworthy links
- `node tools/check-links.mjs` lists every external URL with its HTTP status. **Not run from the build environment, because it had no general internet access.** Run it once online and paste the output here:

```
(paste output here)
```

Manual review checklist (student/teacher):

| Check | Done? |
|---|---|
| Every page read through for age-appropriate, respectful language | |
| Every external link opened and checked to be the official organisation | |
| No personal data (surname, school, contact) anywhere | ✅ only the first name "Agastya" and a family-approved photo (metadata stripped) |
| No forms send data, no cookies, no analytics | ✅ verified by e2e network test |
| Safety note present on Find Experiences | ✅ |

### Function: every button and feature works
`node --test tests/*.test.mjs`, **19/19 pass**:

| Test | Result |
|---|---|
| All 11 pages × 5 widths: no console errors, no external requests, no sideways scroll, exactly one h1 | pass |
| Desktop dropdowns open/close (click, Escape), active link highlighted, links navigate | pass |
| Mobile menu opens, keeps focus inside, closes with Escape and returns focus | pass |
| Quiz: answer, Back, change answer, result with 3 matches, aria-live announcement, home "Your match" banner, retake | pass |
| Quiz scoring: **all 81,920 answer combinations** give 3 distinct matches with a positive top score | pass |
| Every one of the 15 skills can be someone's top match | pass |
| Skill filters by category and region, empty state, reset; unknown skill id shows "not found" | pass |
| Surprise Me: 25 presses, never the same skill twice in a row | pass |
| Streak: day 1 at 23:58, day 2 at 00:01, reset after missed days, restarted by the quiz, "Clear my saved data" (mocked clock) | pass |
| Streak date maths: month/year ends, leap day, EU and US DST changes, corrupt data | pass |
| Pledges saved and restored after reload | pass |
| Find Experiences: preselected skill, curated result (Chennai), validation message, input `São Paulo`, `<script>alert(1)</script>x`, a 300-character string and `Zürich & "Bern"` never inject HTML; empty state; map only after a click; URL-encoded query | pass |
| JavaScript disabled: navigation, skills grid (15 cards), skill summaries and Issue page all readable | pass |

### Materials: licensed, sharp images; consistent fonts and colours
- CREDITS.md lists every file in `assets/img` and `assets/icons`. All are original SVG or PNG files rendered from them. **Pass.**
- Contrast: `node tools/contrast-check.mjs`. **All text pairs meet WCAG 2.2 AA (pass).**
- HTML: `npx html-validate@9 *.html` reports **0 errors**.
- JSON data: validated against `schemas/*.schema.json` with ajv. **All 3 valid.**

## Lighthouse scores (Performance / Accessibility / Best Practices / SEO)

| Page | Mobile | Desktop |
|---|---|---|
| Home | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| About the Issue | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Impact | 99 / 100 / 100 / 100 | – |
| Awareness & Solutions | 99 / 100 / 100 / 100 | – |
| Explore Skills | 98 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Skill detail | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Quiz | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Find Experiences | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Surprise Me | 99 / 100 / 100 / 100 | – |
| About Me | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

Measured locally. Re-measure on the live URL after deployment and add the results here.

| Live page | Mobile score (student to fill in) |
|---|---|
| Home | |
| Quiz | |
