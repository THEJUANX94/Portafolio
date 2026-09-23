# Transición de tema en cascada — Design + Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Estado del diseño:** aprobado 2026-09-23 (demo en `.superpowers/brainstorm/`, opción **C · Cascada en secuencia**).

**Goal:** Al pulsar el botón de tema, los bloques de la página cambian de claro a oscuro (o al revés) **uno tras otro**, de arriba-izquierda hacia abajo, ~90 ms entre bloques, con un leve "respiro" (escala 0.985) y el ícono girando. Con `prefers-reduced-motion` el cambio es instantáneo.

**Architecture:**
- `src/lib/theme-cascade.ts` (puro, Vitest): dado el rectángulo de cada bloque y el alto de la ventana, devuelve el paso de cascada de cada uno (orden por fila y luego columna; bloques fuera de pantalla van al último paso; máximo 8 pasos).
- Los bloques se marcan con el atributo `data-cascade` en los componentes/páginas.
- `ThemeToggle.astro`: al hacer clic (sin movimiento reducido) calcula pasos, asigna `--cascade-step` a cada bloque, activa la clase `theme-cascade` en `<html>`, cambia `data-theme`, anima el "respiro" con Web Animations API y quita la clase al terminar.
- `global.css`: mientras `html.theme-cascade` está activa, todos los elementos transicionan colores con `transition-delay: calc(var(--cascade-step, 0) * 90ms)`. La variable se hereda del bloque a sus hijos. Fuera de la cascada no hay transiciones de color (sin parpadeos al cargar).
- El "respiro" usa `element.animate()` (no CSS `animation`) para no reiniciar la animación `rise-in` de las secciones.

**Tech Stack:** Astro 7.3, Tailwind 4.3, Vitest 5, Playwright 1.63.

Comandos desde `frontend/`. Rama `feat/tema-cascada`.

---

### Task 1: Orden de la cascada (`lib/theme-cascade.ts`)

**Files:** Create `frontend/src/lib/theme-cascade.ts`, `frontend/tests/unit/theme-cascade.test.ts`

- [ ] **Step 1: Test que falla**

```ts
import { describe, it, expect } from 'vitest';
import { cascadeSteps, CASCADE } from '../../src/lib/theme-cascade';

const r = (top: number, left: number) => ({ top, left });

describe('cascadeSteps', () => {
  it('ordena por fila (arriba primero) y luego por columna (izquierda primero)', () => {
    // perfil a la izquierda arriba, dos secciones a la derecha
    const rects = [r(300, 400), r(20, 20), r(20, 400)];
    expect(cascadeSteps(rects, 900)).toEqual([2, 0, 1]);
  });
  it('bloques casi a la misma altura cuentan como la misma fila (tolerancia 24 px)', () => {
    expect(cascadeSteps([r(30, 500), r(20, 20)], 900)).toEqual([1, 0]);
  });
  it('bloques fuera de la pantalla van al último paso', () => {
    expect(cascadeSteps([r(20, 20), r(2000, 20)], 900)).toEqual([0, CASCADE.maxStep]);
  });
  it('nunca supera el paso máximo', () => {
    const many = Array.from({ length: 20 }, (_, i) => r(i * 40, 20));
    const steps = cascadeSteps(many, 5000);
    expect(Math.max(...steps)).toBe(CASCADE.maxStep);
    expect(steps.slice(0, 3)).toEqual([0, 1, 2]);
  });
  it('lista vacía → lista vacía', () => {
    expect(cascadeSteps([], 900)).toEqual([]);
  });
  it('duración total = último paso × retardo + duración del color', () => {
    expect(CASCADE.totalMs).toBe(CASCADE.maxStep * CASCADE.stepMs + CASCADE.colorMs);
  });
});
```

- [ ] **Step 2:** `pnpm test` → FAIL (módulo inexistente).

- [ ] **Step 3: Implementación**

```ts
export const CASCADE = {
  stepMs: 90,
  colorMs: 350,
  maxStep: 8,
  rowTolerancePx: 24,
  get totalMs() {
    return this.maxStep * this.stepMs + this.colorMs;
  },
} as const;

interface Rect {
  top: number;
  left: number;
}

/**
 * Paso de cascada de cada bloque (mismo orden que la entrada).
 * Orden de lectura: filas de arriba hacia abajo (con tolerancia) y, dentro de una fila, de izquierda a derecha.
 * Los bloques por debajo de la ventana van al último paso.
 */
export function cascadeSteps(rects: readonly Rect[], viewportHeight: number): number[] {
  const order = rects
    .map((rect, index) => ({ rect, index }))
    .sort((a, b) => {
      const dy = a.rect.top - b.rect.top;
      if (Math.abs(dy) > CASCADE.rowTolerancePx) return dy;
      return a.rect.left - b.rect.left || dy;
    });

  const steps = new Array<number>(rects.length);
  order.forEach(({ rect, index }, position) => {
    steps[index] = rect.top > viewportHeight ? CASCADE.maxStep : Math.min(position, CASCADE.maxStep);
  });
  return steps;
}
```

Nota: `totalMs` es un getter en un objeto `as const`; si TypeScript se queja, definirlo como constante calculada aparte (`export const CASCADE_TOTAL_MS = …`) y ajustar el test.

- [ ] **Step 4:** `pnpm test` → PASS.
- [ ] **Step 5: Commit** — `feat: add theme cascade ordering helper`

---

### Task 2: CSS de la cascada

**Files:** Modify `frontend/src/styles/global.css`

- [ ] Agregar:

```css
/* ---------- Cambio de tema en cascada (ver ThemeToggle.astro) ---------- */
html.theme-cascade *,
html.theme-cascade *::before,
html.theme-cascade *::after {
  transition-property: background-color, color, border-color, fill, stroke, box-shadow, outline-color;
  transition-duration: 0.35s;
  transition-timing-function: ease;
  transition-delay: calc(var(--cascade-step, 0) * 90ms);
}
html.theme-cascade body {
  transition: background-color 0.35s ease, color 0.35s ease;
}
```

(Los valores 0.35 s y 90 ms coinciden con `CASCADE.colorMs` y `CASCADE.stepMs`.)

- [ ] Commit — `feat: add theme cascade color transitions`

---

### Task 3: Marcar bloques y script del botón

**Files:** Modify `ProfileCard.astro`, `Section.astro`, `MetroMap.astro`, `pages/[lang]/experiencia.astro`, `pages/[lang]/proyectos/[slug].astro`, `pages/404.astro`, `ThemeToggle.astro`

- [ ] **Step 1: `data-cascade`** en:
  - `ProfileCard.astro`: `<header>` raíz.
  - `Section.astro`: `<section>` raíz.
  - `MetroMap.astro`: `<ul data-metro-legend>`, el `<li>` de la terminal y cada `<li data-station-row>`.
  - `experiencia.astro`: `<header>`, `<h1>` y el `<p>` de introducción.
  - `[slug].astro`: `<header>`, `<h1>`, `<p>` del tagline, el aviso anonimizado, cada `<section>` del artículo y el `<nav>`.
  - `404.astro`: el `<p>` "404" y ambas `<section>`.

- [ ] **Step 2: Script** — reemplazar el manejador de clic de `ThemeToggle.astro`:

```ts
import { cascadeSteps, CASCADE } from '../lib/theme-cascade';

// …(KEY, current, sync existentes)…

function applyTheme(next: 'light' | 'dark') {
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(KEY, next); } catch { /* almacenamiento no disponible */ }
  sync();
}

let cascadeTimer: number | undefined;

function cascadeTo(next: 'light' | 'dark', button: HTMLButtonElement) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return applyTheme(next);

  const blocks = [...document.querySelectorAll<HTMLElement>('[data-cascade]')];
  const steps = cascadeSteps(blocks.map((el) => el.getBoundingClientRect()), window.innerHeight);
  blocks.forEach((el, i) => el.style.setProperty('--cascade-step', String(steps[i])));

  const root = document.documentElement;
  root.classList.add('theme-cascade');
  applyTheme(next);

  blocks.forEach((el, i) => {
    el.animate([{ scale: '1' }, { scale: '0.985' }, { scale: '1' }], {
      duration: 450,
      delay: steps[i] * CASCADE.stepMs,
      easing: 'ease',
    });
  });
  button.querySelector('svg:not([style*="display: none"])')?.animate(
    [{ rotate: '0deg' }, { rotate: '360deg' }],
    { duration: 600, easing: 'ease-in-out' },
  );

  window.clearTimeout(cascadeTimer);
  cascadeTimer = window.setTimeout(() => {
    root.classList.remove('theme-cascade');
    blocks.forEach((el) => el.style.removeProperty('--cascade-step'));
  }, CASCADE.totalMs + 50);
}

for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
  btn.addEventListener('click', () => cascadeTo(current() === 'dark' ? 'light' : 'dark', btn));
}
```

Para el giro del ícono basta con animar el `<svg>` visible; si el selector `:not([style*=…])` no sirve (los íconos se ocultan con CSS, no con estilo en línea), animar ambos `svg` del botón (el oculto no se ve).

- [ ] **Step 3: Verificar** — `pnpm check && pnpm test && pnpm build && pnpm test:e2e` (53). Revisión visual: script temporal de Playwright que en `/es/` (1280, tema claro) hace clic en el botón de tema y toma capturas a los 150 ms, 450 ms y 1200 ms → `…/scratchpad/cascade-1.png`, `-2.png`, `-3.png`. Debe verse la secuencia (tarjeta de perfil primero, luego secciones en orden) y al final todo oscuro. Limpiar el script después.

- [ ] **Step 4: Commit** — `feat: cascade theme change across page blocks`

---

### Task 4: Pruebas e2e y docs

**Files:** Create `frontend/tests/e2e/theme-cascade.spec.ts`; Modify `docs/01-arquitectura/architecture.md`, `docs/log.md`

- [ ] **Step 1: Tests**

```ts
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
```

- [ ] **Step 2:** `pnpm test:e2e` → 56 passed. Los tests existentes de tema (`base.spec.ts`, `seo.spec.ts`) deben seguir pasando.
- [ ] **Step 3: Docs** — `architecture.md` sección "8. Animaciones": párrafo "Cambio de tema en cascada" (lib, atributo `data-cascade`, clase `theme-cascade`, WAAPI para el respiro, reducido = instantáneo). `log.md`: bullet 2026-09-23.
- [ ] **Step 4: Commit** — `test: cover cascading theme change` y `docs: document cascading theme transition` (o uno solo con ambos).
