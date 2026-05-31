# subagent-driven-development

Executes an approved implementation plan by dispatching a fresh subagent per task, with a mandatory two-stage review (spec compliance then code quality) after each one. Produces higher quality results than inline execution because each implementer has isolated, focused context.

## Trigger

Use any of: "implement with subagents", "execute plan using subagents", "run the plan with fresh agents", or invoked by the `writing-plans` skill

## Process

1. Extract all tasks from plan upfront, create task tracker
2. For each task: dispatch fresh implementer subagent (focused context only, not full session history)
3. Two-stage review: spec compliance → code quality; fix and resubmit if issues found
4. After all tasks: final code review across full diff
5. Present merge/PR/keep options

## Task statuses

| Status | Meaning |
|---|---|
| `DONE` | Both reviews passed |
| `NEEDS_CONTEXT` | Implementer needs more information |
| `BLOCKED` | Hard blocker — stop and ask user |
| `DONE_WITH_CONCERNS` | Advisory items noted, not blocking |

## Prerequisites

A plan document at `docs/plans/YYYY-MM-DD-<topic>-plan.md`. Use `writing-plans` to create one.
