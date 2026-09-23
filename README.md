# Portafolio — Juan Sebastián Martínez Noreña

Portafolio web bilingüe (español / inglés) para reclutadores: perfil, experiencia como mapa de metro, proyectos y CV descargable.

## Stack

| Capa | Tecnología |
| :--- | :--- |
| Frontend | Astro 7 + React 19 (solo el mapa de experiencia) + Tailwind 4 |
| Contenido | JSON validado con zod (content collections) |
| Backend | Ninguno en v1 (ver [ADR 0002](docs/01-arquitectura/decisions/0002-sin-backend-v1.md)) |
| Pruebas | Vitest + Playwright |
| Deploy | Hosting estático, por definir ([deploy.md](docs/03-operacion/deploy.md)) |

## Estructura

```
frontend/   Sitio Astro (único paquete en v1)
docs/       Documentación técnica (ver docs/index.md)
```

## Inicio rápido

```bash
cd frontend
pnpm install
pnpm dev          # http://localhost:4321
```

Más detalle en [docs/02-desarrollo/setup-local.md](docs/02-desarrollo/setup-local.md). Para cambiar textos, experiencia o proyectos: [como-editar-contenido.md](docs/02-desarrollo/como-editar-contenido.md).
