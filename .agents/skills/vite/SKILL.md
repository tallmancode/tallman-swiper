---
name: vite
description: Vite 8 Rolldown migration — Oxc transformer, rolldownOptions, and config deltas from Vite 7. Use when upgrading to Vite 8, migrating rollupOptions/esbuild config, or debugging Rolldown/Oxc build differences.
metadata:
  author: Anthony Fu
  version: "2026.1.31"
  source: Generated from https://github.com/vitejs/vite, scripts at https://github.com/antfu/skills
---

# Vite 8 / Rolldown

> Novel deltas only. Core Vite CLI, `defineConfig`, plugins, and HMR are assumed known — do not restate them here.

Vite 8 replaces esbuild + Rollup with **Rolldown** (bundler) and **Oxc** (transformer).

## Preferences

- Use TypeScript: prefer `vite.config.ts`
- Always use ESM, avoid CommonJS

## Rolldown migration

| Topic | Description | Reference |
|-------|-------------|-----------|
| Rolldown Migration | Vite 8 changes: Rolldown bundler, Oxc transformer, config migration | [rolldown-migration](references/rolldown-migration.md) |

## Quick deltas

| Before (Vite 7) | After (Vite 8) |
|-----------------|----------------|
| `build.rollupOptions` | `build.rolldownOptions` |
| `esbuild` option | `oxc` option |
| esbuild dep pre-bundle / Rollup production | Rolldown for both |

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rolldownOptions: {
      external: ['vue'],
      output: { globals: { vue: 'Vue' } },
    },
  },
  oxc: {
    jsx: { runtime: 'automatic' },
  },
})
```

For gradual migration, test with `rolldown-vite` before upgrading to `vite@8`. Full steps and edge cases: [rolldown-migration](references/rolldown-migration.md).
