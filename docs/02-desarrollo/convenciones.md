---
type: guide
tags: [portafolio, convenciones]
---

# Convenciones

## Código
- TypeScript estricto (`astro/tsconfigs/strict`).
- Lógica pura en `src/lib/` con test en `tests/unit/<nombre>.test.ts`.
- Componentes en PascalCase; utilidades en camelCase.
- Colores solo mediante tokens (`bg-primary`, `text-text-muted`…), nunca hex en componentes.

## Commits y ramas
- Conventional Commits en inglés: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `ci:`.
- `main` siempre desplegable; cambios grandes en rama `feat/<tema>`.

## Redacción de contenido (para RRHH)
- Verbo en primera persona + resultado + cifra: "Reduje 57% la infraestructura…".
- Sin siglas sin explicar en resúmenes; las tecnologías van como etiquetas.
- Máximo 5 logros por experiencia; los 3 primeros son los que se ven en la página principal.

Última actualización: 2026-09-22
