# Fase 2 — Página principal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la página principal provisional por el diseño aprobado: tarjeta de perfil fija a la izquierda (arriba en móvil) y secciones a la derecha (Sobre mí, Experiencia, Proyectos destacados, Habilidades, Educación y cursos, ¿Tienes un proyecto?).

**Architecture:** Selección y orden de datos en funciones puras (`src/lib/home.ts`, `src/lib/dates.ts`) probadas con Vitest. Componentes Astro sin JS de cliente, uno por bloque, que reciben `lang` y datos ya resueltos. La página `src/pages/[lang]/index.astro` solo consulta colecciones y compone. Textos de interfaz en `src/i18n/*.json`; contenido en `src/data/*.json`.

**Tech Stack:** Astro 7.3, Tailwind 4.3, zod 4 (`astro/zod`), Vitest 5, Playwright 1.63.

**Spec:** [2026-09-22-portafolio-v1-design.md](../specs/2026-09-22-portafolio-v1-design.md) — sección *Páginas → 1. Principal*.

**Estado previo:** Fase 1 completa en `main` ([plan](2026-09-22-fase1-base.md)).

**Nota:** los enlaces "Ver recorrido" (`/[lang]/experiencia/`) y "Ver caso" (`/[lang]/proyectos/<id>/`) apuntan a páginas de las fases 3 y 4. El sitio no se despliega hasta la fase 7, así que es aceptable que respondan 404 mientras tanto.

---

## Mapa de archivos

```
.github/workflows/ci.yml                      (modificar: versiones de acciones)
frontend/src/
├── lib/dates.ts                               (modificar: toYearMonth)
├── lib/home.ts                                (crear: byOrder, featuredProjects, latestWork, initials)
├── lib/schemas.ts                             (modificar: profile.education)
├── data/profile.json                          (modificar: education)
├── i18n/es.json, en.json                      (modificar: textos de la principal)
├── styles/global.css                          (modificar: token success)
├── components/
│   ├── Section.astro                          (crear)
│   ├── ProfileCard.astro                      (crear)
│   ├── ExperienceSummary.astro                (crear)
│   ├── ProjectCard.astro                      (crear)
│   ├── SkillGroup.astro                       (crear)
│   ├── EducationList.astro                    (crear)
│   └── ContactCTA.astro                       (crear)
└── pages/[lang]/index.astro                   (reemplazar)
frontend/tests/
├── unit/dates.test.ts, home.test.ts, schemas.test.ts   (modificar/crear)
└── e2e/home.spec.ts                           (crear)
docs/01-arquitectura/architecture.md, docs/log.md       (modificar)
```

Comandos de `frontend/` con el directorio de trabajo en `Portfolio/frontend`.

---

### Task 1: Actualizar acciones de CI (aviso de Node 20)

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Subir versiones**

En `.github/workflows/ci.yml` reemplazar:
- `actions/checkout@v4` → `actions/checkout@v7`
- `pnpm/action-setup@v4` → `pnpm/action-setup@v6`
- `actions/setup-node@v4` → `actions/setup-node@v7`
- `actions/upload-artifact@v4` → `actions/upload-artifact@v7`

Sin otros cambios (los `with:` se mantienen).

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: bump GitHub Actions to Node 24 compatible versions"
```

La verificación real ocurre al hacer push (Task 8).

---

### Task 2: `toYearMonth` en `lib/dates.ts`

Para calcular la duración de un cargo vigente (`end: null`) se necesita el mes actual en formato `YYYY-MM`.

**Files:**
- Modify: `frontend/src/lib/dates.ts`
- Test: `frontend/tests/unit/dates.test.ts`

- [ ] **Step 1: Test que falla**

Agregar al final de `frontend/tests/unit/dates.test.ts` (y `toYearMonth` al import existente de `../../src/lib/dates`):
```ts
describe('toYearMonth', () => {
  it('convierte una fecha a YYYY-MM con mes de dos dígitos', () => {
    expect(toYearMonth(new Date(2026, 8, 22))).toBe('2026-09');
    expect(toYearMonth(new Date(2025, 11, 31))).toBe('2025-12');
    expect(toYearMonth(new Date(2025, 0, 1))).toBe('2025-01');
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test`
Expected: FAIL — `toYearMonth is not a function` (o error de export).

- [ ] **Step 3: Implementación**

Agregar en `frontend/src/lib/dates.ts`:
```ts
/** Fecha local → 'YYYY-MM'. */
export function toYearMonth(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/dates.ts frontend/tests/unit/dates.test.ts
git commit -m "feat: add toYearMonth date helper"
```

---

### Task 3: Selección de datos de la principal (`lib/home.ts`)

**Files:**
- Create: `frontend/src/lib/home.ts`
- Test: `frontend/tests/unit/home.test.ts`

- [ ] **Step 1: Test que falla**

`frontend/tests/unit/home.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { byOrder, featuredProjects, latestWork, initials } from '../../src/lib/home';

describe('byOrder', () => {
  it('ordena por order ascendente sin mutar la entrada', () => {
    const input = [{ order: 3 }, { order: 1 }, { order: 2 }];
    expect(byOrder(input).map((x) => x.order)).toEqual([1, 2, 3]);
    expect(input.map((x) => x.order)).toEqual([3, 1, 2]);
  });
});

describe('featuredProjects', () => {
  const p = (order: number, featured: boolean) => ({ order, featured });
  it('solo destacados, ordenados', () => {
    expect(featuredProjects([p(2, true), p(1, false), p(0, true)])).toEqual([p(0, true), p(2, true)]);
  });
  it('respeta el máximo (5 por defecto)', () => {
    const many = Array.from({ length: 7 }, (_, i) => p(i, true));
    expect(featuredProjects(many)).toHaveLength(5);
    expect(featuredProjects(many, 3).map((x) => x.order)).toEqual([0, 1, 2]);
  });
});

describe('latestWork', () => {
  const e = (line: string, start: string, end: string | null) => ({ line, start, end });
  it('elige el empleo que termina más tarde; vigente (null) gana', () => {
    const a = e('work', '2025-03', '2025-07');
    const b = e('work', '2025-08', '2026-08');
    const c = e('work', '2026-09', null);
    expect(latestWork([a, b])).toBe(b);
    expect(latestWork([a, c, b])).toBe(c);
  });
  it('desempata por inicio más reciente', () => {
    const a = e('work', '2024-01', '2026-01');
    const b = e('work', '2025-01', '2026-01');
    expect(latestWork([a, b])).toBe(b);
  });
  it('ignora líneas que no son empleo', () => {
    const project = e('projects', '2025-10', null);
    const work = e('work', '2025-08', '2026-08');
    expect(latestWork([project, work])).toBe(work);
  });
  it('undefined si no hay empleo', () => {
    expect(latestWork([e('education', '2020-01', '2026-01')])).toBeUndefined();
  });
});

describe('initials', () => {
  it('nombre completo hispano (2 nombres + 2 apellidos) → nombre + primer apellido', () => {
    expect(initials('Juan Sebastián Martínez Noreña')).toBe('JM');
  });
  it('nombres cortos → primera y última palabra', () => {
    expect(initials('Ana Pérez')).toBe('AP');
    expect(initials('Ana María Pérez')).toBe('AP');
  });
  it('una sola palabra → una letra', () => {
    expect(initials('Sebastián')).toBe('S');
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test`
Expected: FAIL — no se resuelve `../../src/lib/home`.

- [ ] **Step 3: Implementación**

`frontend/src/lib/home.ts`:
```ts
export function byOrder<T extends { order: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function featuredProjects<T extends { featured: boolean; order: number }>(
  items: readonly T[],
  max = 5,
): T[] {
  return byOrder(items.filter((p) => p.featured)).slice(0, max);
}

/** Empleo más reciente: el que termina más tarde (vigente = null gana); empate → inicio más reciente. */
export function latestWork<T extends { line: string; start: string; end: string | null }>(
  items: readonly T[],
): T | undefined {
  const endKey = (e: T) => e.end ?? '9999-12';
  return [...items]
    .filter((e) => e.line === 'work')
    .sort((a, b) => endKey(b).localeCompare(endKey(a)) || b.start.localeCompare(a.start))[0];
}

/** 'Juan Sebastián Martínez Noreña' → 'JM'; 'Ana Pérez' → 'AP'. */
export function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  const surname = words.length >= 4 ? words[2] : words[words.length - 1];
  return (words[0][0] + surname[0]).toUpperCase();
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/home.ts frontend/tests/unit/home.test.ts
git commit -m "feat: add home page data selection helpers"
```

---

### Task 4: Formación en el perfil, token de éxito y textos de interfaz

**Files:**
- Modify: `frontend/src/lib/schemas.ts`, `frontend/tests/unit/schemas.test.ts`, `frontend/src/data/profile.json`, `frontend/src/styles/global.css`, `frontend/src/i18n/es.json`, `frontend/src/i18n/en.json`

- [ ] **Step 1: Test que falla**

En `frontend/tests/unit/schemas.test.ts`, agregar a `validProfile` la propiedad:
```ts
education: { degree: L('Ingeniería'), institution: 'UPTC', year: 2026 },
```
y agregar dentro del `describe` que contiene `validProfile`:
```ts
it('exige la formación en el perfil', () => {
  const { education: _omit, ...withoutEducation } = validProfile;
  expect(profileSchema.safeParse(withoutEducation).success).toBe(false);
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test`
Expected: FAIL — el test "exige la formación en el perfil" espera `false` y recibe `true`.

- [ ] **Step 3: Esquema**

En `frontend/src/lib/schemas.ts`, dentro de `profileSchema`, después de `languages`:
```ts
  education: z.object({
    degree: localized,
    institution: z.string().min(1),
    year: z.number().int(),
  }),
```

- [ ] **Step 4: Datos**

En `frontend/src/data/profile.json`, después de `"languages": [...]`:
```json
    "education": {
      "degree": { "es": "Ingeniería de Sistemas y Computación", "en": "Systems and Computing Engineering" },
      "institution": "Universidad Pedagógica y Tecnológica de Colombia (UPTC)",
      "year": 2026
    }
```

- [ ] **Step 5: Token de éxito**

En `frontend/src/styles/global.css`:
- En `:root` (claro) agregar `--success: #15803d;`
- En los dos bloques oscuros (`@media … :root:not([data-theme="light"])` y `:root[data-theme="dark"]`) agregar `--success: #4ade80;`
- En `@theme inline` agregar `--color-success: var(--success);`

- [ ] **Step 6: Textos de interfaz**

Agregar a `frontend/src/i18n/es.json`:
```json
  "profile.label": "Perfil",
  "profile.downloadCv": "Descargar CV",
  "profile.contact": "Contactar",
  "profile.location": "Ubicación",
  "profile.education": "Formación",
  "profile.languages": "Idiomas",
  "home.about": "Sobre mí",
  "home.experience": "Experiencia",
  "home.journey": "Ver recorrido completo →",
  "home.projects": "Proyectos destacados",
  "home.viewCase": "Ver caso",
  "home.skills": "Habilidades",
  "home.education": "Educación y cursos",
  "home.courses": "Cursos",
  "home.freelance.title": "¿Tienes un proyecto?",
  "home.freelance.body": "También acepto proyectos puntuales: aplicaciones web, despliegues con Docker o puesta a punto de servidores. Cuéntame qué necesitas.",
  "home.freelance.cta": "Escríbeme"
```

Agregar a `frontend/src/i18n/en.json`:
```json
  "profile.label": "Profile",
  "profile.downloadCv": "Download CV",
  "profile.contact": "Contact me",
  "profile.location": "Location",
  "profile.education": "Education",
  "profile.languages": "Languages",
  "home.about": "About me",
  "home.experience": "Experience",
  "home.journey": "See full journey →",
  "home.projects": "Featured projects",
  "home.viewCase": "View case",
  "home.skills": "Skills",
  "home.education": "Education & courses",
  "home.courses": "Courses",
  "home.freelance.title": "Have a project?",
  "home.freelance.body": "I also take on specific projects: web applications, Docker deployments or server setup. Tell me what you need.",
  "home.freelance.cta": "Get in touch"
```

- [ ] **Step 7: Verificar**

Run: `pnpm test && pnpm check && pnpm build`
Expected: tests PASS (incluye `content.test.ts` con el nuevo campo y `ui-strings.test.ts` con claves iguales), `0 errors`, build `Complete!`.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/lib/schemas.ts frontend/tests/unit/schemas.test.ts frontend/src/data/profile.json frontend/src/styles/global.css frontend/src/i18n
git commit -m "feat: add profile education, success token and home UI strings"
```

---

### Task 5: Componentes de la principal

Todos sin JS de cliente. Colores solo con tokens (`bg-primary`, `text-text-muted`, `bg-success`…).

**Files:**
- Create: `frontend/src/components/{Section,ProfileCard,ExperienceSummary,ProjectCard,SkillGroup,EducationList,ContactCTA}.astro`

- [ ] **Step 1: `Section.astro`**

```astro
---
interface Props {
  id: string;
  title: string;
  highlight?: boolean;
}
const { id, title, highlight = false } = Astro.props;
---
<section
  id={id}
  aria-labelledby={`${id}-title`}
  class:list={[
    'rounded-2xl border p-6 sm:p-8',
    highlight ? 'border-accent bg-surface-soft' : 'border-border bg-surface',
  ]}
>
  <h2 id={`${id}-title`} class="text-xl font-bold text-primary">{title}</h2>
  <div class="mt-4">
    <slot />
  </div>
</section>
```

- [ ] **Step 2: `ProfileCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../lib/i18n';
import { t } from '../i18n';
import { initials } from '../lib/home';
import LangSwitch from './LangSwitch.astro';
import ThemeToggle from './ThemeToggle.astro';

interface Props {
  lang: Locale;
  profile: CollectionEntry<'profile'>['data'];
}
const { lang, profile: p } = Astro.props;
const button = 'rounded-lg px-4 py-2.5 text-center font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
---
<aside
  aria-label={t(lang, 'profile.label')}
  data-profile-card
  class="rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-6"
>
  <div class="flex justify-end gap-2">
    <LangSwitch lang={lang} />
    <ThemeToggle lang={lang} />
  </div>

  <div class="mt-2 flex flex-col items-center text-center">
    {
      p.photo ? (
        <img src={p.photo} alt={p.name} width="112" height="112" class="size-28 rounded-full object-cover" />
      ) : (
        <div aria-hidden="true" class="grid size-28 place-items-center rounded-full bg-surface-soft text-3xl font-bold text-primary">
          {initials(p.name)}
        </div>
      )
    }
    <h1 class="mt-4 text-2xl font-bold leading-tight text-primary">{p.name}</h1>
    <p class="mt-1 text-text-muted">{p.title[lang]}</p>
    {
      p.available && (
        <p data-availability class="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1 text-sm font-medium text-text">
          <span aria-hidden="true" class="size-2 shrink-0 rounded-full bg-success" />
          {p.availabilityNote[lang]}
        </p>
      )
    }
  </div>

  <div class="mt-6 flex flex-col gap-2">
    <a href={p.cv[lang]} download data-cv-link class:list={[button, 'bg-primary text-on-primary hover:opacity-90']}>
      {t(lang, 'profile.downloadCv')}
    </a>
    <a href={`mailto:${p.email}`} data-contact-link class:list={[button, 'border border-primary text-primary hover:bg-surface-soft']}>
      {t(lang, 'profile.contact')}
    </a>
  </div>

  <dl class="mt-6 space-y-3 text-sm">
    <div>
      <dt class="text-text-muted">{t(lang, 'profile.location')}</dt>
      <dd>{p.location[lang]}</dd>
    </div>
    <div>
      <dt class="text-text-muted">{t(lang, 'profile.education')}</dt>
      <dd>{p.education.degree[lang]} · {p.education.institution}, {p.education.year}</dd>
    </div>
    <div>
      <dt class="text-text-muted">{t(lang, 'profile.languages')}</dt>
      <dd>{p.languages.map((l) => `${l.name[lang]} (${l.level[lang]})`).join(' · ')}</dd>
    </div>
  </dl>

  <ul class="mt-6 flex justify-center gap-6 text-sm font-semibold">
    <li><a href={p.linkedin} target="_blank" rel="me noopener" class="text-primary underline-offset-4 hover:underline">LinkedIn</a></li>
    <li><a href={p.github} target="_blank" rel="me noopener" class="text-primary underline-offset-4 hover:underline">GitHub</a></li>
  </ul>
</aside>
```

- [ ] **Step 3: `ExperienceSummary.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../lib/i18n';
import { t } from '../i18n';
import { formatRange, formatDuration, monthsBetween, toYearMonth } from '../lib/dates';

interface Props {
  lang: Locale;
  entry: CollectionEntry<'experience'>['data'];
}
const { lang, entry } = Astro.props;
const months = monthsBetween(entry.start, entry.end ?? toYearMonth(new Date()));
---
<div data-experience-summary>
  <p class="text-lg font-semibold">{entry.role[lang]}</p>
  <p class="text-text-muted">{entry.organization[lang]}</p>
  <p class="mt-1 text-sm font-medium text-primary">
    {formatRange(entry.start, entry.end, lang)} · {formatDuration(months, lang)}
  </p>
  <ul class="mt-4 list-disc space-y-2 pl-5">
    {entry.highlights.slice(0, 3).map((h) => <li>{h[lang]}</li>)}
  </ul>
  <a
    href={`/${lang}/experiencia/`}
    data-journey-link
    class="mt-5 inline-block rounded-lg bg-primary px-4 py-2.5 font-semibold text-on-primary hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    {t(lang, 'home.journey')}
  </a>
</div>
```

- [ ] **Step 4: `ProjectCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../lib/i18n';
import { t } from '../i18n';

interface Props {
  lang: Locale;
  id: string;
  project: CollectionEntry<'projects'>['data'];
}
const { lang, id, project } = Astro.props;
const cover = project.images[0];
---
<article data-project-card class="relative flex flex-col overflow-hidden rounded-xl border border-border bg-bg transition hover:border-accent">
  {
    cover ? (
      <img src={cover.src} alt={cover.alt[lang]} loading="lazy" class="aspect-video w-full object-cover" />
    ) : (
      <div aria-hidden="true" class="aspect-video w-full bg-surface-soft" />
    )
  }
  <div class="flex flex-1 flex-col p-4">
    <h3 class="font-semibold">
      <a href={`/${lang}/proyectos/${id}/`} class="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-primary">
        {project.title[lang]}
      </a>
    </h3>
    <p class="mt-1 text-sm text-text-muted">{project.tagline[lang]}</p>
    <p class="mt-3 text-sm">{project.result[lang]}</p>
    <ul class="mt-3 flex flex-wrap gap-1.5">
      {project.tech.slice(0, 4).map((tech) => <li class="rounded-full bg-surface-soft px-2 py-0.5 text-xs">{tech}</li>)}
    </ul>
    <span aria-hidden="true" class="mt-auto pt-4 text-sm font-semibold text-primary">{t(lang, 'home.viewCase')} →</span>
  </div>
</article>
```

- [ ] **Step 5: `SkillGroup.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../lib/i18n';

interface Props {
  lang: Locale;
  skill: CollectionEntry<'skills'>['data'];
}
const { lang, skill } = Astro.props;
---
<div data-skill-group>
  <h3 class="font-semibold">{skill.group[lang]}</h3>
  <ul class="mt-2 flex flex-wrap gap-1.5">
    {skill.tech.map((tech) => <li class="rounded-full border border-border bg-bg px-2.5 py-1 text-sm">{tech}</li>)}
  </ul>
</div>
```

- [ ] **Step 6: `EducationList.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../lib/i18n';
import { t } from '../i18n';

interface Props {
  lang: Locale;
  education: CollectionEntry<'profile'>['data']['education'];
  courses: CollectionEntry<'courses'>['data'][];
}
const { lang, education, courses } = Astro.props;
---
<div>
  <p class="text-lg font-semibold">{education.degree[lang]}</p>
  <p class="text-text-muted">{education.institution} · {education.year}</p>

  <h3 class="mt-6 font-semibold">{t(lang, 'home.courses')}</h3>
  <ul class="mt-2 divide-y divide-border">
    {
      courses.map((c) => (
        <li data-course class="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <span>{c.name[lang]}</span>
          <span class="shrink-0 text-sm text-text-muted">
            {c.institution}
            {c.hours && ` · ${c.hours} h`}
          </span>
        </li>
      ))
    }
  </ul>
</div>
```

- [ ] **Step 7: `ContactCTA.astro`**

```astro
---
import type { Locale } from '../lib/i18n';
import { t } from '../i18n';

interface Props {
  lang: Locale;
  email: string;
}
const { lang, email } = Astro.props;
---
<div>
  <p>{t(lang, 'home.freelance.body')}</p>
  <a
    href={`mailto:${email}`}
    data-freelance-link
    class="mt-4 inline-block rounded-lg border border-primary px-4 py-2.5 font-semibold text-primary hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    {t(lang, 'home.freelance.cta')}
  </a>
</div>
```

- [ ] **Step 8: Verificar**

Run: `pnpm check`
Expected: `0 errors` (los componentes aún no se usan; esto valida tipos y props).

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components
git commit -m "feat: add home page section components"
```

---

### Task 6: Componer la página principal

**Files:**
- Replace: `frontend/src/pages/[lang]/index.astro`

- [ ] **Step 1: Página**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProfileCard from '../../components/ProfileCard.astro';
import Section from '../../components/Section.astro';
import ExperienceSummary from '../../components/ExperienceSummary.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import SkillGroup from '../../components/SkillGroup.astro';
import EducationList from '../../components/EducationList.astro';
import ContactCTA from '../../components/ContactCTA.astro';
import { LOCALES, type Locale } from '../../lib/i18n';
import { byOrder, featuredProjects, latestWork } from '../../lib/home';
import { t } from '../../i18n';

export function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

const lang = Astro.params.lang as Locale;

const profileEntry = await getEntry('profile', 'main');
if (!profileEntry) throw new Error('Falta la entrada "main" en src/data/profile.json');
const profile = profileEntry.data;

const experience = (await getCollection('experience')).map((e) => e.data);
const current = latestWork(experience);
if (!current) throw new Error('No hay ninguna experiencia con line "work" en src/data/experience.json');

const projects = featuredProjects((await getCollection('projects')).map((e) => ({ id: e.id, ...e.data })));
const skills = byOrder((await getCollection('skills')).map((e) => e.data));
const courses = byOrder((await getCollection('courses')).map((e) => e.data));
---
<BaseLayout lang={lang}>
  <div class="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-8 lg:py-10">
    <ProfileCard lang={lang} profile={profile} />

    <main id="main" class="flex min-w-0 flex-col gap-6">
      <Section id="about" title={t(lang, 'home.about')}>
        <p class="text-lg leading-relaxed">{profile.summary[lang]}</p>
      </Section>

      <Section id="experience" title={t(lang, 'home.experience')} highlight>
        <ExperienceSummary lang={lang} entry={current} />
      </Section>

      <Section id="projects" title={t(lang, 'home.projects')}>
        <div class="grid gap-4 sm:grid-cols-2">
          {projects.map(({ id, ...project }) => <ProjectCard lang={lang} id={id} project={project} />)}
        </div>
      </Section>

      <Section id="skills" title={t(lang, 'home.skills')}>
        <div class="grid gap-5 sm:grid-cols-2">
          {skills.map((skill) => <SkillGroup lang={lang} skill={skill} />)}
        </div>
      </Section>

      <Section id="education" title={t(lang, 'home.education')}>
        <EducationList lang={lang} education={profile.education} courses={courses} />
      </Section>

      <Section id="contact" title={t(lang, 'home.freelance.title')}>
        <ContactCTA lang={lang} email={profile.email} />
      </Section>
    </main>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verificar**

Run: `pnpm check && pnpm test && pnpm build && pnpm test:e2e`
Expected: `0 errors`; Vitest PASS; build `Complete!`; Playwright 7 passed (los tests de fase 1 siguen válidos: `h1` con el nombre, `data-lang-switch`, `data-theme-toggle`, sin scroll horizontal a 375 px).

- [ ] **Step 3: Revisión visual**

`pnpm dev`, abrir `/es/` y `/en/` en 1280 px y 375 px, en tema claro y oscuro. Comprobar: tarjeta fija a la izquierda en escritorio y arriba en móvil; 4 tarjetas de proyecto; textos sin desbordes.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages
git commit -m "feat: compose home page with profile card and sections"
```

---

### Task 7: Pruebas de humo de la principal

**Files:**
- Create: `frontend/tests/e2e/home.spec.ts`

- [ ] **Step 1: Tests**

```ts
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
    await expect(card.locator('[data-contact-link]')).toHaveAttribute('href', 'mailto:sebastianmn03@gmail.com');
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

test('principal en inglés usa textos en inglés', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('heading', { level: 2, name: 'Featured projects' })).toBeVisible();
  await expect(page.locator('[data-cv-link]')).toHaveText('Download CV');
  await expect(page.locator('[data-journey-link]')).toHaveAttribute('href', '/en/experiencia/');
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
```

- [ ] **Step 2: Correr**

Run: `pnpm test:e2e`
Expected: 15 passed (7 de `base.spec.ts` + 8 de `home.spec.ts`).

- [ ] **Step 3: Commit**

```bash
git add frontend/tests/e2e/home.spec.ts
git commit -m "test: add home page smoke tests"
```

---

### Task 8: Documentación, verificación y push

**Files:**
- Modify: `docs/01-arquitectura/architecture.md`, `docs/log.md`

- [ ] **Step 1: Arquitectura**

En `docs/01-arquitectura/architecture.md`, sección 3, agregar a la tabla:
```markdown
| `src/lib/home.ts` | Selección de datos de la principal: orden, proyectos destacados, empleo más reciente, iniciales. |
| `src/components/` (principal) | `ProfileCard`, `Section`, `ExperienceSummary`, `ProjectCard`, `SkillGroup`, `EducationList`, `ContactCTA`. Reciben `lang` y datos ya resueltos; sin JS de cliente. |
```
Actualizar el pie a `Última actualización: <fecha del día>`.

- [ ] **Step 2: Bitácora**

En `docs/log.md`, agregar bajo `## 2026-09 — Diseño y base`:
```markdown
- **<fecha del día>** — Fase 2 ([plan](superpowers/plans/2026-09-22-fase2-pagina-principal.md)): página principal con tarjeta de perfil (CV, contacto, disponibilidad, formación, idiomas) y seis secciones; `profile.education` en el esquema; acciones de CI actualizadas (aviso de Node 20). Los enlaces a `/experiencia/` y `/proyectos/<id>/` responden 404 hasta las fases 3 y 4.
```
Actualizar el pie de `log.md`.

- [ ] **Step 3: Verificación completa**

Desde `frontend/`: `pnpm check && pnpm test && pnpm build && pnpm test:e2e`
Expected: todo en verde; Playwright 15 passed.

- [ ] **Step 4: Commit y push**

```bash
git add docs
git commit -m "docs: document phase 2 home page"
git push origin HEAD
```

- [ ] **Step 5: CI**

Run: `gh run watch <id> --repo THEJUANX94/Portafolio --exit-status` (id de `gh run list --repo THEJUANX94/Portafolio --limit 1`)
Expected: job verde y **sin** la anotación "Node.js 20 is deprecated".
