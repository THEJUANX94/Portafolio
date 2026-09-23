---
type: decision
tags: [adr, ux, accesibilidad, experiencia]
---

# ADR 0005: Metro con `<details>` nativo, sin React

## Estado
Aceptado. Reemplaza el punto 3 de [ADR 0004](0004-metro-vertical-isla-react.md) y el punto 2 de [ADR 0001](0001-astro-sitio-estatico.md).

## Contexto

ADR 0004 preveía el metro como isla React. Al diseñar la fase 3, toda la interacción necesaria (abrir una estación, una abierta a la vez, teclado, lector de pantalla, funcionar sin JS) la cubre HTML nativo: `<details name="…">` es un acordeón exclusivo con `aria-expanded` implícito.

## Decisión

1. Cada estación es un `<details name="metro">`; la más reciente se renderiza con `open`.
2. El trazado (orden, líneas presentes, tramos por fila) se calcula en `src/lib/metro.ts` en build.
3. Los rieles son elementos posicionados por fila, así se alinean aunque cambie el alto de la tarjeta abierta.
4. Se retiran `@astrojs/react`, `react` y `react-dom`: no hay otro uso de React.

## Consecuencias

- **Positivas**: cero JavaScript en la página del recorrido; accesible y funcional sin JS; menos dependencias.
- **Costos aceptados**: la exclusividad (`name`) requiere navegadores de 2024 en adelante; en uno antiguo pueden quedar varias estaciones abiertas, sin romper nada. Si en el futuro se quiere una animación compleja, habría que reincorporar una isla.

Última actualización: 2026-09-22
