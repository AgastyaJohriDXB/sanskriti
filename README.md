# Sanskriti – India's Living Traditions

A friendly website that helps young people (ages 8–18) **discover, learn, find and experience** traditional Indian skills: painting, pottery, weaving, music, dance and food.

An MYP 4 Digital Design, Service as Action project by Agastya.

**Live site:** https://agastyajohridxb.github.io/sanskriti/

## What's inside

| Page | File |
|---|---|
| Home | `index.html` |
| About the Issue / Impact / Awareness & Solutions | `issue.html`, `impact.html`, `solutions.html` |
| Explore Skills and one page per skill | `skills.html`, `skill.html?id=…` |
| Discover Your Interests (quiz) | `quiz.html` |
| Find Experiences (near me) | `experiences.html` |
| Surprise Me | `surprise.html` |
| About Me, privacy, credits | `about.html` |

- `data/skills.json` is the single source of truth for every tradition. `data/quiz.json` holds the quiz and `data/experiences.json` the checked places.
- `assets/css/` holds the readable CSS: `tokens.css` (colours, fonts), `base.css`, `components.css` and `pages.css`. These are combined into `site.css`.
- `assets/js/` holds small vanilla ES modules. There are no frameworks and no build step to run the site.
- `tools/` holds dev-only scripts. They are never loaded by the site.

There is no `npm install`. You need [Node.js](https://nodejs.org) for the dev tools only.

## Run it on your computer

```bash
node tools/serve.mjs
```
Then open http://localhost:4173/sanskriti/

## First deployment (GitHub Pages)

Check you are logged in:
```bash
gh auth status
```
Create the public repository and push:
```bash
gh repo create sanskriti --public --source=. --remote=origin --description "Sanskriti – India's Living Traditions. An MYP4 Digital Design project." --push
```
Turn on GitHub Pages (main branch, root folder):
```bash
gh api -X POST "repos/$(gh api user -q .login)/sanskriti/pages" -f "source[branch]=main" -f "source[path]=/"
```
Wait for the first build to finish:
```bash
gh api "repos/$(gh api user -q .login)/sanskriti/pages/builds/latest" -q .status
```
Then put your live URL (for example `https://YOUR-USERNAME.github.io/sanskriti/`, ending in `/`) into `tools/site.config.json` as `siteUrl`, and rebuild. This adds canonical links, share-card URLs, the sitemap and the 404 base link:
```bash
node tools/build-partials.mjs
```
```bash
git commit -am "chore: set live site URL" && git push
```
Add the URL to the repository's About box:
```bash
gh repo edit --homepage "https://YOUR-USERNAME.github.io/sanskriti/" --add-topic myp --add-topic digital-design --add-topic indian-culture --add-topic github-pages
```
Tag the release:
```bash
git tag -a v1.0.0 -m "Sanskriti v1.0.0 – MYP4 submission" && git push origin v1.0.0
```
```bash
gh release create v1.0.0 --generate-notes
```

## How to update the site

Always make changes on a short branch, then open a pull request. This shows each improvement in the project history.

```bash
git switch main && git pull
```
```bash
git switch -c fix/better-quiz-question
```
Make your edits. If you changed the header, footer, `data/skills.json` or any CSS file, rebuild:
```bash
node tools/build-partials.mjs
```
Check it still works:
```bash
node --test tests/*.test.mjs
```
```bash
git add -A && git commit -m "fix: clearer wording for quiz question 3"
```
```bash
git push -u origin fix/better-quiz-question
```
```bash
gh pr create --fill
```
When the checks are green, merge it:
```bash
gh pr merge --squash --delete-branch
```

### Common edits
- **Add a tradition:** add an entry to `data/skills.json` (copy an existing one), add an illustration or a licensed photo, list it in `CREDITS.md`, then run `node tools/build-partials.mjs`.
- **Add a place to Find Experiences:** only add a place after checking its official website. Fill in `verified.date` and `verified.source` in `data/experiences.json`.
- **Change colours:** edit `assets/css/tokens.css`, rebuild, then run `node tools/contrast-check.mjs`.

## Documentation
- [DEVLOG.md](DEVLOG.md): decisions and the TODO-VERIFY list
- [TESTING.md](TESTING.md): test results and the tests still to do by hand
- [SPEC-TRACEABILITY.md](SPEC-TRACEABILITY.md): how each ACCESSFM spec point is met
- [CREDITS.md](CREDITS.md): images, fonts and sources

## Licence
Code: MIT. Content and illustrations: CC BY 4.0. Fonts: SIL OFL 1.1. See [LICENSE](LICENSE) and [CREDITS.md](CREDITS.md).
