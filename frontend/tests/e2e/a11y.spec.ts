import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/es/', '/en/', '/es/experiencia/', '/en/proyectos/ancla/', '/es/proyectos/consolidacion-infraestructura/', '/404'];

for (const scheme of ['light', 'dark'] as const) {
  for (const path of PAGES) {
    test(`sin violaciones WCAG A/AA: ${path} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
}
