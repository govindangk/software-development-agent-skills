---
name: turbo-monorepo-scaffold
description: >
  Scaffold new pnpm workspace + Turborepo monorepos from scratch, with an
  adaptive learning loop that optimizes the turbo pipeline task order based on
  observed run timings. Use this skill whenever a user wants to create a new
  monorepo, set up pnpm workspaces, configure turbo, scaffold packages or apps
  in a new repo, or asks about monorepo structure with turbo/pnpm. Also trigger
  when a user says "start a new monorepo", "set up workspaces", "scaffold a
  package", "new turbo project", or similar — even if the exact words "turbo"
  or "pnpm" aren't used.
---

# turbo-monorepo-scaffold

Scaffold production-ready pnpm + Turborepo monorepos. Parallel-first pipeline
topology. Adaptive learning loop that watches real turbo run timings and
tightens the pipeline config over time.

---

## Workflow overview

```
1. Ask → languages & frameworks needed
2. Scaffold → root + workspace dirs + package templates
3. Generate → turbo.json (parallel-first) + turbo-learn.json (state)
4. Advise → how to run & trigger the learning loop
```

---

## Step 1 — Elicit languages & frameworks

Ask the user ONE question before writing any files:

> "What languages or frameworks will this monorepo contain?
> (e.g. TypeScript libs, Next.js apps, Go services, Python workers — list them all)"

Parse the response and map each to a template. See `references/templates.md`
for per-language scaffolding details. Always scaffold a **root `deno.json`**
with workspace config before any packages — it is the shared TypeScript
compiler config for all Deno packages in the repo.

---

## Step 2 — Scaffold root structure

```
<root>/
├── apps/               # Deployable end products
├── packages/           # Shared internal libs
├── libs/               # Lower-level utilities / non-TS code
├── pnpm-workspace.yaml
├── package.json        # Root — private: true, no src
├── deno.json           # Workspace config + shared TS compiler options
├── turbo.json
├── turbo-learn.json    # Learning loop state (tracked in git)
└── .gitignore
```

### Root `package.json`

```json
{
  "name": "<repo-name>",
  "private": true,
  "scripts": {
    "build":  "turbo run build",
    "test":   "turbo run test",
    "lint":   "turbo run lint",
    "dev":    "turbo run dev --parallel",
    "clean":  "turbo run clean"
  },
  "devDependencies": {
    "turbo": "latest"
  },
  "packageManager": "pnpm@latest"
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "libs/*"
```

---

## Step 3 — Turbo pipeline (parallel-first)

**Core principle**: everything runs in parallel by default. Serialize only when
there is an explicit data dependency (one task's output is another's input).

Generate `turbo.json` from the resolved task graph. Read `references/turbo-pipeline.md`
for topology rules and edge cases before writing the config.

### Starter template

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "cache": false
    },
    "test": {
      "dependsOn": [],
      "outputs": [],
      "cache": false
    },
    "lint": {
      "dependsOn": [],
      "outputs": [],
      "cache": false
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

**Key rules:**
- `"cache": false` on every task — turbo caching is never used
- `test` and `lint` get `dependsOn: []` → fully parallel, no cross-package wait
- `build` uses `^build` → waits only for upstream package builds (DAG edges)
- Non-TS tasks (Go, Python) get their own pipeline entries — see `references/templates.md`
- Never add serial dependencies speculatively; the learning loop will add them if timings reveal conflicts

---

## Step 4 — Initialize learning loop state

Create `turbo-learn.json` next to `turbo.json`:

```json
{
  "schema_version": 1,
  "runs": [],
  "pipeline_overrides": {},
  "conflict_candidates": {}
}
```

See `references/learning-loop.md` for the full schema and update algorithm.

---

## Step 5 — Package scaffolding

For each requested language/framework, scaffold one or more packages under the
appropriate workspace dir. Read `references/templates.md` for the template for
each type.

**Naming conventions:**
- `packages/<name>` — shared TS lib
- `apps/<name>` — deployable app
- `libs/<name>` — low-level utility or non-TS service

Every package, regardless of language, gets:
- A `package.json` with a `build` script wired to turbo
- A `turbo` field or separate `turbo.json` if the task graph differs from root

---

## Step 6 — Post-scaffold instructions

Tell the user:

1. `pnpm install` to link workspaces
2. `pnpm build` for a first run
3. How the learning loop works (see below)
4. Point them at `references/learning-loop.md` for manual tuning

---

## Learning loop

The loop runs **after each `turbo run`**. It is passive — no extra tooling
required. The agent (or user) pastes or pipes turbo's JSON output, and the
skill updates `turbo-learn.json` and potentially rewrites `turbo.json`.

### Trigger

```bash
# Generate turbo timing data
turbo run build test lint --output-logs=json 2>&1 | tee .turbo/last-run.json
```

When the user shares this output (or the file), run the learning update:

1. Parse timing per task per package from the JSON
2. Append a `run` entry to `turbo-learn.json`
3. Check conflict heuristics (see `references/learning-loop.md`)
4. If a new serialization edge is warranted, update both `turbo-learn.json`
   (`pipeline_overrides`) **and** `turbo.json`
5. Report what changed and why

### Serialization threshold

Serialize a task pair `(A → B)` only when:
- A consistently finishes _after_ B starts (observed in ≥ 3 runs), **and**
- The overlap causes cache misses or test flakiness

Otherwise keep parallel.

---

## Reference files

| File | When to read |
|------|-------------|
| `references/turbo-pipeline.md` | Before writing or modifying `turbo.json` |
| `references/templates.md` | When scaffolding any package type |
| `references/learning-loop.md` | When processing turbo run output or modifying `turbo-learn.json` |

---

## Quick examples

**"New monorepo with a Next.js app and two shared TS packages"**
→ Scaffold `apps/web` (Next.js), `packages/ui`, `packages/utils`, `packages/tsconfig`
→ `build` pipeline with `^build`; `test`/`lint` fully parallel

**"Add a Go microservice to an existing repo"**
→ Add `libs/go-svc/`, wire a `build` script via `turbo.json` entry using `go build`
→ No TS tooling needed for this package; still tracked in turbo pipeline

**"The test task keeps getting cache misses after build changes"**
→ Learning loop: add `"test": { "dependsOn": ["build"] }` override for the
   affected package, record in `pipeline_overrides`
