# NestJS Backend Skill

## Step 1 — Gather Project Context (Always Run First)

Do **not** generate any code before completing this step.

### Step 0 — Ask project type

Ask this single question first:

```
Is this a new project or an existing one?

A) New project — I'll ask about your preferred stack and scaffold from scratch.
B) Existing project — I'll read your codebase and infer the stack before touching anything.
```

Then follow the matching path below.

---

### Path A — New project

Ask all 7 axes in one message. Do not assume defaults.

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

3. **Validation**
   - Zod (`safeParse` at the controller boundary)
   - `class-validator` + `class-transformer` + `ValidationPipe`
   - Manual / other

4. **Injection style**
   - String tokens (`@Inject('db')`, `@Inject('logger')`)
   - Class-based (`@InjectRepository(Entity)`, direct class injection)
   - Mixed

5. **Response envelope** — how should list endpoints return data?
   - `{ data: T[], total: number }`
   - `{ items: T[], pagination: { page, limit, total } }`
   - Bare array `T[]`
   - Other (describe)

6. **Auth / guards** — do routes need authentication?
   - None / open routes
   - JWT guard — `@UseGuards(JwtAuthGuard)` on controller class
   - API key or custom guard (describe the decorator / token)
   - Per-endpoint opt-in (no class-level guard)

7. **Tests** — should test files be scaffolded?
   - Yes — Jest unit tests for service + controller
   - No
```

After receiving answers, go to the **Confirmation block** below.

---

### Path B — Existing project (infer first, ask minimally)

1. Read the following files:
   - `src/app.module.ts`
   - First match of `src/**/*.controller.ts`
   - First match of `src/database/repositories/*.ts` (or ORM equivalent)
   - First match of `src/**/*.service.ts`
   - Check for `src/**/*.spec.ts` to determine test convention

2. Infer all 7 axes from the code. Mark each as ✅ (detected) or ❓ (unclear).

3. Print the detection summary:

```
Detected from existing code:
✅ ORM: Drizzle (sql tagged templates, NodePgDatabase)
✅ Validation: Zod (safeParse pattern in controllers)
✅ Logger: Pino (@Inject('logger'), pino Logger type)
✅ DI style: String tokens
✅ Response envelope: { data: T[], total: number }
❓ Auth: unclear — no guards found in sampled files
❓ Tests: unclear — no *.spec.ts files found

→ Please confirm the ❓ items before I proceed.
```

4. Ask **only** about the ❓ axes. If all 7 are clear, skip straight to the confirmation block.

5. After receiving answers, go to the **Confirmation block** below.

---

### Confirmation block (both paths)

Before generating any file, always emit this summary and wait for a go-ahead:

```
Stack confirmed:
- ORM: [value]
- Validation: [value]
- Logger: [value]
- DI style: [value]
- Response envelope: [value]
- Auth: [value]
- Tests: [value]

Proceeding to scaffold...
```

Adapt all generated code to match the confirmed stack. The templates below use **Drizzle + Pino (string tokens) + Zod** as the reference implementation — swap the relevant sections based on confirmed choices.

---

## Stack Reference

> Populated from the gather phase. Do not generate code until this table is complete.

| Layer | Confirmed Tech | Notes |
|---|---|---|
| Framework | NestJS | Pure REST, no GraphQL |
| Validation | [from gather] | |
| ORM | [from gather] | |
| Logger | [from gather] | |
| DI tokens | [from gather] | |
| Response envelope | [from gather] | |
| Auth | [from gather] | |
| Tests | [from gather] | |

---

## Project Structure

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

**Repositories are centralized in `src/database/repositories/` — never co-located with domain modules.**

---

## New Resource Scaffolding Checklist

When adding a new domain resource, follow this order:

- [ ] 1. Define Drizzle schema table (or ORM equivalent) in `src/database/schema/`
- [ ] 2. Create entity interface in `<domain>/entities/<domain>.entity.ts`
- [ ] 3. Create DTO schemas in `<domain>/dto/`
- [ ] 4. Create repository in `src/database/repositories/<domain>.repository.ts`
- [ ] 5. Create service in `<domain>/<domain>.service.ts`
- [ ] 6. Create controller in `<domain>/<domain>.controller.ts`
- [ ] 7. Create module in `<domain>/<domain>.module.ts`
- [ ] 8. Register module in `app.module.ts` imports array
- [ ] 9. Evaluate whether new shared pipes are needed → add to `src/common/pipes/`

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

### 10. Error Handling

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
