# executing-plans

Implements a pre-written plan sequentially with verification checkpoints at each step. Loads the plan, raises questions before starting, executes tasks in order, verifies each step against expected output, and stops immediately on blockers.

## Trigger

Use any of: "execute the plan", "implement the plan", "run through the plan", "start on the plan"

**Recommended alternative:** Use `subagent-driven-development` when subagents are available — it produces higher quality results with fresh isolated context per task.

## Process

1. Load and review plan file — raise questions before starting
2. Execute each task: follow steps exactly → run verification → confirm output → mark complete
3. Stop immediately when blocked; ask rather than guess
4. After all tasks: run full test suite → present merge/PR/keep options

## Prerequisites

A plan document at `docs/plans/YYYY-MM-DD-<topic>-plan.md`. Use `writing-plans` to create one.
