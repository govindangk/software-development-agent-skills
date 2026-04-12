# nestjs-backend

Scaffolds and extends NestJS backends — REST and GraphQL. Reads the existing stack before touching anything, and asks for explicit confirmation before generating code.

## Trigger

NestJS backend work: new projects (REST or GraphQL), adding resources, extending existing APIs.

## What gets scaffolded

### REST

| Layer | Options |
|---|---|
| HTTP adapter | Express (`@nestjs/platform-express`) or Fastify (`@nestjs/platform-fastify`) |
| ORM | Drizzle, Prisma, TypeORM, MikroORM, raw `pg`/`postgres.js` |
| Logger | Pino (`nestjs-pino`), Winston, NestJS built-in, custom, or none |
| Validation | Zod (`safeParse` at controller boundary) or `class-validator` + `ValidationPipe` |
| DI style | String tokens (`@Inject('db')`) or class-based |
| Response envelope | `{ data, total }`, `{ items, pagination }`, bare array, or custom |
| Auth/guards | None, JWT guard, API key, or per-endpoint opt-in |
| Tests | Jest unit tests for service + controller (optional) |

### GraphQL

Always uses **Fastify + Mercurius** (code-first or schema-first). GraphiQL always enabled.

## Conventions (always applied)

- **Default port:** `process.env.PORT ?? 9000`
- **Swagger UI** mounted at `/api/spec` for all REST projects
- **Health check endpoint** always scaffolded for new projects
- **TypeScript path aliases** (`@/*` → `src/*`) always configured — all generated imports use `@/`, never relative paths
- **Package manager:** pnpm for standalone projects; matches existing manager for monorepos

## Process

1. Ask whether it's a new or existing project and which API style (one message).
2. For new REST projects: ask all 8 stack axes in one message — no defaults assumed.
3. For existing projects: read the codebase and infer the stack before generating anything.
4. Present a confirmation block summarizing the plan before writing any files.

## Resources generated per module

Controllers, services, repositories, modules, DTOs/schemas, pipes, and transaction wrappers — all following the detected stack conventions.
