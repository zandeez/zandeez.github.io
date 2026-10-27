// Assemble the site into _site/ and render the CV page to PDF.
// Usage: node scripts/build.mjs   (needs the "playwright" package and Chromium)
import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const out = join(root, '_site');
const include = ['index.html', '404.html', 'CNAME', 'sitemap.xml', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'assets', 'cv', 'dissertation.pdf'];

await rm(out, { recursive: true, force: true });
await mkdir(out);
for (const item of include) {
    await cp(join(root, item), join(out, item), { recursive: true }).catch((err) => {
        if (err.code !== 'ENOENT') throw err; // optional files (e.g. dissertation.pdf) may be absent
    });
}

// Cloudflare and browsers cache assets/*.css for hours, so give each stylesheet link a content hash
const cssVersion = {};
for (const name of await readdir(join(out, 'assets'))) {
    if (name.endsWith('.css')) {
        cssVersion[name] = createHash('sha256').update(await readFile(join(out, 'assets', name))).digest('hex').slice(0, 8);
    }
}
for (const html of ['index.html', '404.html', join('cv', 'index.html')]) {
    const path = join(out, html);
    const text = await readFile(path, 'utf8');
    await writeFile(path, text.replace(/(href="[^"]*assets\/)([\w-]+\.css)"/g,
        (match, prefix, name) => (name in cssVersion ? `${prefix}${name}?v=${cssVersion[name]}"` : match)));
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
