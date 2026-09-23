import { test, expect } from '@playwright/test';

test.describe('raíz', () => {
  test.use({ locale: 'es-CO' });
  test('navegador en español → /es/', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/es\/$/);
  });
});

test.describe('raíz en inglés', () => {
  test.use({ locale: 'en-US' });
  test('navegador en inglés → /en/', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
  });
});

test('las dos versiones muestran el nombre y su idioma', async ({ page }) => {
  await page.goto('/es/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Juan Sebastián');
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByText('Software Engineer')).toBeVisible();
});

test('el selector de idioma lleva a la misma página en el otro idioma', async ({ page }) => {
  await page.goto('/es/');
  await page.locator('[data-lang-switch]').click();
  await expect(page).toHaveURL(/\/en\/$/);
});

test('el tema se alterna y se recuerda al recargar', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/es/');
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('sin scroll horizontal en celular (375 px)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ['/es/', '/en/', '/404']) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, path).toBe(false);
  }
});

test('el CV en español existe', async ({ request }) => {
  const res = await request.get('/cv/CV-Juan-Sebastian-Martinez-ES.pdf');
  expect(res.status()).toBe(200);
});
