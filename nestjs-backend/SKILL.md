# NestJS Backend Skill

## Step 1 — Gather Project Context (Always Run First)

Do **not** generate any code before completing this step.

### Step 0 — Ask project type

Ask these two questions first (one message):

```
1. Is this a new project or an existing one?
   A) New project — I'll ask about your preferred stack and scaffold from scratch.
   B) Existing project — I'll read your codebase and infer the stack before touching anything.

2. What API style?
   A) REST
   B) GraphQL
```

Then follow the matching path below. **GraphQL projects always use Fastify + Mercurius** — do not ask about the HTTP adapter separately for GraphQL.

---

### Path A — New project (REST)

**Package manager:** Before scaffolding, check whether the project is being added to an existing monorepo. If yes, read the root `package.json` or workspace config and use whatever package manager is already in use. If no (standalone new project), always use **pnpm**.

Ask all 8 axes in one message. Do not assume defaults.

```
Before I scaffold this, I need to know your project setup:

1. **HTTP adapter** — which platform is NestJS running on?
   - Express (default — `@nestjs/platform-express`)
   - Fastify (`@nestjs/platform-fastify`)

2. **Database / ORM**
   - Drizzle ORM (sql`` tagged templates)
   - Prisma (prisma client)
   - TypeORM (repository pattern / query builder)
   - MikroORM
   - Raw `pg` / `postgres.js`
   - Other (describe)

3. **Logger**
   - Pino (via `pino` or `nestjs-pino`)
   - Winston
   - NestJS built-in `Logger`
   - Custom (describe the injection token or class)
   - None

4. **Validation**
   - Zod (`safeParse` at the controller boundary)
   - `class-validator` + `class-transformer` + `ValidationPipe`
   - Manual / other

5. **Injection style**
   - String tokens (`@Inject('db')`, `@Inject('logger')`)
   - Class-based (`@InjectRepository(Entity)`, direct class injection)
   - Mixed

6. **Response envelope** — how should list endpoints return data?
   - `{ data: T[], total: number }`
   - `{ items: T[], pagination: { page, limit, total } }`
   - Bare array `T[]`
   - Other (describe)

7. **Auth / guards** — do routes need authentication?
   - None / open routes
   - JWT guard — `@UseGuards(JwtAuthGuard)` on controller class
   - API key or custom guard (describe the decorator / token)
   - Per-endpoint opt-in (no class-level guard)

8. **Tests** — should test files be scaffolded?
   - Yes — Jest unit tests for service + controller
   - No
```

After receiving answers, go to the **Confirmation block** below.

> **Always included for new REST projects:** a `/health` endpoint is scaffolded as part of every new project setup — no need to ask. See the Health Check template in Patterns & Templates.

> **Always included for new REST projects:** Swagger UI is configured and mounted at `/api/spec` — no need to ask. See the Swagger Setup template in Patterns & Templates.

> **Always included for new REST projects:** TypeScript path aliases are configured (`@/*` → `src/*`) — no need to ask. See the Path Aliases template in Patterns & Templates.

---

### Path A — New project (GraphQL)

**Package manager:** Before scaffolding, check whether the project is being added to an existing monorepo. If yes, read the root `package.json` or workspace config and use whatever package manager is already in use. If no (standalone new project), always use **pnpm**.

**HTTP adapter and GraphQL driver are fixed: Fastify + Mercurius. Do not ask about these.**

Ask the remaining 6 axes in one message:

```
Before I scaffold this, I need to know your project setup:

1. **Database / ORM**
   - Drizzle ORM (sql`` tagged templates)
   - Prisma (prisma client)
   - TypeORM (repository pattern / query builder)
   - MikroORM
   - Raw `pg` / `postgres.js`
   - Other (describe)

2. **Logger**
   - Pino (via `pino` or `nestjs-pino`)
   - Winston
   - NestJS built-in `Logger`
   - Custom (describe the injection token or class)
   - None

3. **Injection style**
   - String tokens (`@Inject('db')`, `@Inject('logger')`)
   - Class-based (direct class injection)
   - Mixed

4. **Schema style**
   - Code-first (`@ObjectType()`, `@Resolver()`, `@Field()` decorators — schema generated from TypeScript)
   - Schema-first (`.graphql` SDL file, NestJS generates resolver stubs)

5. **Auth / guards** — do resolvers need authentication?
   - None / open resolvers
   - JWT guard — `@UseGuards(GqlAuthGuard)` on resolver class
   - API key or custom guard (describe)
   - Per-resolver opt-in

6. **Tests** — should test files be scaffolded?
   - Yes — Jest unit tests for service + resolver
   - No
```

After receiving answers, go to the **Confirmation block** below.

> **Always included for new GraphQL projects:** a `/health` REST endpoint is scaffolded alongside the GraphQL API — no need to ask. See the Health Check template in Patterns & Templates.

> **Always included for new GraphQL projects:** GraphiQL playground is enabled and accessible at `/graphql` via the Mercurius driver config — no need to ask. See the Mercurius Setup template in Patterns & Templates.

> **Always included for new GraphQL projects:** TypeScript path aliases are configured (`@/*` → `src/*`) — no need to ask. See the Path Aliases template in Patterns & Templates.

---

### Path B — Existing project (read first, ask minimally)

1. **Read the codebase — no assumptions about the stack.**
   Open and read:
   - `src/main.ts` — reveals HTTP adapter (Express vs Fastify) and any global prefix (`app.setGlobalPrefix`)
   - `src/app.module.ts`
   - First match of `src/**/*.controller.ts` — check the `@Controller('...')` path prefix
   - First match of `src/**/*.repository.ts` (look broadly — not just `src/database/`)
   - First match of `src/**/*.service.ts`
   - Check whether any `src/**/*.spec.ts` files exist

2. **Identify the route path convention first — before anything else.**
   Look for:
   - A global prefix set in `main.ts` (e.g. `app.setGlobalPrefix('api')`)
   - The path string inside `@Controller('...')` on existing controllers
   - Any versioning pattern (e.g. `@Controller('api/v1/widgets')`, `app.enableVersioning()`)

   If a consistent path convention is found, record it.
   If absent or unclear, **stop and ask the user immediately** before continuing:

   ```
   What route prefix convention does this project use?
   Examples: `/api`, `/api/v1`, none (controllers use bare paths like `/widgets`)
   ```

   Do not proceed with the rest of the detection until this is answered.

3. **Describe exactly what you see — for every axis, across every library.**
   Quote the actual import, method call, decorator, or pattern found in the code.
   Do not assume, guess, or map observations to a known library unless the import explicitly names it.
   This applies equally to ORM, logger, validation, DI style, response shape, auth, and tests.
   If you cannot determine an axis from the sampled files, mark it ❓ — do not fill in a default.

4. **Print the detection summary** using what the code actually shows:

```
Detected from existing code:
✅ Route prefix: [e.g. "global prefix 'api' set in main.ts — controllers use bare paths"]
✅ HTTP adapter: [e.g. "@nestjs/platform-fastify in package.json, FastifyAdapter in main.ts"]
✅ ORM: [exactly what you observed — e.g. "prisma.user.findMany() calls in repository"]
✅ Validation: [e.g. "class-validator decorators (@IsString, @IsUUID) on DTO classes"]
✅ Logger: [e.g. "constructor-injected NestJS Logger, no custom token"]
✅ DI style: [e.g. "class-based injection — no @Inject() string tokens found"]
✅ Response envelope: [e.g. "{ data: T[], total: number } — seen in ProductService.findAll"]
❓ Auth: unclear — no guards or auth decorators found in sampled files
❓ Tests: unclear — no *.spec.ts files found

→ Please confirm the ❓ items before I proceed.
```

5. Ask **only** about the ❓ axes. If all axes are clear, skip straight to the confirmation block.

6. After receiving answers, go to the **Confirmation block** below.

---

### Confirmation block (both paths)

Emit this summary and wait for the user to confirm before doing anything else:

**REST projects:**

```
Stack confirmed:
- API style: REST
- Route prefix: [value]
- HTTP adapter: [value]
- ORM: [value]
- Validation: [value]
- Logger: [value]
- DI style: [value]
- Response envelope: [value]
- Auth: [value]
- Tests: [value]

Ready to update the skill config and then scaffold. Confirm?
```

**GraphQL projects:**

```
Stack confirmed:
- API style: GraphQL (Fastify + Mercurius)
- Schema style: [code-first / schema-first]
- ORM: [value]
- Logger: [value]
- DI style: [value]
- Auth: [value]
- Tests: [value]

Ready to update the skill config and then scaffold. Confirm?
```

---

### Self-update (runs once, after confirmation)

Once the user confirms, **edit this SKILL.md file** to lock in the project's stack:

1. **Update the Stack Reference table** — replace every `[from gather]` cell:
   - **Path A (new project):** write the confirmed technology name (e.g. `Prisma`, `Zod`, `Pino`)
   - **Path B (existing project):** write the exact pattern observed in the code — quote the actual call, decorator, or import (e.g. `prisma.user.findMany({ where, skip, take })`, `@IsString() / @IsUUID() on DTO classes`, `@Inject('logger') private readonly logger: Logger`). The Notes column is where the pattern lives; the Confirmed Tech column names the library if identifiable, or describes the mechanism if not.

2. **Update the Project Structure diagram** — rewrite the `src/` tree to reflect the actual folder layout:
   - For an existing project (Path B): walk `src/` and map real directories and files
   - For a new project (Path A): draw the target layout based on the confirmed stack
     (e.g. Prisma projects have `prisma/schema.prisma`, not `src/database/schema/`; TypeORM projects co-locate entities differently)
   - Remove or add nodes to match what is or will be real — do not leave template placeholders

3. **Do not change anything else** in this file.

After the self-update is written, proceed to scaffold.

Adapt all generated code to match the confirmed stack. The templates below use **Drizzle + Pino (string tokens) + Zod** as the reference implementation — swap sections based on confirmed choices.

---

## Stack Reference

> Updated by the skill during setup. If all rows still show `[from gather]`, run Step 1 first.

| Layer | Confirmed Tech | Notes |
|---|---|---|
| Framework | NestJS | |
| API style | [from gather] | REST or GraphQL (Fastify + Mercurius) |
| Schema style | [from gather] | GraphQL only — code-first or schema-first |
| Route prefix | [from gather] | REST only |
| HTTP adapter | [from gather] | REST only; GraphQL always Fastify |
| Validation | [from gather] | |
| ORM | [from gather] | |
| Logger | [from gather] | |
| DI tokens | [from gather] | |
| Response envelope | [from gather] | REST only |
| Auth | [from gather] | |
| Tests | [from gather] | |

---

## Project Structure

> Updated by the skill during setup to reflect the actual project layout.

**REST project:**

```
src/
├── app.module.ts                    # Root — imports all domain modules
├── database/
│   ├── database.module.ts           # Global — provides DB client token
│   └── repositories/               # ALL repositories here, not co-located
│       └── <entity>.repository.ts
├── logger/
│   └── logger.service.ts           # Global transient, provides logger token
├── common/
│   └── pipes/                      # Shared validation/transform pipes
└── <domain>/
    ├── <domain>.module.ts
    ├── <domain>.controller.ts
    ├── <domain>.service.ts
    ├── dto/
    │   └── <action>-<domain>.dto.ts
    └── entities/
        └── <domain>.entity.ts
```

**GraphQL project (Fastify + Mercurius, code-first):**

```
src/
├── app.module.ts                    # Root — imports GraphQLModule + domain modules
├── database/
│   ├── database.module.ts           # Global — provides DB client token
│   └── repositories/               # ALL repositories here, not co-located
│       └── <entity>.repository.ts
├── logger/
│   └── logger.service.ts           # Global transient, provides logger token
└── <domain>/
    ├── <domain>.module.ts
    ├── <domain>.resolver.ts         # @Resolver() — thin, delegates to service
    ├── <domain>.service.ts
    ├── models/
    │   └── <domain>.model.ts        # @ObjectType() GraphQL type
    └── dto/
        ├── create-<domain>.input.ts # @InputType() for mutations
        └── update-<domain>.input.ts
```

---

## New Resource Scaffolding Checklist

**REST — when adding a new domain resource, follow this order:**

- [ ] 1. Define Drizzle schema table (or ORM equivalent) in `src/database/schema/`
- [ ] 2. Create entity interface in `<domain>/entities/<domain>.entity.ts`
- [ ] 3. Create DTO schemas in `<domain>/dto/`
- [ ] 4. Create repository in `src/database/repositories/<domain>.repository.ts`
- [ ] 5. Create service in `<domain>/<domain>.service.ts`
- [ ] 6. Create controller in `<domain>/<domain>.controller.ts`
- [ ] 7. Create module in `<domain>/<domain>.module.ts`
- [ ] 8. Register module in `app.module.ts` imports array
- [ ] 9. Evaluate whether new shared pipes are needed → add to `src/common/pipes/`

**GraphQL — when adding a new domain resource, follow this order:**

- [ ] 1. Define Drizzle schema table (or ORM equivalent) in `src/database/schema/`
- [ ] 2. Create `@ObjectType()` model in `<domain>/models/<domain>.model.ts`
- [ ] 3. Create `@InputType()` DTOs in `<domain>/dto/`
- [ ] 4. Create repository in `src/database/repositories/<domain>.repository.ts`
- [ ] 5. Create service in `<domain>/<domain>.service.ts`
- [ ] 6. Create resolver in `<domain>/<domain>.resolver.ts`
- [ ] 7. Create module in `<domain>/<domain>.module.ts`
- [ ] 8. Register module in `app.module.ts` imports array

---

## Patterns & Templates

### 1. Zod DTO

```typescript
// dto/create-widget.dto.ts
import { z } from 'zod';

export const CreateWidgetDto = z.object({
  name: z.string().min(1).max(255),
  productLineId: z.string().uuid(),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

export type CreateWidgetDto = z.infer<typeof CreateWidgetDto>;
```

> For `class-validator` variant: use `class` with decorators and apply `ValidationPipe` globally or per-handler. Do not mix with Zod.

---

### 2. Entity

Plain interface. Services map raw DB rows → entity. Never return raw rows from a service.

```typescript
// entities/widget.entity.ts
export interface Widget {
  id: string;
  name: string;
  productLineId: string;
  attributes: Record<string, unknown>;
  createdAt: Date;
}
```

---

### 3. Controller

Thin: parse DTO → delegate to service → return. No business logic.

```typescript
// widget.controller.ts
import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Inject, BadRequestException, HttpCode,
} from '@nestjs/common';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { WidgetService } from './widget.service';
import type { Logger } from 'pino'; // swap type for your logger

@Controller('widgets')
export class WidgetController {
  constructor(
    private readonly widgetService: WidgetService,
    @Inject('logger') private readonly logger: Logger,
  ) {}

  @Get()
  findAll(@Query() query: Record<string, string | string[]>) {
    return this.widgetService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.widgetService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() body: unknown) {
    const parsed = CreateWidgetDto.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.widgetService.create(parsed.data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    const parsed = UpdateWidgetDto.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.widgetService.update(id, parsed.data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.widgetService.remove(id);
  }
}
```

**Status codes:**
- `POST` → `201 Created` (`@HttpCode(201)`)
- `DELETE` → `204 No Content` (`@HttpCode(204)`)
- `GET`, `PUT`, `PATCH` → `200 OK` (default)

---

### 4. Service

Business logic, sanitization, entity mapping. Paginated endpoints fan out via `Promise.all`.

```typescript
// widget.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { WidgetRepository } from '../database/repositories/widget.repository';
import type { CreateWidgetDto } from './dto/create-widget.dto';
import type { UpdateWidgetDto } from './dto/update-widget.dto';
import type { Widget } from './entities/widget.entity';
import type { Logger } from 'pino';

@Injectable()
export class WidgetService {
  constructor(
    private readonly widgetRepository: WidgetRepository,
    @Inject('logger') private readonly logger: Logger,
  ) {}

  async create(dto: CreateWidgetDto): Promise<Widget> {
    const sanitized = { ...dto, name: dto.name.trim() };
    const row = await this.widgetRepository.insert(sanitized);
    return this.mapToEntity(row);
  }

  async findAll(query: Record<string, string | string[]>) {
    const [data, total] = await Promise.all([
      this.widgetRepository.findAll(query),
      this.widgetRepository.count(query),
    ]);
    return { data: data.map(this.mapToEntity), total };
  }

  async findOne(id: string): Promise<Widget> {
    const row = await this.widgetRepository.findById(id);
    if (!row) throw new NotFoundException(`Widget ${id} not found`);
    return this.mapToEntity(row);
  }

  async update(id: string, dto: UpdateWidgetDto): Promise<Widget> {
    const row = await this.widgetRepository.update(id, dto);
    if (!row) throw new NotFoundException(`Widget ${id} not found`);
    return this.mapToEntity(row);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.widgetRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Widget ${id} not found`);
  }

  private mapToEntity(row: WidgetRow): Widget {
    return {
      id: row.id,
      name: row.name,
      productLineId: row.product_line_id,
      attributes: row.attributes ?? {},
      createdAt: row.created_at,
    };
  }
}
```

---

### 5. Repository (Drizzle variant)

All DB access lives here. Use `` sql`...` `` tagged templates. Infer row types from the schema — never write manual column name strings.

```typescript
// database/repositories/widget.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { sql, SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { widget } from '../schema/widget';

type WidgetRow = typeof widget.$inferSelect;

@Injectable()
export class WidgetRepository {
  constructor(@Inject('db') private readonly db: NodePgDatabase) {}

  async insert(data: Omit<WidgetRow, 'id' | 'createdAt'>): Promise<WidgetRow> {
    const [row] = await this.db.execute(sql`
      INSERT INTO ${widget} (${widget.name}, ${widget.productLineId}, ${widget.attributes})
      VALUES (${data.name}, ${data.productLineId}, ${JSON.stringify(data.attributes ?? {})})
      RETURNING *
    `);
    return row as WidgetRow;
  }

  async findAll(query: Record<string, string | string[]>): Promise<WidgetRow[]> {
    const limit = Math.min(Number(query.limit) || 50, 200);
    const offset = Number(query.offset) || 0;
    const filters = this.buildFilters(query);
    const rows = await this.db.execute(sql`
      SELECT * FROM ${widget}
      WHERE 1=1 ${filters}
      ORDER BY ${widget.createdAt} DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    return rows as WidgetRow[];
  }

  async findById(id: string): Promise<WidgetRow | null> {
    const [row] = await this.db.execute(sql`
      SELECT * FROM ${widget} WHERE ${widget.id} = ${id}
    `);
    return (row as WidgetRow) ?? null;
  }

  async update(id: string, data: Partial<Pick<WidgetRow, 'name' | 'attributes'>>): Promise<WidgetRow | null> {
    const setClauses: SQL[] = [];
    if (data.name !== undefined) setClauses.push(sql`${widget.name} = ${data.name}`);
    if (data.attributes !== undefined) setClauses.push(sql`${widget.attributes} = ${JSON.stringify(data.attributes)}`);
    if (setClauses.length === 0) {
      // Nothing to update — return current state
      return this.findById(id);
    }
    const [row] = await this.db.execute(sql`
      UPDATE ${widget}
      SET ${sql.join(setClauses, sql`, `)}
      WHERE ${widget.id} = ${id}
      RETURNING *
    `);
    return (row as WidgetRow) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const [row] = await this.db.execute(sql`
      DELETE FROM ${widget} WHERE ${widget.id} = ${id} RETURNING ${widget.id}
    `);
    return !!row;
  }

  // count MUST use the same filter logic as findAll
  async count(query: Record<string, string | string[]>): Promise<number> {
    const filters = this.buildFilters(query);
    const [row] = await this.db.execute(sql`
      SELECT COUNT(*)::int AS count FROM ${widget}
      WHERE 1=1 ${filters}
    `);
    return (row as { count: number }).count;
  }

  // Override in subclasses / extend columnMap for domain-specific filters
  protected buildFilters(query: Record<string, string | string[]>): SQL {
    return sql``;
  }
}
```

> For **Prisma**: replace `db.execute(sql`...`)` with `prisma.<model>.findMany({ where, skip, take })`. Row types come from `Prisma.<Model>`.
>
> For **TypeORM**: use `Repository<Entity>` via `@InjectRepository(Entity)`. Use `createQueryBuilder` for complex filters.

---

### 6. AND/OR Filter DSL (Drizzle)

Extend `buildFilters` in repositories that support dynamic column filtering. Wire query params end-to-end:

**Controller → Service → Repository:**

```typescript
// Controller: pass raw query through
@Get()
findAll(@Query() query: Record<string, string | string[]>) {
  return this.widgetService.findAll(query);
}

// Service: pass query to repo (no filter parsing here)
findAll(query: Record<string, string | string[]>) {
  return Promise.all([
    this.widgetRepository.findAll(query),
    this.widgetRepository.count(query),   // same query — filters must match
  ]);
}
```

**Repository `buildFilters` implementation:**

```typescript
import { SQL, sql } from 'drizzle-orm';
import { widget } from '../schema/widget';

// Always use schema refs — never hardcoded strings
const columnMap = {
  status:   widget.status,
  region:   widget.region,
  category: widget.category,
} as const;

type FilterableColumn = keyof typeof columnMap;

protected buildFilters(query: Record<string, string | string[]>): SQL {
  const conditions: SQL[] = [];

  // AND: ?status=active&region=us  →  WHERE status = 'active' AND region = 'us'
  for (const [col, val] of Object.entries(query)) {
    if (!(col in columnMap) || !val || Array.isArray(val)) continue;
    conditions.push(sql`${columnMap[col as FilterableColumn]} = ${val}`);
  }

  // OR: ?category=shoes&category=bags  →  WHERE (category = 'shoes' OR category = 'bags')
  for (const [col, vals] of Object.entries(query)) {
    if (!(col in columnMap) || !Array.isArray(vals)) continue;
    const parts = vals.map(v => sql`${columnMap[col as FilterableColumn]} = ${v}`);
    conditions.push(sql`(${sql.join(parts, sql` OR `)})`);
  }

  return conditions.length ? sql`AND ${sql.join(conditions, sql` AND `)}` : sql``;
}
```

---

### 7. Transactions

Use transactions for multi-table writes. Never split related mutations across separate awaits.

```typescript
// Drizzle
async createWithRelation(data: CreateWidgetDto, relatedData: CreateRelatedDto) {
  return this.db.transaction(async (tx) => {
    const [widget] = await tx.execute(sql`INSERT INTO ... RETURNING *`);
    await tx.execute(sql`INSERT INTO related_table ... VALUES (${widget.id}, ...)`);
    return widget;
  });
}

// Prisma
return this.prisma.$transaction([
  this.prisma.widget.create({ data }),
  this.prisma.related.create({ data: { widgetId: ... } }),
]);
```

---

### 8. Shared Pipes

Place in `src/common/pipes/`. Reuse across controllers — do not re-implement per domain.

```typescript
// common/pipes/uuid-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

@Injectable()
export class UuidValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const result = uuidSchema.safeParse(value);
    if (!result.success) throw new BadRequestException(`Invalid UUID: ${value}`);
    return result.data;
  }
}
```

**When to add a new pipe:**
- Route param needs format normalization (e.g. `S124` → `S1 2024`)
- Query param accepts a constrained set of values (enum-like)
- Type coercion needed (comma-separated string → array, numeric string → bounded number)
- Logic would be duplicated across 2+ controllers

---

### 9. Module

```typescript
// widget.module.ts
import { Module } from '@nestjs/common';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { WidgetRepository } from '../database/repositories/widget.repository';

@Module({
  controllers: [WidgetController],
  providers: [WidgetService, WidgetRepository],
  exports: [WidgetService],
})
export class WidgetModule {}
```

Register in `app.module.ts` imports array immediately.

---

### 10. Health Check (new projects — always scaffold)

Register directly on `AppModule` — no separate health module needed.

```typescript
// health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
```

```typescript
// app.module.ts
import { HealthController } from './health/health.controller';

@Module({
  controllers: [HealthController],
  // ...
})
export class AppModule {}
```

Responds `200 { status: 'ok' }` at `GET /health`. No service, no repository, no module file.

---

### 11. Swagger Setup (new projects — always scaffold)

Install the package matching the HTTP adapter (pnpm for standalone; match monorepo's package manager otherwise):

```bash
# Express (default)
pnpm add @nestjs/swagger swagger-ui-express

# Fastify
pnpm add @nestjs/swagger @fastify/swagger @fastify/swagger-ui
```

Configure in `main.ts` **after** all global middleware (pipes, guards, filters) and **before** `app.listen()`. Swagger is mounted at `/api/spec`.

```typescript
// main.ts — Express variant
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ... global prefix, pipes, guards, filters here ...

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('REST API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/spec', app, document);

  await app.listen(process.env.PORT ?? 9000);
}

bootstrap();
```

```typescript
// main.ts — Fastify variant
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // ... global prefix, pipes, guards, filters here ...

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('REST API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/spec', app, document);

  await app.listen(process.env.PORT ?? 9000, '0.0.0.0');
}

bootstrap();
```

Swagger UI is accessible at `GET /api/spec`. The raw OpenAPI JSON is at `GET /api/spec-json`.

**Decorating controllers for richer docs** — add these when scaffolding new controllers:

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('widgets')
@Controller('widgets')
export class WidgetController {
  @ApiOperation({ summary: 'List all widgets' })
  @ApiResponse({ status: 200, description: 'Returns paginated widgets' })
  @Get()
  findAll() { ... }

  @ApiOperation({ summary: 'Create a widget' })
  @ApiResponse({ status: 201, description: 'Widget created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post()
  create() { ... }
}
```

> If JWT auth is confirmed, also call `.addBearerAuth()` on the `DocumentBuilder` and add `@ApiBearerAuth()` to protected controllers.

---

### 12. Error Handling

```typescript
// Surface DB errors without leaking internals
async findOne(id: string): Promise<Widget> {
  try {
    const row = await this.widgetRepository.findById(id);
    if (!row) throw new NotFoundException(`Widget ${id} not found`);
    return this.mapToEntity(row);
  } catch (err) {
    if (err instanceof HttpException) throw err;
    this.logger.error({ err, id }, 'Failed to fetch widget');
    throw new InternalServerErrorException('Failed to fetch widget');
  }
}
```

Standard exceptions:
| Scenario | Exception |
|---|---|
| Resource not found | `NotFoundException` (404) |
| Invalid input | `BadRequestException` (400) |
| Duplicate / conflict | `ConflictException` (409) |
| DB / downstream failure | `InternalServerErrorException` (500) |

---

### 13. Mercurius + GraphQL Module Setup (new GraphQL projects — always scaffold)

Install packages (pnpm for standalone; match monorepo's package manager otherwise):

```bash
pnpm add @nestjs/graphql @nestjs/mercurius mercurius fastify
```

Register `GraphQLModule` in `AppModule` using the Mercurius driver. Enable GraphiQL for development:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      autoSchemaFile: true,   // code-first: generate schema in memory
      graphiql: true,         // GraphiQL UI at /graphql
    }),
    // ... domain modules
  ],
})
export class AppModule {}
```

Bootstrap with `FastifyAdapter`:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.listen(process.env.PORT ?? 9000, '0.0.0.0');
}

bootstrap();
```

GraphQL endpoint: `POST /graphql`. GraphiQL playground: `GET /graphql`.

> For **schema-first**: replace `autoSchemaFile: true` with `typePaths: ['**/*.graphql']` and use `@nestjs/mercurius` code-gen to generate TypeScript types from the SDL.

---

### 14. GraphQL Object Type (code-first)

Maps to a GraphQL type. Used as the return type of queries and mutations.

```typescript
// models/widget.model.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Widget {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  productLineId: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  createdAt: Date;
}
```

---

### 15. GraphQL Input Type (code-first)

Use `@InputType()` for mutation arguments. Never reuse `@ObjectType()` as input.

```typescript
// dto/create-widget.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, MinLength, MaxLength, IsOptional } from 'class-validator';

@InputType()
export class CreateWidgetInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @Field()
  @IsUUID()
  productLineId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}
```

> GraphQL projects use `class-validator` on `@InputType()` classes with a global `ValidationPipe`. Do not use Zod for GraphQL input validation.

---

### 16. GraphQL Resolver (code-first)

Thin: delegate to service. No business logic in the resolver.

```typescript
// widget.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Widget } from './models/widget.model';
import { WidgetService } from './widget.service';
import { CreateWidgetInput } from './dto/create-widget.input';
import { UpdateWidgetInput } from './dto/update-widget.input';

@Resolver(() => Widget)
export class WidgetResolver {
  constructor(private readonly widgetService: WidgetService) {}

  @Query(() => [Widget], { name: 'widgets' })
  findAll() {
    return this.widgetService.findAll();
  }

  @Query(() => Widget, { name: 'widget' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.widgetService.findOne(id);
  }

  @Mutation(() => Widget)
  createWidget(@Args('input') input: CreateWidgetInput) {
    return this.widgetService.create(input);
  }

  @Mutation(() => Widget)
  updateWidget(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateWidgetInput,
  ) {
    return this.widgetService.update(id, input);
  }

  @Mutation(() => Boolean)
  removeWidget(@Args('id', { type: () => ID }) id: string) {
    return this.widgetService.remove(id);
  }
}
```

**GraphQL module:**

```typescript
// widget.module.ts
import { Module } from '@nestjs/common';
import { WidgetResolver } from './widget.resolver';
import { WidgetService } from './widget.service';
import { WidgetRepository } from '../database/repositories/widget.repository';

@Module({
  providers: [WidgetResolver, WidgetService, WidgetRepository],
  exports: [WidgetService],
})
export class WidgetModule {}
```

> No `controllers` array for GraphQL modules.

---

### 17. Path Aliases (new projects — always scaffold)

Install runtime path resolution support:

```bash
pnpm add -D tsconfig-paths
```

**`tsconfig.json`** — add `baseUrl` and `paths` inside `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**`tsconfig.json`** — add a `ts-node` block at the top level (used by Jest and `nest start` in dev):

```json
{
  "ts-node": {
    "require": ["tsconfig-paths/register"]
  }
}
```

With these in place, imports resolve as:

```typescript
// Instead of: import { WidgetService } from '../../widget/widget.service';
import { WidgetService } from '@/widget/widget.service';

// Instead of: import { UuidValidationPipe } from '../../../common/pipes/uuid-validation.pipe';
import { UuidValidationPipe } from '@/common/pipes/uuid-validation.pipe';
```

**All generated code must use `@/` imports** — never relative `../../` paths.

> NestJS CLI (`nest build`) resolves `paths` automatically via `tsconfig-paths-webpack-plugin` at build time. No extra webpack config needed.

---

## Rules

1. **No raw SQL strings.** Always `` sql`...` `` tagged templates (Drizzle). No string interpolation into queries.
2. **Schema-inferred columns.** Reference ORM schema objects in queries — never hardcode column name strings.
3. **Repositories in `src/database/repositories/`** — never co-located with domain modules.
4. **Controllers are thin.** Parse DTO → delegate → return. No business logic.
5. **Services own entity mapping.** Raw DB rows → typed entity interface. Never return raw rows.
6. **Standard REST verbs + status codes.** `GET` 200, `POST` 201, `PUT`/`PATCH` 200, `DELETE` 204.
7. **Paginated endpoints:** `Promise.all([repo.findAll(...), repo.count(...)])`. `count()` **must** apply the same filters as `findAll()`.
8. **Transactions for multi-table writes.** Never split related mutations across separate awaits.
9. **No `any`.** Use `unknown` at unvalidated boundaries, narrow via Zod parse or ORM-inferred types.
10. **`null` for explicit absence, not `undefined`.** Use optional properties (`field?: Type`) for optional shape; use `null` when a value is intentionally absent.
11. **Wrap unreliable external calls** (queues, S3, third-party APIs) with retry logic and a try/catch that rethrows as `InternalServerErrorException`.
12. **Register new modules in `app.module.ts` immediately.**
13. **No `class-validator` / `class-transformer` if Zod is the confirmed validator.** Do not mix systems.
14. **Swagger always at `/api/spec` for new REST projects.** Call `SwaggerModule.setup('api/spec', ...)` in `main.ts` after global middleware and before `app.listen()`. Add `@ApiTags` and `@ApiOperation` decorators when scaffolding controllers.
15. **GraphQL projects always use Fastify + Mercurius.** Never use Express for a GraphQL project.
16. **GraphQL projects use `class-validator` on `@InputType()` classes** with a global `ValidationPipe`. Do not use Zod for GraphQL input validation.
17. **Resolvers are thin.** Delegate to service immediately — no business logic, no DB calls in the resolver.
18. **Never reuse `@ObjectType()` as `@InputType()`.** Define separate Input classes for mutations.
19. **GraphiQL is always enabled** via `graphiql: true` in `MercuriusDriverConfig` for new GraphQL projects.
20. **Package manager for new standalone projects is pnpm.** If adding to a monorepo, detect and match the repo's existing package manager before installing anything.
21. **Always use `@/` path aliases in generated code.** Never emit relative `../../` imports. Path aliases (`@/*` → `src/*`) are always configured for new projects.
