# react-scaffolding

Scaffolds a production-ready React + TypeScript project using Vite and TanStack Start. Wires up the full stack automatically — no manual configuration needed.

## Trigger

Use any of: "new React project", "scaffold a web app", "spin up a React app", "new frontend project", mentions of Vite, TanStack, or any of the bundled libraries.

## What gets scaffolded

| Layer | Technology |
|---|---|
| Framework | React + TypeScript via TanStack Start (Vite-based) |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query + devtools |
| State | Jotai + devtools |
| Styling | Tailwind CSS + HeadlessUI **or** Mantine (your choice) |
| HTTP (REST) | Axios `!=1.14.0` with typed `get/post/put/patch/del` wrappers |
| HTTP (GraphQL) | `graphql-request` with a typed `request<TData, TVariables>` wrapper |
| Unit tests | Vitest + Testing Library (jsdom, no snapshots) |
| E2E tests | Playwright (chromium, smoke test included) |
| Linting | ESLint with typescript-eslint, react-hooks, jsx-a11y, import ordering |
| Path aliases | Per-module (`@lib/*`, `@store/*`, `@routes/*`, etc.) enforced by ESLint |

## Choices prompted before scaffolding

1. **Styling library** — Tailwind CSS + HeadlessUI or Mantine
2. **API type** — REST or GraphQL

Both questions are asked in a single message. Nothing is generated until both are answered.

## Package manager

- Standalone new projects: **pnpm**
- Monorepo projects: matches the repo's existing package manager

## Path alias rules

All cross-module imports must use an alias (`@lib/http`, `@store/example`, etc.). Relative paths that cross directory boundaries (`../`) are banned by ESLint. Sibling imports (`./utils`) are allowed.

## Security note

Axios `1.14.0` is excluded from installation — it is the Axios RAT compromised version (Mar 2026). The install command uses `"axios@!=1.14.0"` to pin away from it.

## Verification

All five checks must pass before handoff:

```bash
pnpm dev        # dev server
pnpm test:run   # unit tests
pnpm e2e        # playwright
pnpm lint       # eslint
pnpm build      # production build
```
