# writing-plans

Decomposes an approved design spec into a granular, executable implementation plan. Maps file architecture, breaks work into 2–5 minute TDD tasks with complete code and exact file paths, self-reviews for placeholder anti-patterns, dispatches a plan reviewer subagent, and gates on reviewer approval before any execution begins.

## Trigger

Use any of: "write a plan for X", "create an implementation plan", "plan this out", or invoked automatically by the `brainstorming` skill after spec approval

## Files

- `SKILL.md` — the skill definition
- `plan-document-reviewer-prompt.md` — subagent prompt template for plan review

## Process

1. Load the approved spec
2. Map file architecture (boundaries, responsibilities)
3. Break work into 2–5 min TDD tasks (red → green → commit)
4. Write plan to `docs/plans/YYYY-MM-DD-<topic>-plan.md`
5. Self-review for placeholder anti-patterns
6. Dispatch plan reviewer subagent
7. Fix any issues, re-review until Approved

**Hard gate:** No execution until plan reviewer returns Approved.

## Follows with

`subagent-driven-development` (recommended) or `executing-plans`
