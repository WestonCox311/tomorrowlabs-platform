-- Migration 015: Add is_official_language flag to geographic_concentrations
--
-- Marks languages that are official languages of a given country (Wikidata P37).
-- Combined with is_diaspora_concentration, this enables three-way grouping on
-- country place pages: Official & national / Indigenous & minority / Diaspora.
--
-- Seeded by seed-wikidata-language-countries.ts Phase C (P37 reverse lookup).

ALTER TABLE geographic_concentrations
  ADD COLUMN IF NOT EXISTS is_official_language boolean DEFAULT false;
