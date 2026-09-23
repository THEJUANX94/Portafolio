# Animaciones y micro-interacciones — Design Spec

**Date:** 2026-09-23
**Status:** Approved

## Contexto

Antes de publicar, el autor pidió transiciones fluidas al cambiar de pantalla y detalles pequeños al pasar el mouse. Se revisó una demo interactiva (`.superpowers/brainstorm/`) y se eligieron: transición **A (fundido suave)** + **B (la tarjeta se convierte en la página)** y los **8 detalles de hover**.

## Decisiones

| Tema | Decisión |
|---|---|
| Técnica de transición | View Transitions **nativas entre documentos** (`@view-transition { navigation: auto; }`), sin JS ni `ClientRouter` |
| Soporte | Chrome, Edge, Safari. Otros navegadores navegan sin animación (sin errores) |
| Movimiento reducido | Con `prefers-reduced-motion: reduce` no hay transiciones de página ni animaciones de hover |
| Hover en táctil | Efectos de hover solo dentro de `@media (hover: hover)` |

## Transiciones

- **A · Fundido (todas las navegaciones):** `::view-transition-old(root)` se desvanece en 200 ms; `::view-transition-new(root)` aparece subiendo 10 px en 300 ms (`ease-out`).
- **B · Elemento compartido:**
  - Título de cada tarjeta de proyecto (principal) ↔ `<h1>` de su página: `view-transition-name: project-title-<id>`.
  - Título de la sección "Experiencia" (principal) ↔ `<h1>` "Mi recorrido": `view-transition-name: journey-title`.
  - Al volver atrás el efecto se invierte (lo hace el navegador).
  - Los nombres son únicos por página (los enlaces anterior/siguiente del detalle no llevan nombre).

## Detalles de hover

1. **Tarjetas de proyecto:** suben 4 px con sombra morada suave (200 ms).
2. **Flecha que avanza:** el `→` de "Ver recorrido completo", "Ver caso" y "Siguiente" se desplaza 4 px.
3. **Subrayado que crece:** enlaces de texto (LinkedIn, GitHub, "Hablemos", proyectos de la etapa, repositorio, volver) dibujan el subrayado de izquierda a derecha.
4. **Etiquetas de tecnología:** se tiñen de lavanda (`surface-soft` + borde `accent` + texto `primary`).
5. **Estación del metro:** el punto crece a 1.25× con un halo `surface-soft` al pasar por la fila.
6. **Botón de tema:** el ícono rota −25° y escala 1.1.
7. **Foto / iniciales:** anillo lavanda (`ring` `accent` con separación).
8. **Descargar CV:** un destello diagonal cruza el botón (600 ms).

Todos los colores vía tokens existentes; sin texto nuevo.

## Pruebas

- e2e: la tarjeta de proyecto y el `<h1>` de su página tienen el mismo `view-transition-name` calculado; ídem "Experiencia" ↔ "Mi recorrido".
- e2e: hover sobre una tarjeta cambia su `transform`; con `reducedMotion: 'reduce'` la duración de transición/animación es ~0.
- axe (claro/oscuro) y Lighthouse siguen en verde.

## Fuera de alcance

Router de cliente, animaciones en scroll, parallax, cursores personalizados.
