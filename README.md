# Skills

A collection of agent skills which I use for software development with AI coding tools. 

## Available Skills

### [caveman](./caveman/SKILL.md)
Ultra-compressed communication mode that cuts token usage ~75% by speaking like a caveman while preserving full technical accuracy. Supports multiple intensity levels: `lite`, `full` (default), `ultra`, `wenyan-lite`, `wenyan-full`, `wenyan-ultra`.

**Trigger:** `/caveman`, "caveman mode", "talk like caveman", "less tokens", "be brief"

---

### [jira-ticket-creation](./jira-ticket-creation/SKILL.md)
Creates structured JIRA tickets from code analysis. Performs a gap analysis before drafting, surfaces ambiguous requirements, and requires explicit confirmation before creating or updating tickets.

**Trigger:** "create a JIRA ticket", "draft a story", "log this as a bug", "write up a task", "open a ticket"

---

### [linear-issue-creation](./linear-issue-creation/SKILL.md)
Creates structured Linear issues from code analysis. Performs a gap analysis before drafting, surfaces ambiguous requirements, and requires explicit confirmation before creating or updating issues. Supports Linear-specific fields: Team, Project, Priority, Status, Cycle, Assignee, Estimate, Labels, and Parent (sub-issues).

**Trigger:** "create a Linear issue", "open a Linear issue", "log this in Linear", "write up an issue for this"

---

### [nestjs-backend](./nestjs-backend/SKILL.md)
Scaffolds and extends NestJS backends — REST and GraphQL. Detects the existing stack (HTTP adapter, ORM, logger, validation, DI style, auth, tests) before generating any code. Supports new and existing projects.

- **REST:** Express or Fastify, Drizzle/Prisma/TypeORM, Zod or class-validator, controllers/services/repositories/modules/pipes/transactions. Swagger UI always mounted at `/api/spec`.
- **GraphQL:** Always Fastify + Mercurius (code-first or schema-first), resolvers/object types/input types. GraphiQL always enabled.
- New standalone projects always use **pnpm**; monorepo projects match the repo's existing package manager.
- Health check endpoint always scaffolded for new projects.
- TypeScript path aliases (`@/*` → `src/*`) always configured; all generated imports use `@/` — never relative paths.
- Default port **9000** (`process.env.PORT ?? 9000`).

**Trigger:** NestJS backend work — new projects (REST or GraphQL), adding resources, extending existing APIs

---

### [react-scaffolding](./react-scaffolding/SKILL.md)
Scaffolds a production-ready React + TypeScript project using Vite and TanStack Start. Prompts for styling library (Tailwind CSS + HeadlessUI or Mantine) and API type (REST or GraphQL), then wires up the full stack: TanStack Query, TanStack Router, Jotai, Vitest + Testing Library, Playwright E2E, and ESLint with type-aware rules. All steps are executed directly — no narration unless a decision is needed.

- **REST:** Axios (`!=1.14.0` — compromised version excluded) with typed `get/post/put/patch/del` generic methods.
- **GraphQL:** `graphql-request` with a typed `request<TData, TVariables>` wrapper over `GraphQLClient`.
- Per-module path aliases (`@lib/*`, `@store/*`, `@routes/*`, etc.) with ESLint `no-restricted-imports` rule banning `../` cross-module imports.
- New standalone projects always use **pnpm**; monorepo projects match the repo's existing package manager.

**Trigger:** "new React project", "scaffold a web app", "spin up a React app", "new frontend project", mentions of Vite, TanStack, or any bundled library

---

### [npm-supply-chain-audit](./npm-supply-chain-audit/SKILL.md)
Audits npm/pnpm/yarn projects against a known-bad package database. Detects compromised versions, banned packages, and malicious files in `node_modules`. Currently tracks:
- **Axios RAT** (Mar 31, 2026) — CRITICAL: hijacked maintainer drops cross-platform RAT via `plain-crypto-js`
- **Shai-Hulud v1/v2** (Sep + Nov 2025) — CRITICAL: self-replicating worm that compromised 800+ packages

**Trigger:** "npm security", "supply chain audit", "check for compromised packages", mentions of Shai-Hulud or axios compromise

---

### [turbo-monorepo-scaffold](./turbo-monorepo-scaffold/SKILL.md)
Scaffolds production-ready pnpm + Turborepo monorepos from scratch. Parallel-first pipeline topology — everything runs in parallel by default; serialization is added only when observed run timings prove a data dependency. Includes an adaptive learning loop that watches real `turbo run` timings and automatically tightens the pipeline config over time via `turbo-learn.json`.

- Asks one upfront question: what languages/frameworks the monorepo will contain (TypeScript libs, Next.js apps, Go services, Python workers, etc.)
- Scaffolds root structure (`apps/`, `packages/`, `libs/`), `pnpm-workspace.yaml`, `turbo.json`, and per-language package templates.
- Always uses **pnpm** as the package manager.
- `cache: false` on all turbo tasks — turbo caching is intentionally disabled.

**Trigger:** "start a new monorepo", "set up workspaces", "scaffold a package", "new turbo project", mentions of Turborepo or pnpm workspaces

---

### [brainstorming](./brainstorming/SKILL.md)
Turns a feature idea into an approved design spec before any code is written. Explores project context, asks targeted clarifying questions (one per message), proposes 2–3 approaches with trade-offs, writes a spec to `docs/plans/`, dispatches a reviewer subagent, and hard-gates on explicit user approval before allowing any plan or implementation to proceed.

**Trigger:** "build X", "implement X", "add a feature for X", "let's design X", "brainstorm X", any feature request without an existing approved spec

---

### [writing-plans](./writing-plans/SKILL.md)
Decomposes an approved design spec into a granular, executable implementation plan. Maps file architecture, breaks work into 2–5 minute TDD tasks (red → green → commit) with complete code and exact file paths, self-reviews for placeholder anti-patterns, dispatches a plan reviewer subagent, and hard-gates on reviewer approval before any execution begins.

**Trigger:** "write a plan for X", "create an implementation plan", "plan this out", or invoked automatically after brainstorming approval

---

### [executing-plans](./executing-plans/SKILL.md)
Implements a pre-written plan sequentially with verification checkpoints at each step. Loads the plan, raises questions before starting, follows steps exactly, verifies each step against expected output, and stops immediately on blockers. Recommend `subagent-driven-development` when subagents are available.

**Trigger:** "execute the plan", "implement the plan", "run through the plan", "start on the plan"

---

### [subagent-driven-development](./subagent-driven-development/SKILL.md)
Executes an approved implementation plan by dispatching a fresh subagent per task with isolated context. Runs a mandatory two-stage review (spec compliance then code quality) after each task, fixes and resubmits on issues, and finishes with a final code review across the full diff.

**Trigger:** "implement with subagents", "execute plan using subagents", "run the plan with fresh agents", or invoked by `writing-plans` after plan approval

---

### [dispatching-parallel-agents](./dispatching-parallel-agents/SKILL.md)
Decomposes multi-problem scenarios into independent work streams and dispatches specialized subagents concurrently. Each agent gets a focused, self-contained prompt. After all agents return, reviews summaries, checks for conflicts, and runs the full test suite to verify integration.

**Trigger:** "fix these failures in parallel", "investigate independently", multiple unrelated test failures across different files or subsystems

---

### [using-git-worktrees](./using-git-worktrees/SKILL.md)
Sets up an isolated git workspace for feature work. Detects existing isolation first, prefers native `EnterWorktree` over manual git commands, auto-runs project setup (`npm install`, `cargo build`, etc.), and verifies a clean test baseline before handing off.

**Trigger:** "set up isolated workspace", "create a worktree", "isolate this work", or invoked before executing a plan
