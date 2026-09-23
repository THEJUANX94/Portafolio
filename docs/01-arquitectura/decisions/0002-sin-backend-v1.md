---
type: decision
tags: [adr, backend, alcance]
---

# ADR 0002: Sin backend en la versión 1

## Estado
Aceptado.

## Contexto

Se consideró un backend para: panel de administración de contenido, formulario de contacto, analítica y generación del CV en PDF. El objetivo inmediato es tener el portafolio publicado.

## Decisión

1. v1 es 100% estática. Contacto por `mailto:`, LinkedIn y GitHub; CV como PDF en `public/cv/`.
2. El contenido vive en `frontend/src/data/*.json` validado por zod, separado de la presentación.
3. Si se agrega backend, irá en `backend/` junto a `frontend/`, y solo cambiará la fuente de los datos.

## Consecuencias

- **Positivas**: hosting gratuito, sin servidores que mantener, superficie de ataque mínima.
- **Costos aceptados**: editar contenido requiere cambiar JSON y volver a desplegar; no hay estadísticas de visitas ni formulario.

Última actualización: 2026-09-22
