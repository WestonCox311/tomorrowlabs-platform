# Architecture

The four-layer data architecture and its complete inventory. This is the reference for *how* TomorrowLabs's data infrastructure is shaped.

## Documents in this folder

| Document | What it is |
|----------|-----------|
| `four-layer-model.md` | The four-layer framework: reference, observational, operational, decision support |
| `architecture-map.md` | Complete inventory of every table mapped to its layer |
| `cross-cutting-concerns.md` | Sources, confidence, consent, audit — the infrastructure that runs through every layer |

## The four layers in one paragraph

**Layer 1 (Reference)** holds canonical truth — languages, places, organizations, communities. Slow-moving, citation-grade. **Layer 2 (Observational)** holds time-series data about how the world changes — demographics, tech, regulatory shifts. Never overwritten. **Layer 3 (Operational)** holds TomorrowLabs's active work — programs, deployments, products, content, consent, finance. High-velocity. **Layer 4 (Decision Support)** synthesizes everything below into views and protocols for actual decisions.

## Why this shape

Most organizations conflate these layers and build one system that's mediocre at all three timescales (strategic, operational, real-time). The four-layer model treats them as distinct but connected, with cross-cutting infrastructure ensuring coherence.

The architectural commitment that matters most: **consent infrastructure sits structurally above operational logic, not within it**. Operational pressure cannot override community commitments because the schema prevents it.

## What's actually built

All four layers exist in SQL (see `../03-schema/`). ~75 tables total. The architecture is fully designed; population is the next phase of work.

## Cross-cutting infrastructure

Seven concerns run through every layer:
- **Sources** — every fact resolves to a citation
- **Confidence** — every fact carries a confidence level
- **Consent** — operational logic reads from consent_records, cannot override
- **Audit** — timestamps and decision logs throughout
- **Identity resolution** — UUID primary keys with cross-system mapping
- **Privacy** — sensitivity classifications on PII columns
- **Access control** — structural policies, not just developer discipline
