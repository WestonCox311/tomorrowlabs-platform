-- migration-013-english-babagigi.sql
--
-- Add English to the Babagigi product as Wave 1 / live.
-- English is the other half of every bilingual storybook — it belongs
-- in the system alongside all the heritage languages.
--
-- Finds English by glottocode 'stan1293' (Standard Modern English),
-- which is guaranteed to exist from the Glottolog CLDF seed.

DO $$
DECLARE
  eng_id uuid;
BEGIN
  SELECT id INTO eng_id
  FROM languages
  WHERE glottocode = 'stan1293'
  LIMIT 1;

  IF eng_id IS NULL THEN
    RAISE EXCEPTION 'English (glottocode stan1293) not found — run Glottolog seed first';
  END IF;

  -- Set ethnologue_status to International (highest tier)
  UPDATE languages
  SET ethnologue_status = 'International'
  WHERE id = eng_id
    AND (ethnologue_status IS NULL OR ethnologue_status != 'International');

  -- Add tech_readiness row if not present
  INSERT INTO tech_readiness (language_id, stt_quality_tier, tts_quality_tier, keyboard_support, font_availability, rendering_complexity, notable_gaps)
  VALUES (eng_id, 'production', 'production', 'full', 'commercial', 'standard', NULL)
  ON CONFLICT (language_id) DO NOTHING;

  -- Add Babagigi product_status as Wave 1 / live
  INSERT INTO product_status (language_id, product, wave, status)
  VALUES (eng_id, 'babagigi', 'wave-1', 'live')
  ON CONFLICT DO NOTHING;

END $$;
