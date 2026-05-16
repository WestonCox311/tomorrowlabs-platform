# What Exists — Artifact Inventory

Complete inventory of every significant artifact produced. Each entry includes what it is, where it lives in this knowledge base, and what state it's in.

---

## Foundational documents (HTML, designed)

These are the polished centerpiece artifacts. They live in `08-artifacts-archive/` as HTML files and are referenced from this knowledge base.

| Document | What it is | Status |
|----------|-----------|--------|
| **Data Philosophy v1** | Seven core beliefs about how TomorrowLabs treats data, with five operational commitments | Complete, marked as provisional pending community co-authorship |
| **Philosophy Pressure-Test** | Six adversarial critiques of the philosophy with honest responses | Complete |
| **Four-Layer Architecture** | The architectural framework: reference → observational → operational → decision support | Complete |
| **Architecture Map** | Complete inventory of every table mapped to its layer with relationships | Complete |
| **Architectural Omissions** | What wasn't built, with reasons (deferred, scope, avoid-rebuild, honest-gap) | Complete |

## Schema & migrations (SQL)

The actual data architecture. Seven SQL migrations totaling ~75 tables. Live in `03-schema/`.

| Migration | What it adds | State |
|-----------|-------------|-------|
| 000 (foundational) | Initial language database — 21 tables | Schema + seed data |
| 001 | Omnilingual & Common Voice extensions | Schema |
| 002 | Language depth — vitality, transmission, orthographies, documentation | Schema + partial seed |
| 003 | Phase 1 spine — places, organizations, communities | Schema + seed data |
| 004 | Layer 2 observational — time-series across all dimensions | Schema + minimal seed |
| 005 | Layer 3 operational — programs, deployments, products, content, consent, finance, risk | Schema + seed data |
| 006 | Layer 4 decision support — protocols, outcomes, metrics, strategic views | Schema + 8 seeded protocols |
| 007 | Honest gaps urgent — people, access control, consent audit chain | Schema + 6 seeded policies |

**Status:** None of these have been run against a real database yet. Files are ready to execute against Supabase.

## Strategic documents

| Document | What it is | Location |
|----------|-----------|----------|
| Babagigi Language Roadmap | First version of language waves (cartographer aesthetic) | `04-roadmaps/` |
| Babagigi Demand-First Roadmap | Rebuilt version with commercial/mission track toggle | `04-roadmaps/` |
| Schema Catalog Spreadsheet | 23-sheet xlsx documenting all tables (through migration 002) | `08-artifacts-archive/` |

**Note:** The schema catalog is out of date — it predates migrations 003-007. See `03-schema/README.md` for the current state.

## Reference materials

| Document | What it is | Location |
|----------|-----------|----------|
| Language Data Reference Library | URLs and descriptions of external sources (Glottolog, GeoNames, etc.) | `06-reference/` |
| Language Data URLs | Clean URL list, one per line | `06-reference/` |

## Decisions documented

Major decisions made during the design work:

- **Glottolog as backbone** — committed to using Glottolog as primary linguistic identifier system, ISO 639-3 as required secondary, community positions can override
- **Four-layer architecture** — chose layered model over flat schema or microservices
- **Consent above operational** — consent layer structurally sits above operational logic, cannot be overridden
- **Time-series never overwrites** — observational data appends, never updates
- **Community-dependent gaps deferred** — three honest-gaps cannot be designed without community input

See `05-decisions/` for the full decision log.

## What does NOT yet exist

- **Running database** — schema files exist but haven't been executed
- **Populated data** — beyond seed examples, no real data flows
- **Operational integrations** — no connection to Asana, Stripe, product analytics
- **Community-facing dashboards** — deferred pending community co-design
- **Community internal dynamics modeling** — deferred pending community co-design
- **Community co-governance records** — deferred pending community co-design
- **Climate observations table** — deferred to scope decision
- **Conflict & political events table** — deferred to scope decision
- **Babagigi product** — beta stage, not yet publicly launched
- **LDL devices** — design stage, no field deployments yet
- **Active benefit-sharing agreements** — committed but terms not negotiated (target Q2 2027)

See `07-honest-gaps/` for the full treatment of what's deferred.

## File-level inventory

Every original artifact, with its file path in this knowledge base:

```
01-philosophy/
├── data-philosophy-v1.md (markdown summary)
└── (links to 08-artifacts-archive/tomorrowlabs-data-philosophy.html)

01-philosophy/
├── pressure-test.md (markdown summary)
└── (links to 08-artifacts-archive/tomorrowlabs-philosophy-pressure-test.html)

02-architecture/
├── four-layer-model.md (markdown summary)
├── architecture-map.md (markdown summary)
└── (links to HTML artifacts in 08-artifacts-archive/)

03-schema/
├── migration-000-initial.sql
├── migration-001-omnilingual-cv-ipa.sql
├── migration-002-depth.sql
├── migration-003-places-organizations.sql
├── migration-004-layer-2-observational.sql
├── migration-005-layer-3-operational.sql
├── migration-006-layer-4-decision-support.sql
├── migration-007-honest-gaps-urgent.sql
└── README.md (overview)

04-roadmaps/
├── babagigi-language-roadmap.md
└── babagigi-demand-roadmap.md

05-decisions/
├── decision-log.md
└── README.md

06-reference/
├── language-data-reference-library.md
└── language-data-urls.md

07-honest-gaps/
├── overview.md (markdown summary)
├── deferred-items.md (the five still-deferred items with status)
└── (links to 08-artifacts-archive/tomorrowlabs-architectural-omissions.html)

08-artifacts-archive/
├── tomorrowlabs-data-philosophy.html
├── tomorrowlabs-philosophy-pressure-test.html
├── tomorrowlabs-data-architecture.html
├── tomorrowlabs-architecture-map.html
├── tomorrowlabs-architectural-omissions.html
├── tomorrowlabs-language-schema-catalog.xlsx
├── babagigi-language-roadmap.jsx
└── babagigi-demand-roadmap.jsx
```

---

**Next:** See `03-index-by-question.md` to find documents by the question you're trying to answer.
