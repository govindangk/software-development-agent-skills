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

### [nestjs-backend](./nestjs-backend/SKILL.md)
Scaffolds and extends NestJS backends — REST and GraphQL. Detects the existing stack (HTTP adapter, ORM, logger, validation, DI style, auth, tests) before generating any code. Supports new and existing projects.

- **REST:** Express or Fastify, Drizzle/Prisma/TypeORM, Zod or class-validator, controllers/services/repositories/modules/pipes/transactions. Swagger UI always mounted at `/api/spec`.
- **GraphQL:** Always Fastify + Mercurius (code-first or schema-first), resolvers/object types/input types. GraphiQL always enabled.
- New standalone projects always use **pnpm**; monorepo projects match the repo's existing package manager.
- Health check endpoint always scaffolded for new projects.

**Trigger:** NestJS backend work — new projects (REST or GraphQL), adding resources, extending existing APIs

---

### [npm-supply-chain-audit](./npm-supply-chain-audit/SKILL.md)
Audits npm/pnpm/yarn projects against a known-bad package database. Detects compromised versions, banned packages, and malicious files in `node_modules`. Currently tracks:
- **Axios RAT** (Mar 31, 2026) — CRITICAL: hijacked maintainer drops cross-platform RAT via `plain-crypto-js`
- **Shai-Hulud v1/v2** (Sep + Nov 2025) — CRITICAL: self-replicating worm that compromised 800+ packages

**Trigger:** "npm security", "supply chain audit", "check for compromised packages", mentions of Shai-Hulud or axios compromise
