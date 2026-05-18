-- =====================================================================
-- Migration 000: Initial Language Database
--
-- Reconstruction note: The original migration-000 was created in a
-- prior conversation (May 2026) and is not preserved. This file was
-- reconstructed from:
--   1. What migrations 001-007 ALTER TABLE / REFERENCES / assume exist
--   2. The architecture-map.md Layer 1 table inventory
--   3. Enum types referenced by later migrations (tech_quality_tier,
--      confidence_level) but not created in them
--   4. The 30 seed language UUIDs referenced by fixed update statements
--      in migration-001
--
-- If the original migration-000 is recovered, compare carefully.
-- This reconstruction is conservative — it defines only what
-- downstream migrations require, with plausible seed data.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PART 1: CROSS-CUTTING ENUMS
-- (referenced throughout all later migrations)
-- ---------------------------------------------------------------------

-- Confidence level — used everywhere for epistemic honesty
CREATE TYPE confidence_level AS ENUM (
  'high',       -- Verified from primary source or direct observation
  'medium',     -- Reasonable inference from good secondary sources
  'low',        -- Estimate; significant uncertainty
  'estimated'   -- Explicitly flagged as an estimate; use with care
);

-- Technology quality tier — used for STT and TTS in tech_readiness
-- and tech_readiness_history (migration-004)
CREATE TYPE tech_quality_tier AS ENUM (
  'production',     -- Commercial-grade; reliable for user-facing deployment
  'usable',         -- Functional for research and limited deployment with review
  'experimental',   -- Research-stage; not ready for deployment
  'none'            -- No viable solution exists at this time
);

-- Language granularity — how specific this language record is
CREATE TYPE language_granularity AS ENUM (
  'macrolanguage',  -- ISO macrolanguage umbrella
  'language',       -- Standard language
  'dialect',        -- Regional or social dialect
  'variety',        -- More granular variety (orthographic, spoken variant)
  'register'        -- Formal register or pidgin
);

-- ---------------------------------------------------------------------
-- PART 2: CROSS-CUTTING INFRASTRUCTURE TABLES
-- ---------------------------------------------------------------------

-- Sources — all facts require provenance
CREATE TABLE sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text,                 -- 'academic', 'community', 'internal', 'census', 'survey', 'expert-estimate', 'partner-report'
  url text,
  accessed_date date,
  reliability_rating text,   -- 'high', 'medium', 'low'
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_sources_type ON sources(source_type);

COMMENT ON TABLE sources IS
  'Canonical source registry. Every factual claim in the database should carry a source_id pointing here.';

-- Decision log — cross-cutting audit trail for strategic decisions
CREATE TABLE decision_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_date date NOT NULL DEFAULT CURRENT_DATE,
  decision_type text NOT NULL,   -- 'language-wave', 'partnership', 'architecture', 'scope', 'resource'
  title text NOT NULL,
  summary text NOT NULL,
  rationale text,
  decided_by text,               -- Name or role of decision-maker
  alternatives_considered text,
  reversibility text,            -- 'easily', 'with-effort', 'hard', 'irreversible'
  revisit_date date,
  outcome text,                  -- Populated later when outcome is known
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_decision_log_date ON decision_log(decision_date DESC);
CREATE INDEX idx_decision_log_type ON decision_log(decision_type);

-- ---------------------------------------------------------------------
-- PART 3: CORE LANGUAGE TABLE
-- (the anchor for the entire system)
-- ---------------------------------------------------------------------

CREATE TABLE languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  english_name text NOT NULL,
  endonym text,                          -- Name in the language itself
  glottocode text NOT NULL,              -- Glottolog canonical identifier
  iso_639_3 text,                        -- ISO 639-3 three-letter code
  iso_639_1 text,                        -- ISO 639-1 two-letter code (major languages only)
  wikidata_qid text,                     -- Wikidata entity identifier

  -- Hierarchy
  granularity language_granularity NOT NULL DEFAULT 'language',
  parent_language_id uuid REFERENCES languages(id),    -- e.g., Cantonese → Chinese macrolanguage

  -- Flags
  is_signed_language boolean DEFAULT false,
  is_constructed boolean DEFAULT false,

  -- Notes
  notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_languages_glottocode ON languages(glottocode);
CREATE INDEX idx_languages_iso_639_3 ON languages(iso_639_3);
CREATE INDEX idx_languages_parent ON languages(parent_language_id);

COMMENT ON TABLE languages IS
  'Canonical language registry anchored to Glottolog. One row per language/dialect/variety tracked.';
COMMENT ON COLUMN languages.glottocode IS
  'Glottolog canonical identifier. Treat as authoritative for cross-database joins. Uniqueness enforced.';
COMMENT ON COLUMN languages.parent_language_id IS
  'Glottolog-informed hierarchy. May differ from community self-classification — see community_positions table (migration-002) for community override records.';

-- ---------------------------------------------------------------------
-- PART 4: LANGUAGE DETAIL TABLES
-- (the original "21-table" language database; detail around each language)
-- ---------------------------------------------------------------------

-- Technology readiness — can we build with this language?
CREATE TABLE tech_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,

  -- Speech technology tiers (using tech_quality_tier enum)
  stt_quality_tier tech_quality_tier NOT NULL DEFAULT 'none',
  tts_quality_tier tech_quality_tier NOT NULL DEFAULT 'none',

  -- Keyboard / input
  keyboard_support text,         -- 'full', 'partial', 'none'

  -- Font and rendering
  font_availability text,        -- 'commercial', 'open-source', 'limited', 'none'
  rendering_complexity text,     -- 'standard', 'complex-shaping', 'bidirectional', 'vertical'

  -- Notable limitations
  notable_gaps text,
  notes text,

  assessed_at date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(language_id)            -- One readiness row per language
);

CREATE INDEX idx_tech_readiness_stt ON tech_readiness(stt_quality_tier);
CREATE INDEX idx_tech_readiness_tts ON tech_readiness(tts_quality_tier);

COMMENT ON TABLE tech_readiness IS
  'Technology capability snapshot per language. Migration-001 adds Omnilingual/CommonVoice/IPA columns. Migration-004 adds time-series history. This table holds current state.';

-- Speaker populations — who speaks this, where, demographics
CREATE TABLE speaker_populations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,

  country_code text NOT NULL,          -- ISO 3166-1 alpha-2
  region text,                         -- State/province (optional)
  context text DEFAULT 'diaspora',     -- 'homeland', 'diaspora', 'heritage'

  -- Population estimates
  l1_speakers integer,                 -- First-language speakers
  l2_speakers integer,                 -- Second-language speakers
  heritage_speakers integer,           -- Heritage speakers (partial fluency)
  total_population_in_area integer,    -- For computing ratios

  -- Demographics relevant to Babagigi
  age_60_plus_pct decimal(5,2),        -- % of speakers aged 60+
  age_0_to_18_pct decimal(5,2),        -- % of speakers aged 0-18

  -- Data provenance
  data_year integer,
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'estimated',
  notes text,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_speakerpop_lang_country ON speaker_populations(language_id, country_code);

-- Cultural dimensions — community context for technology and product decisions
CREATE TABLE cultural_dimensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  country_code text,

  -- Transmission signals (Babagigi's core variable)
  transmission_risk text,              -- 'critical', 'high', 'moderate', 'low'
  oral_tradition_strength text,        -- 'strong', 'moderate', 'weak'
  storytelling_centrality text,        -- 'central', 'present', 'peripheral'

  -- Community relationship context
  community_tech_comfort text,         -- 'high', 'moderate', 'low', 'variable'
  diaspora_cohesion text,              -- 'strong', 'moderate', 'fragmented'
  intergenerational_gap text,          -- 'severe', 'significant', 'moderate', 'minor'

  -- Privacy and data sensitivity expectations
  data_sharing_norms text,             -- 'open', 'cautious', 'restricted'
  community_consent_complexity text,   -- 'individual', 'family', 'community-leader', 'collective'

  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'estimated',
  notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(language_id, country_code)
);

CREATE INDEX idx_cultural_lang ON cultural_dimensions(language_id);

-- Product status — which TomorrowLabs products cover this language
CREATE TABLE product_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,

  product text NOT NULL,               -- 'babagigi', 'ldl', 'tomorrowlabs-core'
  wave text,                           -- 'wave-1', 'wave-2', 'wave-3', 'wave-4', 'strategic-stretch', 'deferred'
  status text NOT NULL DEFAULT 'planned',  -- 'live', 'in-development', 'planned', 'deferred', 'sunset'

  target_launch_date date,
  actual_launch_date date,
  rationale text,
  notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(language_id, product)
);

CREATE INDEX idx_product_status_lang ON product_status(language_id);
CREATE INDEX idx_product_status_product ON product_status(product, wave);

-- Field partnerships — active and prospective community partnerships
CREATE TABLE field_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,

  partner_organization text NOT NULL,
  partner_country text,
  partner_region text,
  partner_status text NOT NULL DEFAULT 'exploratory',  -- 'active', 'exploratory', 'paused', 'closed'

  partnership_type text,               -- 'research', 'deployment', 'data-collection', 'funding'
  primary_contact text,
  contact_method text,

  started_date date,
  last_contact_date date,

  benefit_sharing_agreed boolean DEFAULT false,
  consent_framework_agreed boolean DEFAULT false,

  notes text,
  source_id uuid REFERENCES sources(id),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_field_partnerships_lang ON field_partnerships(language_id);
CREATE INDEX idx_field_partnerships_status ON field_partnerships(partner_status);

-- ---------------------------------------------------------------------
-- PART 5: SEED DATA — SOURCES
-- (one seed source for the initial data population)
-- ---------------------------------------------------------------------

INSERT INTO sources (id, name, type, accessed_date, reliability_rating, notes) VALUES
  ('11111111-0000-0000-0000-000000000001', 'TomorrowLabs Internal Assessment — Initial Language Selection', 'internal',
   '2026-05-16', 'high',
   'Initial language selection based on US Census diaspora data, Babagigi market research, and strategic roadmap decisions. May 2026.');

-- ---------------------------------------------------------------------
-- PART 6: SEED DATA — LANGUAGES (30 rows)
-- Fixed UUIDs: pattern 22222222-0000-0000-0000-000000000NNN
-- Referenced by UPDATE statements in migration-001.
-- Order matches migration-001 groupings:
--   001-008: Wave 1 (commercial, well-supported)
--   009-014: Wave 2 (demand expansion)
--   015-020: Wave 3 (aging heritage)
--   021-027: Wave 4 (mission track)
--   028-030: Strategic stretch / deferred
-- ---------------------------------------------------------------------

INSERT INTO languages (id, english_name, endonym, glottocode, iso_639_3, iso_639_1, granularity) VALUES

-- Wave 1: Commercial, well-supported
('22222222-0000-0000-0000-000000000001', 'Spanish',          'Español',         'stan1288', 'spa', 'es', 'language'),
('22222222-0000-0000-0000-000000000002', 'Mandarin Chinese', '普通话',           'mand1415', 'cmn', 'zh', 'language'),
('22222222-0000-0000-0000-000000000003', 'Tagalog',          'Tagalog',         'taga1270', 'tgl', 'tl', 'language'),
('22222222-0000-0000-0000-000000000004', 'Vietnamese',       'Tiếng Việt',      'viet1252', 'vie', 'vi', 'language'),
('22222222-0000-0000-0000-000000000005', 'Korean',           '한국어',            'kore1280', 'kor', 'ko', 'language'),
('22222222-0000-0000-0000-000000000006', 'Arabic (MSA)',     'العربية الفصحى',  'stan1318', 'arb', 'ar', 'variety'),
('22222222-0000-0000-0000-000000000007', 'French',           'Français',        'stan1290', 'fra', 'fr', 'language'),
('22222222-0000-0000-0000-000000000008', 'Portuguese',       'Português',       'port1283', 'por', 'pt', 'language'),

-- Wave 2: Demand expansion
('22222222-0000-0000-0000-000000000009', 'Russian',          'Русский',         'russ1263', 'rus', 'ru', 'language'),
('22222222-0000-0000-0000-000000000010', 'Hindi',            'हिन्दी',            'hind1269', 'hin', 'hi', 'language'),
('22222222-0000-0000-0000-000000000011', 'Cantonese',        '廣東話',           'cant1236', 'yue', NULL, 'language'),
('22222222-0000-0000-0000-000000000012', 'Japanese',         '日本語',           'japa1256', 'jpn', 'ja', 'language'),
('22222222-0000-0000-0000-000000000013', 'Persian (Farsi)',  'فارسی',           'west2369', 'fas', 'fa', 'language'),
('22222222-0000-0000-0000-000000000014', 'Haitian Creole',   'Kreyòl ayisyen',  'hait1238', 'hat', NULL, 'language'),

-- Wave 3: Aging heritage communities
('22222222-0000-0000-0000-000000000015', 'German',           'Deutsch',         'stan1295', 'deu', 'de', 'language'),
('22222222-0000-0000-0000-000000000016', 'Italian',          'Italiano',        'ital1282', 'ita', 'it', 'language'),
('22222222-0000-0000-0000-000000000017', 'Polish',           'Język polski',    'poli1260', 'pol', 'pl', 'language'),
('22222222-0000-0000-0000-000000000018', 'Greek',            'Ελληνικά',        'mode1248', 'ell', 'el', 'language'),
('22222222-0000-0000-0000-000000000019', 'Armenian',         'Հայերեն',         'nucl1235', 'hye', NULL, 'language'),
('22222222-0000-0000-0000-000000000020', 'Ukrainian',        'Українська',      'ukra1253', 'ukr', 'uk', 'language'),

-- Wave 4: Mission track (endangered / heritage — where Omnilingual changed the calculus)
('22222222-0000-0000-0000-000000000021', 'Khmer',            'ភាសាខ្មែរ',        'cent1989', 'khm', 'km', 'language'),
('22222222-0000-0000-0000-000000000022', 'K''iche''',        'K''ichean',       'kich1262', 'quc', NULL, 'language'),
('22222222-0000-0000-0000-000000000023', 'Kaqchikel',        'Kaqchikel',       'kaqc1270', 'cak', NULL, 'language'),
('22222222-0000-0000-0000-000000000024', 'Nahuatl',          'Nāhuatl',         'east2455', 'nhe', NULL, 'language'),
('22222222-0000-0000-0000-000000000025', 'Mixtec',           'Tu''un Sávi',     'mixt1422', 'mix', NULL, 'macrolanguage'),
('22222222-0000-0000-0000-000000000026', 'Lao',              'ພາສາລາວ',          'laoo1244', 'lao', 'lo', 'language'),
('22222222-0000-0000-0000-000000000027', 'Hmong',            'Hmoob',           'whit1273', 'mww', NULL, 'language'),

-- Strategic stretch / deferred
('22222222-0000-0000-0000-000000000028', 'Bengali',          'বাংলা',            'beng1280', 'ben', 'bn', 'language'),
('22222222-0000-0000-0000-000000000029', 'Tamil',            'தமிழ்',             'tami1289', 'tam', 'ta', 'language'),
('22222222-0000-0000-0000-000000000030', 'Urdu',             'اردو',             'urdu1245', 'urd', 'ur', 'language');

-- ---------------------------------------------------------------------
-- PART 7: SEED DATA — TECH READINESS
-- Initial values before migration-001 upgrades mission-track languages.
-- Migration-001 comments tell us what the "before" values were:
--   Khmer: stt 'experimental', Lao: stt 'experimental'
--   K'iche', Kaqchikel, Nahuatl, Mixtec, Hmong: stt 'none'
-- Wave 1-3 and stretch languages were already production/usable.
-- ---------------------------------------------------------------------

INSERT INTO tech_readiness (language_id, stt_quality_tier, tts_quality_tier, notable_gaps) VALUES

-- Wave 1 (production-grade commercial)
('22222222-0000-0000-0000-000000000001', 'production', 'production', NULL),                         -- Spanish
('22222222-0000-0000-0000-000000000002', 'production', 'production', 'Tone marking complexity'),    -- Mandarin
('22222222-0000-0000-0000-000000000003', 'production', 'production', NULL),                         -- Tagalog
('22222222-0000-0000-0000-000000000004', 'production', 'production', 'Tone marking requires special handling'), -- Vietnamese
('22222222-0000-0000-0000-000000000005', 'production', 'production', NULL),                         -- Korean
('22222222-0000-0000-0000-000000000006', 'production', 'production', 'Dialectal variation not covered by MSA models'), -- Arabic MSA
('22222222-0000-0000-0000-000000000007', 'production', 'production', NULL),                         -- French
('22222222-0000-0000-0000-000000000008', 'production', 'production', 'PT-BR and PT-PT diverge phonetically'), -- Portuguese

-- Wave 2 (usable to production)
('22222222-0000-0000-0000-000000000009', 'production', 'production', NULL),                         -- Russian
('22222222-0000-0000-0000-000000000010', 'usable',     'usable',     'Schwa deletion complicates G2P'), -- Hindi
('22222222-0000-0000-0000-000000000011', 'usable',     'usable',     'Six-tone system; mixed script requires sophisticated G2P'), -- Cantonese
('22222222-0000-0000-0000-000000000012', 'usable',     'usable',     'Pitch accent; mixed script (Kanji/Kana)'), -- Japanese
('22222222-0000-0000-0000-000000000013', 'usable',     'usable',     'Ezafe and short vowel rendering'), -- Persian
('22222222-0000-0000-0000-000000000014', 'usable',     'usable',     'Limited training data; community-led work growing'), -- Haitian Creole

-- Wave 3 (production-grade heritage)
('22222222-0000-0000-0000-000000000015', 'production', 'production', NULL),                         -- German
('22222222-0000-0000-0000-000000000016', 'production', 'production', NULL),                         -- Italian
('22222222-0000-0000-0000-000000000017', 'production', 'production', 'Consonant cluster complexity'), -- Polish
('22222222-0000-0000-0000-000000000018', 'usable',     'usable',     NULL),                         -- Greek
('22222222-0000-0000-0000-000000000019', 'usable',     'usable',     'Eastern vs. Western Armenian variation'), -- Armenian
('22222222-0000-0000-0000-000000000020', 'production', 'production', NULL),                         -- Ukrainian

-- Wave 4 (mission track — initial values before Omnilingual upgrade in migration-001)
('22222222-0000-0000-0000-000000000021', 'experimental', 'experimental', 'Khmer script rendering; no commercial TTS; WER ~50% on Whisper'), -- Khmer
('22222222-0000-0000-0000-000000000022', 'none',         'none',         'No viable commercial STT or TTS. Latin orthography is an advantage.'), -- K''iche'
('22222222-0000-0000-0000-000000000023', 'none',         'none',         'No viable commercial STT or TTS.'),                                    -- Kaqchikel
('22222222-0000-0000-0000-000000000024', 'none',         'none',         'Variety-specific data sparse; multiple Nahuatl varieties.'),           -- Nahuatl
('22222222-0000-0000-0000-000000000025', 'none',         'none',         'Macrolanguage complexity; tonal; variety-by-variety work required.'),  -- Mixtec
('22222222-0000-0000-0000-000000000026', 'experimental', 'experimental', 'Lao script G2P limited; close relationship to Thai helps.'),          -- Lao
('22222222-0000-0000-0000-000000000027', 'none',         'none',         'White vs Green Hmong variety distinction; strong oral tradition.'),    -- Hmong

-- Strategic stretch
('22222222-0000-0000-0000-000000000028', 'usable',     'usable',     'Bengali script G2P; consonant cluster complexity'), -- Bengali
('22222222-0000-0000-0000-000000000029', 'usable',     'production', NULL),                         -- Tamil
('22222222-0000-0000-0000-000000000030', 'usable',     'usable',     'Shared pipeline potential with Hindi');            -- Urdu

-- ---------------------------------------------------------------------
-- PART 8: SEED DATA — CULTURAL DIMENSIONS (US context)
-- ---------------------------------------------------------------------

INSERT INTO cultural_dimensions (language_id, country_code, transmission_risk, oral_tradition_strength, storytelling_centrality, diaspora_cohesion, intergenerational_gap, data_sharing_norms, confidence) VALUES

-- Wave 1
('22222222-0000-0000-0000-000000000001', 'US', 'moderate', 'moderate', 'present',   'moderate', 'significant', 'open',     'estimated'), -- Spanish
('22222222-0000-0000-0000-000000000002', 'US', 'moderate', 'moderate', 'present',   'strong',   'significant', 'cautious', 'estimated'), -- Mandarin
('22222222-0000-0000-0000-000000000003', 'US', 'moderate', 'strong',   'central',   'strong',   'significant', 'open',     'estimated'), -- Tagalog
('22222222-0000-0000-0000-000000000004', 'US', 'high',     'strong',   'central',   'strong',   'severe',      'cautious', 'estimated'), -- Vietnamese
('22222222-0000-0000-0000-000000000005', 'US', 'moderate', 'moderate', 'present',   'strong',   'significant', 'cautious', 'estimated'), -- Korean
('22222222-0000-0000-0000-000000000006', 'US', 'moderate', 'strong',   'central',   'moderate', 'significant', 'cautious', 'estimated'), -- Arabic MSA
('22222222-0000-0000-0000-000000000007', 'US', 'low',      'moderate', 'peripheral','moderate', 'moderate',    'open',     'estimated'), -- French
('22222222-0000-0000-0000-000000000008', 'US', 'moderate', 'strong',   'present',   'moderate', 'significant', 'open',     'estimated'), -- Portuguese

-- Wave 2
('22222222-0000-0000-0000-000000000009', 'US', 'low',      'moderate', 'present',   'moderate', 'moderate',    'cautious', 'estimated'), -- Russian
('22222222-0000-0000-0000-000000000010', 'US', 'high',     'strong',   'central',   'strong',   'significant', 'cautious', 'estimated'), -- Hindi
('22222222-0000-0000-0000-000000000011', 'US', 'high',     'strong',   'central',   'strong',   'severe',      'cautious', 'estimated'), -- Cantonese
('22222222-0000-0000-0000-000000000012', 'US', 'moderate', 'moderate', 'present',   'strong',   'significant', 'cautious', 'estimated'), -- Japanese
('22222222-0000-0000-0000-000000000013', 'US', 'high',     'strong',   'central',   'strong',   'severe',      'cautious', 'estimated'), -- Persian
('22222222-0000-0000-0000-000000000014', 'US', 'critical', 'strong',   'central',   'strong',   'severe',      'open',     'estimated'), -- Haitian Creole

-- Wave 3
('22222222-0000-0000-0000-000000000015', 'US', 'low',      'moderate', 'peripheral','moderate', 'moderate',    'open',     'estimated'), -- German
('22222222-0000-0000-0000-000000000016', 'US', 'low',      'moderate', 'peripheral','moderate', 'moderate',    'open',     'estimated'), -- Italian
('22222222-0000-0000-0000-000000000017', 'US', 'moderate', 'moderate', 'present',   'strong',   'significant', 'cautious', 'estimated'), -- Polish
('22222222-0000-0000-0000-000000000018', 'US', 'moderate', 'strong',   'central',   'strong',   'significant', 'cautious', 'estimated'), -- Greek
('22222222-0000-0000-0000-000000000019', 'US', 'high',     'strong',   'central',   'strong',   'severe',      'cautious', 'estimated'), -- Armenian
('22222222-0000-0000-0000-000000000020', 'US', 'moderate', 'strong',   'central',   'strong',   'significant', 'cautious', 'estimated'), -- Ukrainian

-- Wave 4 (mission)
('22222222-0000-0000-0000-000000000021', 'US', 'critical', 'strong',   'central',   'strong',   'severe',      'cautious', 'estimated'), -- Khmer
('22222222-0000-0000-0000-000000000022', 'US', 'critical', 'strong',   'central',   'strong',   'severe',      'community-leader', 'estimated'), -- K''iche'
('22222222-0000-0000-0000-000000000023', 'US', 'critical', 'strong',   'central',   'strong',   'severe',      'community-leader', 'estimated'), -- Kaqchikel
('22222222-0000-0000-0000-000000000024', 'US', 'critical', 'strong',   'central',   'moderate', 'severe',      'community-leader', 'estimated'), -- Nahuatl
('22222222-0000-0000-0000-000000000025', 'US', 'critical', 'strong',   'central',   'moderate', 'severe',      'collective', 'estimated'), -- Mixtec
('22222222-0000-0000-0000-000000000026', 'US', 'critical', 'strong',   'central',   'strong',   'severe',      'cautious', 'estimated'), -- Lao
('22222222-0000-0000-0000-000000000027', 'US', 'critical', 'strong',   'central',   'strong',   'severe',      'collective', 'estimated'), -- Hmong

-- Strategic stretch
('22222222-0000-0000-0000-000000000028', 'US', 'high',     'strong',   'central',   'strong',   'significant', 'cautious', 'estimated'), -- Bengali
('22222222-0000-0000-0000-000000000029', 'US', 'high',     'strong',   'central',   'strong',   'significant', 'cautious', 'estimated'), -- Tamil
('22222222-0000-0000-0000-000000000030', 'US', 'high',     'strong',   'central',   'strong',   'significant', 'cautious', 'estimated'); -- Urdu

-- ---------------------------------------------------------------------
-- PART 9: SEED DATA — SPEAKER POPULATIONS (US, estimates)
-- Source: US Census ACS 2022, Pew Research, community org estimates.
-- l1_speakers = US diaspora first-language speakers (approximate).
-- age_60_plus_pct = estimated % of US speakers aged 60+ (Babagigi target).
-- All confidence = 'estimated' — update with real census data.
-- ---------------------------------------------------------------------

INSERT INTO speaker_populations (language_id, country_code, context, l1_speakers, age_60_plus_pct, data_year, source_id, confidence) VALUES

-- Wave 1
('22222222-0000-0000-0000-000000000001', 'US', 'diaspora', 41800000, 14.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Spanish
('22222222-0000-0000-0000-000000000002', 'US', 'diaspora',  3500000, 22.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Mandarin
('22222222-0000-0000-0000-000000000003', 'US', 'diaspora',  1760000, 18.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Tagalog
('22222222-0000-0000-0000-000000000004', 'US', 'diaspora',  1610000, 21.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Vietnamese
('22222222-0000-0000-0000-000000000005', 'US', 'diaspora',  1080000, 17.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Korean
('22222222-0000-0000-0000-000000000006', 'US', 'diaspora',  1230000, 23.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Arabic MSA
('22222222-0000-0000-0000-000000000007', 'US', 'diaspora',   685000, 19.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- French
('22222222-0000-0000-0000-000000000008', 'US', 'diaspora',   750000, 16.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Portuguese

-- Wave 2
('22222222-0000-0000-0000-000000000009', 'US', 'diaspora',   870000, 24.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Russian
('22222222-0000-0000-0000-000000000010', 'US', 'diaspora',   790000, 25.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Hindi
('22222222-0000-0000-0000-000000000011', 'US', 'diaspora',   555000, 28.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Cantonese
('22222222-0000-0000-0000-000000000012', 'US', 'diaspora',   460000, 22.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Japanese
('22222222-0000-0000-0000-000000000013', 'US', 'diaspora',   370000, 26.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Persian
('22222222-0000-0000-0000-000000000014', 'US', 'diaspora',   830000, 31.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Haitian Creole

-- Wave 3
('22222222-0000-0000-0000-000000000015', 'US', 'diaspora',  1020000, 38.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- German
('22222222-0000-0000-0000-000000000016', 'US', 'diaspora',   710000, 41.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Italian
('22222222-0000-0000-0000-000000000017', 'US', 'diaspora',   480000, 35.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Polish
('22222222-0000-0000-0000-000000000018', 'US', 'diaspora',   360000, 36.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Greek
('22222222-0000-0000-0000-000000000019', 'US', 'diaspora',   300000, 39.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Armenian
('22222222-0000-0000-0000-000000000020', 'US', 'diaspora',   335000, 27.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Ukrainian

-- Wave 4 (mission — smaller US communities, many recent arrivals)
('22222222-0000-0000-0000-000000000021', 'US', 'diaspora',   340000, 29.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Khmer
('22222222-0000-0000-0000-000000000022', 'US', 'diaspora',    85000, 32.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- K''iche'
('22222222-0000-0000-0000-000000000023', 'US', 'diaspora',    42000, 30.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Kaqchikel
('22222222-0000-0000-0000-000000000024', 'US', 'diaspora',   170000, 28.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Nahuatl
('22222222-0000-0000-0000-000000000025', 'US', 'diaspora',   115000, 31.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Mixtec
('22222222-0000-0000-0000-000000000026', 'US', 'diaspora',   250000, 26.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Lao
('22222222-0000-0000-0000-000000000027', 'US', 'diaspora',   330000, 29.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Hmong

-- Strategic stretch
('22222222-0000-0000-0000-000000000028', 'US', 'diaspora',   310000, 20.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Bengali
('22222222-0000-0000-0000-000000000029', 'US', 'diaspora',   250000, 21.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'), -- Tamil
('22222222-0000-0000-0000-000000000030', 'US', 'diaspora',   420000, 22.0, 2022, '11111111-0000-0000-0000-000000000001', 'estimated'); -- Urdu

-- ---------------------------------------------------------------------
-- PART 10: SEED DATA — PRODUCT STATUS (Babagigi wave assignments)
-- ---------------------------------------------------------------------

INSERT INTO product_status (language_id, product, wave, status) VALUES

-- Wave 1: Core commercial languages
('22222222-0000-0000-0000-000000000001', 'babagigi', 'wave-1', 'planned'),   -- Spanish
('22222222-0000-0000-0000-000000000002', 'babagigi', 'wave-1', 'planned'),   -- Mandarin
('22222222-0000-0000-0000-000000000003', 'babagigi', 'wave-1', 'planned'),   -- Tagalog
('22222222-0000-0000-0000-000000000004', 'babagigi', 'wave-1', 'planned'),   -- Vietnamese
('22222222-0000-0000-0000-000000000005', 'babagigi', 'wave-1', 'planned'),   -- Korean
('22222222-0000-0000-0000-000000000006', 'babagigi', 'wave-1', 'planned'),   -- Arabic MSA
('22222222-0000-0000-0000-000000000007', 'babagigi', 'wave-1', 'planned'),   -- French
('22222222-0000-0000-0000-000000000008', 'babagigi', 'wave-1', 'planned'),   -- Portuguese

-- Wave 2: Demand expansion
('22222222-0000-0000-0000-000000000009', 'babagigi', 'wave-2', 'planned'),   -- Russian
('22222222-0000-0000-0000-000000000010', 'babagigi', 'wave-2', 'planned'),   -- Hindi
('22222222-0000-0000-0000-000000000011', 'babagigi', 'wave-2', 'planned'),   -- Cantonese
('22222222-0000-0000-0000-000000000012', 'babagigi', 'wave-2', 'planned'),   -- Japanese
('22222222-0000-0000-0000-000000000013', 'babagigi', 'wave-2', 'planned'),   -- Persian
('22222222-0000-0000-0000-000000000014', 'babagigi', 'wave-2', 'planned'),   -- Haitian Creole

-- Wave 3: Aging heritage
('22222222-0000-0000-0000-000000000015', 'babagigi', 'wave-3', 'planned'),   -- German
('22222222-0000-0000-0000-000000000016', 'babagigi', 'wave-3', 'planned'),   -- Italian
('22222222-0000-0000-0000-000000000017', 'babagigi', 'wave-3', 'planned'),   -- Polish
('22222222-0000-0000-0000-000000000018', 'babagigi', 'wave-3', 'planned'),   -- Greek
('22222222-0000-0000-0000-000000000019', 'babagigi', 'wave-3', 'planned'),   -- Armenian
('22222222-0000-0000-0000-000000000020', 'babagigi', 'wave-3', 'planned'),   -- Ukrainian

-- Wave 4: Mission track (Omnilingual unlocked)
('22222222-0000-0000-0000-000000000021', 'babagigi', 'wave-4', 'planned'),   -- Khmer
('22222222-0000-0000-0000-000000000022', 'babagigi', 'wave-4', 'planned'),   -- K''iche'
('22222222-0000-0000-0000-000000000023', 'babagigi', 'wave-4', 'planned'),   -- Kaqchikel
('22222222-0000-0000-0000-000000000024', 'babagigi', 'wave-4', 'planned'),   -- Nahuatl
('22222222-0000-0000-0000-000000000025', 'babagigi', 'wave-4', 'planned'),   -- Mixtec
('22222222-0000-0000-0000-000000000026', 'babagigi', 'wave-4', 'planned'),   -- Lao
('22222222-0000-0000-0000-000000000027', 'babagigi', 'wave-4', 'planned'),   -- Hmong

-- Strategic stretch / deferred
('22222222-0000-0000-0000-000000000028', 'babagigi', 'strategic-stretch', 'deferred'), -- Bengali
('22222222-0000-0000-0000-000000000029', 'babagigi', 'strategic-stretch', 'deferred'), -- Tamil
('22222222-0000-0000-0000-000000000030', 'babagigi', 'strategic-stretch', 'deferred'); -- Urdu

-- ---------------------------------------------------------------------
-- PART 11: SEED DATA — FIELD PARTNERSHIPS
-- Minimal seed: only confirmed active/exploratory partnerships.
-- ---------------------------------------------------------------------

INSERT INTO field_partnerships (language_id, partner_organization, partner_country, partner_status, partnership_type, notes) VALUES
('22222222-0000-0000-0000-000000000021', 'Cambodian Cultural Organization (TBD)',           'US', 'exploratory', 'research',    'Long Beach CA Cambodian community — relationship not yet formalized'),
('22222222-0000-0000-0000-000000000022', 'Golden Leaf Foundation',                          'GT', 'exploratory', 'research',    'K''iche'' primary partner; also covers Kaqchikel languages'),
('22222222-0000-0000-0000-000000000023', 'Golden Leaf Foundation',                          'GT', 'exploratory', 'research',    'Kaqchikel work shared with K''iche'' partnership'),
('22222222-0000-0000-0000-000000000024', 'Indigenous Language Institute (TBD)',              'MX', 'exploratory', 'research',    'Eastern Huasteca Nahuatl focus; partner organization TBD'),
('22222222-0000-0000-0000-000000000025', 'Mixtec Community Organization (TBD)',              'US', 'exploratory', 'research',    'US diaspora entry point; connect to homeland orgs');

-- =====================================================================
-- END MIGRATION 000 (RECONSTRUCTED)
--
-- To verify this ran correctly:
--   SELECT count(*) FROM languages;     -- should return 30
--   SELECT count(*) FROM tech_readiness; -- should return 30
--   SELECT count(*) FROM sources;       -- should return 1
--
-- After running migrations 001-007, verify:
--   SELECT english_name, stt_quality_tier FROM tech_readiness
--   JOIN languages ON languages.id = tech_readiness.language_id
--   WHERE stt_quality_tier IN ('usable', 'production')
--   ORDER BY english_name;
-- =====================================================================
