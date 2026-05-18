-- migration-009-glottocode-constraint.sql
--
-- Promotes the existing unique index on languages.glottocode into a formal
-- UNIQUE CONSTRAINT. Required for Supabase's upsert (PostgREST on_conflict)
-- to recognise glottocode as a valid conflict target.
--
-- This uses UNIQUE USING INDEX, which converts the index in-place —
-- no data movement, no index rebuild, no table lock beyond a brief
-- metadata update.
--
-- Run once in the Supabase SQL Editor, then retry: npm run seed:glottolog

ALTER TABLE languages
  ADD CONSTRAINT languages_glottocode_key
  UNIQUE USING INDEX idx_languages_glottocode;
