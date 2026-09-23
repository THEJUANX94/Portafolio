---
type: decision
tags: [adr, deploy, hosting]
---

# ADR 0006: Hosting en Cloudflare Pages con despliegue desde GitHub Actions

## Estado
Aceptado.

## Contexto

El sitio es 100% estático (`frontend/dist/`). Se buscaba una opción gratuita, con subdominio incluido y margen amplio. Comparación (septiembre de 2026):

| | Cloudflare Pages | GitHub Pages | Vercel Hobby | Netlify Free |
|---|---|---|---|---|
| Subdominio | `<nombre>.pages.dev` | `<usuario>.github.io` | `<nombre>.vercel.app` | `<nombre>.netlify.app` |
| Tráfico | Ilimitado (estático) | 100 GB/mes, límite flexible | 100 GB/mes, pausa el sitio al superarlo | ~15 GB/mes (300 créditos), pausa el sitio |
| Despliegues | 500/mes | Sin límite con Actions | Sin límite | ~20/mes |
| Uso comercial | Sí | Sí | No | Sí |

## Decisión

1. Cloudflare Pages, proyecto `jsmartinez-dev` (https://jsmartinez-dev.pages.dev).
2. Despliegue por **Direct Upload** desde GitHub Actions (`cloudflare/wrangler-action`), después de que la CI pase, usando el mismo `dist/` que se probó. No se usa la integración Git de Cloudflare (compilaría otra vez, con otra imagen y otra versión de pnpm).
3. `SITE_URL` fijo en el workflow; cabeceras en `frontend/public/_headers`.

## Consecuencias

- **Positivas**: tráfico sin tope, CDN global, rollback de un clic, dominio propio fácil de agregar; solo se publica lo que pasó las pruebas.
- **Costos aceptados**: requiere cuenta en Cloudflare y dos secretos en GitHub; sin previews por PR (se podrían agregar con `--branch=<rama>`).

Última actualización: 2026-09-22
