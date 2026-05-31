---
name: writing-plans
description: >
  Decomposes an approved spec into a granular, executable implementation plan.
  Use after brainstorming is approved. Trigger phrases: "write a plan for X",
  "create an implementation plan", "plan this out", or when invoked by the
  brainstorming skill after spec approval.
---

# Writing Plans

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

## Hard Gate

**Do NOT begin implementation until this plan has been reviewed by the plan reviewer subagent and the reviewer returns Approved.**

## The Process

### Step 1 — Load the spec

Read the approved spec from `docs/plans/YYYY-MM-DD-<topic>-spec.md`. If no spec exists, invoke the `brainstorming` skill first.

Raise any questions before writing the plan. Do not silently resolve ambiguities.

### Step 2 — Map file architecture

Before defining tasks, map out the files involved:

- Which files will be created?
- Which files will be modified?
- What are the clear boundaries and responsibilities?
- What changes together should live together?

Document this at the top of the plan under **Architecture**.

### Step 3 — Break into tasks

Decompose work into 2–5 minute TDD tasks. Each task follows this cycle:

1. Write failing test
2. Verify it fails (red)
3. Write minimal implementation to pass
4. Verify it passes (green)
5. Commit

Each task must have:
- A clear title
- Exact file paths
- Complete, runnable code — no placeholders, no "TBD", no "similar to Task N", no "add appropriate handling"
- The specific verification command and expected output

### Step 4 — Write the plan

Save to:

```
docs/plans/YYYY-MM-DD-<topic>-plan.md
```

Required header:

```markdown
# Plan: <feature-name>

**Spec:** docs/plans/YYYY-MM-DD-<topic>-spec.md
**Goal:** <one sentence>
**Architecture:** <file map from Step 2>
**Tech Stack:** <relevant stack details>
```

### Step 5 — Self-review

Scan for anti-patterns before dispatching the reviewer:

- [ ] Any "TBD", "TODO", "add appropriate X", "similar to Task N"
- [ ] Tasks that reference code without providing it
- [ ] Spec requirements not covered by any task
- [ ] Type or naming inconsistencies across tasks
- [ ] Tasks with no verification step

Fix all inline.

### Step 6 — Dispatch plan reviewer subagent

Use the prompt template in `plan-document-reviewer-prompt.md` to dispatch a reviewer subagent. Pass both the plan file path and the spec file path.

If the reviewer returns **Issues Found**: fix the flagged issues in the plan and re-run the reviewer.

Only proceed when reviewer returns **Approved**.

---

## After Approval

Offer two execution paths:

1. **Subagent-driven** (recommended) — invoke `subagent-driven-development` skill; each task gets a fresh agent
2. **Inline** — invoke `executing-plans` skill; tasks run sequentially in this session

---

## Common Mistakes

- Writing tasks with placeholder content ("add error handling", "implement as needed")
- Skipping the architecture map — leads to circular dependencies discovered mid-implementation
- Tasks too large (more than 5 minutes of work)
- Missing verification steps — no way to confirm a task is done
- Skipping the plan reviewer
