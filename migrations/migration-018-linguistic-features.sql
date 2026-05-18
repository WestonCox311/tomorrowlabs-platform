-- Migration 018: linguistic_features table
--
-- Stores typological feature codings per language, sourced from Grambank
-- (and optionally WALS in future). Each row = one feature value for one language.
--
-- Values from Grambank:
--   '0' = feature absent
--   '1' = feature present
--   '2' / '3' = multi-value features (used by ~7K rows in Grambank)
--   '?' = coded but undetermined
--
-- Confidence is 'estimated' across the board — Grambank is peer-reviewed
-- academic work but the individual codings are expert assessments, not
-- primary community surveys.

CREATE TABLE linguistic_features (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  source_id   uuid NOT NULL REFERENCES sources(id),
  feature_code  text NOT NULL,
  feature_name  text,
  feature_value text NOT NULL,
  confidence  confidence_level NOT NULL DEFAULT 'estimated',
  created_at  timestamptz DEFAULT now(),

  UNIQUE(language_id, feature_code)
);

CREATE INDEX idx_linguistic_features_language
  ON linguistic_features(language_id);

CREATE INDEX idx_linguistic_features_feature
  ON linguistic_features(feature_code, feature_value);

COMMENT ON TABLE linguistic_features IS
  'Typological feature codings per language. Primary source: Grambank CLDF (195 features × ~2,467 languages). Keyed by (language_id, feature_code).';
