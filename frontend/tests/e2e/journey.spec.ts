import { test, expect } from '@playwright/test';

test.describe('recorrido en español', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/es/experiencia/');
  });

  test('título, leyenda y estaciones en orden', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mi recorrido');
    await expect(page.locator('[data-metro-legend] li')).toHaveText(['Empleo', 'Proyectos y hackatón']);
    const stations = page.locator('[data-station]');
    await expect(stations).toHaveCount(5);
    await expect(stations.nth(0)).toHaveAttribute('data-line', 'projects');
    await expect(stations.nth(0)).toContainText('Líder de equipo');
    await expect(stations.nth(1)).toContainText('Tech Lead');
    await expect(stations.nth(2)).toContainText('Practicante');
    await expect(stations.nth(3)).toHaveAttribute('data-line', 'projects');
    await expect(stations.nth(3)).toContainText('Aplicación distribuida de estudiantes');
    await expect(stations.nth(3)).toContainText('2022 – 2023');
    await expect(stations.nth(4)).toHaveAttribute('data-line', 'projects');
    await expect(stations.nth(4)).toContainText('Ancla');
  });

  test('solo la estación más reciente está abierta al cargar', async ({ page }) => {
    const stations = page.locator('[data-station]');
    await expect(stations.nth(0)).toHaveAttribute('open', '');
    await expect(stations.nth(1)).not.toHaveAttribute('open', '');
    await expect(stations.nth(2)).not.toHaveAttribute('open', '');
  });

  test('con teclado se abre otra estación y la anterior se cierra', async ({ page }) => {
    const stations = page.locator('[data-station]');
    await stations.nth(1).locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(stations.nth(1)).toHaveAttribute('open', '');
    await expect(stations.nth(0)).not.toHaveAttribute('open', '');
    await expect(stations.nth(1).locator('[data-station-body]')).toContainText('57%');
  });

  test('enlaces: volver, contacto y proyectos de la etapa', async ({ page }) => {
    await expect(page.locator('[data-back-link]')).toHaveAttribute('href', '/es/');
    await expect(page.locator('[data-metro-next]')).toHaveAttribute('href', 'mailto:sebastianmn03@gmail.com');
    await expect(page.locator('[data-station]').nth(0).getByRole('link')).toHaveAttribute('href', '/es/proyectos/cardenas-vision/');
  });

  test('el selector de idioma conserva la página', async ({ page }) => {
    await page.locator('[data-lang-switch]').click();
    await expect(page).toHaveURL(/\/en\/experiencia\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('My journey');
  });
});

test('la principal enlaza al recorrido', async ({ page }) => {
  await page.goto('/es/');
  await page.locator('[data-journey-link]').click();
  await expect(page).toHaveURL(/\/es\/experiencia\/$/);
});

test('sin JavaScript las estaciones siguen siendo legibles y se pueden abrir', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/es/experiencia/');
  await expect(page.locator('[data-station]').nth(0).locator('[data-station-body]')).toBeVisible();
  await page.locator('[data-station]').nth(2).locator('summary').click();
  await expect(page.locator('[data-station]').nth(2).locator('[data-station-body]')).toBeVisible();
  await context.close();
});

test('celular: sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/es/experiencia/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
