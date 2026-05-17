# Current Task

**What's currently being worked on.** Updated at the start and end of every Claude Code session.

---

## In progress

Nothing actively in flight.

---

## Last completed

**FilterBar system + docs/sources pages + sidebar + seed scripts — 2026-05-17**

| Shipped | Details |
|---------|---------|
| FilterBar component | `src/components/filter-bar.tsx` — client component, auto-apply selects, filter chips, clear all |
| Languages filters | + ethnologue_status (6 values), is_constructed (true/false) |
| Tech Readiness filters | + language name search, omnilingual (yes only), IPA path (yes only) |
| Places, Organizations | Replaced inline form with FilterBar |
| Communities | + self_identified filter |
| Documentation page | `/admin/documentation` — glossary (30+ terms), table reference by layer |
| Sources page | `/admin/sources` — grouped by type, reliability badges |
| Sidebar | "Spine Entities" → "Data"; Products section (Babagigi); Documentation + Sources utility links |
| Seed scripts | seed-wikidata-enrichment, seed-glottolog-endangerment, seed-wals, seed-common-voice, seed-iso639 |
| UNESCO vitality fix | Wikidata labels use "1 safe" prefix format — fixed label map; 2,120 vitality_assessments rows now inserted |
| seed-wikidata-vitality | Standalone Phase 4 script for future re-runs |

**Phase 1–3 + Phase 4 (partial) — fully complete as of 2026-05-16**

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

1. Run **migration-010** — fixes is_signed_language for ~140 sign languages
2. Run **migration-011** — fixes is_constructed for Esperanto, Lojban, Klingon etc.
3. Run **migration-012** — cleans up Wikidata URI values written as endonyms
4. Run `npm run seed:endonyms` — re-runs endonym seed (now paginated + URI-filtered)
5. Run `npm run types:generate` — regenerate TypeScript types after schema work

## Blockers

None.

## Notes for next session

Natural next directions (Phase 4, user chooses):

**A. Tech readiness admin** — The `tech_readiness` table (migration-004) tracks STT/TTS quality per language. No admin UI exists yet. This is directly relevant to Babagigi language selection — Weston needs a way to see and update which languages have production/usable/experimental/none voice tech.

**B. Sources management** — Every fact should have a `source_id` but the `sources` table has no admin UI. Adding/editing sources is currently only possible via SQL. Low complexity to build.

**C. Layer 4 dashboard** — Decision support views using real data. The Babagigi pipeline page is a start. Next could be: language readiness scorecard (ethnologue status × tech readiness × community coverage), or a partner engagement view.

**D. Data completeness audit** — Now that 8,618 languages are seeded, identify which Babagigi-wave languages still have gaps (missing ethnologue_status, no tech_readiness rows, no community associations).

**E. Edit pages for Babagigi-specific data** — Currently product_status rows can only be created/edited via SQL. An edit UI for wave assignment and status on the Babagigi pipeline page would be useful.
