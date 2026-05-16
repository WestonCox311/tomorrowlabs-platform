# The Four-Layer Architecture

**Source artifact:** `../08-artifacts-archive/tomorrowlabs-data-architecture.html`
**Status:** Complete, all four layers built in SQL
**Last updated:** May 2026

---

## The argument

TomorrowLabs's data work happens at three timescales that demand different architectures:

- **Strategic decisions** (annual) — where to expand, which languages to serve. Need careful, cited, research-grade data.
- **Operational decisions** (weekly) — when to ship, how to price. Need accurate current-state data.
- **Real-time decisions** (continuous) — what to show this user right now. Need fast, contextual data.

Building one system for all three produces mediocre results across the board. The four-layer model treats them as distinct but connected.

## The four layers

### Layer 1 — Reference (foundation)
**The slow-moving truth about the world.**

- Canonical entities: languages, places, organizations, communities, frameworks
- Cadence: monthly to yearly
- Sources: Glottolog, GeoNames, academic catalogs
- Format: research-grade
- **Serves:** authoritative identity, shared vocabulary for everything above

### Layer 2 — Observational
**What is actually happening in the world.**

- Time-series data: demographics, tech evolution, regulatory shifts, migration flows
- Cadence: weekly to yearly
- Never overwritten — each row is a snapshot at a point in time
- Format: longitudinal
- **Serves:** trajectory analysis, impact measurement, trend detection

### Layer 3 — Operational
**The work TomorrowLabs is currently doing.**

- Active partnerships, deployments, products, content, users, finance, team
- Cadence: daily to hourly
- Integrated with operational tools (Asana, Stripe, product analytics)
- **Serves:** day-to-day operations, team's working memory

### Layer 4 — Decision Support
**Synthesized views that answer specific questions.**

- Not separate tables — curated views, dashboards, AI-assisted analyses
- Combines data from layers below
- Question-driven, audience-specific
- **Serves:** recurring decisions, board reporting, partnership transparency

## The cross-cutting strip (Layer 00)

Below all four layers — but conceptually outside them — sits the cross-cutting infrastructure:

- Sources, confidence, consent, audit log
- Identity resolution, privacy, access control

This is the **connective tissue** that makes the layers cohere. Without it, the system would be four disconnected datasets.

## The architectural commitments

Six commitments encoded *structurally*, not just stated in policy:

1. **Every fact carries provenance** — sources table referenced by every observation
2. **Every fact carries confidence** — confidence_level enum on every claim
3. **Consent sits above operational logic** — Layer 3 reads from consent_records, cannot override
4. **Time-series never overwrites** — append-only observational tables
5. **Community positions are first-class** — schema records both academic and community classifications
6. **Decisions close the loop** — every decision_log entry expects a decision_outcomes follow-up

## The single most important tension

Layer 3 (operational) is where commercial pressure lives. Layer 1 and 2 (reference and observational) are where humanitarian commitments live. They sometimes pull in different directions.

**When they conflict, which layer wins?**

Architecturally: the consent and rights infrastructure sits above operational logic, not within it. Layer 3 can read Layer 1/2 commitments but cannot override them. The schema enforces what the values claim. If the architecture doesn't enforce it, operational pressure will erode it over time.

## How it gets built

Phased over four moves, none of them complete in one heroic effort:

| Phase | What | When |
|-------|------|------|
| 1 | The Spine — places, organizations alongside languages | Q3 2026 |
| 2 | Observational Depth — demographics, market, infrastructure | Q4 2026 – Q1 2027 |
| 3 | Operationalize — connect to Asana, Stripe, analytics | Q2 2027 onwards |
| 4 | Decision Support — views and dashboards | Q3 2027 — ongoing forever |

## What the architecture alone can't do

Three pieces of infrastructure that sit outside the data model itself:

- **Data governance function** — someone whose job is data quality, identifier conflicts, consent management
- **Decision-making protocol** — when do we actually consult the data?
- **Community accountability** — how do partner communities review what we hold about them?

The architecture supports these. It doesn't create them.

---

**See also:**
- `architecture-map.md` — the complete table inventory
- `../03-schema/` — the actual SQL migrations
- `../05-decisions/decision-log.md` — where architectural decisions are tracked
