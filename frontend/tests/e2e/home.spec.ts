import { test, expect } from '@playwright/test';

test.describe('principal en español', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/es/');
  });

  test('tarjeta de perfil con CV y contacto', async ({ page, request }) => {
    const card = page.locator('[data-profile-card]');
    await expect(card.getByRole('heading', { level: 1 })).toContainText('Juan Sebastián');
    await expect(card.locator('[data-availability]')).toBeVisible();
    const cv = card.locator('[data-cv-link]');
    const href = await cv.getAttribute('href');
    expect(href).toBe('/cv/CV-Juan-Sebastian-Martinez-ES.pdf');
    expect((await request.get(href!)).status()).toBe(200);
    await expect(card.locator('[data-contact-link]')).toHaveAttribute('href', 'https://mail.google.com/mail/?view=cm&fs=1&to=sebastianmn03%40gmail.com&su=Contacto+desde+tu+portafolio');
    await expect(card.locator('[data-contact-link]')).toHaveAttribute('target', '_blank');
    await expect(card.locator('[data-email-link]')).toHaveAttribute('href', 'mailto:sebastianmn03@gmail.com');
    await expect(page.locator('[data-freelance-link]')).toHaveAttribute('href', 'https://mail.google.com/mail/?view=cm&fs=1&to=sebastianmn03%40gmail.com&su=Contacto+desde+tu+portafolio');
  });

  test('seis secciones en orden', async ({ page }) => {
    const ids = await page.locator('main > section').evaluateAll((els) => els.map((el) => el.id));
    expect(ids).toEqual(['about', 'experience', 'projects', 'skills', 'education', 'contact']);
  });

  test('experiencia lleva al recorrido', async ({ page }) => {
    await expect(page.locator('[data-journey-link]')).toHaveAttribute('href', '/es/experiencia/');
    await expect(page.locator('[data-experience-summary] li')).toHaveCount(3);
  });

  test('proyectos destacados enlazan a su caso', async ({ page }) => {
    const cards = page.locator('[data-project-card]');
    await expect(cards).toHaveCount(4);
    await expect(cards.first().getByRole('link')).toHaveAttribute('href', '/es/proyectos/consolidacion-infraestructura/');
  });

  test('habilidades y cursos', async ({ page }) => {
    await expect(page.locator('[data-skill-group]')).toHaveCount(6);
    await expect(page.locator('[data-course]')).toHaveCount(4);
  });
});

test('principal en inglés usa textos en inglés', async ({ page, request }) => {
  await page.goto('/en/');
  await expect(page.getByRole('heading', { level: 2, name: 'Featured projects' })).toBeVisible();
  await expect(page.locator('[data-cv-link]')).toHaveText('Download CV');
  await expect(page.locator('[data-journey-link]')).toHaveAttribute('href', '/en/experiencia/');
  const cv = page.locator('[data-cv-link]');
  const href = await cv.getAttribute('href');
  expect(href).toBe('/cv/CV-Juan-Sebastian-Martinez-EN.pdf');
  expect((await request.get(href!)).status()).toBe(200);
});

test('escritorio: tarjeta a la izquierda del contenido', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/es/');
  const card = await page.locator('[data-profile-card]').boundingBox();
  const main = await page.locator('main').boundingBox();
  expect(card!.x + card!.width).toBeLessThanOrEqual(main!.x);
});

test('celular: tarjeta arriba del contenido y sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/es/');
  const card = await page.locator('[data-profile-card]').boundingBox();
  const main = await page.locator('main').boundingBox();
  expect(card!.y + card!.height).toBeLessThanOrEqual(main!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
