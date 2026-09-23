---
type: guide
tags: [portafolio, contenido]
---

# Cómo editar el contenido

Todo el contenido está en `frontend/src/data/`. Cada texto visible lleva ambos idiomas: `{ "es": "…", "en": "…" }`.

| Archivo | Qué contiene |
|---|---|
| `profile.json` | Nombre, título, resumen, disponibilidad, enlaces, rutas del CV, idiomas |
| `experience.json` | Estaciones del metro. `line`: `work` (empleo), `projects` (proyectos propios/hackatón), `education` (estudios) |
| `projects.json` | Casos de estudio. `id` = slug de la URL |
| `skills.json` | Grupos de habilidades |
| `courses.json` | Cursos y certificaciones |

## Agregar una experiencia
1. Añadir un objeto a `experience.json` con `id` único, fechas `YYYY-MM` y `end: null` si sigue vigente.
2. En `projects`, usar `id`s existentes de `projects.json`.
3. `pnpm build && pnpm test` — si algo está mal, el error dice el archivo y el campo.
4. Si no se conoce el mes exacto (por ejemplo, un proyecto universitario), agregar `"approximate": true`. La estación muestra solo el año o el rango de años (`2022 – 2023`) y no muestra la duración.

## Agregar un proyecto
1. Añadir a `projects.json`. Institucional → `"visibility": "anonymized"` y **sin** `repo` ni `demo`.
2. Capturas en `frontend/public/img/proyectos/<id>/`, con `alt` en ambos idiomas.

## Anonimizar capturas
Usar datos de prueba o cubrir nombres, documentos, correos y teléfonos antes de guardar la imagen. Nunca subir capturas con datos reales de ciudadanos o funcionarios.

## Cambiar el CV
Reemplazar el PDF en `frontend/public/cv/` manteniendo el nombre, o actualizar `cv.es` / `cv.en` en `profile.json`.

El PDF en español se mantiene manualmente. El PDF en inglés se genera desde `cv/cv-en.html`: editar ese archivo y correr `pnpm cv` (desde `frontend/`) para regenerar `frontend/public/cv/CV-Juan-Sebastian-Martinez-EN.pdf`.

Última actualización: 2026-09-22
