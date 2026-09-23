---
type: decision
tags: [adr, i18n]
---

# ADR 0003: Idiomas por rutas `/es/` y `/en/`

## Estado
Aceptado.

## Contexto

El portafolio apunta a empresas colombianas y a trabajo remoto internacional. Se necesita español e inglés, con URLs compartibles por idioma e indexables.

## Decisión

1. i18n nativo de Astro: `locales: ["es", "en"]`, `defaultLocale: "es"`, `prefixDefaultLocale: true`.
2. `/` redirige en el cliente según `navigator.languages` (inglés → `/en/`, cualquier otro → `/es/`), con enlaces `<noscript>`.
3. Contenido bilingüe como `{ es, en }` en cada campo; textos de interfaz en `src/i18n/{es,en}.json` con las mismas claves.
4. `hreflang` alternos en cada página.

## Consecuencias

- **Positivas**: cada idioma tiene URL propia; imposible publicar un texto sin traducir (falla el build).
- **Costos aceptados**: todo contenido se escribe dos veces; la raíz depende de JS para redirigir (con fallback manual).

Última actualización: 2026-09-22
