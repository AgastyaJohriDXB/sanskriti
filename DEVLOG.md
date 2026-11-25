# Development log

Decisions, problems and open items while building Sanskriti. Newest last.

## Decisions

1. **Shared header/footer: build-time stamping, not runtime JS includes.** `tools/build-partials.mjs` writes the same `<head>`, header and footer into every page between `<!-- @header -->` style markers. The pages are plain HTML, so navigation and reading work with JavaScript turned off, and there is no extra network request or layout flash. A `<noscript>` nav fallback is therefore not needed. To change the header, edit the script and run `node tools/build-partials.mjs`.
2. **Unified navigation.** The approved home design (Home / Explore Skills / Discover Your Interests / About Us) and inner-page design (About the Issue / Impact / Awareness & Solutions / About Me) were merged into one header: Home · Explore ▾ (Explore Skills, Discover Your Interests, Find Experiences, Surprise Me) · The Issue ▾ (About the Issue, Impact, Awareness & Solutions) · About Me · **Start Exploring** (→ quiz). On screens under 900px it becomes a disclosure menu: a real `<button aria-expanded>`, Escape closes it, focus stays inside.
3. **One stylesheet.** The readable sources are `tokens.css`, `base.css`, `components.css` and `pages.css`. The build script concatenates them into `site.css`, so the page makes one request instead of a chain of `@import`s. **No minification.** Pages already score 98–100 for Performance on mobile and weigh 160–215 KB, mostly fonts. Minifying would save a few KB but make the shipped code harder for a student to read, so it was not adopted.
4. **No service worker.** GitHub Pages caching is enough, and a service worker adds risk for little gain here.
5. **Images: original SVG illustrations, no photographs.** The build environment could not reach Wikimedia Commons (only package registries were reachable), so every image is an original flat SVG illustration made by `tools/make-illustrations.mjs` (8–30 KB each, sharp at any size). This is copyright-safe from day one. Swapping in a licensed photo is a one-line change of `image.src` in `data/skills.json`. Because the images are SVG, the AVIF/WebP `<picture>` pipeline was not needed. If photos are added later, convert them to AVIF/WebP with a `<picture>` element and keep each under about 150 KB.
6. **Accessible colour variants.** The spec palette is kept for decoration. Text uses named variants that pass WCAG AA: `--south-gold-text #7A5C0C`, `--south-green-deep #0F4A37` (hero and footer, so gold text on them passes), and `--north-blue-deep #1D4A78` (Explore band). `tools/contrast-check.mjs` checks 49 pairs (47 text pairs plus 2 marked decorative-only) and all of them pass.
7. **Fonts.** Self-hosted from the Fontsource npm packages: Latin subset, woff2. Five files load: Cormorant 600 regular and italic, and Inter 400, 600 and 700. Only Cormorant 600 and Inter 400 are preloaded. The italic accent font uses `font-display: optional`. Lighthouse found it caused a 0.22 layout shift on the quiz page when it swapped in late.
8. **Dark mode.** The site stays in a light theme on purpose: cream and ivory reading areas are part of the approved design. It does not break under `prefers-color-scheme: dark`, because every colour is set explicitly.
9. **"Customer" spec typo.** The spec's age group "5–10" is treated as **8–12**, to match the target audience of 8–18.
10. **Experiences search** matches the city exactly after case and accent normalisation ("Delhi" also matches "New Delhi"). The live map is a Google Maps embed loaded only after a click, so no third-party request happens by default. The e2e test asserts zero external requests on every page.
11. **CSP** is set with a `<meta>` tag, because GitHub Pages cannot send headers. It allows `self` only, `img-src 'self' data:`, `frame-src https://www.google.com`, plus a hash for the one-line inline script that adds the `js` class. `frame-ancestors` cannot be set from a meta tag.
12. **404 page on a sub-path.** If `siteUrl` is set in `tools/site.config.json`, the build adds `<base href>` to 404.html so its links work from any missing URL.
13. **Canonical/OG URLs and sitemap** are only generated when `siteUrl` is known. See "Deployment" below.
14. **Impact page, 4th statistic.** The UNESCO endangered-languages figure (wireframe placeholder) could **not** be confirmed. Search results gave conflicting counts (about 170 vs almost 300 for India and the region), and the UNESCO Atlas could not be reached directly. **It was dropped** and replaced with a verified handloom figure: 31.45 lakh handloom households (Census 2019–20).
15. **UNESCO quote.** It is quoted exactly from the UNESCO ICH page "What is Intangible Cultural Heritage?", as shown in search results.
16. **"Where it happens" map.** No licensed map was available offline, so the page shows a "Map coming soon" placeholder and a list of craft clusters.
17. **Dindigul lock-making** has no dedicated skill page or illustration yet. The Impact card uses the metal-craft illustration and says so in its caption.

18. **Creator photo added (2026-11-25), at the family's request.** The original spec said no photo of the student. The family later asked for one to be added to About Me. The photo was cropped, saved as WebP with a JPEG fallback in 3 widths (13–60 KB each) and stripped of all metadata, including any GPS location. It is lazy-loaded below the fold. Still no surname, school, contact details or social links. Note: the photo's background shows a recognisable city skyline. A crop or a different photo is an option if that is a concern.

## Deployment status

Live at https://agastyajohridxb.github.io/sanskriti/ and deployed by `.github/workflows/pages.yml` (Pages source: GitHub Actions). A verify job checks that every page and asset returns 200 after each deploy. The v1.0.0 release must be created in the GitHub web UI.

## TODO-VERIFY

The build environment could not open any website directly; facts were checked through web-search results only. Please confirm each of these by opening the page:

| Item | Where | What to check |
|---|---|---|
| Anokhi Museum official URL `https://www.anokhi.com/museum` and opening times | data/experiences.json | URL taken from a directory listing, not confirmed |
| DakshinaChitra official URL `https://www.dakshinachitra.net/` | data/experiences.json | URL taken from a museum directory |
| Kalakshetra URL `https://www.kalakshetra.in/` | experiences, solutions, skills | Confirmed via india.gov.in listing and Wikipedia; one source lists kalakshetra.net |
| SPIC MACAY `https://spicmacay.org/` | solutions, skills | Taken from its Wikipedia infobox |
| Handlooms `https://handlooms.nic.in/`, Indian Culture Portal `https://indianculture.gov.in/` | solutions, skills | Well-known government domains, not opened from here |
| 66.3% income figure | impact.html | Confirmed via the PARI Library summary of the Census; check the Census PDF itself |
| Skill histories (15 skills) | data/skills.json | Written from general reference knowledge at a simple reading level; each lists a Wikipedia source. A teacher should check them against a primary source |
| All external links | whole site | Run `node tools/check-links.mjs` with internet access |

## Log

- Stage 1 – scaffold, tokens, fonts, shared partials, 404.
- Stage 2 – home page: hero, five arches, journey strip.
- Stage 3 – Issue, Impact, Solutions with sourced facts.
- Stage 4 – skills data (15 skills, 6 categories, all 5 zones), Explore grid (pre-rendered, works without JS), detail template.
- Stage 5 – quiz (8 questions, all 81,920 answer combinations tested), Surprise Me, streaks.
- Stage 6 – Find Experiences (5 curated places + click-to-load map).
- Stage 7 – About Me, privacy, credits.
- Stage 8 – icons, share image, manifest, contrast fixes, CLS fixes (quiz italic font, skill page min-height), robots.txt.
- Stage 9 – unit + e2e tests, HTML validation, Lighthouse, docs.
