-- Migration 016: Add is_indigenous_language flag to geographic_concentrations
-- Seeded by Phase E of seed-wikidata-language-countries.ts using Wikidata P2341 (indigenous to).
-- Distinct from is_diaspora_concentration: a language is indigenous to a country if it
-- originates there, regardless of official status.

ALTER TABLE geographic_concentrations
  ADD COLUMN IF NOT EXISTS is_indigenous_language boolean DEFAULT false;
