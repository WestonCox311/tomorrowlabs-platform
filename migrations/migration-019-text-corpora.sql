-- Migration 019: text_corpora table
--
-- Stores NLP text dataset records per language — parallel to audio_corpora
-- for non-audio resources. Primary initial sources: Masakhane benchmarks
-- (African NLP community) and future OPUS parallel corpus data.
--
-- Distinct from audio_corpora (which tracks speech hours, speakers, quality)
-- and from tech_readiness (which is a summary scorecard, not per-corpus).
--
-- task_type vocabulary:
--   ner                  Named entity recognition (MasakhaNER)
--   pos                  Part-of-speech tagging (MasakhaPOS)
--   news-classification  Topic/category classification (MasakhaNEWS)
--   sentiment            Sentiment analysis (AfriSenti)
--   mt                   Machine translation (MAFAND, NTREX, etc.)
--   qa                   Question answering (AfriQA)
--   nli                  Natural language inference (AfriXNLI)
--   llm-benchmark        LLM evaluation / instruction following (AfriMMSLU, etc.)
--   parallel-text        Raw parallel text corpora (OPUS, CCAligned, etc.)
--   other                Catch-all for unclassified tasks

CREATE TABLE text_corpora (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  source_id   uuid NOT NULL REFERENCES sources(id),

  corpus_name text NOT NULL,
  task_type   text NOT NULL,

  sentence_count  integer,
  hf_dataset_id   text,      -- HuggingFace dataset identifier, e.g. 'masakhane/masakhaner2'
  license         text,
  url             text,

  notes           text,
  confidence  confidence_level NOT NULL DEFAULT 'estimated',
  created_at  timestamptz DEFAULT now(),

  UNIQUE(language_id, corpus_name, task_type)
);

CREATE INDEX idx_text_corpora_language ON text_corpora(language_id);
CREATE INDEX idx_text_corpora_task ON text_corpora(task_type);

COMMENT ON TABLE text_corpora IS
  'NLP text dataset records per language. Parallel to audio_corpora for text resources. Primary source: Masakhane benchmarks (~40 African languages, 10+ tasks).';
