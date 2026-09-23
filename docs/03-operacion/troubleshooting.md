---
type: runbook
tags: [portafolio, troubleshooting]
---

# Troubleshooting

## `astro check does not currently support TypeScript 7.0`
Usar TypeScript 6 (`pnpm add -D typescript@^6`). Ver [ADR 0001](../01-arquitectura/decisions/0001-astro-sitio-estatico.md).

## `InvalidContentEntryDataError` al compilar
El contenido no cumple el esquema. El mensaje indica colección, `id` y campo. Causas típicas: falta `en` en un texto, fecha que no es `YYYY-MM`, proyecto anonimizado con `repo`.

## Referencia a proyecto inexistente
Astro solo registra en consola `Invalid content reference…` cuando `experience.json` apunta a un `id` de `projects.json` que no existe; no hace fallar el build. Por eso `tests/unit/content.test.ts` valida explícitamente las referencias cruzadas entre colecciones y hace fallar la CI si alguna es inválida. Correr `pnpm test` para detectarlo.

## pnpm pide aprobar scripts de build
Agregar el paquete a `allowBuilds:` en `frontend/pnpm-workspace.yaml` (pnpm ≥ 10).

## Playwright: `Executable doesn't exist`
Correr `pnpm exec playwright install chromium`.

Última actualización: 2026-09-22
