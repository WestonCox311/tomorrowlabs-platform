# Index by Question

Find the right document by the question you're trying to answer.

---

## Philosophy & values

**"What does TomorrowLabs believe about data?"**
→ `01-philosophy/data-philosophy-v1.md` (and the HTML version in `08-artifacts-archive/`)

**"What's the strongest critique of TomorrowLabs's data philosophy?"**
→ `01-philosophy/pressure-test.md`

**"How does TomorrowLabs handle community partnerships ethically?"**
→ See "community" section in the philosophy + the pressure-test critique #6

**"What is the commitment about consent?"**
→ Data philosophy belief #7 + the consent infrastructure in migration 005

**"What did TomorrowLabs commit to do by Q1/Q2 2027?"**
→ The "What this critique changes" section in the pressure-test document

## Architecture & design

**"What is TomorrowLabs's data architecture?"**
→ `02-architecture/four-layer-model.md` (and the HTML version)

**"What tables exist and where do they live?"**
→ `02-architecture/architecture-map.md` (and the HTML version)

**"Why is the schema designed this way?"**
→ The architecture map document explains the principles; the four-layer doc explains the framework

**"What does each layer of the architecture do?"**
→ Layer 1 (reference), 2 (observational), 3 (operational), 4 (decision support) — see four-layer-model.md

**"How does a strategic question flow through the layers?"**
→ The "Sample Cross-Layer Query" section of the architecture map

## Schema & implementation

**"How do I run the schema in a real database?"**
→ `03-schema/README.md` — implementation notes for running migrations against Supabase

**"What does the [X] table look like?"**
→ Search the relevant migration file in `03-schema/`

**"How do I add a new table?"**
→ See the architectural principles in `02-architecture/four-layer-model.md` — every new table maps to a layer

**"Where is the schema documented for non-engineers?"**
→ The original schema catalog spreadsheet in `08-artifacts-archive/` (note: outdated, covers migrations 000-002)

## Languages & strategy

**"Which languages does TomorrowLabs prioritize?"**
→ `04-roadmaps/babagigi-demand-roadmap.md` — current version with waves

**"Why was Tagalog elevated to Wave 1?"**
→ Decision: 33% of speakers are 60+, strongest grandparent demographic — see decision log

**"What's the difference between Wave 1 (commercial) and Wave 4 (mission)?"**
→ Roadmap doc — commercial waves are demand-driven, mission waves are cross-subsidized

**"How did Omnilingual change the language tech landscape?"**
→ Migration 001 + the language data reference library entry for Omnilingual

## Decisions & governance

**"Where is the decision log?"**
→ `05-decisions/decision-log.md`

**"How are strategic decisions made?"**
→ The decision_protocols table in migration 006 — eight protocols seeded for different decision types

**"What metrics does TomorrowLabs track?"**
→ The metric_definitions table in migration 006

## Gaps & deferred work

**"What hasn't been built and why?"**
→ `07-honest-gaps/overview.md` (and the HTML omissions document)

**"What requires community co-authorship before it can be built?"**
→ `07-honest-gaps/deferred-items.md` — three of the five still-deferred items

**"What's the next thing that should be addressed?"**
→ Check the migration 007 closing notes; see also `00-start-here/04-where-we-left-off.md`

## External references

**"Where does the data come from?"**
→ `06-reference/language-data-reference-library.md`

**"What's Glottolog and why is it the backbone?"**
→ Reference library + the architecture map's discussion of structural identifiers

**"What's Common Voice?"**
→ Reference library

## Operational questions

**"What's TomorrowLabs's organizational structure?"**
→ For-profit + nonprofit arm in formation; Weston (founder), various contractors

**"Who are the active partners?"**
→ Migration 003 seed data + `02-architecture/architecture-map.md` partner section

**"What products exist and what stage are they at?"**
→ Migration 005 seed data (products table) + the orientation doc

---

## Index by audience

If you're showing this work to someone, here's what to point them at first:

**For a funder:** Start with the data philosophy HTML, then the architecture map HTML
**For a board candidate:** Add the pressure-test document — it demonstrates serious self-critique
**For a technical co-founder:** The migration SQL files, plus the architecture map
**For a partnership conversation:** The philosophy + the architectural omissions (especially honest-gaps section)
**For Amdal (operational):** The four-layer architecture doc + migration 005 (operational) + 006 (decision support)

---

**Next:** `04-where-we-left-off.md` for the running status log.
