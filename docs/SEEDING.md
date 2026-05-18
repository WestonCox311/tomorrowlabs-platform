# Seeding the Database

All seed scripts live in `scripts/` and require `.env.local` with Supabase credentials.
Run from the project root: `npm run seed:<name>`

---

## Quick commands

| Command | What it does |
|---------|-------------|
| `npm run seed:base` | Glottolog + GeoNames countries + endonyms — fast skeleton (~5 min) |
| `npm run seed:full` | Full pipeline in correct order (~60–90 min total) |

---

## Full pipeline — order matters

Run these in sequence. Later steps depend on language IDs and place IDs created by earlier steps.

### Layer 1 — Base inventory (~10 min)

```bash
npm run seed:glottolog          # ~7,000 languages from Glottolog CLDF. Run first.
npm run seed:geonames           # ~252 country places from GeoNames.
npm run seed:geonames-admin1    # ~3,900 state/province places. Requires countries.
npm run seed:geonames-admin2    # ~40,000+ district/county places. Requires admin1.
npm run seed:endonyms           # Native language names from Wikidata P1705.
npm run seed:iso639             # ISO 639-1 two-letter codes (~500–1,000 languages).
npm run seed:wals               # WALS codes for ~2,600 languages.
```

### Layer 2 — Endangerment & vitality (~5 min)

```bash
npm run seed:glottolog-endangerment   # EGIDS endangerment levels from Glottolog AES.
```

### Layer 3 — Speaker populations (~10 min)

```bash
npm run seed:worldbank-populations    # Country-level populations from World Bank.
npm run seed:wikidata-populations     # Global speaker counts via Wikidata P1098.
npm run seed:wikidata                 # Full Wikidata enrichment: speaker counts,
                                      # writing systems, UNESCO vitality, QIDs.
npm run seed:wikidata-language-countries  # Language × country distribution + diaspora
                                          # + indigenous flags. ~25 min (5 phases).
```

### Layer 4 — Technology readiness (~5 min)

```bash
npm run seed:common-voice       # Mozilla Common Voice audio corpus data (~130 langs).
npm run seed:whisper            # OpenAI Whisper speech recognition coverage.
npm run seed:mms                # Meta MMS multilingual speech coverage.
npm run seed:huggingface        # Hugging Face model availability data.
npm run seed:tech-readiness     # Babagigi tech readiness scorecard.
```

### Layer 5 — Census (US-specific, run last) (~2 min)

```bash
npm run seed:census-language-speakers   # ACS 2022 B16001: 28 languages,
                                        # national + state level. Inherits diaspora/
                                        # indigenous flags from wikidata-language-countries.
                                        # Run seed:wikidata-language-countries first.
```

---

## Idempotency

All scripts are safe to re-run. Each one deletes its own rows (by `source_id`) before
reinserting, or uses `upsert` with a unique key. Re-running a script won't duplicate data.

Exception: `seed:glottolog` and `seed:geonames` use upsert on natural keys — also safe.

---

## Expected row counts after full seed

| Table | Expected rows |
|-------|--------------|
| `languages` | ~7,000 |
| `places` (country) | ~252 |
| `places` (state-province) | ~3,900 |
| `places` (district) | ~40,000+ |
| `speaker_populations` | ~6,000–10,000 |
| `geographic_concentrations` | ~60,000–100,000 |
| `vitality_assessments` | ~8,000–12,000 |
| `orthographies` | ~3,000–5,000 |
| `audio_corpora` | ~130–150 |
| `tech_readiness` | ~8,600 (one per language) |

---

## Data quality notes

- `confidence: 'low'` on Wikidata rows — speaker counts from Wikipedia infoboxes, not verified surveys.
- `confidence: 'high'` on Census rows — ACS methodology, but see notes below.
- **English (ACS)**: `B16001_002E` = "English-only at home." Bilinguals counted under their other language. True English total is ~280M+; the 244M figure is a lower bound.
- **Chinese (ACS)**: Covers Mandarin + Cantonese + Min + Wu + Hakka. Mapped to Mandarin as plurality proxy. See seed notes.
- **Arabic (ACS)**: Covers all spoken Arabic varieties. Modern Standard Arabic used as DB proxy.
- **Hmong (ACS)**: Covers White Hmong + Green Hmong as aggregate. Mapped to single record.

---

## After running migrations

Whenever you run a new migration that adds or removes columns, regenerate TypeScript types:

```bash
npm run types:generate
```
