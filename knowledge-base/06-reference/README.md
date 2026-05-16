# Reference

External sources and documents the architecture builds on.

## Documents in this folder

| Document | What it is |
|----------|-----------|
| `language-data-reference-library.md` | Annotated reference list with URLs and descriptions |
| `language-data-urls.md` | Clean URL list, one per line |

## Key external systems referenced

### Linguistic identifier systems
- **Glottolog** (https://glottolog.org) — primary linguistic backbone
- **Ethnologue** (https://www.ethnologue.com) — cross-reference for EGIDS classifications
- **ISO 639-3** — required vendor compatibility

### Geographic systems
- **GeoNames** (https://www.geonames.org) — primary geographic backbone
- **native-land.ca** — indigenous territory mapping
- **Wikidata** — cross-reference

### Vitality and endangerment classifications
- **EGIDS** scale (Ethnologue)
- **UNESCO Atlas of the World's Languages in Danger**
- **ELP / ELCat** (Endangered Languages Project / Catalogue of Endangered Languages)

### Phonological and structural databases
- **PHOIBLE** — phonological inventories
- **Grambank** — grammatical features
- **WALS** — World Atlas of Language Structures

### Audio and speech technology
- **Mozilla Common Voice** — community-contributed speech data (286+ languages as of v24.0)
- **Meta Omnilingual ASR** — 1600+ language native support, Apache 2.0 (Nov 2025)
- **OpenAI Whisper** — production STT, ~30 languages strong
- **Google Chirp 3, Azure Speech, ElevenLabs** — commercial TTS/STT providers

### Funding and partnership databases
- **Candid** (formerly Foundation Center) — US foundation directory
- **NSF Documenting Endangered Languages (DEL)** — major US grant program
- **Henry Luce Foundation** — Asian studies funding

### Standards and protocols
- **CLDF** — Cross-Linguistic Data Formats
- **OLAC** — Open Language Archives Community
- **PARADISEC, ELAR** — major academic linguistic archives

## How sources are referenced in the schema

Every fact in the database resolves to a row in the `sources` table. The sources table includes:
- Source name and type (academic, government, vendor, community, internal)
- URL
- Date accessed
- Reliability rating (high, medium, low)
- Methodology notes

When data is added to any table, the `source_id` foreign key is required. This is the structural commitment to "every fact resolves to a source."

## Adding new references

When you encounter a new external source that should be referenced:

1. Add an entry to `language-data-reference-library.md` with description
2. Add the URL to `language-data-urls.md`
3. When the source is first used to populate data, create a row in the `sources` table
4. Update the appropriate cross-reference (e.g., add a `wikidata_id` column if integrating Wikidata)

## Sources NOT to use

The data philosophy commits to avoiding:
- Unsourced aggregator sites
- Anonymous user-generated content for canonical facts
- Sources with documented bias against the communities whose data they hold
- Sources that haven't been verified for currency in 5+ years

When in doubt, prefer:
- Academic sources with peer review
- Government statistical agencies (with caveats about state actor bias)
- Community-led organizations for community data
- Industry standards bodies for technical specifications
