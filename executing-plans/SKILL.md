---
name: executing-plans
description: >
  Implements a pre-written plan sequentially with verification checkpoints.
  Use when a plan document already exists and you are executing it inline
  (without subagents). Trigger phrases: "execute the plan", "implement the plan",
  "run through the plan", "start on the plan".
---

# Executing Plans

**Announce at start:** "I'm using the executing-plans skill to implement the plan."

**Recommended alternative:** When subagents are available, use the `subagent-driven-development` skill instead — it produces higher quality results by giving each task a fresh agent with isolated context.

## Prerequisites

A plan document must already exist at `docs/plans/YYYY-MM-DD-<topic>-plan.md`. If no plan exists, invoke `writing-plans` first.

## The Process

### Step 1 — Load and review

Read the full plan file. Before touching any code:

- Identify any steps that are unclear or potentially outdated
- Check that all file paths referenced in the plan still exist
- Raise questions now — do not silently resolve ambiguities mid-execution

### Step 2 — Execute tasks

For each task in order:

1. **Mark in progress** — note which task you are on
2. **Follow steps exactly** — do not skip, reorder, or improvise
3. **Run the specified verification command** — read the complete output
4. **Confirm against expected output** — if it doesn't match, stop
5. **Mark complete** — only after verification passes

**Stop immediately when blocked.** Ask for clarification rather than guessing. Do not proceed to the next task until the current one verifies.

### Step 3 — Finish

After all tasks verify successfully:

1. Run the full test suite to confirm nothing regressed
2. Present options:
   - Merge to main locally
   - Push branch and open a PR
   - Keep branch and stop here
3. Execute the chosen option

---

## Hard Rules

- Never skip a verification step
- Never proceed past a failing verification without asking
- Never improvise or deviate from the plan mid-execution
- Stop immediately when blocked; ask rather than guess
- Never commit to `main`/`master` directly without explicit consent
