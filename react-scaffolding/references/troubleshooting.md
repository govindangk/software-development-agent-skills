# Troubleshooting — React + Vite + TanStack Start

## `create tanstack-app` fails or template not found

TanStack Start is under active development. If the template flag fails:

```bash
# fallback: use the TanStack Router starter directly
pnpm create vite@latest $PROJECT_NAME --template react-ts
cd $PROJECT_NAME
pnpm add @tanstack/react-router @tanstack/router-vite-plugin @tanstack/start
```

Then manually configure `vite.config.ts`:
```ts
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
})
```

## Vitest globals not recognized in TypeScript

Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

## `@testing-library/jest-dom` matchers not found

Ensure `setupFiles` in vite.config points to `src/test/setup.ts` and that file imports `@testing-library/jest-dom`. If still failing:
```bash
pnpm add -D @types/testing-library__jest-dom
```

## Playwright can't find browser binaries

```bash
npx playwright install chromium
```

In CI, use:
```bash
npx playwright install --with-deps chromium
```

## Tailwind v4 — classes not applying

Tailwind v4 uses `@import "tailwindcss"` (not `@tailwind base/components/utilities`). Confirm:
1. `src/index.css` has `@import "tailwindcss"`
2. `vite.config.ts` includes the `tailwindcss()` Vite plugin
3. `src/main.tsx` imports `./index.css`

No `tailwind.config.ts` is required for v4.

## Mantine styles not loading

```tsx
// Must be imported before component styles
import '@mantine/core/styles.css'
```

## Jotai atoms not updating across components

Jotai atoms are global by default when imported from a shared module. If you need component-local atoms, use `atomWithReducer` or scope via `Provider`:

```tsx
import { createStore, Provider } from 'jotai'

const store = createStore()
<Provider store={store}><YourComponent /></Provider>
```

## TanStack Query devtools not showing in prod build

ReactQueryDevtools renders only when `process.env.NODE_ENV !== 'production'` by default. If you explicitly need to suppress:

```tsx
{import.meta.env.DEV && <ReactQueryDevtools />}
```

## Port conflict on Playwright webServer

Change `baseURL` and `webServer.url` in `playwright.config.ts` to match your dev server port. TanStack Start defaults to `3000`; Vite standalone defaults to `5173`.
