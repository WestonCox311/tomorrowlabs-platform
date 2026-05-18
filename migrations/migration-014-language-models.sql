-- migration-014-language-models.sql
--
-- Tracks individual AI/ML model resources per language.
-- Separate from tech_readiness (which holds summary quality tiers) —
-- this table holds the specific models, links, and provenance that
-- inform those quality assessments.

-- ─── TABLE ────────────────────────────────────────────────────────────────────

CREATE TABLE language_models (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id  uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,

  -- What it is
  model_name   text NOT NULL,
  provider     text NOT NULL,   -- 'openai', 'meta', 'microsoft', 'google', 'mozilla', 'community', 'academic'
  model_type   text NOT NULL,   -- 'stt', 'tts', 'llm', 'translation', 'g2p'

  -- Quality
  quality_tier tech_quality_tier,  -- reuses existing enum: production / usable / experimental / none

  -- Licensing
  is_open_source boolean DEFAULT true,
  license        text,   -- 'mit', 'apache-2.0', 'cc-by-nc-4.0', 'research-only', 'commercial', etc.

  -- Source / provenance
  source_url   text,   -- model card, API docs, GitHub, arxiv paper
  source_id    uuid REFERENCES sources(id),

  notes        text,
  last_verified_at date DEFAULT CURRENT_DATE,

  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()

  -- No UNIQUE constraint: a language can have many models of the same type
);

CREATE INDEX idx_language_models_language  ON language_models(language_id);
CREATE INDEX idx_language_models_type      ON language_models(model_type);
CREATE INDEX idx_language_models_provider  ON language_models(provider);
CREATE INDEX idx_language_models_tier      ON language_models(quality_tier);

COMMENT ON TABLE language_models IS
  'One row per AI/ML model resource per language. Tracks specific model implementations, '
  'their quality, licensing, and source links. Separate from tech_readiness which holds '
  'the aggregate quality tier summary.';

-- ─── SOURCES ──────────────────────────────────────────────────────────────────

INSERT INTO sources (id, name, type, url, accessed_date, reliability_rating, notes) VALUES
  (
    '11111111-0000-0000-0000-000000000010',
    'OpenAI Whisper — tokenizer.py language list',
    'dataset',
    'https://raw.githubusercontent.com/openai/whisper/main/whisper/tokenizer.py',
    CURRENT_DATE,
    'high',
    'Python dict LANGUAGES={code: name} in the Whisper repo. 99 languages. Reflects Whisper Large v3 coverage. MIT license.'
  ),
  (
    '11111111-0000-0000-0000-000000000011',
    'Meta MMS — Massively Multilingual Speech',
    'dataset',
    'https://dl.fbaipublicfiles.com/mms/asr/mms1b_l1107_langs.html',
    CURRENT_DATE,
    'high',
    'HTML tables listing ASR and TTS language coverage for Meta MMS (mms1b model). 1,107 languages. CC-BY-NC 4.0. The primary source for low-resource and endangered language model coverage.'
  ),
  (
    '11111111-0000-0000-0000-000000000012',
    'Hugging Face Hub — model metadata API',
    'api',
    'https://huggingface.co/api/models',
    CURRENT_DATE,
    'medium',
    'HuggingFace public REST API. Returns model metadata including language tags for TTS and ASR pipeline models. Quality varies widely — community models range from experimental to production.'
  )
ON CONFLICT (id) DO NOTHING;
