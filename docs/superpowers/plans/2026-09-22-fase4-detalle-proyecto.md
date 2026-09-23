# Fase 4 — Detalle de proyecto Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Una página por proyecto en `/[lang]/proyectos/<id>/` con formato de caso de estudio (problema, mi rol, solución, resultado con cifras, capturas, tecnologías, enlaces solo si el proyecto es público), la etapa del recorrido donde ocurrió y navegación anterior/siguiente. Al terminar, ningún enlace interno del sitio responde 404.

**Architecture:** Selección pura en `src/lib/projects.ts` (vecinos por `order`, experiencia relacionada) probada con Vitest. La página `src/pages/[lang]/proyectos/[slug].astro` genera `idiomas × proyectos` rutas estáticas. Sin JS de cliente. Los proyectos `anonymized` muestran un aviso y nunca enlaces (el esquema ya impide que tengan `repo`/`demo`).

**Tech Stack:** Astro 7.3, Tailwind 4.3, Vitest 5, Playwright 1.63.

**Spec:** [2026-09-22-portafolio-v1-design.md](../specs/2026-09-22-portafolio-v1-design.md) — *Páginas → 3. Detalle de proyecto* y *4. 404*.

**Estado previo:** Fases 1–3 en `main`. La 404 bilingüe existe desde la fase 1; esta fase solo verifica que las rutas inexistentes la sirvan con estado 404.

---

## Mapa de archivos

```
frontend/
├── src/lib/projects.ts                          (crear: neighbors, relatedExperience)
├── src/i18n/es.json, en.json                    (modificar: textos del detalle)
├── src/pages/[lang]/proyectos/[slug].astro      (crear)
├── tests/unit/projects.test.ts                  (crear)
└── tests/e2e/projects.spec.ts                   (crear)
docs/01-arquitectura/architecture.md, docs/log.md   (modificar)
```

Comandos de `frontend/` con el directorio de trabajo en `Portfolio/frontend`.

Orden actual de proyectos (`order`): `consolidacion-infraestructura` (1), `postulaciones-docentes` (2), `cardenas-vision` (3), `azure-distribuidos` (4), `ancla` (5). Los tres primeros son `anonymized`; los dos últimos `full` con `repo`.

---

### Task 1: Selección de datos del detalle (`lib/projects.ts`)

**Files:**
- Create: `frontend/src/lib/projects.ts`
- Test: `frontend/tests/unit/projects.test.ts`

- [ ] **Step 1: Test que falla**

`frontend/tests/unit/projects.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { neighbors, relatedExperience } from '../../src/lib/projects';

const p = (id: string, order: number) => ({ id, order });
const all = [p('c', 3), p('a', 1), p('b', 2)];

describe('neighbors', () => {
  it('anterior y siguiente según order', () => {
    expect(neighbors(all, 'b')).toEqual({ prev: p('a', 1), next: p('c', 3) });
  });
  it('el primero no tiene anterior y el último no tiene siguiente', () => {
    expect(neighbors(all, 'a')).toEqual({ prev: undefined, next: p('b', 2) });
    expect(neighbors(all, 'c')).toEqual({ prev: p('b', 2), next: undefined });
  });
  it('un solo proyecto → sin vecinos', () => {
    expect(neighbors([p('x', 1)], 'x')).toEqual({ prev: undefined, next: undefined });
  });
  it('id inexistente → error', () => {
    expect(() => neighbors(all, 'zzz')).toThrow(/zzz/);
  });
});

describe('relatedExperience', () => {
  const e = (id: string, projects: string[]) => ({ id, projects });
  it('devuelve las etapas que referencian el proyecto, en el orden recibido', () => {
    const entries = [e('uno', ['a']), e('dos', ['b']), e('tres', ['a', 'b'])];
    expect(relatedExperience(entries, 'a').map((x) => x.id)).toEqual(['uno', 'tres']);
  });
  it('lista vacía si ninguna etapa lo referencia', () => {
    expect(relatedExperience([e('uno', ['a'])], 'b')).toEqual([]);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test`
Expected: FAIL — no se resuelve `../../src/lib/projects`.

- [ ] **Step 3: Implementación**

`frontend/src/lib/projects.ts`:
```ts
import { byOrder } from './home';

/** Proyecto anterior y siguiente según `order`. */
export function neighbors<T extends { id: string; order: number }>(
  items: readonly T[],
  id: string,
): { prev: T | undefined; next: T | undefined } {
  const sorted = byOrder(items);
  const index = sorted.findIndex((p) => p.id === id);
  if (index === -1) throw new Error(`Proyecto inexistente: ${id}`);
  return { prev: sorted[index - 1], next: sorted[index + 1] };
}

/** Etapas de experiencia que referencian el proyecto. */
export function relatedExperience<T extends { projects: readonly string[] }>(
  entries: readonly T[],
  projectId: string,
): T[] {
  return entries.filter((e) => e.projects.includes(projectId));
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/projects.ts frontend/tests/unit/projects.test.ts
git commit -m "feat: add project neighbors and related experience helpers"
```

---

### Task 2: Textos del detalle

**Files:**
- Modify: `frontend/src/i18n/es.json`, `frontend/src/i18n/en.json`

- [ ] **Step 1: Textos**

Agregar a `frontend/src/i18n/es.json`:
```json
  "project.back": "Volver a proyectos",
  "project.problem": "El problema",
  "project.role": "Mi rol",
  "project.solution": "La solución",
  "project.result": "El resultado",
  "project.images": "Capturas",
  "project.tech": "Tecnologías",
  "project.links": "Enlaces",
  "project.repo": "Ver el código en GitHub",
  "project.demo": "Ver la demo",
  "project.anonymized": "Proyecto institucional: el código no es público y las capturas usan datos de prueba.",
  "project.related": "En mi recorrido",
  "project.more": "Más proyectos",
  "project.prev": "Anterior",
  "project.next": "Siguiente"
```

Agregar a `frontend/src/i18n/en.json`:
```json
  "project.back": "Back to projects",
  "project.problem": "The problem",
  "project.role": "My role",
  "project.solution": "The solution",
  "project.result": "The result",
  "project.images": "Screenshots",
  "project.tech": "Technologies",
  "project.links": "Links",
  "project.repo": "View the code on GitHub",
  "project.demo": "View the demo",
  "project.anonymized": "Institutional project: the code is not public and screenshots use test data.",
  "project.related": "In my journey",
  "project.more": "More projects",
  "project.prev": "Previous",
  "project.next": "Next"
```

- [ ] **Step 2: Verificar**

Run: `pnpm test && pnpm check`
Expected: PASS, `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/i18n
git commit -m "feat: add project detail UI strings"
```

---

### Task 3: Página de detalle

**Files:**
- Create: `frontend/src/pages/[lang]/proyectos/[slug].astro`

- [ ] **Step 1: Página**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import LangSwitch from '../../../components/LangSwitch.astro';
import ThemeToggle from '../../../components/ThemeToggle.astro';
import { LOCALES, type Locale } from '../../../lib/i18n';
import { neighbors, relatedExperience } from '../../../lib/projects';
import { formatRange } from '../../../lib/dates';
import { t, type UiKey } from '../../../i18n';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return LOCALES.flatMap((lang) => projects.map((p) => ({ params: { lang, slug: p.id } })));
}

const lang = Astro.params.lang as Locale;
const slug = Astro.params.slug as string;

const profileEntry = await getEntry('profile', 'main');
if (!profileEntry) throw new Error('Falta la entrada "main" en src/data/profile.json');

const projects = (await getCollection('projects')).map((p) => ({ id: p.id, ...p.data }));
const project = projects.find((p) => p.id === slug);
if (!project) throw new Error(`Proyecto inexistente: ${slug}`);
const { prev, next } = neighbors(projects, slug);

const experience = (await getCollection('experience')).map((e) => ({
  id: e.id,
  role: e.data.role,
  organization: e.data.organization,
  start: e.data.start,
  end: e.data.end,
  projects: e.data.projects.map((ref) => ref.id),
}));
const related = relatedExperience(experience, slug);

const story: [UiKey, typeof project.problem][] = [
  ['project.problem', project.problem],
  ['project.role', project.role],
  ['project.solution', project.solution],
];
const external = 'text-primary underline underline-offset-4 hover:no-underline';
---
<BaseLayout lang={lang} title={`${project.title[lang]} — ${profileEntry.data.name}`} description={project.tagline[lang]}>
  <div class="mx-auto max-w-3xl px-4 py-6 lg:py-10">
    <header class="flex items-center justify-between gap-2">
      <a href={`/${lang}/#projects`} data-back-link class="font-semibold text-primary underline-offset-4 hover:underline">
        <span aria-hidden="true">← </span>{t(lang, 'project.back')}
      </a>
      <div class="flex gap-2">
        <LangSwitch lang={lang} />
        <ThemeToggle lang={lang} />
      </div>
    </header>

    <main id="main" class="mt-8">
      <article data-project={project.id}>
        <h1 class="text-3xl font-bold leading-tight text-primary">{project.title[lang]}</h1>
        <p class="mt-2 text-lg text-text-muted">{project.tagline[lang]}</p>

        {
          project.visibility === 'anonymized' && (
            <p data-anonymized-note class="mt-5 rounded-lg border border-border bg-surface-soft px-4 py-3 text-sm">
              {t(lang, 'project.anonymized')}
            </p>
          )
        }

        {
          story.map(([key, text]) => (
            <section class="mt-8">
              <h2 class="text-xl font-bold text-primary">{t(lang, key)}</h2>
              <p class="mt-2 leading-relaxed">{text[lang]}</p>
            </section>
          ))
        }

        <section class="mt-8 rounded-xl border border-accent bg-surface-soft p-5" data-project-result>
          <h2 class="text-xl font-bold text-primary">{t(lang, 'project.result')}</h2>
          <p class="mt-2 leading-relaxed">{project.result[lang]}</p>
          {
            project.metrics && project.metrics.length > 0 && (
              <ul class="mt-3 list-disc space-y-1 pl-5 font-semibold">
                {project.metrics.map((m) => <li>{m[lang]}</li>)}
              </ul>
            )
          }
        </section>

        {
          project.images.length > 0 && (
            <section class="mt-8">
              <h2 class="text-xl font-bold text-primary">{t(lang, 'project.images')}</h2>
              <div class="mt-3 grid gap-4">
                {project.images.map((img) => (
                  <figure>
                    <img src={img.src} alt={img.alt[lang]} loading="lazy" class="w-full rounded-lg border border-border" />
                    <figcaption class="mt-1 text-sm text-text-muted">{img.alt[lang]}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )
        }

        <section class="mt-8">
          <h2 class="text-xl font-bold text-primary">{t(lang, 'project.tech')}</h2>
          <ul class="mt-3 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => <li class="rounded-full border border-border bg-surface px-2.5 py-1 text-sm">{tech}</li>)}
          </ul>
        </section>

        {
          project.visibility === 'full' && (project.repo || project.demo) && (
            <section class="mt-8">
              <h2 class="text-xl font-bold text-primary">{t(lang, 'project.links')}</h2>
              <ul class="mt-2 space-y-1">
                {project.repo && (
                  <li>
                    <a href={project.repo} target="_blank" rel="noopener" data-repo-link class={external}>
                      {t(lang, 'project.repo')}<span class="sr-only"> {t(lang, 'profile.newTab')}</span>
                    </a>
                  </li>
                )}
                {project.demo && (
                  <li>
                    <a href={project.demo} target="_blank" rel="noopener" data-demo-link class={external}>
                      {t(lang, 'project.demo')}<span class="sr-only"> {t(lang, 'profile.newTab')}</span>
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )
        }

        {
          related.length > 0 && (
            <section class="mt-8" data-project-related>
              <h2 class="text-xl font-bold text-primary">{t(lang, 'project.related')}</h2>
              <ul class="mt-2 space-y-1">
                {related.map((e) => (
                  <li>
                    <a href={`/${lang}/experiencia/`} class={external}>{e.role[lang]}</a>
                    <span class="text-text-muted"> · {e.organization[lang]} · {formatRange(e.start, e.end, lang)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )
        }
      </article>

      {
        (prev || next) && (
          <nav aria-label={t(lang, 'project.more')} class="mt-12 grid gap-3 sm:grid-cols-2" data-project-nav>
            {prev ? (
              <a href={`/${lang}/proyectos/${prev.id}/`} rel="prev" data-prev-link class="rounded-xl border border-border bg-surface p-4 hover:border-accent focus-visible:outline-2 focus-visible:outline-primary">
                <span class="block text-sm text-text-muted"><span aria-hidden="true">← </span>{t(lang, 'project.prev')}</span>
                <span class="block font-semibold">{prev.title[lang]}</span>
              </a>
            ) : (
              <span aria-hidden="true" class="hidden sm:block" />
            )}
            {next && (
              <a href={`/${lang}/proyectos/${next.id}/`} rel="next" data-next-link class="rounded-xl border border-border bg-surface p-4 text-right hover:border-accent focus-visible:outline-2 focus-visible:outline-primary">
                <span class="block text-sm text-text-muted">{t(lang, 'project.next')}<span aria-hidden="true"> →</span></span>
                <span class="block font-semibold">{next.title[lang]}</span>
              </a>
            )}
          </nav>
        )
      }
    </main>
  </div>
</BaseLayout>
```

Si `pnpm check` rechaza `typeof project.problem` en la anotación de `story` (porque `project` puede ser `undefined` antes del `throw`), usar `import type { Localized } from '../../../lib/schemas'` y tipar `story` como `[UiKey, Localized][]`. Si `UiKey` no está exportado desde `src/i18n/index.ts`, exportarlo ahí (`export type UiKey = keyof typeof es;` ya existe — solo verificar que tenga `export`).

- [ ] **Step 2: Verificar**

Run: `pnpm check && pnpm build`
Expected: `0 errors`; build genera `dist/{es,en}/proyectos/{consolidacion-infraestructura,postulaciones-docentes,cardenas-vision,azure-distribuidos,ancla}/index.html` (10 páginas).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages
git commit -m "feat: add project case study pages"
```

---

### Task 4: Pruebas de humo de proyectos y enlaces internos

**Files:**
- Create: `frontend/tests/e2e/projects.spec.ts`

- [ ] **Step 1: Tests**

```ts
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
```

- [ ] **Step 2: Correr**

Run: `pnpm test:e2e`
Expected: 32 passed (23 previos + 9 nuevos).

Si `ruta inexistente responde 404` falla porque `astro preview` no devuelve estado 404, investigar la causa (p. ej. con `curl -i http://localhost:4321/es/proyectos/no-existe/`) y reportarla; no quitar la aserción de estado sin explicación.

- [ ] **Step 3: Commit**

```bash
git add frontend/tests/e2e/projects.spec.ts
git commit -m "test: add project pages and internal link smoke tests"
```

---

### Task 5: Documentación y verificación

**Files:**
- Modify: `docs/01-arquitectura/architecture.md`, `docs/log.md`

- [ ] **Step 1: Arquitectura**

En la tabla de la sección 3 de `docs/01-arquitectura/architecture.md` agregar:
```markdown
| `src/lib/projects.ts` | Detalle de proyecto: vecinos por `order` y etapas de experiencia relacionadas. |
```
y en la fila de `src/pages/` mencionar `[lang]/proyectos/[slug].astro` (una página por idioma y proyecto).

- [ ] **Step 2: Bitácora**

Agregar bajo `## 2026-09 — Diseño y base` en `docs/log.md`:
```markdown
- **2026-09-22** — Fase 4 ([plan](superpowers/plans/2026-09-22-fase4-detalle-proyecto.md)): páginas `/[lang]/proyectos/<id>/` como caso de estudio (problema, rol, solución, resultado, capturas, tecnologías, enlaces solo si es público, etapa del recorrido, anterior/siguiente). Prueba e2e que verifica que ningún enlace interno responde 404.
```

- [ ] **Step 3: Verificación**

Desde `frontend/`: `pnpm check && pnpm test && pnpm build && pnpm test:e2e`
Expected: todo verde; 32 passed.

- [ ] **Step 4: Commit**

```bash
git add docs
git commit -m "docs: log phase 4 project pages"
```
