# Where We Left Off

A running log of the state of the work. **Update this whenever you make significant progress** so the future-you can pick up cleanly.

---

## As of May 16, 2026

### State of the work

The **architecture phase is complete**. Seven SQL migrations defining ~75 tables across four layers. Five HTML foundational documents. Two strategic roadmaps. One reference library. Two markdown reference files. This knowledge base structure.

The **implementation phase has not begun**. No database is running. No data is populated beyond seed examples. No operational integrations exist.

### What was just finished

- **Migration 007 (honest-gaps urgent)** — three of the eight tables tagged honest-gap got built: `people`, `access_control_policies`, `consent_audit_chain`. The remaining five are explicitly deferred (three for community co-authorship, two for scope reasons).
- **Architectural omissions document** — comprehensive catalog of what wasn't built and why
- **Architecture map document** — visual reference for the complete system as built
- **This knowledge base structure** — organized home for everything

### What's deferred and visible

Five honest-gap items remain unbuilt and tracked in `07-honest-gaps/`:

| Item | Why deferred |
|------|-------------|
| `climate_observations` | Scope decision — build when a deployment is materially affected |
| `conflict_and_political_events` | Scope decision — build when a conflict event affects a partnership |
| `community_internal_dynamics` | Requires community co-authorship |
| `community_co_governance_records` | Requires community co-authorship |
| `community_facing_dashboards` | Requires community co-authorship |

### Active commitments with deadlines

From the pressure-test document:

| Commitment | Deadline | Status |
|-----------|----------|--------|
| Negotiate benefit-sharing formulas with three field partners | Q2 2027 | Placeholder agreement seeded; real terms not yet negotiated |
| Establish irrevocable archive partnerships for community data | End of 2027 | Not started |
| Draft sunset clause for organizational failure | Q4 2027 | Not started |
| Co-design v2 philosophy with community co-authorship | Within 12 months of May 2026 | Not started |
| Build community-override mechanisms for products | Q4 2026 | Not started |

### Next moves (when you come back)

The decision about what to do next was made on May 16, 2026: **build this documentation site first**. That's now done.

The next concrete options, in rough order of preference:

1. **Run the schema in Supabase** (2-4 weeks) — Take migrations 000-007, run them in order against a Supabase project. Populate the spine entities (languages, places, organizations, communities) with ~100-200 real rows. The output: a real queryable database.

2. **Execute one decision protocol end-to-end** (~1 month) — Pick `STRAT-BB-WAVE` (Babagigi Next Wave Assignment). Walk through it manually using the existing views. Make the wave assignment decision. Log it. Six months later, assess the outcome.

3. **Update the schema catalog spreadsheet** — The xlsx in `08-artifacts-archive/` is outdated, covering only migrations 000-002. A refresh would catch it up to 007.

4. **Begin community co-authorship conversations** — Start the relational work that would eventually let the deferred community-dependent gaps be designed properly. Probably starts with Golden Leaf Foundation.

### Open questions to think about

- **Does Amdal need access to this?** Currently configured as personal knowledge base. If/when Amdal is going to engage with the data work, this structure should be migrated to Notion or a shared system.
- **When does the database actually need to exist?** The architecture is ready, but population takes effort. What's the forcing function?
- **Which decision protocol is most important to test first?** The choice affects which views and tables get populated first.

---

## Log format for future updates

When updating this document, follow this pattern:

```
## As of [DATE]

### What changed since last update
- ...

### What's now next
- ...

### Open questions
- ...
```

Don't delete old entries — let the history accumulate. The trajectory is part of the value.

---

## Previous entries

*(None yet — this is the first entry.)*
