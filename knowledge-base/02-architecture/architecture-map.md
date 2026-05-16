# The Architecture Map

**Source artifact:** `../08-artifacts-archive/tomorrowlabs-architecture-map.html`
**Status:** Complete inventory through migration 007
**Last updated:** May 2026

---

## The complete table inventory

### Layer 1 — Reference (~30 tables)

**The Spine — canonical entities:**
- `languages` — Glottolog-anchored, hierarchical
- `places` — GeoNames-anchored, with indigenous-territory and community-designated support
- `organizations` — partners, funders, peers, vendors
- `communities` — diaspora/religious/indigenous groups that cross places and languages

**Language detail tables:**
- `speaker_populations`, `tech_readiness`, `cultural_dimensions`
- `orthographies`, `audio_corpora`, `documentation_status`
- `institutional_support`, `geographic_concentrations`
- `community_positions`, `reference_identifiers`

**Place detail tables:**
- `organization_place_presence`

**Organization detail tables:**
- `organization_relationships`, `organization_financial_profile`
- `organization_programs`, `organization_interactions`

**Partnership-specific:**
- `field_partnerships`, `funding_landscape`
- `revitalization_programs`, `revitalization_summary`, `product_status`

**People (migration 007):**
- `people`, `person_roles`

### Layer 2 — Observational (~15 tables)

**Meta-registry:**
- `observation_registry` — catalogs what's tracked and at what cadence

**Place-level observations:**
- `place_demographics`, `place_economic_indicators`
- `place_infrastructure`, `place_regulatory_environment`
- `place_cultural_calendar`, `place_health_safety`

**Cross-entity dynamics:**
- `migration_flows`, `language_place_presence`, `community_state`

**Technology & sector intelligence:**
- `tech_readiness_history`, `sector_events`
- `funding_flows`, `publications`

**Regulatory & trust:**
- `regulatory_events`, `community_trust_signals`

**Language-specific (from earlier migrations):**
- `vitality_assessments`, `transmission_assessments`, `domain_usage`

### Layer 3 — Operational (~20 tables)

**Programs & deployments:**
- `programs`, `deployments`, `products`

**Content & users:**
- `content_items`, `users`, `user_households`

**Consent (sits above operational):**
- `consent_records`

**Finance & accountability:**
- `financial_flows`, `grants_active`, `benefit_sharing_agreements`

**Team, communications, risk:**
- `team_members`, `communications`
- `operational_risks`, `infrastructure_dependencies`

### Layer 4 — Decision Support (mostly views)

**Protocols & outcomes:**
- `decision_protocols`, `decision_outcomes`
- `ai_synthesis_runs`, `metric_definitions`, `dashboards`

**Strategic views (board & leadership):**
- `board_state_summary`, `quarterly_strategic_review`
- `language_strategic_scorecard`, `exposure_dashboard`
- `protocols_due_for_review`, `decision_learning_health`
- `partner_facing_accountability`

**Operational views:**
- `active_work_summary`, `upcoming_obligations`
- `active_risk_dashboard`, `program_financial_summary`
- `benefit_sharing_accountability`

### Cross-cutting infrastructure (Layer 00)

- `sources`, `decision_log`
- `confidence_level` (enum used everywhere)
- `access_control_policies`, `access_log`
- `consent_audit_chain`

## The spine — four canonical anchors

Every other table in the system references one or more of these:

```
Languages ─┐
           ├─── joined by ─── Demand, Capability,
Places ────┤                  Partnership, Active Work
           │                  (all the supporting tables)
Organizations ─┤
               │
Communities ───┘ (cross-cuts the other three)
```

## How a strategic question crosses layers

Example: *"Which Wave 4 mission-track languages have moved into deployment readiness since Omnilingual, and where do we have trusted partners with active programs that could deliver them?"*

| Layer | Tables consulted |
|-------|-----------------|
| L1 Reference | languages, places, organizations, communities |
| L2 Observational | tech_readiness_history, sector_events, migration_flows, community_trust_signals |
| L3 Operational | organization_relationships, programs, deployments, benefit_sharing_agreements |
| L4 Decision Support | tech_watershed_moments, deployment_readiness_assessment, language_strategic_scorecard, decision_protocols |

No single layer answers this question. The architectural value comes from cross-layer composition.

## What's seeded vs. unpopulated

The architecture is fully designed. Most tables have minimal seed data demonstrating structure. None are populated with production data. See `../00-start-here/02-what-exists.md` for the current state per migration.

---

**See also:**
- `four-layer-model.md` — the framework these tables implement
- `../03-schema/` — the actual SQL files
- `../07-honest-gaps/` — what's NOT in this map and why
