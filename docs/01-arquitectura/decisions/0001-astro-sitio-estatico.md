---
type: decision
tags: [adr, astro, frontend]
---

# ADR 0001: Astro como generador de sitio estático

## Estado
Aceptado.

## Contexto

El portafolio es casi todo contenido, lo revisan reclutadores desde el celular y se comparte por LinkedIn/WhatsApp. Necesita cargar rápido, indexarse bien y mostrar vista previa. Solo una pieza es interactiva (el mapa de experiencia). Se evaluaron Astro, Next.js con exportación estática y React + Vite (SPA).

## Decisión

1. **Astro 7** genera HTML estático por página.
2. **React** solo como isla para el mapa de experiencia (`client:visible`).
3. **Tailwind 4** para estilos.

## Consecuencias

- **Positivas**:
  - Casi cero JavaScript enviado al navegador; buen Lighthouse en móvil.
  - HTML completo para buscadores y vistas previas (a diferencia de una SPA).
  - i18n por rutas incluido en el framework.
- **Costos aceptados**:
  - Tecnología nueva para el autor (curva corta).
  - `astro check` requiere TypeScript 6; no se puede subir a TS 7 hasta que Astro lo soporte.

Última actualización: 2026-09-22
