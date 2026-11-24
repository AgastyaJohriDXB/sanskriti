# Specification traceability (ACCESSFM)

| Spec | Requirement (from the portfolio) | Where it is implemented | Test | Result |
|---|---|---|---|---|
| **A**esthetics | Attractive, culturally inspired look in the Northern/Southern palettes; readable text; easy navigation | `assets/css/tokens.css` (exact palette hex values), themed bands in `components.css`, arch motif, Cormorant + Inter type, cream reading areas (never paragraphs on dark green), unified header | 10-student survey (docs/survey.md); contrast script; screenshots | Contrast pass; survey **pending (student)** |
| **C**ost | Free tools only, zero development cost | Static HTML/CSS/JS, no dependencies, GitHub Pages, OFL fonts, no API keys | Network audit in e2e test; no package.json | Pass: 0 external requests, 0 paid services |
| **C**ustomer | For ages 8–18 who don't know where to start; easy to use | Simple language, Discover → Learn → Find → Experience journey, 30-second quiz, large type (≥17px), 44px+ tap targets | Age-group survey (8–12, 13–18) | **Pending (student)** |
| **E**nvironment | Light pages, compressed images, no heavy animation | SVG images (8–30 KB), one CSS file, 5 small fonts, no frameworks, reduced-motion support | Lighthouse page weight | Pass: 160–215 KB per page, perf 98–100 |
| **S**ize | Works on laptop, iPad and phone | Mobile-first CSS, breakpoints about 600/900/1200, mobile menu | e2e at 360/768/1024/1440/1920; screenshots; real-device table | Automated pass; devices **pending (student)** |
| **S**afety | Age-appropriate, trustworthy links, no personal data | Privacy & Safety section (about.html#privacy), safety note on experiences, CSP meta, `rel="noopener noreferrer"`, links only to trusted organisations, first name only | e2e (no requests or cookies), link-check script, manual checklist | Automated pass; link check & review **pending (needs internet)** |
| **F**unction | Every button and feature works: quiz, find near me, surprise, streaks, filters, pledge | `assets/js/*.js`, `data/*.json` | 19 unit + e2e tests | Pass 19/19 |
| **M**aterials | High quality, authentic, copyright-safe; consistent fonts and colours | Original CC BY illustrations, CREDITS.md, OFL fonts with licence files, sourced facts | CREDITS.md coverage, contrast, HTML validation | Pass |
