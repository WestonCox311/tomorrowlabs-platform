# Current Task

**What's currently being worked on.** Updated at the start and end of every Claude Code session.

---

## In progress

Nothing actively in flight.

---

## Last completed

**Language models + Places hierarchy — 2026-05-17**

| Shipped | What |
|---------|------|
| migration-013 | English added to Babagigi (wave-1, live, glottocode stan1293) |
| migration-014 | `language_models` table — tracks TTS/STT/LLM/translation/G2P resources per language |
| seed:whisper | Whisper Large v3 STT coverage (~97 languages, provider=openai, quality=production) |
| seed:mms | Meta MMS ASR + TTS coverage (~1,107 languages, quality=usable, license=cc-by-nc-4.0) |
| seed:huggingface | HuggingFace top TTS+STT models (449 TTS + 467 STT rows, 916 total) |
| Language detail page | New Language Models section: grouped by type, edit/delete, + Add link |
| /admin/language-models | New + edit forms for individual model resources |
| /admin/readiness | Language Readiness Dashboard — all Babagigi wave languages with tech tiers, vitality, speakers, wave badges, sortable columns |
| Sidebar | "Decisions" section with Readiness link |
| Places detail page | Redesigned: parent breadcrumb, parent field as clickable link, Subdivisions section (child places), Languages section (merged from primary_languages_used + geographic_concentrations) |
| seed:geonames-admin1 | Script to seed ~3,900 first-level admin divisions for all 252 countries from GeoNames TSV |

**Phase 1–3 + Phase 4 (partial) — complete as of 2026-05-16**

All planned tasks through Task 10 are done, plus additional Phase 4 work:

| Task | What shipped |
|------|-------------|
| 01 | Next.js 15 project setup, Supabase connection, Tailwind, shadcn/ui |
| 02 | Reconstructed migration-000 (21-table language DB) |
| 03 | TypeScript types generated from Supabase schema |
| 04 | Auth: login/logout, protected layout |
| 05 | Languages CRUD: list, detail, create, edit (with pagination) |
| 06 | Places CRUD: list, detail, create, edit |
| 07 | Organizations CRUD: list, detail, create, edit |
| 08 | Communities CRUD: list, detail, create, edit |
| 09 | Sidebar nav, breadcrumbs, empty states |
| 10 | Real data: Glottolog CLDF (8,618 languages), GeoNames (252 countries), migration-008 curated (27 Babagigi languages, 6 communities, 9 organizations) |
| — | Phase 4: Relationship enrichment on detail pages (language↔community↔place) |
| — | Phase 4: Interactivity — server pagination, clickable rows, copy-to-clipboard, InfoTooltips on all columns |
| — | Phase 4: Babagigi pipeline page (/admin/babagigi) — wave groupings, status, community counts |
| — | Accuracy: migration-010 (sign languages), migration-011 (constructed languages), seed-glottolog updated to detect both from CSV fields |
| — | Accuracy: seed-endonyms rewritten for bulk Wikidata P1394 coverage (all 8,600+ languages, not just Babagigi 33); fixed URI literal bug |

## Pending user actions (before next session)

These need to be run manually in Supabase SQL Editor or terminal:

1. Run **migration-014** (`migrations/migration-014-language-models.sql`) in Supabase SQL editor — creates `language_models` table + seed sources
2. Run `npm run types:generate` — regenerate TypeScript types after migration-014
3. Run `npm run seed:whisper` — Whisper STT coverage
4. Run `npm run seed:mms` — Meta MMS ASR + TTS coverage
5. Run `npm run seed:huggingface` — HuggingFace top models
6. Run `npm run seed:geonames-admin1` — ~3,900 first-level admin divisions for all 252 countries

## Blockers

None.

## Notes for next session

Natural next directions (Phase 4, user chooses):

**A. Tech readiness admin** — The `tech_readiness` table (migration-004) tracks STT/TTS quality per language. No admin UI exists yet. This is directly relevant to Babagigi language selection — Weston needs a way to see and update which languages have production/usable/experimental/none voice tech.

**B. Sources management** — Every fact should have a `source_id` but the `sources` table has no admin UI. Adding/editing sources is currently only possible via SQL. Low complexity to build.

**C. Layer 4 dashboard** — Decision support views using real data. The Babagigi pipeline page is a start. Next could be: language readiness scorecard (ethnologue status × tech readiness × community coverage), or a partner engagement view.

**D. Data completeness audit** — Now that 8,618 languages are seeded, identify which Babagigi-wave languages still have gaps (missing ethnologue_status, no tech_readiness rows, no community associations).

**E. Edit pages for Babagigi-specific data** — Currently product_status rows can only be created/edited via SQL. An edit UI for wave assignment and status on the Babagigi pipeline page would be useful.
