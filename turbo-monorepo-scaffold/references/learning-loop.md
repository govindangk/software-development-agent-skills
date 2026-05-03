# Learning Loop

## Purpose

After each `turbo run`, observe real task timings and update the pipeline config
to eliminate unnecessary serialization and surface real conflicts.

---

## turbo-learn.json schema

```json
{
  "schema_version": 1,
  "runs": [
    {
      "id": "run-001",
      "timestamp": "2025-01-01T00:00:00Z",
      "command": "turbo run build test lint",
      "tasks": [
        {
          "package": "packages/ui",
          "task": "build",
          "duration_ms": 1240,
          "start_time_ms": 0
        },
        {
          "package": "apps/web",
          "task": "build",
          "duration_ms": 4300,
          "start_time_ms": 1250
        }
      ],
      "total_duration_ms": 6800,
      "conflicts_detected": []
    }
  ],
  "pipeline_overrides": {
    "apps/web#test": {
      "dependsOn": ["packages/ui#build"],
      "added_in_run": "run-003",
      "reason": "Cache miss overlap detected in 3 consecutive runs"
    }
  },
  "conflict_candidates": {
    "apps/web#test|packages/ui#build": {
      "overlap_count": 2,
      "first_seen": "run-001"
    }
  }
}
```

---

## Parsing turbo run output

Run turbo with JSON output:
```bash
turbo run build test lint --output-logs=json 2>&1 | tee .turbo/last-run.json
```

Or use the summarizer flag (turbo ≥ 1.10):
```bash
turbo run build test lint --summarize
# output lands in .turbo/runs/<id>.json
```

Extract per-task timing from either format:

```typescript
interface TurboTaskResult {
  taskId: string;       // "packages/ui#build"
  package: string;      // "packages/ui"
  task: string;         // "build"
  startAt: number;      // epoch ms
  endAt: number;        // epoch ms
  exitCode: number;
}
```

---

## Update algorithm

Run after parsing each turbo output:

### 1. Record the run
Append a new entry to `runs[]` with all task timings.

### 2. Detect overlap conflicts

For every pair of tasks `(A, B)` that ran in the same turbo invocation:

```
overlap = A.endAt > B.startAt AND B.endAt > A.startAt
```

If overlap is detected AND `B` had a non-zero exit code or produced corrupted
output (inferred from package dependency graph), increment
`conflict_candidates[A|B].overlap_count`.

### 3. Evaluate serialization threshold

If `conflict_candidates[A|B].overlap_count >= 3`:
- Add `pipeline_overrides[B] = { dependsOn: [A] }` with reason
- Write the override into `turbo.json` pipeline section
- Reset `conflict_candidates[A|B].overlap_count` to 0 (edge is now explicit)

### 4. Prune stale overrides

If a task pair has had 0 conflicts in the last 10 runs after its override was
added, flag it as a candidate for removal. Report to user before removing —
don't auto-remove.

---

## Reporting changes to the user

After each learning loop update, emit a concise report:

```
## turbo-learn update (run-004)

**No new serialization edges added.**

Conflict candidates:
- apps/web#test | packages/ui#build — 2/3 overlaps (1 more to trigger edge)

Total time: 8.2s (↑ 0.4s from last run)
```

Or if an edge was added:

```
## turbo-learn update (run-005)

**New serialization edge added:**
  apps/web#test → dependsOn: ["packages/ui#build"]
  Reason: Cache miss overlap detected in 3 consecutive runs.
  turbo.json updated.
```

---

## Manual tuning

Users can hand-edit `pipeline_overrides` in `turbo-learn.json`. When the agent
next processes a run, it should respect manually-added entries and not overwrite
them unless `"manual": true` is NOT set.

Suggested flag for manual entries:
```json
"apps/web#test": {
  "dependsOn": ["packages/ui#build"],
  "manual": true,
  "reason": "Integration test requires compiled UI package"
}
```

---

## Parallelism budget

Optionally track concurrency. If the user reports OOM or CPU saturation,
set a `concurrency` hint:

```json
{
  "pipeline_overrides": {},
  "concurrency_hint": 4
}
```

Surface this as `turbo run build --concurrency=4` in the run instructions.
