---
type: decision
tags: [adr, ux, react, experiencia]
---

# ADR 0004: Experiencia como mapa de metro vertical en una isla React

## Estado
Aceptado (implementación en fase 3).

## Contexto

Se quería una presentación de la experiencia más visual que una lista, pero fácil para RRHH y usable en celular. Se compararon: sendero vertical, paisaje ilustrado horizontal, metro horizontal y metro vertical.

## Decisión

1. **Metro vertical** en su propia página (`/[lang]/experiencia`): lectura de lo más reciente a lo más antiguo, como un CV.
2. Tres líneas: morado = empleo, lavanda = proyectos propios y hackatón, gris = estudios y cursos.
3. Implementado como isla React (`client:visible`) con toda la información también presente en el HTML (funciona sin JS).
4. Cálculo de posiciones y ramificaciones en `src/lib/metro.ts` (puro, probado con Vitest).

## Consecuencias

- **Positivas**: distingue tipos de experiencia por color; sin scroll horizontal en móvil; recordable.
- **Costos aceptados**: más trabajo que una lista; requiere cuidar accesibilidad (botones con `aria-expanded`).

Última actualización: 2026-09-22
