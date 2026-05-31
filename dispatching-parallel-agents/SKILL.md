---
name: dispatching-parallel-agents
description: >
  Decomposes multi-problem scenarios into independent work streams and dispatches
  specialized subagents concurrently. Use when facing 2+ independent failures or
  tasks that have no shared state or sequential dependencies.
  Trigger phrases: "fix these failures in parallel", "investigate independently",
  "dispatch agents for each", multiple unrelated test failures, multiple independent bugs.
---

# Dispatching Parallel Agents

**Announce at start:** "I'm using the dispatching-parallel-agents skill to split this into parallel work streams."

**Core principle:** Dispatch one agent per independent problem domain. Let them work concurrently.

## When to Use

Use when:
- 3+ test files failing with different root causes
- Multiple subsystems broken independently
- Each problem can be understood without context from others
- No shared state between investigations

Do NOT use when:
- Failures are related (fixing one might fix others — investigate together first)
- You don't yet know what's broken (do exploratory debugging first)
- Agents would edit the same files

## The Process

### Step 1 — Identify independent domains

Group the failures or tasks by what's actually broken. Verify they are truly independent — if there's any chance fixing one affects another, they are not independent.

Example grouping:
- Domain A: `auth.test.ts` — 3 failures in token expiry logic
- Domain B: `batch.test.ts` — 2 failures in queue completion behavior
- Domain C: `retry.test.ts` — 1 failure in backoff calculation

Each domain is independent — fixing token expiry doesn't affect retry logic.

### Step 2 — Write focused agent prompts

Each agent prompt must be:
1. **Focused** — one clear problem domain, named explicitly
2. **Self-contained** — all context needed to understand the problem (paste error messages, test names, relevant code snippets)
3. **Constrained** — "do not change files outside `src/auth/`"
4. **Specific about output** — "return: root cause, what you changed, and why"

Never pass full session history to a subagent. Construct exactly what they need.

### Step 3 — Dispatch in parallel

Dispatch all agents at the same time using parallel tool calls. Do not wait for one before starting the next.

### Step 4 — Review and integrate

When all agents return:

1. Read each summary — understand what changed and why
2. Check for conflicts — did any two agents edit the same files?
3. If conflicts exist: resolve manually before proceeding
4. Run the full test suite — verify all fixes work together
5. Spot check — agents can make systematic errors; verify representative cases

---

## Agent Prompt Template

```
Fix the N failing tests in <file-path>:

1. "<test name>" — <what it expects, what actually happens>
2. "<test name>" — <what it expects, what actually happens>

Context:
<paste relevant error output>
<paste relevant code snippet if helpful>

Your task:
1. Read the test file and understand what each test verifies
2. Identify the root cause (timing issue? logic bug? wrong expectation?)
3. Fix it — if timing, replace arbitrary waits with event-based waiting; if logic, fix the bug
4. Do NOT change files outside <scope constraint>
5. Do NOT just increase timeouts — find the real issue

Return: Summary of root cause and what you changed.
```

---

## Hard Rules

- Verify independence before dispatching — never dispatch parallel agents for related failures
- Agents must not share state or edit overlapping files
- Always run the full test suite after integrating all agent results
- If agents conflict, resolve manually — never silently discard one agent's work
