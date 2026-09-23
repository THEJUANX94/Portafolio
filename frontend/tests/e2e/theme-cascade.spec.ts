import { test, expect } from '@playwright/test';

test('el cambio de tema recorre los bloques en secuencia y termina limpio', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/es/');
  await page.locator('[data-theme-toggle]').first().click();
  await expect(page.locator('html')).toHaveClass(/theme-cascade/);
  const steps = await page.locator('[data-cascade]').evaluateAll((els) =>
    els.map((el) => Number((el as HTMLElement).style.getPropertyValue('--cascade-step'))),
  );
  expect(steps[0]).toBe(0); // la tarjeta de perfil (primer bloque) arranca
  expect(Math.max(...steps)).toBeGreaterThan(0);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).not.toHaveClass(/theme-cascade/, { timeout: 3000 });
});

test('con movimiento reducido el tema cambia sin cascada', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/es/experiencia/');
  await page.locator('[data-theme-toggle]').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).not.toHaveClass(/theme-cascade/);
});

test('todas las páginas tienen bloques de cascada', async ({ page }) => {
  for (const path of ['/es/', '/es/experiencia/', '/es/proyectos/ancla/', '/404']) {
    await page.goto(path);
    expect(await page.locator('[data-cascade]').count(), path).toBeGreaterThan(1);
  }
});
