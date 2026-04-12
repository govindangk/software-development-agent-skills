# jira-ticket-creation

Creates structured JIRA tickets from code analysis. Performs a gap analysis before drafting, surfaces ambiguous requirements, and requires explicit confirmation before creating or updating anything on JIRA.

## Trigger

Use any of: "create a JIRA ticket", "draft a story", "log this as a bug", "write up a task", "open a ticket"

## Behavior

1. Analyze the referenced code or description thoroughly.
2. Connect to JIRA via MCP.
3. Identify and surface requirement gaps (ambiguous scope, missing edge cases, unclear ownership).
4. Present the gap analysis and proposed ticket draft for review.
5. Ask for explicit confirmation before creating or updating the ticket.

No TypeScript code samples are included in ticket bodies.

## Gap analysis checklist

Before drafting, the skill checks for:
- Unclear or missing acceptance criteria
- Ambiguous scope boundaries (in vs. out)
- Unidentified dependencies or affected systems
- Missing non-functional requirements (performance, security, accessibility)
- No clear owner or team assignment

## Ticket structure

| Field | Format |
|---|---|
| Type | `User Story` / `Bug` / `Task` |
| Summary | `[Verb] [object] so that [outcome]` |
| Description | Context, Problem/Goal, Scope, Dependencies |
| Acceptance Criteria | Specific, testable checkboxes |
| Technical Notes | Label (tech-debt / performance / feature / bug) |

> Tickets are marked as AI-generated and flagged for human review before implementation.
