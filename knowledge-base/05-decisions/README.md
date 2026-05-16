# Decisions

Where significant decisions get logged with their reasoning. The audit trail of TomorrowLabs's organizational thinking.

## How decisions get tracked

Two levels:

**Strategic decisions** are logged in this folder as markdown entries in `decision-log.md`. These are decisions about direction, partnerships, architecture, philosophy.

**Operational decisions** flow through the `decision_log` and `decision_outcomes` tables in the database (when implemented). These are decisions about wave assignments, deployment locations, partnership prioritization.

## What goes in the strategic decision log

The strategic log is for decisions that:
- Affect TomorrowLabs's direction for 12+ months
- Establish a principle or commitment
- Reverse or significantly revise prior thinking
- Affect partnerships materially
- Require board or external visibility

What does NOT go here:
- Day-to-day operational choices
- Minor product decisions
- Schema additions (those go in migrations)

## Format for each entry

```markdown
## [Date]: [Decision title]

**Context:** Why this decision was needed.

**Options considered:** What alternatives were on the table.

**Decision:** What was chosen.

**Rationale:** Why this option won.

**Who decided:** Who was in the room.

**Revisit when:** What conditions would prompt revisiting.

**Related artifacts:** Documents or code this decision affected.
```

Don't delete old entries. If a decision is reversed, log the reversal as a new entry referencing the original.

## Why this matters

A year from now, you won't remember why you chose Glottolog over Wikidata. Six months from now, Amdal will ask why Cantonese is in Wave 1. Two years from now, a board member will ask why TomorrowLabs is for-profit rather than nonprofit.

The decision log is the answer to those questions, captured at the moment when the reasoning was fresh.

## Reading the log

The decision log is in `decision-log.md`. Entries are in reverse chronological order — newest first.
