import { test, expect } from '@playwright/test';

test('principal: Open Graph, Twitter, x-default y JSON-LD', async ({ page, request }) => {
  await page.goto('/es/');
  const og = (p: string) => page.locator(`meta[property="${p}"]`);
  await expect(og('og:locale')).toHaveAttribute('content', 'es_CO');
  await expect(og('og:type')).toHaveAttribute('content', 'profile');
  const image = await og('og:image').getAttribute('content');
  expect(image).toMatch(/\/img\/og-es\.png$/);
  expect((await request.get(new URL(image!).pathname)).status()).toBe(200);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', /\/es\/$/);
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(ld['@type']).toBe('Person');
  expect(ld.sameAs).toContain('https://github.com/THEJUANX94');
});

test('inglés usa su propia imagen y locale', async ({ page }) => {
  await page.goto('/en/experiencia/');
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-en\.png$/);
});

test('robots.txt apunta al sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  expect(await res.text()).toMatch(/Sitemap: .*\/sitemap-index\.xml/);
});

test('botón de tema refleja el estado con aria-pressed', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/es/');
  const btn = page.locator('[data-theme-toggle]').first();
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
});
