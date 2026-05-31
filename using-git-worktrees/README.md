# using-git-worktrees

Sets up an isolated git workspace for feature work. Detects existing isolation first, prefers native tools (`EnterWorktree`) over manual git commands, auto-runs project setup, and verifies a clean test baseline before handing off.

## Trigger

Use any of: "set up isolated workspace", "create a worktree", "isolate this work", or invoked before executing a plan

## Process

1. **Step 0 — Detect**: Check if already in a linked worktree (skip if so)
2. **Step 1a — Native tool**: Use `EnterWorktree` if available (preferred)
3. **Step 1b — Git fallback**: `git worktree add .worktrees/<branch>` — only if no native tool; verify directory is git-ignored first
4. **Step 3 — Setup**: Auto-run `npm install` / `cargo build` / `pip install` / `go mod download`
5. **Step 4 — Baseline**: Run tests; report failures and ask before proceeding

## Hard rules

- Always detect existing isolation before creating anything
- Never use `git worktree add` when `EnterWorktree` is available
- Never create a project-local worktree directory without verifying it is git-ignored
