---
type: runbook
tags: [portafolio, deploy, cloudflare]
---

# Despliegue

**Producción:** Cloudflare Pages, proyecto `jsmartinez-dev` → https://jsmartinez-dev.pages.dev ([ADR 0006](../01-arquitectura/decisions/0006-hosting-cloudflare-pages.md)).

## Cómo funciona

1. Cada push a `main` corre la CI (`.github/workflows/ci.yml`, job `frontend`): `astro check`, Vitest, build con `SITE_URL`, Playwright y Lighthouse.
2. Si todo pasa, el job sube `frontend/dist/` como artefacto `site`.
3. El job `deploy` descarga **ese mismo** `dist/` y lo publica con `wrangler pages deploy`. No se vuelve a compilar: se publica exactamente lo que pasó las pruebas.
4. En pull requests no se despliega.

`SITE_URL` y el nombre del proyecto están en el bloque `env:` al inicio del workflow. Si cambia el dominio, cambiar `SITE_URL` ahí (canonical, hreflang, Open Graph, sitemap y robots dependen de él).

Cabeceras de seguridad y caché: `frontend/public/_headers` (CSP, `X-Frame-Options`, caché inmutable para `/_astro/*`).

## Configuración inicial (una sola vez, la hace el dueño de la cuenta)

1. Crear una cuenta gratuita en https://dash.cloudflare.com/sign-up.
2. Crear el proyecto de Pages vacío con el nombre exacto `jsmartinez-dev` y rama de producción `main`. Opciones:
   - Dashboard: **Workers & Pages → Create → Pages → Upload assets (Direct Upload)** → nombre `jsmartinez-dev` → subir cualquier archivo (se reemplaza en el primer despliegue).
   - O por terminal: `pnpm dlx wrangler login` y luego `pnpm dlx wrangler pages project create jsmartinez-dev --production-branch=main`.
   Si el nombre ya estuviera tomado, Cloudflare asigna otro: actualizar `PAGES_PROJECT` y `SITE_URL` en el workflow.
3. Crear un API token: **My Profile → API Tokens → Create Token → Custom token**, permiso **Account → Cloudflare Pages → Edit**, limitado a tu cuenta.
4. Copiar el **Account ID** (Workers & Pages → panel derecho, o la URL del dashboard).
5. En GitHub, **Settings → Secrets and variables → Actions → New repository secret** del repo `THEJUANX94/Portafolio`:
   - `CLOUDFLARE_API_TOKEN` = el token.
   - `CLOUDFLARE_ACCOUNT_ID` = el Account ID.
   (O con `gh secret set CLOUDFLARE_API_TOKEN --repo THEJUANX94/Portafolio` y pegar el valor cuando lo pida.)
6. Relanzar el último workflow de `main` (**Actions → CI → Re-run all jobs**) o hacer un push.

Mientras falten los secretos, el job `deploy` termina en verde con un aviso "Despliegue omitido".

## Dominio propio (opcional)

Cloudflare Pages → proyecto → **Custom domains → Set up a domain**. Con dominio comprado en Cloudflare Registrar se configura solo; con otro registrador, agregar el CNAME que indique. Después, cambiar `SITE_URL` en el workflow al dominio nuevo y hacer push.

## Revertir un despliegue

Cloudflare Pages → proyecto → **Deployments** → despliegue anterior → **Rollback to this deployment**.

Última actualización: 2026-09-22
