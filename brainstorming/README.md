# brainstorming

Turns a feature idea into an approved design spec before any code is written. Explores project context, asks targeted clarifying questions, proposes 2–3 approaches with trade-offs, writes a spec, runs a reviewer subagent, and gates on explicit user approval.

## Trigger

Use any of: "build X", "implement X", "add a feature for X", "let's design X", "brainstorm X", any feature request without an existing approved spec

## Files

- `SKILL.md` — the skill definition
- `spec-document-reviewer-prompt.md` — subagent prompt template for spec review

## Process

1. Explore project context
2. Ask clarifying questions (one per message)
3. Propose 2–3 approaches with trade-offs
4. Write spec to `docs/plans/YYYY-MM-DD-<topic>-spec.md`
5. Self-review spec for gaps and contradictions
6. Dispatch spec reviewer subagent
7. Get explicit user approval

**Hard gate:** No plan or code until spec is approved.

## Follows with

`writing-plans` skill
