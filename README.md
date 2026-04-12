# Skills

A collection of Claude Code skills for common development tasks.

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
