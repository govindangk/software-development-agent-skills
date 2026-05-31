---
name: using-git-worktrees
description: >
  Sets up an isolated workspace for feature work via git worktrees.
  Use before executing implementation plans or starting any feature work
  that needs isolation from the current branch.
  Trigger phrases: "set up isolated workspace", "create a worktree",
  "isolate this work", or when invoked before executing a plan.
---

# Using Git Worktrees

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

**Core principle:** Detect existing isolation first. Then use native tools. Then fall back to git. Never fight the harness.

## Step 0 — Detect existing isolation

Before creating anything, check if you are already in an isolated workspace:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside git submodules. Verify you are not in a submodule first:

```bash
git rev-parse --show-superproject-working-tree 2>/dev/null
```

If this returns a path, you are in a submodule — treat as normal repo.

**If `GIT_DIR != GIT_COMMON` (and not a submodule):** You are already in a linked worktree. Skip to Step 3. Do NOT create another worktree.

**If `GIT_DIR == GIT_COMMON`:** You are in a normal repo checkout. Ask for consent before creating a worktree:

> "Would you like me to set up an isolated worktree? It protects your current branch from changes."

Honor any existing declared preference without asking again. If the user declines, work in place and skip to Step 3.

## Step 1 — Create isolated workspace

### 1a. Native worktree tool (preferred)

Check for a native tool: `EnterWorktree`, a `/worktree` command, or a `--worktree` flag. If one exists, use it and skip to Step 3.

Native tools handle directory placement, branch creation, and cleanup automatically. Do not use `git worktree add` when a native tool is available — this creates state the harness cannot see or manage.

### 1b. Git worktree fallback

Only if no native tool is available.

**Directory selection** (in priority order):

1. Check your instructions for a declared preference
2. Check for existing project-local directory: `.worktrees/` or `worktrees/`
3. Default to `.worktrees/` at the project root

**Safety check (project-local directories only):**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

If NOT ignored: add to `.gitignore` and commit the change first.

**Create the worktree:**

```bash
git worktree add .worktrees/<branch-name> -b <branch-name>
cd .worktrees/<branch-name>
```

If `git worktree add` fails with a permission error: work in place and proceed to Step 3.

## Step 3 — Project setup

Auto-detect and run the appropriate setup:

```bash
# Node.js
[ -f package.json ] && npm install

# Rust
[ -f Cargo.toml ] && cargo build

# Python
[ -f requirements.txt ] && pip install -r requirements.txt
[ -f pyproject.toml ] && poetry install

# Go
[ -f go.mod ] && go mod download
```

## Step 4 — Verify clean baseline

Run the project's test suite. Report the result.

- **Tests pass:** Report ready — `Worktree ready at <path>, N tests passing`
- **Tests fail:** Report failures and ask whether to proceed or investigate first

---

## Quick Reference

| Situation | Action |
|---|---|
| Already in linked worktree (not submodule) | Skip creation — go to Step 3 |
| In a submodule | Treat as normal repo |
| Native worktree tool available | Use it (Step 1a) |
| No native tool | Git worktree fallback (Step 1b) |
| `.worktrees/` not git-ignored | Add to `.gitignore` + commit first |
| Permission error on create | Work in place |
| Tests fail at baseline | Report + ask before proceeding |

---

## Hard Rules

- Always run Step 0 detection before creating anything
- Never create a nested worktree inside an existing one
- Never use `git worktree add` when a native tool (`EnterWorktree`) is available
- Never create a project-local worktree directory without verifying it is git-ignored
- Never proceed with failing baseline tests without asking the user
