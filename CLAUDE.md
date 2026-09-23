# CLAUDE.md — Portafolio personal

## Contexto
Portafolio público de Juan Sebastián Martínez Noreña (Ingeniero de Sistemas, UPTC 2026; ex Tech Lead de Software e Infraestructura en la Gobernación de Boyacá). Audiencia: reclutadores y RRHH **no técnicos**; lenguaje simple, logros con cifras.

## Stack
- `frontend/`: Astro 7, Tailwind 4, zod 4 vía `astro/zod`. Sin React (ver ADR 0005).
- TypeScript **6** (`astro check` no soporta TS 7).
- pnpm 11 (aprobaciones de build en `frontend/pnpm-workspace.yaml` con `allowBuilds:`).
- Sin backend en v1. Si se agrega, va en `backend/` junto a `frontend/`.

## Reglas
- Todo texto visible es bilingüe (`{ es, en }`); el esquema lo exige.
- Nada de texto de contenido escrito directo en componentes: sale de `src/data/*.json` o `src/i18n/*.json`.
- Proyectos de la Gobernación: `visibility: "anonymized"` — sin repo, demo, ni datos reales en capturas.
- No inventar datos del CV (fechas, premios, cifras). Si falta, se pregunta.
- Lógica pura en `src/lib/` con test en `tests/unit/`.

## Metodología
Spec-Driven Development. Specs en `docs/superpowers/specs/`, planes por fase en `docs/superpowers/plans/`. Registrar hitos en `docs/log.md`.

## Comandos (desde `frontend/`)
`pnpm dev` · `pnpm check` · `pnpm test` · `pnpm build` · `pnpm test:e2e`
