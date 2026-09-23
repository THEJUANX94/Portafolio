import { test, expect } from '@playwright/test';

const IDS = ['consolidacion-infraestructura', 'postulaciones-docentes', 'cardenas-vision', 'azure-distribuidos', 'ancla'];

test('todas las páginas de proyecto existen en ambos idiomas', async ({ request }) => {
  for (const lang of ['es', 'en']) {
    for (const id of IDS) {
      const res = await request.get(`/${lang}/proyectos/${id}/`);
      expect(res.status(), `/${lang}/proyectos/${id}/`).toBe(200);
    }
  }
});

test('proyecto institucional: aviso y sin enlaces externos', async ({ page }) => {
  await page.goto('/es/proyectos/consolidacion-infraestructura/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Consolidación de infraestructura');
  await expect(page.locator('[data-anonymized-note]')).toBeVisible();
  await expect(page.locator('[data-repo-link], [data-demo-link]')).toHaveCount(0);
  await expect(page.locator('[data-project-result]')).toContainText('57%');
  await expect(page.locator('[data-project-related] a')).toHaveAttribute('href', '/es/experiencia/');
});

test('proyecto público: enlace al repositorio y sin aviso', async ({ page }) => {
  await page.goto('/en/proyectos/ancla/');
  await expect(page.locator('[data-anonymized-note]')).toHaveCount(0);
  await expect(page.locator('[data-repo-link]')).toHaveAttribute('href', 'https://github.com/THEJUANX94/Ancla');
  await expect(page.getByRole('heading', { level: 2, name: 'The problem' })).toBeVisible();
});

test('navegación anterior / siguiente por orden', async ({ page }) => {
  await page.goto('/es/proyectos/consolidacion-infraestructura/');
  await expect(page.locator('[data-prev-link]')).toHaveCount(0);
  await expect(page.locator('[data-next-link]')).toHaveAttribute('href', '/es/proyectos/postulaciones-docentes/');
  await page.goto('/es/proyectos/ancla/');
  await expect(page.locator('[data-next-link]')).toHaveCount(0);
  await expect(page.locator('[data-prev-link]')).toHaveAttribute('href', '/es/proyectos/azure-distribuidos/');
});

test('el selector de idioma conserva el proyecto', async ({ page }) => {
  await page.goto('/es/proyectos/cardenas-vision/');
  await page.locator('[data-lang-switch]').click();
  await expect(page).toHaveURL(/\/en\/proyectos\/cardenas-vision\/$/);
});

test('desde la principal, una tarjeta abre su caso', async ({ page }) => {
  await page.goto('/es/');
  await page.locator('[data-project-card]').nth(1).getByRole('link').click();
  await expect(page).toHaveURL(/\/es\/proyectos\/postulaciones-docentes\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plataforma de postulaciones docentes');
});

test('ningún enlace interno responde 404', async ({ page, request }) => {
  const pages = ['/es/', '/en/', '/es/experiencia/', '/en/experiencia/', '/es/proyectos/ancla/', '/en/proyectos/consolidacion-infraestructura/'];
  const hrefs = new Set<string>();
  for (const path of pages) {
    await page.goto(path);
    const found = await page.locator('a[href^="/"]').evaluateAll((els) => els.map((el) => el.getAttribute('href')!));
    found.forEach((h) => hrefs.add(h.split('#')[0]));
  }
  for (const href of hrefs) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
});

test('ruta inexistente responde 404 con la página bilingüe', async ({ page }) => {
  const res = await page.goto('/es/proyectos/no-existe/');
  expect(res!.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página no encontrada');
});

test('celular: detalle sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/es/proyectos/cardenas-vision/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
