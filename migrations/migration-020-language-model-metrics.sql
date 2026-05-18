-- Migration 020: Add evaluation metrics to language_models
--
-- WER/CER are standard metrics for STT models.
-- BLEU is standard for MT models.
-- parameter_count gives model scale context.
-- eval_dataset names the test set so numbers are interpretable.

ALTER TABLE language_models
  ADD COLUMN IF NOT EXISTS wer              decimal(6,2),  -- Word Error Rate  0–100
  ADD COLUMN IF NOT EXISTS cer              decimal(6,2),  -- Character Error Rate 0–100
  ADD COLUMN IF NOT EXISTS bleu_score       decimal(6,2),  -- BLEU score 0–100 (MT models)
  ADD COLUMN IF NOT EXISTS eval_dataset     text,          -- test set used (e.g. "CommonVoice 17 test")
  ADD COLUMN IF NOT EXISTS eval_notes       text,          -- methodology / caveats
  ADD COLUMN IF NOT EXISTS parameter_count  bigint;        -- model size (e.g. 1500000000 = 1.5B)

COMMENT ON COLUMN language_models.wer             IS 'Word Error Rate as a percentage (0–100). Relevant for STT models.';
COMMENT ON COLUMN language_models.cer             IS 'Character Error Rate as a percentage (0–100). Relevant for STT models.';
COMMENT ON COLUMN language_models.bleu_score      IS 'BLEU score 0–100. Relevant for MT models.';
COMMENT ON COLUMN language_models.eval_dataset    IS 'Test set used for the evaluation (e.g. "CommonVoice 17.0 test", "LibriSpeech test-clean").';
COMMENT ON COLUMN language_models.parameter_count IS 'Total parameter count, e.g. 1500000000 for a 1.5B model.';
