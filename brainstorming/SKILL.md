---
name: brainstorming
description: >
  Structured design skill. Use before any implementation — when asked to build, add,
  create, or implement a feature. Turns an idea into an approved spec before any code
  is written. Trigger phrases: "build X", "implement X", "add feature", "let's design X",
  "brainstorm X", any feature request without an existing approved spec.
---

# Brainstorming

**Announce at start:** "I'm using the brainstorming skill to turn this into a design before we build."

## Hard Gate

**Do NOT invoke any implementation skill, write any plan, or produce any code until you have presented a design and the user has explicitly approved it.**

No exceptions. "Simple" projects often hide the most problematic assumptions.

## The Process

### Step 1 — Explore project context

Read the relevant files. Understand what already exists, what patterns are in use, what boundaries would be affected. Do not skip this — assumptions here cause wrong designs.

### Step 2 — Ask clarifying questions

Ask one clarifying question per message. Use multiple-choice when feasible. Keep asking until you understand:
- What problem this is solving
- What success looks like
- What's explicitly out of scope
- Any constraints (performance, auth, backward compatibility, etc.)

### Step 3 — Propose approaches

Present 2–3 alternative approaches with:
- A short name for each
- What it does
- Key trade-offs

Let the user pick one before proceeding.

### Step 4 — Write the spec

Save the agreed design to:

```
docs/plans/YYYY-MM-DD-<topic>-spec.md
```

The spec must include:
- **Goal** — what this achieves and why
- **Scope** — what is in, what is explicitly out
- **Design** — the chosen approach in enough detail that a plan can be written from it
- **Open questions** — anything still unresolved

Break the system into units with one clear purpose each, communicating through well-defined interfaces.

### Step 5 — Self-review

Before presenting, scan the spec for:
- [ ] TODOs, TBDs, or incomplete sections
- [ ] Internal contradictions
- [ ] Requirements ambiguous enough to cause two different implementations
- [ ] Scope creep (things not asked for)

Fix inline before showing.

### Step 6 — Dispatch spec reviewer subagent

Use the prompt template in `spec-document-reviewer-prompt.md` to dispatch a reviewer subagent. Pass the spec file path. Wait for the result.

If the reviewer returns **Issues Found**: fix the flagged issues in the spec and re-run the reviewer.

Only proceed when reviewer returns **Approved**.

### Step 7 — Get explicit user approval

Present the spec to the user. Do not proceed to planning until you receive explicit approval.

Accepted: "looks good", "approved", "go ahead", "yes", thumbs-up.  
Not accepted: silence, vague acknowledgement, questions that imply uncertainty.

---

## After Approval

Invoke the `writing-plans` skill to decompose the approved spec into an implementation plan.

---

## Common Mistakes

- Starting to write code or a plan before spec approval
- Combining multiple design questions in one message
- Treating "simple" requests as exempt from this process
- Writing a spec that still has open questions without flagging them
- Skipping the spec reviewer
