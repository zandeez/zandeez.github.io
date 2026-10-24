// Assemble the site into _site/ and render the CV page to PDF.
// Usage: node scripts/build.mjs   (needs the "playwright" package and Chromium)
import { cp, mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const out = join(root, '_site');
const include = ['index.html', '404.html', 'CNAME', 'sitemap.xml', 'assets', 'cv', 'dissertation.pdf'];

await rm(out, { recursive: true, force: true });
await mkdir(out);
for (const item of include) {
    await cp(join(root, item), join(out, item), { recursive: true }).catch((err) => {
        if (err.code !== 'ENOENT') throw err; // optional files (e.g. dissertation.pdf) may be absent
    });
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(join(out, 'cv', 'index.html')).href, { waitUntil: 'networkidle' });
await page.pdf({
    path: join(out, 'cv', 'andrew-cassidy-cv.pdf'),
    format: 'A4',
    preferCSSPageSize: true,
    printBackground: true,
});
await browser.close();
console.log('Built _site/ and _site/cv/andrew-cassidy-cv.pdf');
