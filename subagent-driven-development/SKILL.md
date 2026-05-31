---
name: subagent-driven-development
description: >
  Executes an approved implementation plan by dispatching a fresh subagent per task,
  with a two-stage review (spec compliance then code quality) after each one.
  Use when a plan document exists and subagents are available.
  Trigger phrases: "implement with subagents", "execute plan using subagents",
  "run the plan with fresh agents", or when invoked by the writing-plans skill.
---

# Subagent-Driven Development

**Announce at start:** "I'm using the subagent-driven-development skill to execute the plan."

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast.

## Prerequisites

A plan document must already exist at `docs/plans/YYYY-MM-DD-<topic>-plan.md`. If no plan exists, invoke `writing-plans` first.

Never start on `main`/`master` without explicit user consent.

## The Process

### Step 1 — Extract and track

Read the full plan. Extract all tasks upfront. Create a TodoWrite tracker listing every task with status: `TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`, or `DONE_WITH_CONCERNS`.

Do not start executing until you have the full task list.

### Step 2 — For each task

Execute tasks continuously — do not pause between them unless blocked.

#### 2a — Dispatch implementer

Create a focused prompt for the implementer subagent containing:
- The specific task steps from the plan (exact code, file paths, commands)
- Enough context to understand the task — but not the full session history
- The spec file path for reference
- Explicit constraints: "do not change files outside this task's scope"

Dispatch the subagent. Wait for it to return.

#### 2b — Spec compliance review

Before checking code quality, verify the implementation matches the spec:
- Does it fulfill the task's acceptance criteria?
- Does it stay within scope?

If **issues found**: send back to the implementer with specific feedback. Implementer must fix and resubmit. Repeat until compliant.

Only proceed to 2c after spec review passes.

#### 2c — Code quality review

Review the implementation for quality:
- Correctness (logic errors, edge cases)
- Clarity (naming, structure)
- DRY / YAGNI violations

If **issues found**: send back to the implementer. Repeat until approved.

#### 2d — Mark complete

Mark the task `DONE` and proceed immediately to the next task.

### Step 3 — Final review

After all tasks are complete, dispatch a final code reviewer across the full diff:
- Read all changed files
- Verify nothing conflicts across tasks
- Run the full test suite

### Step 4 — Finish

Present options:
1. Merge to main locally
2. Push branch and open a PR
3. Keep branch and stop here

Execute the chosen option.

---

## Task Status Handling

| Status | Meaning | Action |
|---|---|---|
| `DONE` | Task complete, both reviews passed | Proceed to next task |
| `NEEDS_CONTEXT` | Implementer missing information | Provide context, re-dispatch |
| `BLOCKED` | Hard blocker (missing dependency, test failure) | Stop, ask user |
| `DONE_WITH_CONCERNS` | Completed but reviewer flagged advisory items | Note concerns, proceed |

---

## Hard Rules

- Never skip review stages
- Never proceed to the next task while review issues are open
- Never pass full session history to a subagent — construct focused, self-contained prompts
- Stop immediately when blocked; ask rather than guess
- Never start on `main`/`master` without explicit user consent
