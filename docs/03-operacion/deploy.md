---
type: runbook
tags: [portafolio, deploy]
---

# Despliegue

**Estado:** proveedor por decidir (al terminar la fase 5).

El build (`pnpm build` en `frontend/`) produce `frontend/dist/`, un sitio estático que funciona en cualquier hosting estático. Solo hay que definir `SITE_URL`.

## Opciones

| Proveedor | Costo | Deploy desde GitHub | Dominio propio | Notas |
|---|---|---|---|---|
| Vercel | Gratis (hobby) | Sí, por push | Sí | Previews por PR |
| Netlify | Gratis | Sí, por push | Sí | Previews por PR |
| Cloudflare Pages | Gratis | Sí, por push | Sí | CDN global, sin límite de ancho de banda |
| GitHub Pages | Gratis | Vía Actions | Sí | Todo queda en GitHub |

Configuración común: directorio raíz `frontend`, comando `pnpm build`, salida `dist`, variable `SITE_URL`.

Antes del primer despliegue, definir `SITE_URL` con el dominio final; sin eso las vistas previas en LinkedIn/WhatsApp apuntan a localhost.

Última actualización: 2026-09-22
