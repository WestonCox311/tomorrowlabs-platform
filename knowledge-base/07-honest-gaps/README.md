# Honest Gaps

What hasn't been built, organized by why. This folder is the accountability infrastructure for the architecture — the place where deferrals stay visible rather than getting forgotten.

## Documents in this folder

| Document | What it is |
|----------|-----------|
| `overview.md` | Summary of all architectural omissions with the four-category taxonomy |
| `deferred-items.md` | The five honest-gap items still deferred, with status and resolution paths |

The original comprehensive document lives at `../08-artifacts-archive/tomorrowlabs-architectural-omissions.html`.

## The four reasons something doesn't get built

| Tag | Meaning |
|-----|---------|
| **Deferred** | Right table, wrong time. Will be built when conditions are right. |
| **Scope** | Worth building eventually. Not necessary for current decisions. |
| **Avoid Rebuild** | Existing system does this better. Integration, not duplication. |
| **Honest Gap** | We should have built it, or the question is too hard for the current team alone. Named to make accountable. |

## What's been built since the omissions document

Three honest-gap items got built in migration 007:
- `people` (with privacy-respecting design)
- `access_control_policies` (structural rather than policy-only)
- `consent_audit_chain` (immutable audit trail)

## What remains deferred

Five items, each in `deferred-items.md`:

| Item | Why deferred |
|------|-------------|
| `climate_observations` | Scope decision |
| `conflict_and_political_events` | Scope decision |
| `community_internal_dynamics` | Requires community co-authorship |
| `community_co_governance_records` | Requires community co-authorship |
| `community_facing_dashboards` | Requires community co-authorship |

## Why this folder exists

Most architectures hide their omissions. This one surfaces them, because:

1. **Hidden gaps drift indefinitely.** Tracked gaps get addressed.
2. **Funders trust organizations that name their limits.** Pretending to completeness is less credible than honest accounting.
3. **The community co-authorship deferrals are themselves a commitment.** Saying "we won't design this alone" is a relational stance, not just a scheduling choice.

## When to update this folder

- When a deferred item gets built — move it from "deferred" to "built" in the relevant document and add to the decision log
- When a new honest-gap is identified — add it here before the temptation to forget it sets in
- When the reasoning changes — update the resolution path explicitly

The point of writing these down is to make the gaps maintainable, visible enough that they get addressed when conditions permit.

---

**See also:**
- `../08-artifacts-archive/tomorrowlabs-architectural-omissions.html` — the original comprehensive document
- `../03-schema/migration-007-honest-gaps-urgent.sql` — the three honest-gap items that got built
