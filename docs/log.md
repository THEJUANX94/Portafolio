---
type: log
tags: [portafolio, changelog]
---

# Bitácora de cambios

## 2026-09 — Diseño y base

- **2026-09-22** — Brainstorming y spec aprobada ([spec](superpowers/specs/2026-09-22-portafolio-v1-design.md)): audiencia RRHH, tarjeta de perfil + secciones, experiencia como metro vertical, paleta morado + lavanda, ES/EN, sin backend, Astro.
- **2026-09-22** — Fase 1 ([plan](superpowers/plans/2026-09-22-fase1-base.md)): scaffold Astro 7 en `frontend/`, i18n, tema claro/oscuro, colecciones con datos del CV, Vitest + Playwright, CI, documentación.
- Astro solo registra (no falla) referencias rotas entre colecciones → se agregó `tests/unit/content.test.ts`. La 404 queda `noindex`.
- **2026-09-22** — Decisiones del autor: el CV en PDF se publica tal cual, incluido el teléfono (decisión explícita; `profile.json` no lo muestra en la página). Aprobados los textos de proyectos que no salen literalmente del CV (Postulaciones docentes, Cárdenas Visión, Consolidación de infraestructura).
- Pendiente: mes de graduación de la UPTC para la estación de estudios (el inicio, febrero de 2021, ya se conoce); foto de perfil; capturas anonimizadas.
- **2026-09-22** — Fase 2 ([plan](superpowers/plans/2026-09-22-fase2-pagina-principal.md)): página principal con tarjeta de perfil (CV, contacto, disponibilidad, formación, idiomas) y seis secciones; `profile.education` en el esquema; tarjetas de proyecto con franja de acento mientras no haya capturas; acciones de CI actualizadas (aviso de Node 20). Los enlaces a `/experiencia/` y `/proyectos/<id>/` responden 404 hasta las fases 3 y 4.
- **2026-09-22** — Fase 3 ([plan](superpowers/plans/2026-09-22-fase3-metro.md)): página `/[lang]/experiencia/` con el metro vertical (líneas por tipo, terminal "¿Siguiente estación? Hablemos", una estación abierta a la vez). Implementado con `<details>` nativo; se retira React ([ADR 0005](01-arquitectura/decisions/0005-metro-details-nativo-sin-react.md)). La línea de estudios aparecerá al agregar entradas `education` (falta la fecha de inicio en la UPTC).
- **2026-09-22** — Fase 4 ([plan](superpowers/plans/2026-09-22-fase4-detalle-proyecto.md)): páginas `/[lang]/proyectos/<id>/` como caso de estudio (problema, rol, solución, resultado, capturas, tecnologías, enlaces solo si es público, etapa del recorrido, anterior/siguiente). Prueba e2e que verifica que ningún enlace interno responde 404.
- **2026-09-22** — CV en inglés (`cv/cv-en.html` → `pnpm cv` genera `frontend/public/cv/CV-Juan-Sebastian-Martinez-EN.pdf`; `profile.json.cv.en` actualizado). Fechas aproximadas: `dates.ts` y `experienceBase` ganan `approximate` (muestra solo el año, sin duración) para las estaciones universitarias `azure-distribuidos-uptc` y `ancla-uptc` (UPTC, 2022 – 2023, sin meses exactos). Confirmado: el equipo de la Hackathon Boyacá Innovate 2025 ganó el primer puesto en el reto de Cárdenas Visión; la solución se entregó a la empresa y el desarrollo continúa en conjunto (`experience.json`, `projects.json`, `courses.json` actualizados).

Última actualización: 2026-09-22
