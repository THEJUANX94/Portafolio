# Animaciones y micro-interacciones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transiciones nativas entre páginas (fundido + elemento compartido) y 8 detalles de hover, respetando `prefers-reduced-motion` y dispositivos táctiles.

**Architecture:** Todo en CSS. `global.css` recibe `@view-transition`, las animaciones de `::view-transition-*` y un set de clases utilitarias de hover dentro de `@media (hover: hover)`. Los componentes agregan esas clases y `view-transition-name` en los títulos compartidos. Sin JS nuevo.

**Tech Stack:** Astro 7.3, Tailwind 4.3 (propiedades individuales `translate`/`scale`), Playwright 1.63.

**Spec:** [2026-09-23-animaciones-design.md](../specs/2026-09-23-animaciones-design.md)

Comandos desde `frontend/`. Rama: `feat/animaciones`.

**Nota Tailwind 4:** las utilidades `-translate-x-1/2`, `scale-*` usan las propiedades CSS individuales `translate` y `scale`, no `transform`. Los efectos de hover usan también `translate`/`scale`/`rotate` individuales para no pisar esos valores.

---

### Task 1: CSS global — transiciones de página y utilidades de hover

**Files:** Modify `frontend/src/styles/global.css`

- [ ] **Step 1:** Agregar al final de `global.css` (antes del bloque `prefers-reduced-motion` existente, o después; el orden no importa salvo que el bloque reducido nuevo vaya al final):

```css
/* ---------- Transiciones entre páginas (View Transitions nativas) ---------- */
@view-transition {
  navigation: auto;
}

@keyframes vt-fade-out {
  to { opacity: 0; }
}
@keyframes vt-fade-up {
  from { opacity: 0; translate: 0 10px; }
}

::view-transition-old(root) {
  animation: vt-fade-out 0.2s ease both;
}
::view-transition-new(root) {
  animation: vt-fade-up 0.3s ease-out both;
}
::view-transition-group(*) {
  animation-duration: 0.4s;
  animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* ---------- Detalles de hover (solo con mouse) ---------- */
.link-grow {
  text-decoration: none;
  background-image:
    linear-gradient(currentColor, currentColor),
    linear-gradient(color-mix(in srgb, currentColor 35%, transparent), color-mix(in srgb, currentColor 35%, transparent));
  background-position: 0 100%, 0 100%;
  background-size: 0 2px, 100% 1px;
  background-repeat: no-repeat;
  padding-bottom: 2px;
}

@media (hover: hover) {
  .hover-lift {
    transition: translate 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .hover-lift:hover {
    translate: 0 -4px;
    box-shadow: 0 12px 28px -12px color-mix(in srgb, var(--primary) 45%, transparent);
  }

  .hover-arrow .arrow {
    display: inline-block;
    transition: translate 0.2s ease;
  }
  .hover-arrow:hover .arrow {
    translate: 4px 0;
  }

  .link-grow {
    transition: background-size 0.25s ease;
  }
  .link-grow:hover {
    background-size: 100% 2px, 100% 1px;
  }

  .chip {
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .chip:hover {
    background-color: var(--surface-soft);
    border-color: var(--accent);
    color: var(--primary);
  }

  .station-row .station-dot {
    transition: scale 0.2s ease, box-shadow 0.2s ease;
  }
  .station-row:hover .station-dot {
    scale: 1.25;
    box-shadow: 0 0 0 5px var(--surface-soft);
  }

  .theme-spin svg {
    transition: rotate 0.4s ease, scale 0.4s ease;
  }
  .theme-spin:hover svg {
    rotate: -25deg;
    scale: 1.1;
  }

  .avatar-ring {
    transition: box-shadow 0.3s ease, scale 0.3s ease;
  }
  .avatar-ring:hover {
    box-shadow: 0 0 0 4px var(--surface), 0 0 0 7px var(--accent);
    scale: 1.03;
  }

  .shine {
    position: relative;
    overflow: hidden;
  }
  .shine::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 30%, rgb(255 255 255 / 0.28) 50%, transparent 70%);
    translate: -100% 0;
    pointer-events: none;
  }
  .shine:hover::after {
    transition: translate 0.6s ease;
    translate: 100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  @view-transition {
    navigation: none;
  }
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

- [ ] **Step 2:** `pnpm check && pnpm build` → verde; `grep -o "@view-transition" dist/_astro/*.css` encuentra la regla (Tailwind/Lightning CSS no la elimina). Si la elimina, reportar.

- [ ] **Step 3: Commit** — `feat: add native page transitions and hover utility styles`

---

### Task 2: Aplicar en componentes

**Files:** Modify `ProjectCard.astro`, `Section.astro`, `ExperienceSummary.astro`, `ProfileCard.astro`, `ThemeToggle.astro`, `SkillGroup.astro`, `MetroMap.astro`, `pages/[lang]/index.astro`, `pages/[lang]/experiencia.astro`, `pages/[lang]/proyectos/[slug].astro`

- [ ] **Step 1: Elementos compartidos (B)**
  - `ProjectCard.astro`: al `<h3>` agregar `style={`view-transition-name: project-title-${id}`}`.
  - `pages/[lang]/proyectos/[slug].astro`: al `<h1>` agregar `style={`view-transition-name: project-title-${project.id}`}`.
  - `Section.astro`: nueva prop opcional `vtName?: string`; si existe, poner `style={`view-transition-name: ${vtName}`}` en el `<h2>`. En `pages/[lang]/index.astro` pasar `vtName="journey-title"` a la sección `experience`.
  - `pages/[lang]/experiencia.astro`: al `<h1>` agregar `style="view-transition-name: journey-title"`.

- [ ] **Step 2: Hover 1–8**
  1. `ProjectCard.astro`: al `<article>` agregar `hover-lift hover-arrow`; en el `<span … >{t(lang,'home.viewCase')} →</span>` separar la flecha: `{t(lang, 'home.viewCase')} <span class="arrow">→</span>`; chips con clase `chip` y borde transparente para que el cambio de borde no mueva el layout: `class="chip rounded-full border border-transparent bg-surface-soft px-2 py-0.5 text-xs"`.
  2. `ExperienceSummary.astro`: al enlace `data-journey-link` agregar `hover-arrow` y cambiar `<span aria-hidden="true"> →</span>` por `<span aria-hidden="true" class="arrow"> →</span>`. En `[slug].astro` hacer lo mismo con los enlaces `data-next-link` / `data-prev-link` (flecha `←` con `class="arrow"`; para "anterior" la flecha debe moverse a la izquierda: agregar en `global.css` dentro de `@media (hover:hover)`: `.hover-arrow-back:hover .arrow { translate: -4px 0; }` y usar `hover-arrow-back` en el enlace anterior, con `.hover-arrow-back .arrow` compartiendo la `transition` de `.hover-arrow .arrow`). A las tarjetas anterior/siguiente agregar también `hover-lift`.
  3. `link-grow` reemplazando `underline underline-offset-4 hover:no-underline` o `underline-offset-4 hover:underline` en: enlaces LinkedIn/GitHub (`ProfileCard`), "Hablemos" y proyectos de la etapa (`MetroMap`), repositorio/demo y experiencia relacionada (`[slug].astro`, variable `external`), enlaces "Volver" (`experiencia.astro`, `[slug].astro`).
  4. `SkillGroup.astro`: chips con clase `chip` (ya tienen `border`). En `[slug].astro` las etiquetas de tecnología también con `chip`. En `MetroMap.astro` las etiquetas con `chip border border-transparent`.
  5. `MetroMap.astro`: al `<li>` de cada estación agregar `station-row`; al `<span>` del punto de la estación agregar `station-dot`.
  6. `ThemeToggle.astro`: al `<button>` agregar `theme-spin`.
  7. `ProfileCard.astro`: a la `<img>` y al `<div>` de iniciales agregar `avatar-ring`.
  8. `ProfileCard.astro`: al enlace `data-cv-link` agregar `shine`.

- [ ] **Step 3:** `pnpm check && pnpm test && pnpm build && pnpm test:e2e` → verde (48). Revisión visual con capturas en `…/scratchpad/anim-home.png` (hover sobre la primera tarjeta, 1280 px, claro) usando un script temporal con `page.hover()` y `pnpm preview --port 4323`; limpiar después.

- [ ] **Step 4: Commit** — `feat: add shared-element titles and hover micro-interactions`

---

### Task 3: Pruebas

**Files:** Create `frontend/tests/e2e/animations.spec.ts`

- [ ] **Step 1:**

```ts
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
```

- [ ] **Step 2:** `pnpm test:e2e` → 53 passed (48 + 5). Si alguna aserción falla, investigar la causa (p. ej., Chromium de Playwright y `view-transition-name`), no debilitarla.

- [ ] **Step 3: Commit** — `test: cover view transition names and hover behavior`

---

### Task 4: Documentación

- [ ] `docs/01-arquitectura/architecture.md`: sección "8. Animaciones" (View Transitions nativas entre documentos, nombres compartidos `project-title-<id>` y `journey-title`, utilidades de hover en `global.css` dentro de `@media (hover: hover)`, desactivación con `prefers-reduced-motion`).
- [ ] `docs/log.md`: bullet 2026-09-23 con enlace a spec y plan.
- [ ] Verificación: `pnpm check && pnpm test && pnpm build && pnpm test:e2e`.
- [ ] Commit — `docs: document page transitions and hover details`
