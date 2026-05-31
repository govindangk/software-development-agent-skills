# dispatching-parallel-agents

Decomposes multi-problem scenarios into independent work streams and dispatches specialized subagents concurrently. Each agent gets a focused, self-contained prompt with exactly the context it needs — no shared history. After all agents return, reviews summaries, checks for conflicts, and runs the full test suite.

## Trigger

Use any of: "fix these failures in parallel", "investigate independently", "dispatch agents for each", or when facing multiple unrelated test failures or independent bugs

## When to use

- 3+ test files failing with different root causes
- Multiple subsystems broken independently
- Each problem can be understood without context from others
- No shared state between investigations

**Do NOT use** when failures are related (investigate together first) or when agents would edit the same files.

## Process

1. Identify truly independent domains — group failures by what's actually broken
2. Write one focused, self-contained prompt per domain (scope, error context, constraints, expected output)
3. Dispatch all agents in parallel
4. Review each summary — understand what changed
5. Check for conflicts — did any two agents touch the same files?
6. Run full test suite — verify all fixes work together
