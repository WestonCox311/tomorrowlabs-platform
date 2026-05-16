# Overview — All Architectural Omissions

**Source artifact:** `../08-artifacts-archive/tomorrowlabs-architectural-omissions.html`

This is the summary view. For the full treatment with reasoning, see the HTML document.

---

## The four reasons something didn't get built

- **Deferred** — Right table, wrong time
- **Scope** — Worth building eventually, not now
- **Avoid Rebuild** — Existing system does it better
- **Honest Gap** — We should have, or the question is too hard for the current team alone

---

## Layer 1 (Reference) — what wasn't built

| Item | Reason | Status |
|------|--------|--------|
| `people` | Honest Gap | **Built** in migration 007 |
| `frameworks_and_classifications` | Deferred | Still deferred |
| `standards_and_protocols` | Deferred | Still deferred |
| `indigenous_territories` (as distinct table) | Scope | Handled within `places` via granularity enum |
| `religious_traditions` | Deferred | Still deferred |

## Layer 2 (Observational) — what wasn't built

| Item | Reason | Status |
|------|--------|--------|
| `climate_observations` | Honest Gap | **Still deferred** (see `deferred-items.md`) |
| `conflict_and_political_events` | Honest Gap | **Still deferred** (see `deferred-items.md`) |
| `educational_outcomes_longitudinal` | Deferred | Still deferred — handled by aggregation in place_demographics |
| `news_and_media_mentions` | Avoid Rebuild | Use Google Alerts, Mention.com, etc. |
| `community_internal_dynamics` | Honest Gap | **Still deferred** (requires community co-authorship) |
| `economic_indicators_micro_level` | Scope | Still deferred — current data goes to metro level |

## Layer 3 (Operational) — what wasn't built

| Item | Reason | Status |
|------|--------|--------|
| `tasks` / `kanban` / `project_management` | Avoid Rebuild | Use Asana, ClickUp, Linear, Notion |
| `payments` / `transactions` / `accounting` | Avoid Rebuild | Use Stripe, QuickBooks, Bill.com |
| `product_analytics` / `user_behavior_events` | Avoid Rebuild | Use Mixpanel, Amplitude, PostHog |
| `grants_pipeline` (vs `grants_active`) | Deferred | Still deferred — `funding_landscape` covers it for now |
| `incidents` / `postmortems` | Deferred | Still deferred — first real incident will shape the schema |
| `community_co_governance_records` | Honest Gap | **Still deferred** (requires community co-authorship) |
| `vendor_contracts` / `legal_agreements` | Scope | Still deferred — currently scattered across tables |
| `internal_knowledge_base` | Scope | Still deferred — this docs site partially addresses |

## Layer 4 (Decision Support) — what wasn't built

| Item | Reason | Status |
|------|--------|--------|
| `scenario_models` | Deferred | Still deferred — tied to first major fundraising scenario need |
| `comparative_benchmarks` | Deferred | Still deferred — `metric_definitions` has `external_benchmark` field |
| `community_facing_dashboards` (as schema) | Honest Gap | **Still deferred** (requires community co-authorship) |
| `ml_model_performance_tracking` | Scope | Still deferred — needs 12-18 months of synthesis data first |
| `public_reports_archive` | Deferred | Still deferred — tied to first annual report |

## Cross-cutting — what wasn't built

| Item | Reason | Status |
|------|--------|--------|
| `access_control_policies` (as schema) | Honest Gap | **Built** in migration 007 |
| `data_quality_assertions` | Deferred | Still deferred — use dbt tests or Great Expectations when needed |
| `consent_audit_chain` | Honest Gap | **Built** in migration 007 |
| `identity_resolution_table` | Scope | Still deferred — needs first cross-source confusion to surface |

## Summary: built vs. still deferred

**Built since omissions document (in migration 007):**
- people
- access_control_policies
- consent_audit_chain

**Still deferred:**
- Climate observations
- Conflict and political events
- Community internal dynamics ⓘ
- Community co-governance records ⓘ
- Community-facing dashboards ⓘ
- Plus ~10 other scope/deferred/avoid-rebuild items

ⓘ = Cannot be designed without community co-authorship. See `deferred-items.md`.

## The hardest omission

The architectural omissions document named one omission as the most consequential, sitting separately from the layer-by-layer analysis:

**Community co-authorship of the schema itself.**

Every table in this architecture was designed by Weston working with an AI assistant, with no partner community member in the room when structural choices were made. The omissions tagged "honest-gap" related to community modeling are attempts to surface where this matters most — but the fact that they were tagged at all (rather than built blindly) doesn't fully address the underlying issue.

The next version of this architecture needs community co-authorship of the schema itself, not just review of what was built. Schema design is a relational act.

---

**See also:**
- `deferred-items.md` — detail on the five items still deferred
- `../08-artifacts-archive/tomorrowlabs-architectural-omissions.html` — full reasoning
- `../05-decisions/decision-log.md` — the decisions that resulted in each deferral
