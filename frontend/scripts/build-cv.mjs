// Genera public/cv/CV-Juan-Sebastian-Martinez-EN.pdf desde ../cv/cv-en.html.
// Uso (desde frontend/): pnpm cv
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const source = fileURLToPath(new URL('../../cv/cv-en.html', import.meta.url));
const output = fileURLToPath(new URL('../public/cv/CV-Juan-Sebastian-Martinez-EN.pdf', import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(source).href, { waitUntil: 'load' });
await page.pdf({
  path: output,
  format: 'Letter',
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate:
    '<div style="width:100%;font:8px Arial,sans-serif;color:#888;text-align:right;padding-right:0.6in">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
});
await browser.close();
console.log(`CV generado: ${output}`);
