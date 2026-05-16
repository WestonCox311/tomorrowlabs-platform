# Deferred Items

The five honest-gap items still deferred, with status, resolution paths, and the conditions that would trigger building them.

---

## Community-dependent gaps (3)

These cannot be designed without community co-authorship. Building them alone would replicate exactly the problem the philosophy claims to be against.

### `community_internal_dynamics`

**Where it would live:** Layer 2 (Observational)

**What it would track:** Internal heterogeneity within communities — generational divides, political differences, religious factions, class stratification. Currently the `community_state` table touches "generational tension notes" but doesn't seriously model these dynamics.

**Why it's deferred:** Modeling internal community dynamics is genuinely hard — and harder still without community co-authorship of the schema. Building it alone would be presumptuous about which dynamics matter and how they should be classified.

**Resolution path:** Co-design with at least one partner community at the schema design stage, not just review of what was built. Pair with the v2 philosophy co-authorship work.

**Trigger to build:** First community partner conversation where TomorrowLabs is invited to model these dynamics. Not before.

---

### `community_co_governance_records`

**Where it would live:** Layer 3 (Operational)

**What it would track:** Community review and governance moments — when communities reviewed decisions, what they said, what changed as a result. The structural infrastructure for the pressure-test commitment to community co-governance by Q1 2027.

**Why it's deferred:** The governance mechanism itself is still being designed. Building a schema before the practice exists would presuppose the answer.

**Resolution path:** Co-design the schema alongside the actual co-governance practice, with at least one partner community involved in the table design itself.

**Trigger to build:** First formal community governance moment (e.g., a partner community reviewing a major TomorrowLabs decision).

---

### `community_facing_dashboards` (as schema)

**Where it would live:** Layer 4 (Decision Support)

**What it would track:** What communities can see about TomorrowLabs's work in their context, how feedback flows back. The `partner_facing_accountability` view exists but the schema doesn't yet structure what a community-facing dashboard should actually contain.

**Why it's deferred:** Community-facing dashboards designed without community input would themselves be a betrayal of the philosophy. The UX and governance questions are inseparable from the schema design.

**Resolution path:** Co-design with one partner community first, learning what they actually want to see. Build slowly.

**Trigger to build:** First partner community expresses interest in or asks about TomorrowLabs's transparency mechanisms.

---

## Scope-decision gaps (2)

These are worth building eventually but aren't necessary for current decisions or current scale of work.

### `climate_observations`

**Where it would live:** Layer 2 (Observational)

**What it would track:** Climate change effects on places where TomorrowLabs operates — sea level rise in Cambodian river delta, drought in Guatemalan highlands, extreme heat in Mexico City, wildfire smoke in Portland.

**Why it's deferred:** Climate data is voluminous and easily becomes overwhelming. Picking the right subset that's actually decision-relevant requires thought we haven't given it. The `place_health_safety` table has `climate_vulnerability_index` and `recent_climate_events` as starter fields.

**Resolution path:** Add focused climate observation tables when a specific deployment decision is actively affected by climate considerations. Build narrowly, not comprehensively.

**Trigger to build:** First time a deployment decision needs to evaluate climate trajectory as a primary input.

---

### `conflict_and_political_events`

**Where it would live:** Layer 2 (Observational)

**What it would track:** Political instability, conflict escalation, regime changes, civil unrest in places where TomorrowLabs operates or has partners.

**Why it's deferred:** Partly squeamishness — TomorrowLabs's instinct is to focus on positive work, and explicitly cataloging conflict feels uncomfortable. That discomfort is exactly why it should be structured eventually. The `regulatory_events` and `place_health_safety` tables touch related territory.

**Resolution path:** Add when a conflict event affects an active partnership or deployment. The table should exist before it's needed urgently.

**Trigger to build:** First conflict-related event that materially affects partnership operations.

---

## Review cadence

Re-read this document every 3 months to ask:
1. Has the trigger condition for any deferred item occurred?
2. Has the resolution path changed?
3. Should the deferral be re-justified or is it drifting into inertia?

Next scheduled review: **August 2026**

## Adding new deferrals

When a new architectural decision results in deferral:

1. Add an entry here following the template above
2. Update the decision log with the reasoning
3. Reference both from `00-start-here/04-where-we-left-off.md`

## When something gets built

When a deferred item is built:

1. Remove it from this document
2. Note the date and reasoning in `decision-log.md`
3. Add it to `00-start-here/02-what-exists.md` artifact inventory
4. Reference the migration file that contains it
