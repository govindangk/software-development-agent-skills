# Turbo Pipeline Reference

## Topology rules

### Parallel-first defaults

| Task   | Default `dependsOn` | Rationale |
|--------|---------------------|-----------|
| `lint` | `[]`               | Purely static — no runtime deps |
| `test` | `[]`               | Unit tests shouldn't need siblings built |
| `build`| `["^build"]`       | Needs upstream packages compiled |
| `dev`  | `["^build"]`       | Needs initial build of deps, then persistent |
| `clean`| `[]`               | No deps; idempotent |

`^build` means "all packages I depend on must finish `build` before I start mine".
It does **not** mean "all packages in the repo". Turbo resolves this via `package.json#dependencies`.

---

## Adding serialization edges

Only add an edge when you have evidence of a real conflict. Two forms:

### 1. Cross-package (global)
```json
"test": { "dependsOn": ["^build"] }
```
All packages: tests wait for upstream builds. Use when integration tests import
compiled artifacts.

### 2. Per-package override
```json
"apps/web#test": { "dependsOn": ["packages/ui#build"] }
```
Targeted. Prefer this over a global rule when only one consumer has the conflict.

---

## Non-TS task entries

### Go
```json
"libs/go-svc#build": {
  "dependsOn": [],
  "outputs": ["bin/**"],
  "cache": false
}
```

### Python
```json
"libs/py-worker#build": {
  "dependsOn": [],
  "outputs": [".venv/**", "dist/**"],
  "cache": false
}
```

### Docker
```json
"apps/api#docker": {
  "dependsOn": ["apps/api#build"],
  "cache": false
}
```

---

## Cache configuration

- Set `"cache": false` on **all tasks** — caching is globally disabled for this skill
- For tasks with side effects (publishing, docker push, db migrations), `"cache": false` is already the baseline

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| `dependsOn: ["build"]` (no `^`) | Means "my own build", not upstream — usually wrong for cross-package deps |
| `dependsOn: ["test", "lint"]` on build | Creates false serial chain; test/lint shouldn't gate build |
| Missing `outputs` on build | Turbo can't restore cache; always specify |
| `persistent: true` on test | Tests aren't watchers; only `dev` should be persistent |
