---
type: reference
tags: [portafolio, configuracion]
---

# Variables de entorno

| Variable | Dónde | Uso | Default |
|---|---|---|---|
| `SITE_URL` | build (`astro.config.mjs`) | URL pública; usada en `canonical`, `hreflang`, `og:image`, `og:url`, sitemap y `robots.txt` | `http://localhost:4321` (en CI: `https://jsmartinez-dev.pages.dev`, definido en `.github/workflows/ci.yml`) |
| `CI` | Playwright | Activa reintentos y prohíbe `test.only` | — |

No hay secretos en v1. No commitear archivos `.env`.

Última actualización: 2026-09-22
