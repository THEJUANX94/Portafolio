---
type: reference
tags: [portafolio, configuracion]
---

# Variables de entorno

| Variable | Dónde | Uso | Default |
|---|---|---|---|
| `SITE_URL` | build (`astro.config.mjs`) | URL pública; usada en `canonical`, `hreflang`, sitemap y Open Graph | `http://localhost:4321` |
| `CI` | Playwright | Activa reintentos y prohíbe `test.only` | — |

No hay secretos en v1. No commitear archivos `.env`.

Última actualización: 2026-09-22
