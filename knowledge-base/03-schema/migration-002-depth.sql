-- =====================================================================
-- Migration 002: Comprehensive Depth for Language Preservation Work
-- 
-- This migration transforms the database from a product-decision tool
-- into a research-grade language preservation infrastructure that
-- supports TomorrowLabs's long-horizon mission.
--
-- Major additions:
--   1. EGIDS classification (Ethnologue/SIL standard)
--   2. UNESCO vitality framework
--   3. Transmission assessments (time-series)
--   4. Domain usage tracking
--   5. Institutional support indicators
--   6. Documentation status
--   7. Revitalization activity
--   8. Orthography and writing systems
--   9. External reference linkages
--  10. Geographic distribution (sub-national)
--  11. Funding & partnership landscape
--  12. Audio corpora beyond Common Voice
--  13. Glottolog formalization
--
-- =====================================================================

-- ---------------------------------------------------------------------
-- PART 1: NEW ENUMS
-- ---------------------------------------------------------------------

-- EGIDS scale (Ethnologue/SIL — the academic standard)
CREATE TYPE egids_level AS ENUM (
  '0-international',        -- Used widely between nations in trade, knowledge exchange, policy
  '1-national',             -- Used in education, work, mass media, government at national level
  '2-provincial',           -- Used in education, work, mass media, government at regional level
  '3-wider-communication',  -- Used in work and mass media without official status
  '4-educational',          -- In vigorous use, with standardization and literature being sustained through education
  '5-developing',           -- In vigorous use, with literature in a standardized form being used by some though not yet widespread
  '6a-vigorous',            -- Used for face-to-face communication by all generations and the situation is sustainable
  '6b-threatened',          -- Used for face-to-face communication within all generations but losing users
  '7-shifting',             -- The child-bearing generation can use the language but is not transmitting it to children
  '8a-moribund',            -- The only remaining active users are members of the grandparent generation
  '8b-nearly-extinct',      -- The only remaining users are members of the grandparent generation or older with limited opportunity to use
  '9-dormant',              -- The language serves as a reminder of heritage identity but no one has more than symbolic proficiency
  '10-extinct'              -- The language is no longer used and no one retains a sense of ethnic identity associated with it
);

-- UNESCO vitality scale
CREATE TYPE unesco_vitality AS ENUM (
  'safe',
  'vulnerable',
  'definitely-endangered',
  'severely-endangered',
  'critically-endangered',
  'extinct'
);

-- Language Endangerment Index (ELP/Catalogue of Endangered Languages)
CREATE TYPE elp_status AS ENUM (
  'at-risk',
  'vulnerable',
  'threatened',
  'endangered',
  'severely-endangered',
  'critically-endangered',
  'awakening',
  'dormant'
);

-- Domain of language use
CREATE TYPE language_domain AS ENUM (
  'home',
  'extended-family',
  'religious',
  'education-primary',
  'education-secondary',
  'education-tertiary',
  'government',
  'commerce',
  'mass-media',
  'social-media',
  'literature',
  'arts',
  'workplace',
  'community-events',
  'intergenerational-storytelling'
);

-- Strength of language presence in a domain
CREATE TYPE domain_strength AS ENUM (
  'dominant',     -- This is the primary language in this domain
  'co-equal',     -- Used alongside another language
  'limited',      -- Used in some contexts within this domain
  'symbolic',     -- Used ceremonially or for identity but not functional communication
  'absent'        -- Not present in this domain
);

-- Documentation status
CREATE TYPE documentation_level AS ENUM (
  'extensive',         -- Multiple grammars, dictionaries, large recorded corpora
  'substantial',       -- Major grammar, dictionary, sizable documentation
  'moderate',          -- Some published documentation, sketch grammar, partial dictionary
  'limited',           -- Wordlist or sketch documentation
  'minimal',           -- A few publications or observations
  'undocumented'
);

-- Institutional recognition level
CREATE TYPE recognition_level AS ENUM (
  'official-international',  -- UN language, EU official language, etc.
  'official-national',       -- Official/co-official language of a nation
  'official-regional',       -- Official in a state/province/region
  'recognized-minority',     -- Legally recognized as a minority language with protections
  'recognized-indigenous',   -- Recognized indigenous status with cultural protections
  'tolerated',               -- Permitted but no formal recognition
  'unrecognized',            -- No formal recognition
  'restricted',              -- Actively restricted or suppressed
  'historically-suppressed'  -- Currently improving from past suppression
);

-- Orthography development status
CREATE TYPE orthography_status AS ENUM (
  'standardized',          -- One widely accepted orthography
  'multiple-competing',    -- Multiple orthographies in use
  'emerging',              -- Orthography development underway
  'contested',             -- Active disagreement about orthography
  'oral-primary',          -- Language is primarily oral; written form rare
  'historical-only'        -- Written form used only for historical/religious texts
);

-- Revitalization activity level
CREATE TYPE revitalization_level AS ENUM (
  'active-large-scale',    -- Government programs, immersion schools, broad institutional support
  'active-community-led',  -- Community-driven programs, language nests, classes
  'emerging',              -- Beginning efforts, scattered initiatives
  'documentation-only',    -- Academic documentation but no community revitalization
  'none-documented',       -- No revitalization activity identified
  'not-applicable'         -- Language is safely transmitted; revitalization not needed
);

-- Source of audio corpus
CREATE TYPE corpus_source AS ENUM (
  'mozilla-common-voice',
  'fleurs',
  'voxpopuli',
  'mls',
  'librispeech',
  'omnilingual-corpus',
  'paradisec',
  'elar',
  'archive-org',
  'community-partner-corpus',
  'tomorrowlabs-internal',
  'university-archive',
  'commercial-licensed',
  'other-open-source',
  'other-proprietary'
);

-- ---------------------------------------------------------------------
-- PART 2: FORMALIZE GLOTTOLOG COMMITMENT
-- ---------------------------------------------------------------------

-- Make Glottocode required and unique going forward
-- (existing rows may need backfilling before this constraint applies)
ALTER TABLE languages
  ALTER COLUMN glottocode DROP NOT NULL;  -- temporarily nullable during migration

-- Add a flag for whether the row has been validated against Glottolog's
-- canonical catalog, so we can audit data integrity over time
ALTER TABLE languages
  ADD COLUMN glottolog_validated boolean DEFAULT false,
  ADD COLUMN glottolog_last_synced date,
  ADD COLUMN glottolog_parent_glottocode text,    -- Glottolog's parent reference
  ADD COLUMN ethnologue_status text,              -- Ethnologue's classification for cross-reference
  ADD COLUMN linguasphere_code text,              -- Linguasphere Register (Dalby system)
  ADD COLUMN wals_code text;                      -- WALS structural database reference

COMMENT ON COLUMN languages.glottolog_validated IS
  'True only after row has been verified against canonical Glottolog data. Required before language is used for any TomorrowLabs published research or external citation.';

COMMENT ON COLUMN languages.glottolog_parent_glottocode IS
  'Glottolog parent languoid identifier. Independent of TomorrowLabs internal parent_language_id, which may differ for community-respectful reasons.';

-- ---------------------------------------------------------------------
-- PART 3: VITALITY CLASSIFICATIONS
-- ---------------------------------------------------------------------

CREATE TABLE vitality_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  -- Multiple framework classifications
  egids_level egids_level,
  unesco_vitality unesco_vitality,
  elp_status elp_status,
  
  -- Assessment context
  assessment_date date NOT NULL,
  assessment_scope text,        -- "global", "United States diaspora", "Cambodia rural", etc.
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'medium',
  
  -- Free-form rationale
  rationale text,
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_vitality_lang ON vitality_assessments(language_id);
CREATE INDEX idx_vitality_egids ON vitality_assessments(egids_level);
CREATE INDEX idx_vitality_unesco ON vitality_assessments(unesco_vitality);

-- ---------------------------------------------------------------------
-- PART 4: TRANSMISSION ASSESSMENTS (TIME-SERIES)
-- ---------------------------------------------------------------------
-- The core mechanism for tracking how language transmission changes
-- over time. Each row is a snapshot at a moment in time and a place.

CREATE TABLE transmission_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  -- When and where
  assessment_date date NOT NULL,
  country_code text,
  region text,
  community_identifier text,    -- e.g., "Long Beach Cambodian community", "Sololá K'iche' communities"
  
  -- Age-cohort transmission signals
  pct_under_5_with_l1 decimal(5,2),       -- % of under-5 children with this as L1
  pct_5_to_18_fluent decimal(5,2),        -- % of 5-18 year olds fluent
  pct_18_to_40_fluent decimal(5,2),       -- % of 18-40 fluent
  pct_40_to_60_fluent decimal(5,2),       -- % of 40-60 fluent
  pct_60_plus_fluent decimal(5,2),        -- % of 60+ fluent
  
  -- Sentinel indicators
  youngest_fluent_speaker_age integer,
  median_fluent_speaker_age integer,
  acquisition_status text,                -- "All children acquiring", "Some children", "No children", etc.
  
  -- Direction of change
  trajectory text,                        -- "Stable", "Declining", "Recovering", "Critically declining"
  trajectory_confidence confidence_level,
  
  -- Provenance
  source_id uuid REFERENCES sources(id),
  methodology text,                       -- Census, ethnographic survey, partner report, expert estimate
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_transmission_lang_date ON transmission_assessments(language_id, assessment_date DESC);

COMMENT ON TABLE transmission_assessments IS
  'Time-series transmission data. Critical for tracking trajectory over years. New row per assessment, never updated in place — preserves historical record.';

-- ---------------------------------------------------------------------
-- PART 5: DOMAIN USAGE
-- ---------------------------------------------------------------------

CREATE TABLE domain_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  assessment_date date NOT NULL,
  country_code text,
  region text,
  
  domain language_domain NOT NULL,
  strength domain_strength NOT NULL,
  
  -- Trajectory in this domain
  is_expanding boolean,
  is_contracting boolean,
  
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_domain_lang ON domain_usage(language_id, assessment_date DESC);
CREATE INDEX idx_domain_lookup ON domain_usage(language_id, domain);

-- ---------------------------------------------------------------------
-- PART 6: INSTITUTIONAL SUPPORT
-- ---------------------------------------------------------------------

CREATE TABLE institutional_support (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  country_code text NOT NULL,
  
  -- Recognition status
  recognition_level recognition_level NOT NULL,
  recognition_basis text,                  -- Citation: constitution article, law, policy
  recognition_date date,
  
  -- Specific institutional facts
  has_official_orthography boolean DEFAULT false,
  has_government_translation_services boolean DEFAULT false,
  has_court_interpretation_rights boolean DEFAULT false,
  has_public_education boolean DEFAULT false,
  has_higher_education boolean DEFAULT false,
  has_state_media boolean DEFAULT false,
  
  -- Census visibility
  appears_in_national_census boolean DEFAULT false,
  census_methodology_notes text,
  
  source_id uuid REFERENCES sources(id),
  last_reviewed date DEFAULT CURRENT_DATE,
  notes text
);

CREATE INDEX idx_institutional_lang_country ON institutional_support(language_id, country_code);

-- ---------------------------------------------------------------------
-- PART 7: DOCUMENTATION STATUS
-- ---------------------------------------------------------------------

CREATE TABLE documentation_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  assessment_date date NOT NULL,
  
  -- Overall level
  overall_level documentation_level NOT NULL,
  
  -- Specific resources
  has_published_grammar boolean DEFAULT false,
  has_dictionary boolean DEFAULT false,
  has_text_corpus boolean DEFAULT false,
  has_audio_corpus boolean DEFAULT false,
  has_video_corpus boolean DEFAULT false,
  has_pedagogical_materials boolean DEFAULT false,
  has_translated_religious_texts boolean DEFAULT false,
  has_literary_tradition boolean DEFAULT false,
  
  -- Where the documentation lives
  primary_archives text[],            -- e.g., ['PARADISEC', 'ELAR', 'University of Toronto']
  
  -- Gaps
  major_documentation_gaps text,
  
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text
);

CREATE INDEX idx_doc_status_lang ON documentation_status(language_id, assessment_date DESC);

-- ---------------------------------------------------------------------
-- PART 8: REVITALIZATION ACTIVITY
-- ---------------------------------------------------------------------

CREATE TABLE revitalization_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  program_name text,
  organization text,
  country_code text,
  region text,
  
  program_type text,           -- "immersion-school", "language-nest", "master-apprentice",
                               -- "online-platform", "media-production", "documentation-project"
  
  start_year integer,
  end_year integer,            -- null = ongoing
  participant_count integer,
  
  funding_sources text[],      -- Helpful for grant landscape mapping
  
  url text,
  contact_info text,
  
  is_potential_partner boolean DEFAULT false,
  partnership_notes text,
  
  source_id uuid REFERENCES sources(id),
  last_reviewed date DEFAULT CURRENT_DATE,
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_revital_lang ON revitalization_programs(language_id);
CREATE INDEX idx_revital_partner ON revitalization_programs(is_potential_partner) WHERE is_potential_partner = true;

-- Overall revitalization level summary (separate from individual programs)
CREATE TABLE revitalization_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  overall_level revitalization_level NOT NULL,
  assessment_date date NOT NULL,
  
  community_attitude text,        -- "Strong pride", "Mixed", "Stigmatized", etc.
  generational_attitude_gap text, -- Are younger generations more or less invested?
  
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text
);

-- ---------------------------------------------------------------------
-- PART 9: ORTHOGRAPHIES & WRITING SYSTEMS
-- ---------------------------------------------------------------------

CREATE TABLE orthographies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  name text NOT NULL,             -- "Hangul", "Quốc Ngữ", "Khmer script", "RPA Hmong"
  script_iso15924 text,           -- ISO 15924 script code (e.g., 'Khmr', 'Latn', 'Hang')
  is_primary boolean DEFAULT false,
  status orthography_status,
  
  origin_year integer,
  developed_by text,
  
  community_acceptance text,      -- "Universal", "Majority", "Contested", "Limited"
  used_in text[],                 -- ['religious-texts', 'education', 'media', 'community-only']
  
  unicode_blocks text[],
  font_availability text,         -- "Excellent", "Good", "Limited", "Specialized fonts required"
  rendering_complexity text,      -- "Standard", "Complex shaping required", "Bidirectional", etc.
  
  notes text,
  source_id uuid REFERENCES sources(id)
);

CREATE INDEX idx_orth_lang ON orthographies(language_id);

-- ---------------------------------------------------------------------
-- PART 10: GEOGRAPHIC DISTRIBUTION (sub-national)
-- ---------------------------------------------------------------------

CREATE TABLE geographic_concentrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  country_code text NOT NULL,
  region text NOT NULL,           -- State, province, county, metro area
  region_type text,               -- 'state', 'metro-area', 'county', 'neighborhood'
  
  estimated_speakers integer,
  is_historical_origin boolean DEFAULT false,
  is_diaspora_concentration boolean DEFAULT false,
  
  community_organizations text[],  -- Cultural orgs, heritage schools, churches
  
  source_id uuid REFERENCES sources(id),
  data_year integer,
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text
);

CREATE INDEX idx_geo_lang_country ON geographic_concentrations(language_id, country_code);

-- ---------------------------------------------------------------------
-- PART 11: AUDIO CORPORA (beyond Common Voice)
-- ---------------------------------------------------------------------

CREATE TABLE audio_corpora (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  corpus_name text NOT NULL,
  source corpus_source NOT NULL,
  
  total_hours decimal(10,2),
  validated_hours decimal(10,2),
  speaker_count integer,
  
  speech_type text,               -- 'read', 'spontaneous', 'narrative', 'conversational', 'oratorical'
  domain_coverage text[],         -- What domains are covered
  
  -- Rights
  license text,                   -- 'CC0', 'CC-BY', 'CC-BY-SA', 'CC-BY-NC', 'proprietary', etc.
  community_consent_documented boolean DEFAULT false,
  benefit_sharing_terms text,
  
  -- Quality
  audio_quality text,             -- 'studio', 'good', 'variable', 'field-conditions'
  transcription_quality text,
  
  url text,
  contact text,
  
  release_date date,
  last_updated date,
  
  notes text,
  source_id uuid REFERENCES sources(id)
);

CREATE INDEX idx_audio_lang ON audio_corpora(language_id);
CREATE INDEX idx_audio_source ON audio_corpora(source);

-- ---------------------------------------------------------------------
-- PART 12: FUNDING & ECOSYSTEM LANDSCAPE
-- ---------------------------------------------------------------------

CREATE TABLE funding_landscape (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid REFERENCES languages(id),     -- nullable: some funders cross-cutting
  
  funder_name text NOT NULL,
  funder_type text,               -- 'foundation', 'government', 'NGO', 'university', 'corporate', 'individual'
  
  program_name text,
  focus_area text,
  geographic_focus text,
  
  typical_grant_size_usd numeric(12, 2),
  application_cycle text,
  
  url text,
  contact text,
  
  is_potential_funder boolean DEFAULT false,
  fit_assessment text,
  last_contacted date,
  
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_funding_lang ON funding_landscape(language_id);
CREATE INDEX idx_funding_potential ON funding_landscape(is_potential_funder) WHERE is_potential_funder = true;

-- ---------------------------------------------------------------------
-- PART 13: COMMUNITY POSITIONS
-- ---------------------------------------------------------------------
-- Critical for the Glottolog-as-tool-not-truth commitment.
-- When community classifications differ from academic classifications,
-- both must be recorded.

CREATE TABLE community_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  community_name text NOT NULL,    -- Who holds this position
  position_type text NOT NULL,     -- 'classification', 'naming', 'orthography', 'recognition'
  
  position_summary text NOT NULL,
  academic_position_summary text,   -- What Glottolog/Ethnologue say
  
  position_documented_via text,     -- Letter, statement, partnership agreement, field interview
  documented_date date,
  documented_by text,
  
  tomorrowlabs_response text,       -- How we handle the disagreement in product/research
  
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_community_lang ON community_positions(language_id);

COMMENT ON TABLE community_positions IS
  'Records community linguistic positions that may differ from academic classifications. This is the structural mechanism for treating Glottolog as a tool rather than truth. When in conflict, both are preserved.';

-- ---------------------------------------------------------------------
-- PART 14: ADDITIONAL REFERENCE LINKAGES
-- ---------------------------------------------------------------------

CREATE TABLE reference_identifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  
  system_name text NOT NULL,       -- 'PHOIBLE', 'AUSTLANG', 'ELP', 'OLAC', 'MultiTree', 'Wikidata'
  identifier text NOT NULL,
  url text,
  notes text
);

CREATE INDEX idx_refid_lang ON reference_identifiers(language_id);
CREATE UNIQUE INDEX idx_refid_unique ON reference_identifiers(language_id, system_name, identifier);

-- ---------------------------------------------------------------------
-- PART 15: VIEWS — research-grade queries
-- ---------------------------------------------------------------------

-- Most recent vitality per language across all frameworks
CREATE OR REPLACE VIEW current_vitality AS
SELECT DISTINCT ON (va.language_id)
  l.english_name,
  l.glottocode,
  va.egids_level,
  va.unesco_vitality,
  va.elp_status,
  va.assessment_date,
  va.confidence
FROM vitality_assessments va
JOIN languages l ON l.id = va.language_id
ORDER BY va.language_id, va.assessment_date DESC;

-- Most recent transmission state per language
CREATE OR REPLACE VIEW current_transmission AS
SELECT DISTINCT ON (ta.language_id, ta.country_code)
  l.english_name,
  l.glottocode,
  ta.country_code,
  ta.region,
  ta.youngest_fluent_speaker_age,
  ta.median_fluent_speaker_age,
  ta.pct_under_5_with_l1,
  ta.pct_5_to_18_fluent,
  ta.trajectory,
  ta.assessment_date
FROM transmission_assessments ta
JOIN languages l ON l.id = ta.language_id
ORDER BY ta.language_id, ta.country_code, ta.assessment_date DESC;

-- Transmission trajectory (multi-year comparison)
CREATE OR REPLACE VIEW transmission_trajectory AS
WITH ranked AS (
  SELECT
    ta.*,
    l.english_name,
    l.glottocode,
    ROW_NUMBER() OVER (
      PARTITION BY ta.language_id, ta.country_code 
      ORDER BY ta.assessment_date DESC
    ) AS recency_rank
  FROM transmission_assessments ta
  JOIN languages l ON l.id = ta.language_id
)
SELECT
  r1.english_name,
  r1.glottocode,
  r1.country_code,
  r1.region,
  r1.assessment_date AS latest_date,
  r2.assessment_date AS prior_date,
  r1.youngest_fluent_speaker_age AS current_youngest,
  r2.youngest_fluent_speaker_age AS prior_youngest,
  (r1.youngest_fluent_speaker_age - r2.youngest_fluent_speaker_age) AS youngest_age_change,
  r1.trajectory AS current_trajectory
FROM ranked r1
LEFT JOIN ranked r2 
  ON r2.language_id = r1.language_id 
  AND r2.country_code = r1.country_code 
  AND r2.recency_rank = 2
WHERE r1.recency_rank = 1;

-- Intervention priorities: combines vitality, transmission, partnerships, and audio gap
CREATE OR REPLACE VIEW intervention_priorities AS
SELECT
  l.english_name,
  l.glottocode,
  cv.egids_level,
  cv.unesco_vitality,
  ct.youngest_fluent_speaker_age,
  ct.trajectory,
  fp.partner_organization,
  fp.partner_status,
  COALESCE(SUM(ac.validated_hours), 0) AS total_audio_hours,
  CASE
    WHEN cv.egids_level IN ('7-shifting', '8a-moribund', '8b-nearly-extinct')
      AND fp.partner_status = 'active' THEN 'urgent-active-partner'
    WHEN cv.egids_level IN ('7-shifting', '8a-moribund', '8b-nearly-extinct')
      AND fp.partner_status IS NULL THEN 'urgent-partnership-gap'
    WHEN cv.unesco_vitality IN ('severely-endangered','critically-endangered')
      AND COALESCE(SUM(ac.validated_hours), 0) < 50 THEN 'documentation-gap-critical'
    WHEN ct.trajectory = 'critically-declining' THEN 'trajectory-alarm'
    ELSE 'stable-or-monitoring'
  END AS priority_category
FROM languages l
LEFT JOIN current_vitality cv ON cv.glottocode = l.glottocode
LEFT JOIN current_transmission ct ON ct.glottocode = l.glottocode
LEFT JOIN field_partnerships fp ON fp.language_id = l.id
LEFT JOIN audio_corpora ac ON ac.language_id = l.id
GROUP BY 
  l.english_name, l.glottocode, cv.egids_level, cv.unesco_vitality,
  ct.youngest_fluent_speaker_age, ct.trajectory,
  fp.partner_organization, fp.partner_status;

-- Documentation gaps: where intervention investment would matter most
CREATE OR REPLACE VIEW documentation_gaps AS
SELECT
  l.english_name,
  l.glottocode,
  ds.overall_level AS doc_level,
  ds.has_audio_corpus,
  ds.has_dictionary,
  ds.has_published_grammar,
  cv.unesco_vitality,
  cv.egids_level,
  ds.major_documentation_gaps
FROM languages l
JOIN documentation_status ds ON ds.language_id = l.id
LEFT JOIN current_vitality cv ON cv.glottocode = l.glottocode
WHERE ds.overall_level IN ('limited', 'minimal', 'undocumented')
  OR (ds.has_audio_corpus = false AND cv.unesco_vitality IN ('severely-endangered','critically-endangered'));

-- =====================================================================
-- END MIGRATION 002
-- =====================================================================
