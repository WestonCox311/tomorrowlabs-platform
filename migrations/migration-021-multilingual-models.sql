-- Migration 021: Support multilingual/umbrella model records
--
-- Adds parent_model_id so language-specific entries (e.g. Whisper Large v3 – Khmer)
-- can be nested under a parent umbrella record (e.g. Whisper Large v3).
-- language_id becomes nullable: parent/umbrella models cover multiple languages
-- and have no single language_id.

ALTER TABLE language_models
  ADD COLUMN IF NOT EXISTS parent_model_id uuid REFERENCES language_models(id) ON DELETE SET NULL;

ALTER TABLE language_models
  ALTER COLUMN language_id DROP NOT NULL;

COMMENT ON COLUMN language_models.parent_model_id IS 'For language-specific entries under a multilingual model, references the umbrella parent record.';
COMMENT ON COLUMN language_models.language_id IS 'The specific language this model entry covers. NULL for umbrella/multilingual parent records.';
