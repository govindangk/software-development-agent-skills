---
name: react-vite-tanstack
description: >
  Scaffold a production-ready React + TypeScript project using Vite and TanStack Start.
  Use this skill whenever the user asks to create, initialize, bootstrap, or set up a new
  React project, frontend project, or web app — especially when they mention Vite, TanStack,
  TypeScript, or any of the bundled libraries (TanStack Query, Jotai, Vitest, Playwright).
  Also trigger when a user says things like "spin up a React app", "new frontend project",
  "scaffold a web app", or "set up a project with Vite". Always use this skill before writing
  any React/TypeScript code in a new project context.
---

# React + Vite + TanStack Start Scaffold Skill

Scaffold a modern, production-grade React + TypeScript project. This skill is for **agents** — execute the steps directly, don't narrate them unless something needs a decision.

---

## Step 0 — Gather inputs

Before running anything, resolve these variables:

| Variable | Source |
|---|---|
| `PROJECT_NAME` | From user prompt or ask if missing |
| `STYLE_LIB` | Present user with options (see below) |
| `API_TYPE` | Present user with options (see below) |
| `PROJECT_DIR` | CWD or explicitly stated path |
| `IS_MONOREPO` | Check for a root `package.json` with `workspaces` or a `pnpm-workspace.yaml` above `PROJECT_DIR` |

**Package manager:** For standalone new projects use **pnpm**. If `IS_MONOREPO` is true, read the root workspace config and use whatever package manager is already in use.

Ask both questions in a single message before proceeding:

### Styling choice

```
question: "Which styling library would you like to use?"
options:
  - "Tailwind CSS + HeadlessUI"
  - "Mantine"
```

### API type

```
question: "How will this app communicate with its backend?"
options:
  - "REST"
  - "GraphQL"
```

Wait for both responses, set `STYLE_LIB` and `API_TYPE` accordingly, then continue.

---

## Step 1 — Bootstrap with TanStack Start

```bash
pnpm create tanstack-app@latest $PROJECT_NAME \
  --template react-typescript \
  --package-manager pnpm

cd $PROJECT_NAME
```

> TanStack Start ships with Vite under the hood. Do not eject or override `vite.config.ts` unless the user explicitly asks.

---

## Step 2 — Install core dependencies

```bash
# State & data fetching
pnpm add @tanstack/react-query jotai

# Dev tools (dev only)
pnpm add -D @tanstack/react-query-devtools @tanstack/router-devtools jotai-devtools

# HTTP client — REST only
# ⚠️  1.14.0 is a known-compromised version (Axios RAT, Mar 2026) — never install it
pnpm add "axios@!=1.14.0"

# HTTP client — GraphQL only
pnpm add graphql graphql-request

# Testing
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom

# E2E
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps
```

Then install the styling lib — see [Styling](#styling).

---

## Step 3 — Styling

### If STYLE_LIB = Tailwind + HeadlessUI

```bash
pnpm add -D tailwindcss @tailwindcss/vite
pnpm add @headlessui/react
```

Add to `vite.config.ts`:
```ts
import tailwindcss from '@tailwindcss/vite'

// inside plugins: []
tailwindcss(),
```

Create `src/index.css`:
```css
@import "tailwindcss";
```

Import in `src/main.tsx`:
```ts
import './index.css'
```

### If STYLE_LIB = Mantine

```bash
pnpm add @mantine/core @mantine/hooks @mantine/form @mantine/notifications
pnpm add -D postcss postcss-preset-mantine postcss-simple-vars
```

Wrap root in `src/main.tsx`:
```tsx
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'

// wrap <App /> with <MantineProvider>
```

Create `postcss.config.cjs`:
```js
module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': { variables: { 'mantine-breakpoint-xs': '36em', /* etc */ } },
  },
}
```

---

## Step 4 — Configure Vitest

Add to `vite.config.ts`:

```ts
/// <reference types="vitest" />

export default defineConfig({
  // ...existing config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
})
```

Create `src/test/setup.ts`:
```ts
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"
```

> No snapshot tests. Unit/integration tests only, BDD via Playwright.

---

## Step 5 — Configure Playwright

```bash
pnpm exec playwright codegen  # skip if not needed
```

Create `playwright.config.ts` at root:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

Add to `package.json` scripts:
```json
"e2e": "playwright test",
"e2e:ui": "playwright test --ui",
"e2e:report": "playwright show-report"
```

Create `e2e/` directory with a smoke test:

```ts
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test'

test('app loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.*/)
})
```

---

## Step 6 — Wire up TanStack Query

Create `src/lib/query-client.ts`:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})
```

In `src/routes/__root.tsx`:

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { queryClient } from '../lib/query-client'

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools initialIsOpen={false} />
          <TanStackRouterDevtools position="bottom-right" />
        </>
      )}
    </QueryClientProvider>
  ),
})
```

---

## Step 7 — Jotai setup

No global provider needed for basic usage. For devtools or SSR:

```tsx
import { DevTools } from 'jotai-devtools'
// add <DevTools /> inside your root component (dev only)
```

Create `src/store/` directory for atom definitions:

```ts
// src/store/example.ts
import { atom } from 'jotai'

export const exampleAtom = atom<string>('')
```

---

## Step 8 — HTTP client setup

### If API_TYPE = REST

Create `src/lib/http.ts`:

```ts
import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export function get<TResponse>(
  url: string,
  params?: Record<string, unknown>,
): Promise<TResponse> {
  return instance.get<TResponse>(url, { params }).then(r => r.data)
}

export function post<TRequest, TResponse>(
  url: string,
  data: TRequest,
): Promise<TResponse> {
  return instance.post<TResponse>(url, data).then(r => r.data)
}

export function put<TRequest, TResponse>(
  url: string,
  data: TRequest,
): Promise<TResponse> {
  return instance.put<TResponse>(url, data).then(r => r.data)
}

export function patch<TRequest, TResponse>(
  url: string,
  data: TRequest,
): Promise<TResponse> {
  return instance.patch<TResponse>(url, data).then(r => r.data)
}

export function del<TResponse>(url: string): Promise<TResponse> {
  return instance.delete<TResponse>(url).then(r => r.data)
}

export default instance
```

Usage with TanStack Query:

```ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { get, post } from '@/lib/http'
import type { Widget } from '@/types/widget'
import type { CreateWidgetRequest } from '@/types/widget'

export function useWidgets() {
  return useQuery({
    queryKey: ['widgets'],
    queryFn: () => get<Widget[]>('/widgets'),
  })
}

export function useCreateWidget() {
  return useMutation({
    mutationFn: (data: CreateWidgetRequest) =>
      post<CreateWidgetRequest, Widget>('/widgets', data),
  })
}
```

---

### If API_TYPE = GraphQL

Create `src/lib/gql.ts`:

```ts
import { GraphQLClient } from 'graphql-request'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import type { Variables } from 'graphql-request'

const client = new GraphQLClient(import.meta.env.VITE_GRAPHQL_URL, {
  headers: { 'Content-Type': 'application/json' },
})

export function request<TData, TVariables extends Variables = Variables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
): Promise<TData> {
  return client.request(document, variables)
}

export default client
```

Usage with TanStack Query:

```ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { request } from '@/lib/gql'
import { GetWidgetsDocument, CreateWidgetDocument } from '@/gql/generated'
import type { CreateWidgetInput } from '@/gql/generated'

export function useWidgets() {
  return useQuery({
    queryKey: ['widgets'],
    queryFn: () => request(GetWidgetsDocument),
  })
}

export function useCreateWidget() {
  return useMutation({
    mutationFn: (input: CreateWidgetInput) =>
      request(CreateWidgetDocument, { input }),
  })
}
```

> `TypedDocumentNode` types are generated from your GraphQL schema using a codegen tool (e.g. `@graphql-codegen/cli`). The `request()` wrapper is type-safe end-to-end — no casting needed.

---

## Step 9 — ESLint configuration

### Install

```bash
# Always install
pnpm add -D eslint typescript-eslint \
  @eslint/js \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh \
  eslint-plugin-jsx-a11y \
  eslint-plugin-import eslint-import-resolver-typescript

# Only when STYLE_LIB = Tailwind + HeadlessUI
pnpm add -D eslint-plugin-tailwindcss
```

### `eslint.config.ts`

```ts
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import tailwind from 'eslint-plugin-tailwindcss'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.tanstack'] },

  // Base JS + TS recommended
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/prop-types': 'off',
    },
  },

  // Accessibility
  {
    plugins: { 'jsx-a11y': jsxA11y },
    rules: jsxA11y.configs.recommended.rules,
  },

  // Import ordering
  {
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },

  // Tailwind class sorting — only when STYLE_LIB = Tailwind + HeadlessUI
  // Remove this block if using Mantine
  ...tailwind.configs['flat/recommended'],

  // Strict overrides
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
    },
  },
)
```

> **Tailwind note**: if `STYLE_LIB = Mantine`, omit the `eslint-plugin-tailwindcss` install and remove the `...tailwind.configs['flat/recommended']` spread.

### Add scripts to `package.json`

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

---

## Step 10 — Path aliases

### `tsconfig.json`

Add `baseUrl` and `paths` inside `compilerOptions`. Define one alias per top-level module directory:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*":            ["src/*"],
      "@lib/*":         ["src/lib/*"],
      "@store/*":       ["src/store/*"],
      "@routes/*":      ["src/routes/*"],
      "@components/*":  ["src/components/*"],
      "@hooks/*":       ["src/hooks/*"],
      "@types/*":       ["src/types/*"]
    }
  }
}
```

Add a new module directory to `paths` whenever a new top-level folder is created under `src/`.

### Vite

Install runtime resolution support:

```bash
pnpm add -D vite-tsconfig-paths
```

Add to `vite.config.ts`:

```ts
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    // ...existing plugins
    tsconfigPaths(),
  ],
})
```

### ESLint enforcement

Add a `no-restricted-imports` block to `eslint.config.ts` to ban `../` imports that cross module boundaries:

```ts
// Path alias enforcement
{
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../*'],
            message: 'Use a module alias (@lib, @store, @components, etc.) instead of a relative path that crosses module boundaries.',
          },
        ],
      },
    ],
  },
},
```

Sibling imports within the same directory (`./foo`) are allowed. Any import that would require going up a directory (`../`) must use an alias instead.

### Rules

| Situation | Correct | Wrong |
|---|---|---|
| Importing from another module | `import { x } from '@lib/http'` | `import { x } from '../../lib/http'` |
| Importing a sibling file | `import { x } from './utils'` | — (allowed as-is) |
| Importing a type | `import type { Widget } from '@types/widget'` | `import type { Widget } from '../types/widget'` |

---

## Step 11 — Final structure check

Expected layout after scaffold:

```
$PROJECT_NAME/
├── e2e/
│   └── smoke.spec.ts
├── src/
│   ├── lib/
│   │   ├── query-client.ts
│   │   ├── http.ts           # REST only — typed Axios methods
│   │   └── gql.ts            # GraphQL only — typed graphql-request wrapper
│   ├── routes/               # TanStack Start file-based routing
│   ├── store/                # Jotai atoms
│   ├── test/
│   │   └── setup.ts
│   └── main.tsx
├── eslint.config.ts
├── playwright.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Step 12 — Verify

```bash
pnpm dev          # dev server
pnpm test:run     # unit tests
pnpm e2e          # playwright
pnpm lint         # eslint
pnpm build        # production build
```

All five must exit cleanly before handing off to the user.
