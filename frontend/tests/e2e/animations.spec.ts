import { test, expect } from '@playwright/test';

const vtName = (loc: import('@playwright/test').Locator) =>
  loc.evaluate((el) => getComputedStyle(el).getPropertyValue('view-transition-name'));

test('título de tarjeta y de página de proyecto comparten nombre de transición', async ({ page }) => {
  await page.goto('/es/');
  const card = page.locator('[data-project-card] h3').first();
  expect(await vtName(card)).toBe('project-title-consolidacion-infraestructura');
  await page.goto('/es/proyectos/consolidacion-infraestructura/');
  expect(await vtName(page.getByRole('heading', { level: 1 }))).toBe('project-title-consolidacion-infraestructura');
});

test('experiencia y recorrido comparten nombre de transición', async ({ page }) => {
  await page.goto('/es/');
  expect(await vtName(page.locator('#experience-title'))).toBe('journey-title');
  await page.goto('/es/experiencia/');
  expect(await vtName(page.getByRole('heading', { level: 1 }))).toBe('journey-title');
});

test('nombres de transición únicos en cada página', async ({ page }) => {
  for (const path of ['/es/', '/es/experiencia/', '/es/proyectos/ancla/']) {
    await page.goto(path);
    const names = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .map((el) => getComputedStyle(el).getPropertyValue('view-transition-name'))
        .filter((n) => n && n !== 'none'),
    );
    expect(new Set(names).size, path).toBe(names.length);
  }
});

test('hover eleva la tarjeta de proyecto', async ({ page }) => {
  await page.goto('/es/');
  const card = page.locator('[data-project-card]').first();
  await card.hover();
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el).translate)).not.toBe('none');
});

test('con movimiento reducido no hay transición en hover', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/es/');
  const card = page.locator('[data-project-card]').first();
  const duration = await card.evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
  expect(duration).toBeLessThan(0.01);
});
