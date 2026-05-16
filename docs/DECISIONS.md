# Development Decisions

Decisions made during code implementation, kept as an audit trail. Different from `knowledge-base/05-decisions/decision-log.md` which holds strategic decisions.

This log is for development-level decisions: "we chose Next.js over SvelteKit," "we used shadcn/ui rather than building components from scratch," "we deferred dark mode to a later phase."

---

## Format

```markdown
## YYYY-MM-DD — Brief title

**Decision:** What was decided.
**Context:** Why this decision came up.
**Alternatives considered:** What else was on the table.
**Reasoning:** Why this option won.
**Reversibility:** Easy / moderate / hard to reverse.
**Decided by:** Who (usually Weston + Claude Code).
**Revisit when:** Conditions that would prompt revisiting.
```

---

## Decisions

*(None yet — this file will populate as development proceeds.)*

---

## Conventions for this log

- Newest decisions at the top
- Don't delete entries — reversed decisions get new entries that reference the original
- Keep entries concise but complete — future-you should understand the reasoning without reconstructing the context
- Only log decisions worth remembering. Routine choices ("we used `useState` here") don't need entries. Architectural or directional choices do.

## What goes here vs. CLAUDE.md vs. knowledge-base

| Type of decision | Where it lives |
|------------------|----------------|
| Strategic / philosophical | `knowledge-base/05-decisions/decision-log.md` |
| Architectural commitments | `CLAUDE.md` (these don't change) |
| Code conventions | `docs/CONVENTIONS.md` |
| Implementation choices | This file (`docs/DECISIONS.md`) |
| Routine "how should I code this" | Nowhere — just code it |

When in doubt, log it. The cost of an extra entry is low; the cost of forgotten reasoning is high.
