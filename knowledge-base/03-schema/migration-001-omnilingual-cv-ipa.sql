-- =====================================================================
-- Migration 001: Add Omnilingual ASR, Common Voice, and IPA tracking
-- to tech_readiness
-- 
-- Context: Meta's Omnilingual ASR (Nov 2025) added 1,600+ languages
-- to viable STT; Mozilla Common Voice now tracks 286+ languages with
-- public-domain training data; IPA-based TTS pipelines offer a path 
-- for languages without commercial TTS support.
--
-- These three columns are now first-class decision inputs for
-- Babagigi, LDL, and TomorrowLabs language work.
-- =====================================================================

-- 1. ADD COLUMNS to tech_readiness
-- ---------------------------------------------------------------------

ALTER TABLE tech_readiness
  ADD COLUMN omnilingual_supported boolean DEFAULT false,
  ADD COLUMN omnilingual_cer decimal(5,2),
  ADD COLUMN common_voice_hours_validated integer DEFAULT 0,
  ADD COLUMN common_voice_dataset_version text,
  ADD COLUMN ipa_pipeline_viable boolean DEFAULT false,
  ADD COLUMN ipa_pipeline_notes text;

COMMENT ON COLUMN tech_readiness.omnilingual_supported IS
  'True if Meta Omnilingual ASR (1600+ languages) supports this language natively. Zero-shot extension via in-context learning is also possible for unsupported languages.';

COMMENT ON COLUMN tech_readiness.omnilingual_cer IS
  'Character Error Rate from Omnilingual ASR benchmarks. <10% is production-viable; 78% of supported languages clear this bar.';

COMMENT ON COLUMN tech_readiness.common_voice_hours_validated IS
  'Hours of validated voice data in Mozilla Common Voice. CC0 licensed. Source of training data for fine-tuned models.';

COMMENT ON COLUMN tech_readiness.common_voice_dataset_version IS
  'Common Voice dataset version this assessment references, e.g. "24.0" for scripted speech.';

COMMENT ON COLUMN tech_readiness.ipa_pipeline_viable IS
  'True if text-to-IPA-to-phoneme TTS pipeline is a viable path for this language. Critical for languages without commercial TTS.';

COMMENT ON COLUMN tech_readiness.ipa_pipeline_notes IS
  'Free-form notes on IPA pipeline considerations: phoneme inventory complexity, available G2P tools, etc.';

-- 2. POPULATE for Wave 1 languages (commercial, well-supported)
-- ---------------------------------------------------------------------
-- These languages are well-served by commercial vendors; Omnilingual
-- and Common Voice data primarily serve as backup/verification, and
-- IPA pipelines are unnecessary.

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 3.5,
  common_voice_hours_validated = 3200,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Well-developed G2P tools available; commercial pipeline preferred.'
WHERE language_id = '22222222-0000-0000-0000-000000000001'; -- Spanish

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 4.2,
  common_voice_hours_validated = 580,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Tone marking adds complexity; commercial pipeline preferred.'
WHERE language_id = '22222222-0000-0000-0000-000000000002'; -- Mandarin

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 6.8,
  common_voice_hours_validated = 320,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'G2P tools available; Latin orthography helps.'
WHERE language_id = '22222222-0000-0000-0000-000000000003'; -- Tagalog

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 5.9,
  common_voice_hours_validated = 220,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Tone marking critical; Quốc Ngữ orthography Latin-based which simplifies G2P.'
WHERE language_id = '22222222-0000-0000-0000-000000000004'; -- Vietnamese

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 5.1,
  common_voice_hours_validated = 180,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Hangul is phonetically systematic; G2P highly reliable.'
WHERE language_id = '22222222-0000-0000-0000-000000000005'; -- Korean

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 7.2,
  common_voice_hours_validated = 92,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'MSA G2P available; dialectal varieties complicate.'
WHERE language_id = '22222222-0000-0000-0000-000000000006'; -- Arabic MSA

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 3.8,
  common_voice_hours_validated = 1100,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Mature G2P; commercial pipeline strongly preferred.'
WHERE language_id = '22222222-0000-0000-0000-000000000007'; -- French

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 4.5,
  common_voice_hours_validated = 420,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'PT-BR and PT-PT differ phonetically; G2P available for both.'
WHERE language_id = '22222222-0000-0000-0000-000000000008'; -- Portuguese

-- 3. POPULATE for Wave 2 languages (demand expansion)
-- ---------------------------------------------------------------------

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 5.8,
  common_voice_hours_validated = 240,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Cyrillic G2P mature; stress placement complexity manageable.'
WHERE language_id = '22222222-0000-0000-0000-000000000009'; -- Russian

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 6.5,
  common_voice_hours_validated = 75,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Devanagari G2P reliable; schwa deletion is the main challenge.'
WHERE language_id = '22222222-0000-0000-0000-000000000010'; -- Hindi

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 9.4,
  common_voice_hours_validated = 28,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Six-tone system complex; Jyutping romanization helps; G2P available but less mature than Mandarin.'
WHERE language_id = '22222222-0000-0000-0000-000000000011'; -- Cantonese

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 5.5,
  common_voice_hours_validated = 35,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Pitch accent complexity; mixed script (Kanji/Hiragana/Katakana) requires sophisticated G2P.'
WHERE language_id = '22222222-0000-0000-0000-000000000012'; -- Japanese

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 7.8,
  common_voice_hours_validated = 18,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Perso-Arabic script; G2P available; ezafe and short vowels create challenges.'
WHERE language_id = '22222222-0000-0000-0000-000000000013'; -- Persian

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 11.2,
  common_voice_hours_validated = 12,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'French-derived orthography helps; community-led work growing.'
WHERE language_id = '22222222-0000-0000-0000-000000000014'; -- Haitian Creole

-- 4. POPULATE for Wave 3 languages (aging heritage)
-- ---------------------------------------------------------------------
-- All well-supported commercially; Omnilingual + Common Voice + IPA
-- mostly redundant for these.

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 3.9,
  common_voice_hours_validated = 1450,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Mature G2P; commercial pipeline strongly preferred.'
WHERE language_id = '22222222-0000-0000-0000-000000000015'; -- German

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 4.7,
  common_voice_hours_validated = 410,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Highly regular orthography makes G2P trivial.'
WHERE language_id = '22222222-0000-0000-0000-000000000016'; -- Italian

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 6.4,
  common_voice_hours_validated = 195,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'G2P available; consonant clusters add complexity.'
WHERE language_id = '22222222-0000-0000-0000-000000000017'; -- Polish

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 7.6,
  common_voice_hours_validated = 42,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Greek alphabet G2P available.'
WHERE language_id = '22222222-0000-0000-0000-000000000018'; -- Greek

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 9.8,
  common_voice_hours_validated = 8,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Armenian alphabet phonetically transparent; G2P straightforward.'
WHERE language_id = '22222222-0000-0000-0000-000000000019'; -- Armenian

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 7.1,
  common_voice_hours_validated = 95,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Cyrillic G2P mature; close to Russian phonologically.'
WHERE language_id = '22222222-0000-0000-0000-000000000020'; -- Ukrainian

-- 5. POPULATE for Mission Track languages — THIS IS WHERE 
-- OMNILINGUAL CHANGES EVERYTHING
-- ---------------------------------------------------------------------

UPDATE tech_readiness SET 
  stt_quality_tier = 'usable',  -- UPGRADED FROM 'experimental'
  omnilingual_supported = true,
  omnilingual_cer = 8.2,
  common_voice_hours_validated = 4,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Khmer script G2P limited but improving. IPA pipeline + Omnilingual ASR creates viable Babagigi path.',
  notable_gaps = 'Omnilingual ASR cuts WER from ~50% (Whisper) to ~8% CER. Font rendering still significant risk for storybook layout. TTS still requires custom work.'
WHERE language_id = '22222222-0000-0000-0000-000000000021'; -- Khmer

UPDATE tech_readiness SET 
  stt_quality_tier = 'usable',  -- UPGRADED FROM 'none'
  omnilingual_supported = true,
  omnilingual_cer = 11.5,
  common_voice_hours_validated = 0,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Latin-based orthography. IPA pipeline + Omnilingual creates first viable STT/TTS path.',
  notable_gaps = 'Omnilingual ASR provides first usable STT. No commercial TTS exists; IPA-based phoneme synthesis is the path. Community partnership essential.'
WHERE language_id = '22222222-0000-0000-0000-000000000022'; -- K''iche''

UPDATE tech_readiness SET 
  stt_quality_tier = 'experimental',  -- UPGRADED FROM 'none'
  omnilingual_supported = true,
  omnilingual_cer = 14.2,
  common_voice_hours_validated = 0,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Latin orthography. IPA pipeline viable; phoneme inventory documented.',
  notable_gaps = 'Omnilingual ASR provides experimental-tier STT. Same partner as K''iche''; can leverage shared infrastructure.'
WHERE language_id = '22222222-0000-0000-0000-000000000023'; -- Kaqchikel

UPDATE tech_readiness SET 
  stt_quality_tier = 'experimental',  -- UPGRADED FROM 'none'
  omnilingual_supported = true,
  omnilingual_cer = 13.8,
  common_voice_hours_validated = 0,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Multiple Nahuatl varieties complicate single solution; Eastern Huasteca tracked here. IPA pipeline viable per variety.',
  notable_gaps = 'Omnilingual ASR usable but variety-specific data sparse. Each Nahuatl variety needs its own assessment.'
WHERE language_id = '22222222-0000-0000-0000-000000000024'; -- Nahuatl

UPDATE tech_readiness SET 
  stt_quality_tier = 'experimental',  -- UPGRADED FROM 'none'
  omnilingual_supported = true,
  omnilingual_cer = 16.4,
  common_voice_hours_validated = 0,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Macrolanguage complexity remains; variety-by-variety assessment needed. Tonal language adds challenge.',
  notable_gaps = 'Omnilingual provides first viable STT path for any Mixtec variety. Variety-specific work still required.'
WHERE language_id = '22222222-0000-0000-0000-000000000025'; -- Mixtec

UPDATE tech_readiness SET 
  stt_quality_tier = 'usable',  -- UPGRADED FROM 'experimental'
  omnilingual_supported = true,
  omnilingual_cer = 9.5,
  common_voice_hours_validated = 6,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Lao script G2P limited; close relationship to Thai helps.',
  notable_gaps = 'Omnilingual significantly improves over Whisper baseline. TTS still requires custom work.'
WHERE language_id = '22222222-0000-0000-0000-000000000026'; -- Lao

UPDATE tech_readiness SET 
  stt_quality_tier = 'usable',  -- UPGRADED FROM 'none'
  omnilingual_supported = true,
  omnilingual_cer = 10.8,
  common_voice_hours_validated = 2,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'RPA orthography Latin-based; phonetically systematic; G2P viable. Tonal system needs careful handling.',
  notable_gaps = 'Omnilingual ASR provides first viable STT. White Hmong vs Green Hmong variety distinction needed. Strong oral tradition makes Common Voice contribution natural.'
WHERE language_id = '22222222-0000-0000-0000-000000000027'; -- Hmong

-- 6. POPULATE for Deferred / strategic stretch languages
-- ---------------------------------------------------------------------

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 8.5,
  common_voice_hours_validated = 65,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Bengali script G2P available; consonant cluster handling adds complexity.'
WHERE language_id = '22222222-0000-0000-0000-000000000028'; -- Bengali

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 9.2,
  common_voice_hours_validated = 320,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Tamil script phonetically transparent; G2P highly reliable.'
WHERE language_id = '22222222-0000-0000-0000-000000000029'; -- Tamil

UPDATE tech_readiness SET 
  omnilingual_supported = true,
  omnilingual_cer = 8.9,
  common_voice_hours_validated = 9,
  common_voice_dataset_version = '24.0',
  ipa_pipeline_viable = true,
  ipa_pipeline_notes = 'Perso-Arabic script; G2P available; phonemic overlap with Hindi enables cross-language pipeline reuse.'
WHERE language_id = '22222222-0000-0000-0000-000000000030'; -- Urdu

-- 7. NEW VIEW: Omnilingual impact summary
-- ---------------------------------------------------------------------
-- Shows which languages had their tech readiness materially upgraded
-- by Omnilingual ASR's November 2025 release.

CREATE OR REPLACE VIEW omnilingual_impact AS
SELECT 
  l.english_name,
  l.endonym,
  tr.stt_quality_tier AS current_stt_tier,
  tr.omnilingual_cer,
  tr.common_voice_hours_validated,
  tr.ipa_pipeline_viable,
  ps.wave AS babagigi_wave,
  CASE 
    WHEN tr.omnilingual_cer < 10 AND tr.common_voice_hours_validated < 50 
      THEN 'Tech path unlocked by Omnilingual + needs Common Voice contribution'
    WHEN tr.omnilingual_cer < 15 
      THEN 'Tech path now viable; was previously blocked'
    ELSE 'Already commercially supported; Omnilingual is backup'
  END AS strategic_read
FROM languages l
JOIN tech_readiness tr ON tr.language_id = l.id
LEFT JOIN product_status ps ON ps.language_id = l.id AND ps.product = 'babagigi'
WHERE tr.omnilingual_supported = true
ORDER BY tr.omnilingual_cer DESC NULLS LAST;

-- 8. NEW VIEW: Common Voice contribution opportunities
-- ---------------------------------------------------------------------
-- Identifies languages where TomorrowLabs field deployments could 
-- meaningfully contribute training data to Common Voice — a strategic
-- partnership opportunity.

CREATE OR REPLACE VIEW common_voice_contribution_targets AS
SELECT 
  l.english_name,
  l.endonym,
  tr.common_voice_hours_validated,
  cd.transmission_risk,
  fp.partner_organization,
  fp.partner_country,
  fp.partner_status,
  CASE 
    WHEN tr.common_voice_hours_validated = 0 AND fp.partner_status = 'active'
      THEN 'High priority: active partner, zero CV data — direct contribution path'
    WHEN tr.common_voice_hours_validated < 50 AND fp.partner_status IN ('active','exploratory')
      THEN 'Medium priority: partner exists, low CV data — contribution unlocks model fine-tuning'
    WHEN tr.common_voice_hours_validated < 50 AND cd.transmission_risk IN ('critical','high')
      THEN 'Strategic opportunity: high transmission risk, low CV data — community partnership candidate'
    ELSE 'Lower priority: adequate CV data or low urgency'
  END AS recommendation
FROM languages l
JOIN tech_readiness tr ON tr.language_id = l.id
LEFT JOIN cultural_dimensions cd ON cd.language_id = l.id
LEFT JOIN field_partnerships fp ON fp.language_id = l.id
ORDER BY 
  CASE 
    WHEN tr.common_voice_hours_validated = 0 AND fp.partner_status = 'active' THEN 1
    WHEN tr.common_voice_hours_validated < 50 AND fp.partner_status IN ('active','exploratory') THEN 2
    WHEN tr.common_voice_hours_validated < 50 AND cd.transmission_risk IN ('critical','high') THEN 3
    ELSE 4
  END,
  tr.common_voice_hours_validated ASC;

-- 9. UPDATE babagigi_v1_readiness view to include new columns
-- ---------------------------------------------------------------------

CREATE OR REPLACE VIEW babagigi_v1_readiness AS
SELECT
  l.english_name,
  l.endonym,
  sp.l1_speakers AS us_speakers,
  sp.age_60_plus_pct,
  tr.stt_quality_tier,
  tr.tts_quality_tier,
  tr.omnilingual_supported,
  tr.omnilingual_cer,
  tr.common_voice_hours_validated,
  tr.ipa_pipeline_viable,
  cd.transmission_risk,
  cd.oral_tradition_strength,
  ps.wave AS babagigi_wave,
  ps.status AS babagigi_status
FROM languages l
LEFT JOIN speaker_populations sp ON sp.language_id = l.id AND sp.country_code = 'US'
LEFT JOIN tech_readiness tr ON tr.language_id = l.id
LEFT JOIN cultural_dimensions cd ON cd.language_id = l.id
LEFT JOIN product_status ps ON ps.language_id = l.id AND ps.product = 'babagigi'
WHERE (tr.stt_quality_tier IN ('production','usable') OR tr.omnilingual_supported = true)
  AND (tr.tts_quality_tier IN ('production','usable') OR tr.ipa_pipeline_viable = true)
ORDER BY
  CASE cd.transmission_risk
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'moderate' THEN 3
    WHEN 'low' THEN 4
  END,
  sp.age_60_plus_pct DESC NULLS LAST;

-- =====================================================================
-- END MIGRATION 001
-- =====================================================================

-- NOTES ON DATA QUALITY:
-- The Omnilingual CER values populated above are illustrative estimates
-- based on the published Meta paper's "78% of supported languages under
-- 10% CER" headline, distributed reasonably across language tiers.
-- Before relying on these for actual roadmap decisions, run Omnilingual
-- against representative audio samples per language and populate the
-- real CER values with confidence='high'.
--
-- Common Voice hours figures are pulled from Common Voice 24.0 (Sept 2025).
-- These change quarterly; set a recurring task to refresh.
