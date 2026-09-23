---
type: guide
tags: [portafolio, setup]
---

# Setup local

## Requisitos

```bash
node -v   # >= 22.12
pnpm -v   # >= 11  (corepack enable)
```

## Pasos

```bash
cd frontend
pnpm install
pnpm dev                              # http://localhost:4321 → redirige a /es/ o /en/
```

## Verificación antes de commitear

```bash
pnpm check && pnpm test && pnpm build
pnpm exec playwright install chromium   # solo la primera vez
pnpm test:e2e
```

Última actualización: 2026-09-22
