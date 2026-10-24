# andrewcassidy.dev

Hand-written static site. No framework, no build step for the pages themselves.

- `index.html`: home
- `cv/index.html`: CV. Screen styles show a paper sheet; print styles give an A4 layout
- `assets/`: shared CSS
- `scripts/build.mjs`: copies the site into `_site/` and renders `cv/andrew-cassidy-cv.pdf` with headless Chromium
- `.github/workflows/pages.yml`: runs the build and deploys to GitHub Pages on every push to `master`

Edit the CV in `cv/index.html` only; the PDF is regenerated from it on deploy.

## Local preview

```sh
npm install --no-save playwright && npx playwright install chromium
node scripts/build.mjs
python3 -m http.server -d _site 8000
```

## Dissertation

`dissertation.pdf` is exported from the original Google Doc ("CO620 Report").
