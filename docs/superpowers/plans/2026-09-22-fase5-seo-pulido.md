# Fase 5 — SEO y pulido Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el sitio se vea bien al compartirlo (Open Graph / Twitter), lo entienda Google (JSON-LD `Person`, `robots.txt`, `hreflang` con `x-default`), cargue rápido (fuente autoalojada, favicon propio) y quede protegido por pruebas automáticas de accesibilidad (axe en ambos temas) y de calidad (Lighthouse CI ≥ 90 en las cuatro categorías). Además: ícono de tema sol/luna con `aria-pressed` y animaciones de entrada suaves.

**Architecture:** Lógica de metadatos pura en `src/lib/seo.ts` (Vitest). `BaseLayout.astro` recibe `image`/`type` y emite Open Graph, Twitter card, `hreflang` + `x-default`. `robots.txt` como endpoint estático que usa `Astro.site`. Imágenes OG (1200×630, una por idioma) generadas con Playwright desde una plantilla HTML (`og/og.html`), igual que el CV. Fuente vía `@fontsource-variable/plus-jakarta-sans`.

**Tech Stack:** Astro 7.3, Tailwind 4.3, Vitest 5, Playwright 1.63, @axe-core/playwright 4.13, @lhci/cli 0.15, @fontsource-variable/plus-jakarta-sans 5.3.

**Spec:** [2026-09-22-portafolio-v1-design.md](../specs/2026-09-22-portafolio-v1-design.md) — *SEO y vista previa*, *Tema y estilo*, *Accesibilidad*, *Pruebas y calidad*.

---

## Mapa de archivos

```
og/og.html                                     (crear: plantilla de imagen OG)
frontend/
├── scripts/build-og.mjs                       (crear)
├── public/img/og-es.png, og-en.png            (generar)
├── public/favicon.svg                         (reemplazar), public/favicon.ico (borrar)
├── src/lib/seo.ts                             (crear: ogLocale, personJsonLd)
├── src/layouts/BaseLayout.astro               (modificar: OG, Twitter, x-default, fuente)
├── src/pages/robots.txt.ts                    (crear)
├── src/pages/[lang]/index.astro               (modificar: JSON-LD)
├── src/components/ThemeToggle.astro           (modificar: sol/luna, aria-pressed)
├── src/styles/global.css                      (modificar: fuente, animación)
├── astro.config.mjs                           (modificar: locales del sitemap)
├── lighthouserc.cjs                           (crear)
├── tests/unit/seo.test.ts                     (crear)
└── tests/e2e/seo.spec.ts, a11y.spec.ts        (crear)
.github/workflows/ci.yml                       (modificar: Lighthouse CI)
docs/…                                         (modificar)
```

Comandos de `frontend/` con el directorio de trabajo en `Portfolio/frontend`.

---

### Task 1: Metadatos puros (`lib/seo.ts`)

**Files:**
- Create: `frontend/src/lib/seo.ts`
- Test: `frontend/tests/unit/seo.test.ts`

- [ ] **Step 1: Test que falla**

```ts
import { describe, it, expect } from 'vitest';
import { ogLocale, personJsonLd } from '../../src/lib/seo';

describe('ogLocale', () => {
  it('formato de Open Graph por idioma', () => {
    expect(ogLocale('es')).toBe('es_CO');
    expect(ogLocale('en')).toBe('en_US');
  });
});

describe('personJsonLd', () => {
  const profile = {
    name: 'Juan Sebastián Martínez Noreña',
    title: { es: 'Ingeniero de Software', en: 'Software Engineer' },
    summary: { es: 'Resumen', en: 'Summary' },
    email: 'a@b.co',
    linkedin: 'https://linkedin.com/in/x',
    github: 'https://github.com/x',
    location: { es: 'Boyacá, Colombia', en: 'Boyacá, Colombia' },
    education: { degree: { es: 'Ingeniería', en: 'Engineering' }, institution: 'UPTC', year: 2026 },
  };

  it('Person con cargo, enlaces y formación en el idioma pedido', () => {
    const ld = personJsonLd(profile, 'en', 'https://example.com/en/');
    expect(ld).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Juan Sebastián Martínez Noreña',
      jobTitle: 'Software Engineer',
      description: 'Summary',
      url: 'https://example.com/en/',
      email: 'mailto:a@b.co',
      sameAs: ['https://linkedin.com/in/x', 'https://github.com/x'],
      address: { '@type': 'PostalAddress', addressRegion: 'Boyacá', addressCountry: 'CO' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'UPTC' },
    });
  });
});
```

- [ ] **Step 2: Verificar que falla** — Run: `pnpm test` → FAIL (módulo inexistente).

- [ ] **Step 3: Implementación**

`frontend/src/lib/seo.ts`:
```ts
import type { Locale } from './i18n';
import type { Localized } from './schemas';

const OG_LOCALE: Record<Locale, string> = { es: 'es_CO', en: 'en_US' };

export function ogLocale(locale: Locale): string {
  return OG_LOCALE[locale];
}

interface PersonSource {
  name: string;
  title: Localized;
  summary: Localized;
  email: string;
  linkedin: string;
  github: string;
  education: { institution: string };
}

/** JSON-LD schema.org/Person para la página principal. */
export function personJsonLd(profile: PersonSource, locale: Locale, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title[locale],
    description: profile.summary[locale],
    url: pageUrl,
    email: `mailto:${profile.email}`,
    sameAs: [profile.linkedin, profile.github],
    address: { '@type': 'PostalAddress', addressRegion: 'Boyacá', addressCountry: 'CO' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: profile.education.institution },
  };
}
```

La región y el país vienen de `profile.location` (`Boyacá, Colombia`), que hoy es texto libre; se fijan aquí porque schema.org necesita valores separados. Si cambia la ubicación, cambiar también esta función.

- [ ] **Step 4: Verificar que pasa** — Run: `pnpm test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/seo.ts frontend/tests/unit/seo.test.ts
git commit -m "feat: add Open Graph locale and Person JSON-LD helpers"
```

---

### Task 2: Fuente autoalojada y favicon propio

**Files:**
- Modify: `frontend/src/styles/global.css`, `frontend/src/layouts/BaseLayout.astro`, `frontend/src/pages/index.astro`
- Replace: `frontend/public/favicon.svg`; Delete: `frontend/public/favicon.ico`

- [ ] **Step 1: Dependencia**

```bash
pnpm add @fontsource-variable/plus-jakarta-sans
```

- [ ] **Step 2: CSS**

En `frontend/src/styles/global.css`, justo después de `@import "tailwindcss";`:
```css
@import "@fontsource-variable/plus-jakarta-sans";
```
y en `@theme inline` cambiar la fuente a:
```css
  --font-sans: "Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif;
```

- [ ] **Step 3: Quitar Google Fonts**

En `frontend/src/layouts/BaseLayout.astro` borrar las tres líneas `<link rel="preconnect" … fonts.googleapis.com>`, `<link rel="preconnect" … fonts.gstatic.com crossorigin>` y `<link href="https://fonts.googleapis.com/css2?…" rel="stylesheet" />`.

- [ ] **Step 4: Favicon**

Reemplazar `frontend/public/favicon.svg` por:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#4c1d95"/>
  <text x="32" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#ede9fe">JM</text>
</svg>
```
Borrar `frontend/public/favicon.ico` (`git rm frontend/public/favicon.ico`). Las páginas ya enlazan solo `/favicon.svg`.

- [ ] **Step 5: Verificar** — Run: `pnpm check && pnpm build && pnpm test:e2e` → verde; `grep -r "fonts.googleapis" dist` sin resultados.

- [ ] **Step 6: Commit**

```bash
git add -A frontend/src frontend/public frontend/package.json frontend/pnpm-lock.yaml
git commit -m "perf: self-host font and add monogram favicon"
```

---

### Task 3: Imágenes Open Graph

**Files:**
- Create: `og/og.html`, `frontend/scripts/build-og.mjs`
- Generate: `frontend/public/img/og-es.png`, `frontend/public/img/og-en.png`
- Modify: `frontend/package.json` (script `og`)

- [ ] **Step 1: Plantilla**

`og/og.html`:
```html
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; display: flex; flex-direction: column; justify-content: center;
    padding: 0 96px; box-sizing: border-box; font-family: "Plus Jakarta Sans Variable", Arial, sans-serif;
    background: linear-gradient(135deg, #2e1065 0%, #4c1d95 60%, #6d28d9 100%); color: #ede9fe; }
  .badge { display: inline-flex; align-items: center; gap: 12px; align-self: flex-start; background: rgba(237,233,254,.14);
    border-radius: 999px; padding: 10px 22px; font-size: 26px; }
  .dot { width: 14px; height: 14px; border-radius: 50%; background: #4ade80; }
  h1 { font-size: 72px; line-height: 1.05; margin: 36px 0 18px; color: #fff; }
  p { font-size: 34px; margin: 0; color: #c4b5fd; }
  .mono { position: absolute; right: 96px; top: 80px; width: 120px; height: 120px; border-radius: 32px;
    background: #ede9fe; color: #4c1d95; display: grid; place-items: center; font-size: 52px; font-weight: 800; }
</style>
</head>
<body>
  <div class="mono" id="mono"></div>
  <div class="badge"><span class="dot"></span><span id="availability"></span></div>
  <h1 id="name"></h1>
  <p id="title"></p>
</body>
</html>
```

- [ ] **Step 2: Script**

`frontend/scripts/build-og.mjs`:
```js
// Genera public/img/og-{es,en}.png (1200×630) desde ../og/og.html y src/data/profile.json.
// Uso (desde frontend/): pnpm og
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const template = fileURLToPath(new URL('../../og/og.html', import.meta.url));
const fontCss = fileURLToPath(new URL('../node_modules/@fontsource-variable/plus-jakarta-sans/index.css', import.meta.url));
const [profile] = JSON.parse(readFileSync(new URL('../src/data/profile.json', import.meta.url), 'utf8'));
const outDir = fileURLToPath(new URL('../public/img/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const words = profile.name.split(/\s+/);
const monogram = (words[0][0] + (words.length >= 4 ? words[2] : words.at(-1))[0]).toUpperCase();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const lang of ['es', 'en']) {
  await page.goto(pathToFileURL(template).href);
  await page.addStyleTag({ path: fontCss });
  await page.evaluate(
    ({ name, title, availability, monogram }) => {
      document.getElementById('name').textContent = name;
      document.getElementById('title').textContent = title;
      document.getElementById('availability').textContent = availability;
      document.getElementById('mono').textContent = monogram;
    },
    { name: profile.name, title: profile.title[lang], availability: profile.availabilityNote[lang], monogram },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${outDir}og-${lang}.png` });
}
await browser.close();
console.log(`Imágenes OG generadas en ${outDir}`);
```

La lógica de iniciales replica `initials()` de `src/lib/home.ts` (el script es JS plano fuera de Vite y no puede importar TS).

- [ ] **Step 3: Generar**

```bash
npm pkg set scripts.og="node scripts/build-og.mjs"
pnpm og
```
Expected: `public/img/og-es.png` y `og-en.png` de 1200×630. Abrir una y revisarla visualmente (nombre sin cortes, texto legible).

- [ ] **Step 4: Commit**

```bash
git add og frontend/scripts/build-og.mjs frontend/public/img frontend/package.json
git commit -m "feat: generate Open Graph images per language"
```

---

### Task 4: Metadatos en el layout, JSON-LD, robots y sitemap

**Files:**
- Modify: `frontend/src/layouts/BaseLayout.astro`, `frontend/src/pages/[lang]/index.astro`, `frontend/astro.config.mjs`
- Create: `frontend/src/pages/robots.txt.ts`

- [ ] **Step 1: Layout**

En `BaseLayout.astro`:
- Props nuevas: `image?: string` (ruta pública; por defecto `` `/img/og-${lang}.png` ``) y `type?: 'website' | 'profile' | 'article'` (por defecto `'website'`).
- Importar `ogLocale` de `../lib/seo` y `otherLocale` de `../lib/i18n`.
- Calcular `const imageUrl = new URL(image ?? \`/img/og-${lang}.png\`, Astro.site).href;` y `const xDefault = new URL(switchLocalePath(Astro.url.pathname, 'es'), Astro.site).href;`.
- Dentro del bloque `!noindex`, después de los `alternate`, agregar `<link rel="alternate" hreflang="x-default" href={xDefault} />`.
- Agregar (también cuando `noindex`, salvo `og:url`):
```astro
    <meta property="og:type" content={type} />
    <meta property="og:site_name" content={t(lang, 'site.title')} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={imageUrl} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={title} />
    <meta property="og:locale" content={ogLocale(lang)} />
    <meta property="og:locale:alternate" content={ogLocale(otherLocale(lang))} />
    {!noindex && <meta property="og:url" content={canonical.href} />}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={imageUrl} />
    <meta name="theme-color" content="#4c1d95" />
```

- [ ] **Step 2: JSON-LD en la principal**

En `src/pages/[lang]/index.astro` importar `personJsonLd` y, dentro de `<BaseLayout …>` antes del contenido:
```astro
  <script type="application/ld+json" set:html={JSON.stringify(personJsonLd(profile, lang, new URL(`/${lang}/`, Astro.site).href))} />
```
y pasar `type="profile"` a `BaseLayout`.

En `src/pages/[lang]/proyectos/[slug].astro` pasar `type="article"`.

- [ ] **Step 3: robots.txt**

`frontend/src/pages/robots.txt.ts`:
```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

- [ ] **Step 4: Sitemap alineado con hreflang**

En `astro.config.mjs` cambiar los locales del sitemap a `locales: { es: 'es', en: 'en' }` (mismos códigos que los `hreflang` del layout).

- [ ] **Step 5: Verificar**

`pnpm check && pnpm build`; inspeccionar `dist/es/index.html` (og:*, twitter:*, x-default, JSON-LD válido con `node -e "JSON.parse(...)"` sobre el contenido del script), `dist/robots.txt`, `dist/sitemap-0.xml` (hreflang `es`/`en`).

- [ ] **Step 6: Commit**

```bash
git add frontend/src frontend/astro.config.mjs
git commit -m "feat: add Open Graph, Twitter, x-default, Person JSON-LD and robots.txt"
```

---

### Task 5: Tema sol/luna y animaciones de entrada

**Files:**
- Modify: `frontend/src/components/ThemeToggle.astro`, `frontend/src/styles/global.css`, `frontend/src/components/Section.astro`, `frontend/src/components/MetroMap.astro`

- [ ] **Step 1: ThemeToggle**

Reemplazar el `<span aria-hidden="true" class="block">☾</span>` por dos íconos SVG (`aria-hidden="true"`, 18×18, `stroke="currentColor"`): una luna con clase `theme-icon-moon` y un sol con clase `theme-icon-sun`. Agregar `aria-pressed="false"` al botón. En el `<script>`: función `sync()` que pone `aria-pressed` en `"true"` cuando `current() === 'dark'`; llamarla al cargar, después de cada clic y en `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync)`.

En `global.css`:
```css
.theme-icon-sun { display: none; }
:root[data-theme="dark"] .theme-icon-sun { display: block; }
:root[data-theme="dark"] .theme-icon-moon { display: none; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .theme-icon-sun { display: block; }
  :root:not([data-theme="light"]) .theme-icon-moon { display: none; }
}
```
(En tema oscuro se muestra el sol: indica a qué tema se cambia.)

- [ ] **Step 2: Animaciones**

En `global.css`:
```css
@keyframes rise-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
.rise-in { animation: rise-in 0.45s ease-out both; }
details[name="metro"][open] [data-station-body] { animation: rise-in 0.3s ease-out both; }
```
Agregar la clase `rise-in` al `<section>` de `Section.astro` con `style={`animation-delay: ${delay}ms`}` usando una prop opcional `delay = 0`; en `src/pages/[lang]/index.astro` pasar `delay={i * 60}` a las secciones (0, 60, 120…). El bloque `prefers-reduced-motion` existente ya anula las animaciones.

- [ ] **Step 3: Verificar** — `pnpm check && pnpm test:e2e` verde (el test de tema sigue funcionando; los nuevos íconos no cambian `data-theme`).

- [ ] **Step 4: Commit**

```bash
git add frontend/src
git commit -m "feat: add sun/moon theme icon with aria-pressed and subtle entrance animations"
```

---

### Task 6: Pruebas de SEO y accesibilidad automática

**Files:**
- Create: `frontend/tests/e2e/seo.spec.ts`, `frontend/tests/e2e/a11y.spec.ts`

- [ ] **Step 1: Dependencia** — `pnpm add -D @axe-core/playwright`

- [ ] **Step 2: `seo.spec.ts`**

```ts
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
```

- [ ] **Step 3: `a11y.spec.ts`**

```ts
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
```
(`reducedMotion: 'reduce'` evita medir contraste a mitad de una animación de opacidad.)

- [ ] **Step 4: Correr** — `pnpm test:e2e`. Si axe reporta violaciones, **corregir la causa en los componentes o tokens** (no desactivar reglas) y documentar cada corrección en el mensaje de commit. Expected final: 32 previos + 4 SEO + 12 a11y = 48 passed.

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/e2e frontend/package.json frontend/pnpm-lock.yaml frontend/src
git commit -m "test: add SEO metadata and axe accessibility checks in both themes"
```

---

### Task 7: Lighthouse CI

**Files:**
- Create: `frontend/lighthouserc.cjs`
- Modify: `frontend/package.json`, `.github/workflows/ci.yml`

- [ ] **Step 1: Dependencia y configuración**

`pnpm add -D @lhci/cli`

`frontend/lighthouserc.cjs`:
```js
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        'http://localhost/es/',
        'http://localhost/en/experiencia/',
        'http://localhost/es/proyectos/consolidacion-infraestructura/',
      ],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './.lighthouseci' },
  },
};
```
Script: `npm pkg set scripts.lhci="lhci autorun"`.

- [ ] **Step 2: Correr localmente**

`pnpm build && pnpm lhci` (si no encuentra Chrome en Windows, definir `CHROME_PATH` con el Chromium de Playwright: `node -e "console.log(require('@playwright/test').chromium.executablePath())"`). Expected: las 4 categorías ≥ 0.9 en las 3 URLs. Si alguna no llega, **corregir la causa** (p. ej. tamaño de imagen, contraste, meta faltante) y reportarla.

- [ ] **Step 3: CI**

En `.github/workflows/ci.yml`, después de `- run: pnpm test:e2e`, agregar:
```yaml
      - run: pnpm lhci
```
y en el paso de subida de artefactos agregar `frontend/.lighthouseci` a `path`. Agregar `.lighthouseci/` ya está en el `.gitignore` raíz (verificar).

- [ ] **Step 4: Commit**

```bash
git add frontend/lighthouserc.cjs frontend/package.json frontend/pnpm-lock.yaml .github/workflows/ci.yml
git commit -m "ci: add Lighthouse CI with 90+ thresholds"
```

---

### Task 8: Documentación y verificación

**Files:**
- Modify: `docs/01-arquitectura/architecture.md`, `docs/02-desarrollo/como-editar-contenido.md`, `docs/02-desarrollo/variables-entorno.md`, `docs/03-operacion/deploy.md`, `docs/log.md`

- [ ] **Step 1: Documentos**

- `architecture.md`: fila `src/lib/seo.ts` (locale OG, JSON-LD Person); sección nueva "7. SEO" (OG/Twitter por página, imagen por idioma generada con `pnpm og`, `robots.txt` endpoint, sitemap con `hreflang` es/en + `x-default` a `/es/`).
- `como-editar-contenido.md`: "Si cambias nombre, título o disponibilidad en `profile.json`, regenera las imágenes de vista previa con `pnpm og`."
- `variables-entorno.md`: `SITE_URL` ahora afecta `og:image`, `og:url`, canonical, sitemap y robots (quitar "(Open Graph en fase 5)").
- `deploy.md`: "Antes del primer despliegue, definir `SITE_URL` con el dominio final; sin eso las vistas previas en LinkedIn/WhatsApp apuntan a localhost."
- `log.md`: bullet de fase 5 con resultados de Lighthouse (puntajes reales obtenidos).

- [ ] **Step 2: Verificación** — `pnpm check && pnpm test && pnpm build && pnpm test:e2e && pnpm lhci` todo verde.

- [ ] **Step 3: Commit**

```bash
git add docs
git commit -m "docs: document SEO, OG images and quality gates"
```
