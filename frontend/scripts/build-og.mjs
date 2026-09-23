// Genera public/img/og-{es,en}.png (1200×630) desde ../og/og.html y src/data/profile.json.
// Uso (desde frontend/): pnpm og
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const template = fileURLToPath(new URL('../../og/og.html', import.meta.url));
const fontCss = fileURLToPath(new URL('../node_modules/@fontsource-variable/plus-jakarta-sans/index.css', import.meta.url));
const [profile] = JSON.parse(readFileSync(new URL('../src/data/profile.json', import.meta.url), 'utf8'));
const outDir = fileURLToPath(new URL('../public/img/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const words = profile.name.split(/\s+/);
const monogram = (words[0][0] + (words.length >= 4 ? words[2] : words.at(-1))[0]).toUpperCase();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const lang of ['es', 'en']) {
  await page.goto(pathToFileURL(template).href);
  await page.addStyleTag({ path: fontCss });
  await page.evaluate(
    ({ name, title, availability, monogram }) => {
      document.getElementById('name').textContent = name;
      document.getElementById('title').textContent = title;
      document.getElementById('availability').textContent = availability;
      document.getElementById('mono').textContent = monogram;
    },
    { name: profile.name, title: profile.title[lang], availability: profile.availabilityNote[lang], monogram },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${outDir}og-${lang}.png` });
}
await browser.close();
console.log(`Imágenes OG generadas en ${outDir}`);
