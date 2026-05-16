-- =====================================================================
-- Migration 004: Layer 2 — Observational Data
--
-- Time-series tracking of how the world changes across the dimensions
-- TomorrowLabs's decisions depend on. Each table follows a standardized
-- observation pattern so the layer queries cohesively.
--
-- The discipline of this layer:
--   - Time-stamped, never overwritten
--   - Multi-source: same fact can have multiple observations from different sources
--   - Confidence-graded: explicit about what we know well vs. estimate
--   - Sparse by default: empty fields are honest, not failures
--   - Cadence-aware: tables note the expected refresh rate
--   - Trajectory-enabling: structured for time-series queries
-- =====================================================================

-- =====================================================================
-- PART 1: NEW ENUMS FOR OBSERVATIONAL LAYER
-- =====================================================================

CREATE TYPE observation_cadence AS ENUM (
  'real-time',           -- Continuous (rare in our work)
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annual',
  'biennial',
  'multi-year',          -- Every 3-10 years (census-style)
  'episodic',            -- Only when events happen
  'one-time'             -- Snapshot, not refreshed
);

CREATE TYPE methodology_type AS ENUM (
  'census',
  'representative-survey',
  'partner-report',
  'ethnographic-fieldwork',
  'administrative-data',
  'sensor-data',
  'expert-estimate',
  'community-self-report',
  'aggregated-from-sources',
  'predictive-model',
  'manual-review'
);

CREATE TYPE indicator_direction AS ENUM (
  'improving',
  'stable',
  'declining',
  'volatile',
  'reversing',           -- Changing direction
  'unknown'
);

CREATE TYPE event_significance AS ENUM (
  'transformative',      -- Changes the landscape materially
  'significant',         -- Notable shift
  'moderate',            -- Worth tracking
  'minor',               -- For completeness
  'monitoring-only'      -- Background noise but recorded
);

CREATE TYPE migration_flow_type AS ENUM (
  'voluntary-economic',
  'voluntary-family-reunification',
  'voluntary-education',
  'voluntary-retirement',
  'forced-conflict',
  'forced-climate',
  'forced-economic-crisis',
  'forced-political',
  'circular-seasonal',
  'mixed',
  'unknown'
);

-- =====================================================================
-- PART 2: STANDARDIZED OBSERVATION HELPER TABLE
-- =====================================================================
-- A "registry" of all observation tables in Layer 2. Lets us query
-- "which observation tables track place demographics?" or "which 
-- observations are due for refresh?" across the whole layer.

CREATE TABLE observation_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  table_name text NOT NULL UNIQUE,
  observed_entity_type text NOT NULL,    -- 'place', 'language', 'organization', 'community', 'cross-entity'
  observation_domain text NOT NULL,      -- 'demographics', 'economic', 'tech', 'cultural', etc.
  
  expected_cadence observation_cadence NOT NULL,
  typical_lag_days integer,              -- How many days after period end does data typically become available
  
  primary_sources text[],                -- Where the data typically comes from
  
  description text,
  notes text,
  
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE observation_registry IS
  'Meta-registry of all observational tables. Lets us track what we observe, how often we observe it, and where the data comes from at the layer level rather than per-table.';

-- =====================================================================
-- PART 3: MIGRATION FLOWS BETWEEN PLACES
-- =====================================================================
-- Critical for understanding diaspora dynamics. The Cambodian-American
-- community exists because of specific migration flows in specific eras.

CREATE TABLE migration_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Where and to where
  origin_place_id uuid NOT NULL REFERENCES places(id),
  destination_place_id uuid NOT NULL REFERENCES places(id),
  
  -- When
  observation_year integer NOT NULL,
  observation_period_start date,
  observation_period_end date,
  
  -- Magnitude
  estimated_flow_count integer,
  flow_count_confidence confidence_level NOT NULL DEFAULT 'medium',
  
  -- Character of the flow
  flow_type migration_flow_type,
  is_first_generation boolean,           -- New migrants vs. second-generation movement
  
  -- Demographic composition (where known)
  pct_under_18 decimal(5,2),
  pct_18_to_40 decimal(5,2),
  pct_40_to_65 decimal(5,2),
  pct_65_plus decimal(5,2),
  pct_female decimal(5,2),
  
  -- Languages associated with this flow
  associated_language_ids uuid[],
  
  -- Context
  driving_factors text,                  -- "Post-Khmer Rouge refugee resettlement" etc.
  policy_context text,                   -- Visa programs, refugee acts, etc.
  
  source_id uuid REFERENCES sources(id),
  methodology methodology_type,
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_migration_origin_dest ON migration_flows(origin_place_id, destination_place_id, observation_year DESC);
CREATE INDEX idx_migration_year ON migration_flows(observation_year);
CREATE INDEX idx_migration_languages ON migration_flows USING gin(associated_language_ids);

COMMENT ON TABLE migration_flows IS
  'Time-series migration data between place pairs. Used to understand diaspora dynamics, refugee waves, and demographic shifts that produce heritage language populations.';

-- =====================================================================
-- PART 4: LANGUAGE-PLACE PRESENCE OVER TIME
-- =====================================================================
-- A language's presence in a place changes over time. The Khmer-speaking
-- population in Long Beach has a specific historical trajectory. This
-- table captures that as time-series data.

CREATE TABLE language_place_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  language_id uuid NOT NULL REFERENCES languages(id),
  place_id uuid NOT NULL REFERENCES places(id),
  
  observation_year integer NOT NULL,
  
  -- Population
  l1_speakers_count bigint,              -- First-language speakers
  l2_speakers_count bigint,              -- Second-language speakers
  heritage_speakers_count bigint,        -- Heritage speakers (may overlap with L1/L2)
  total_speakers_count bigint,
  
  -- Status in this place
  is_native_to_place boolean DEFAULT false,
  is_diaspora_presence boolean DEFAULT false,
  arrived_via_migration boolean DEFAULT false,
  earliest_attestation_year integer,
  
  -- Vitality in this place specifically
  pct_children_acquiring decimal(5,2),
  intergenerational_transmission_status text,
  
  -- Recognition in this place
  has_official_recognition boolean DEFAULT false,
  recognition_type text,                 -- 'national', 'regional', 'minority', 'indigenous', 'none'
  
  -- Educational status in this place
  taught_in_public_schools boolean DEFAULT false,
  taught_in_community_schools boolean DEFAULT false,
  language_of_instruction_for_subjects text[],
  
  -- Media presence in this place
  has_local_media boolean DEFAULT false,
  has_digital_presence boolean DEFAULT false,
  
  source_id uuid REFERENCES sources(id),
  methodology methodology_type,
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_lang_place_lookup ON language_place_presence(language_id, place_id, observation_year DESC);
CREATE INDEX idx_lang_place_year ON language_place_presence(observation_year);

COMMENT ON TABLE language_place_presence IS
  'How a language exists in a specific place at a specific time. Different from speaker_populations because it tracks the trajectory and context, not just numbers. Critical for understanding diaspora language dynamics over time.';

-- =====================================================================
-- PART 5: COMMUNITY STATE OVER TIME
-- =====================================================================
-- Communities are dynamic. The Cambodian-American community in 1985
-- is meaningfully different from the same community in 2025.

CREATE TABLE community_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  community_id uuid NOT NULL REFERENCES communities(id),
  observation_year integer NOT NULL,
  
  -- Geographic distribution
  primary_place_ids uuid[],
  estimated_total_population bigint,
  
  -- Generational composition
  pct_first_generation decimal(5,2),
  pct_second_generation decimal(5,2),
  pct_third_plus_generation decimal(5,2),
  
  -- Language transmission within the community
  pct_fluent_in_heritage_language decimal(5,2),
  pct_speak_heritage_at_home decimal(5,2),
  generation_at_which_loss_typically_begins integer,
  
  -- Institutional infrastructure
  cultural_organizations_count integer,
  heritage_schools_count integer,
  religious_institutions_count integer,
  community_media_outlets_count integer,
  
  -- Economic profile
  median_household_income_usd decimal(12,2),
  pct_below_poverty_line decimal(5,2),
  pct_homeownership decimal(5,2),
  pct_with_tertiary_education decimal(5,2),
  
  -- Cohesion and identity
  community_cohesion_assessment text,
  generational_tension_notes text,
  
  source_id uuid REFERENCES sources(id),
  methodology methodology_type,
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_community_state_lookup ON community_state(community_id, observation_year DESC);

-- =====================================================================
-- PART 6: TECH STACK EVOLUTION OVER TIME
-- =====================================================================
-- Layer 2 view of language tech readiness. Same dimensions as the
-- tech_readiness table from earlier migrations, but as time-series so
-- we can show "Omnilingual changed this" and similar trajectory stories.

CREATE TABLE tech_readiness_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  language_id uuid NOT NULL REFERENCES languages(id),
  observation_date date NOT NULL,
  
  -- STT
  stt_quality_tier tech_quality_tier,
  stt_wer_conversational decimal(5,2),
  best_stt_provider text,
  
  -- TTS
  tts_quality_tier tech_quality_tier,
  tts_voice_count integer,
  best_tts_provider text,
  
  -- Other
  omnilingual_cer decimal(5,2),
  common_voice_hours_validated integer,
  
  -- Watershed events
  notable_change text,                   -- "Omnilingual ASR release Nov 2025"
  significance event_significance,
  
  source_id uuid REFERENCES sources(id),
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tech_history_lookup ON tech_readiness_history(language_id, observation_date DESC);

COMMENT ON TABLE tech_readiness_history IS
  'Time-series of language tech capability. The current tech_readiness table holds present state; this table holds the historical trajectory. Useful for showing "this is when X became possible."';

-- =====================================================================
-- PART 7: SECTOR EVENTS AND WATERSHED MOMENTS
-- =====================================================================
-- Things that happen in our field that affect our decisions. The
-- Omnilingual ASR launch. UNESCO policy shifts. Major funding 
-- announcements. Community-led revitalization wins.

CREATE TABLE sector_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_name text NOT NULL,
  event_date date NOT NULL,
  event_type text,                       -- 'technology-release', 'policy-change', 'funding-announcement', 'publication', 'crisis', 'partnership'
  
  -- What and where
  description text NOT NULL,
  primary_affected_languages uuid[],
  primary_affected_places uuid[],
  primary_affected_organizations uuid[],
  
  -- Impact
  significance event_significance NOT NULL,
  affects_tomorrowlabs_directly boolean DEFAULT false,
  impact_assessment text,
  
  -- TomorrowLabs response
  tomorrowlabs_response_taken text,
  tomorrowlabs_response_owner text,
  decision_log_reference uuid REFERENCES decision_log(id),
  
  -- External references
  source_url text,
  related_publications text[],
  
  source_id uuid REFERENCES sources(id),
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_events_date ON sector_events(event_date DESC);
CREATE INDEX idx_events_significance ON sector_events(significance);
CREATE INDEX idx_events_tl ON sector_events(affects_tomorrowlabs_directly) WHERE affects_tomorrowlabs_directly = true;
CREATE INDEX idx_events_languages ON sector_events USING gin(primary_affected_languages);

COMMENT ON TABLE sector_events IS
  'Things that happen in language preservation, AI, education, and adjacent fields that affect our work. Lets us build a real institutional memory of "what changed and how we responded."';

-- =====================================================================
-- PART 8: FUNDING FLOWS GLOBALLY
-- =====================================================================
-- What grants are being made in our space? Who's funding what?
-- This is intelligence, not just our pipeline.

CREATE TABLE funding_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The grant
  grant_name text,
  grant_amount_usd decimal(15,2),
  grant_announced_date date NOT NULL,
  grant_start_date date,
  grant_end_date date,
  
  -- Who funded whom
  funder_organization_id uuid REFERENCES organizations(id),
  recipient_organization_id uuid REFERENCES organizations(id),
  recipient_name_if_not_in_db text,      -- For recipients we haven't catalogued yet
  
  -- What it funds
  purpose text NOT NULL,
  focus_areas text[],
  target_language_ids uuid[],
  target_place_ids uuid[],
  
  -- Strategic relevance
  is_strategic_signal boolean,           -- Worth paying attention to as market signal
  strategic_significance text,
  
  source_id uuid REFERENCES sources(id),
  source_url text,
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_funding_funder ON funding_flows(funder_organization_id, grant_announced_date DESC);
CREATE INDEX idx_funding_recipient ON funding_flows(recipient_organization_id);
CREATE INDEX idx_funding_strategic ON funding_flows(is_strategic_signal) WHERE is_strategic_signal = true;
CREATE INDEX idx_funding_languages ON funding_flows USING gin(target_language_ids);
CREATE INDEX idx_funding_places ON funding_flows USING gin(target_place_ids);

COMMENT ON TABLE funding_flows IS
  'Global funding activity in TomorrowLabs''s space. Not just our pipeline — intelligence about where money is moving, who is funded for what, what trends are emerging.';

-- =====================================================================
-- PART 9: PUBLICATIONS AND RESEARCH OUTPUTS
-- =====================================================================
-- Tracks academic papers, reports, and major publications that 
-- inform our work. Lets us be current with the field.

CREATE TABLE publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  title text NOT NULL,
  authors text[],
  publication_date date NOT NULL,
  
  -- Type and venue
  publication_type text,                 -- 'peer-reviewed-paper', 'report', 'book', 'thesis', 'preprint', 'blog-post'
  venue text,                            -- Journal, conference, publisher, organization
  
  -- Identifiers
  doi text,
  isbn text,
  arxiv_id text,
  url text,
  
  -- Relevance
  abstract text,
  key_findings_summary text,
  relevance_to_tomorrowlabs text,
  
  -- Categorization
  topic_areas text[],
  related_language_ids uuid[],
  related_place_ids uuid[],
  related_organization_ids uuid[],
  
  -- Impact tracking
  citation_count integer,
  citation_count_last_checked date,
  is_canonical_in_field boolean DEFAULT false,
  
  -- Internal usage
  read_by_tomorrowlabs boolean DEFAULT false,
  read_by_whom text,
  internal_summary_url text,
  
  source_id uuid REFERENCES sources(id),
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_pubs_date ON publications(publication_date DESC);
CREATE INDEX idx_pubs_canonical ON publications(is_canonical_in_field) WHERE is_canonical_in_field = true;
CREATE INDEX idx_pubs_languages ON publications USING gin(related_language_ids);
CREATE INDEX idx_pubs_topics ON publications USING gin(topic_areas);

-- =====================================================================
-- PART 10: REGULATORY EVENTS OVER TIME
-- =====================================================================
-- The regulatory environment changes. New laws pass. Policies shift.
-- This tracks those changes as they happen.

CREATE TABLE regulatory_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  place_id uuid NOT NULL REFERENCES places(id),
  event_date date NOT NULL,
  
  event_type text,                       -- 'law-passed', 'law-amended', 'policy-issued', 'court-ruling', 'regulation-issued'
  event_name text NOT NULL,
  
  -- What changed
  affected_domain text,                  -- 'data-protection', 'content-regulation', 'indigenous-rights', 'language-policy', 'nonprofit-operations'
  summary text NOT NULL,
  
  -- For TomorrowLabs
  affects_tomorrowlabs boolean DEFAULT false,
  compliance_required boolean DEFAULT false,
  compliance_deadline date,
  compliance_owner text,
  compliance_status text,                -- 'not-yet-required', 'in-progress', 'compliant', 'non-compliant'
  
  -- For partners
  affects_partners boolean DEFAULT false,
  partner_impact_notes text,
  
  -- For communities
  affects_communities text,              -- Which communities and how
  
  citation text,                         -- Legal citation
  url text,
  source_id uuid REFERENCES sources(id),
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_regevents_place_date ON regulatory_events(place_id, event_date DESC);
CREATE INDEX idx_regevents_tl ON regulatory_events(affects_tomorrowlabs) WHERE affects_tomorrowlabs = true;
CREATE INDEX idx_regevents_compliance ON regulatory_events(compliance_deadline) WHERE compliance_required = true;

-- =====================================================================
-- PART 11: HEALTH AND SAFETY INDICATORS
-- =====================================================================
-- Especially important for field deployments. Where can we safely 
-- deploy people and resources? Where are partners operating?

CREATE TABLE place_health_safety (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  place_id uuid NOT NULL REFERENCES places(id),
  observation_year integer NOT NULL,
  
  -- Health indicators
  life_expectancy_years decimal(4,1),
  infant_mortality_per_1000 decimal(6,2),
  pct_population_with_healthcare_access decimal(5,2),
  
  -- Mental health context
  mental_health_resources_available text,
  
  -- Safety
  political_stability_index decimal(5,2),
  conflict_status text,                  -- 'stable', 'tensions', 'low-conflict', 'active-conflict', 'post-conflict'
  travel_advisory_level text,            -- US State Dept-style levels
  
  -- Specific concerns
  child_protection_infrastructure text,
  gender_safety_assessment text,
  press_freedom_index decimal(5,2),
  
  -- Climate
  climate_vulnerability_index decimal(5,2),
  recent_climate_events text[],
  
  -- Disease/health emergencies
  ongoing_health_emergencies text[],
  
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_health_lookup ON place_health_safety(place_id, observation_year DESC);

-- =====================================================================
-- PART 12: TRUST AND REPUTATION SIGNALS
-- =====================================================================
-- The community trust history we discussed in the architecture doc.
-- Time-series of how communities and partners regard TomorrowLabs
-- and adjacent organizations.

CREATE TABLE community_trust_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  community_id uuid NOT NULL REFERENCES communities(id),
  observation_date date NOT NULL,
  
  -- Subject of trust assessment
  subject_organization_id uuid REFERENCES organizations(id),
  
  -- Trust state
  trust_assessment text,                 -- 'deeply-trusted', 'trusted', 'cautious', 'distrusted', 'unknown'
  basis_for_assessment text,             -- What the assessment is based on
  
  -- History
  prior_negative_experiences text,
  prior_positive_experiences text,
  
  -- Specific gatekeepers and authorities
  recognized_community_authorities text[],
  
  -- Recent signals
  recent_positive_signals text,
  recent_negative_signals text,
  
  source_id uuid REFERENCES sources(id),
  methodology methodology_type,
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_trust_community ON community_trust_signals(community_id, observation_date DESC);
CREATE INDEX idx_trust_subject ON community_trust_signals(subject_organization_id);

COMMENT ON TABLE community_trust_signals IS
  'How communities regard organizations operating in their space. Critical context for partnership decisions. Time-series because trust changes — a community burned by a previous organization may be cautious about similar ones for years.';

-- =====================================================================
-- PART 13: OBSERVATION REGISTRY SEED
-- =====================================================================
-- Register all observation tables so we can query the layer meta-data.

INSERT INTO observation_registry (table_name, observed_entity_type, observation_domain, expected_cadence, typical_lag_days, primary_sources, description) VALUES

-- Place-related observations
('place_demographics', 'place', 'demographics', 'annual', 365, 
 ARRAY['US Census ACS', 'national censuses', 'UN DESA'],
 'Population, age structure, education, income, digital divide indicators per place over time.'),
 
('place_economic_indicators', 'place', 'economic', 'quarterly', 90,
 ARRAY['World Bank', 'national statistical agencies', 'IMF'],
 'GDP, inflation, payment infrastructure, market readiness signals.'),

('place_infrastructure', 'place', 'infrastructure', 'annual', 180,
 ARRAY['ITU', 'national infrastructure reports', 'logistics provider data'],
 'Digital, physical, and educational infrastructure trajectory.'),

('place_regulatory_environment', 'place', 'regulatory', 'episodic', 30,
 ARRAY['official government sources', 'legal databases'],
 'Snapshot of regulatory environment, refreshed when material changes occur.'),

('place_health_safety', 'place', 'health-safety', 'annual', 180,
 ARRAY['WHO', 'national health agencies', 'travel advisories'],
 'Health, conflict, climate vulnerability for places where we operate or might operate.'),

-- Migration and movement
('migration_flows', 'cross-entity', 'demographics', 'annual', 365,
 ARRAY['UN DESA Migration Stock', 'Migration Policy Institute', 'national immigration data'],
 'Migration counts between place pairs over time. Critical for diaspora analysis.'),

-- Language-place dynamics
('language_place_presence', 'cross-entity', 'demographics', 'annual', 365,
 ARRAY['US Census ACS detailed languages', 'national censuses', 'Ethnologue', 'community estimates'],
 'How a language exists in a place over time. Where the diaspora language story actually lives.'),

-- Community state
('community_state', 'community', 'demographics', 'annual', 365,
 ARRAY['MPI diaspora data', 'community surveys', 'cultural organization reports'],
 'Communities as time-series. How a diaspora ages, urbanizes, loses or retains heritage language.'),

-- Tech evolution
('tech_readiness_history', 'language', 'technology', 'quarterly', 30,
 ARRAY['vendor docs', 'arxiv', 'benchmark releases'],
 'Time-series of language tech capability. Where Omnilingual moves the bar gets recorded here.'),

-- Sector intelligence
('sector_events', 'cross-entity', 'sector-intelligence', 'episodic', 7,
 ARRAY['announcements', 'press releases', 'partner notifications'],
 'Watershed moments in our space. Tracks what changed and how we responded.'),

('funding_flows', 'organization', 'funding', 'episodic', 30,
 ARRAY['IRS Form 990', 'foundation announcements', 'Candid', 'NSF awards'],
 'Global grants and funding activity in our space. Intelligence about where money is moving.'),

('publications', 'cross-entity', 'research', 'episodic', 14,
 ARRAY['Google Scholar', 'arxiv', 'journal alerts', 'colleague recommendations'],
 'Academic and applied research relevant to our work.'),

('regulatory_events', 'place', 'regulatory', 'episodic', 7,
 ARRAY['government gazettes', 'legal news', 'partner notifications'],
 'Time-series of regulatory changes affecting our work.'),

-- Trust dynamics
('community_trust_signals', 'community', 'trust', 'episodic', 30,
 ARRAY['partner conversations', 'community feedback', 'historical knowledge'],
 'How communities regard organizations operating in their space.');

-- =====================================================================
-- PART 14: SEED DATA
-- =====================================================================
-- Real entries demonstrating the tables work, not exhaustive

-- Migration flow: Cambodian refugee resettlement to US
INSERT INTO migration_flows (
  origin_place_id, destination_place_id, observation_year,
  estimated_flow_count, flow_count_confidence, flow_type,
  is_first_generation, associated_language_ids,
  driving_factors, policy_context,
  source_id, methodology
) VALUES (
  '33333333-0000-0000-0000-000000000002',     -- Cambodia
  '33333333-0000-0000-0000-000000000001',     -- US
  1981,                                        -- Peak year of Khmer refugee resettlement
  20000, 'medium', 'forced-conflict',
  true, 
  ARRAY[(SELECT id FROM languages WHERE english_name = 'Khmer')]::uuid[],
  'Post-Khmer Rouge refugee crisis. Resettlement of survivors who fled to Thailand.',
  'US Refugee Act of 1980 established the modern refugee admissions system.',
  '11111111-1111-1111-1111-111111111107', 'administrative-data'
);

-- Sector event: Omnilingual ASR release
INSERT INTO sector_events (
  event_name, event_date, event_type,
  description,
  significance, affects_tomorrowlabs_directly,
  impact_assessment, tomorrowlabs_response_taken,
  source_url, source_id
) VALUES (
  'Meta releases Omnilingual ASR (1600+ language support)',
  '2025-11-10', 'technology-release',
  'Meta released Omnilingual ASR supporting 1600+ languages natively, extensible to 5400+ via zero-shot learning. Apache 2.0 license. Represents largest open-source language tech expansion ever.',
  'transformative', true,
  'Materially upgrades viability of Wave 4 mission-track languages. Khmer, K''iche'', Nahuatl, Mixtec, Hmong all now have viable STT off-the-shelf where previously none existed. Changes the economics of mission-track language work.',
  'Updated language database tech_readiness for affected languages. Migration 001 reflects new state. Strategic implication: Wave 4 work shifts from "build from scratch" to "evaluate and refine."',
  'https://ai.meta.com/research/publications/omnilingual-asr-open-source-multilingual-speech-recognition-for-1600-languages/',
  '11111111-1111-1111-1111-111111111103'
);

-- Tech readiness history: Khmer trajectory
INSERT INTO tech_readiness_history (
  language_id, observation_date,
  stt_quality_tier, stt_wer_conversational,
  tts_quality_tier, tts_voice_count,
  omnilingual_cer, common_voice_hours_validated,
  notable_change, significance,
  source_id
) VALUES
((SELECT id FROM languages WHERE english_name = 'Khmer'), '2025-06-01',
 'experimental', 50.0, 'experimental', 1,
 null, 4,
 'Pre-Omnilingual. Whisper baseline ~50% WER. Effectively unusable for production.',
 'monitoring-only',
 '11111111-1111-1111-1111-111111111103'),

((SELECT id FROM languages WHERE english_name = 'Khmer'), '2025-11-15',
 'usable', 12.0, 'experimental', 1,
 8.2, 4,
 'Omnilingual ASR release. STT moves from experimental to usable in five days. TTS unchanged.',
 'transformative',
 '11111111-1111-1111-1111-111111111103');

-- Publication: the Omnilingual paper
INSERT INTO publications (
  title, authors, publication_date, publication_type,
  venue, arxiv_id, url,
  abstract, key_findings_summary, relevance_to_tomorrowlabs,
  topic_areas, related_language_ids,
  is_canonical_in_field,
  source_id
) VALUES (
  'Omnilingual ASR: Open-Source Multilingual Speech Recognition for 1600+ Languages',
  ARRAY['Omnilingual ASR team', 'Gil Keren', 'Artyom Kozhevnikov', 'Yen Meng', 'Christophe Ropers'],
  '2025-11-12', 'preprint',
  'arXiv', '2511.09690', 'https://arxiv.org/abs/2511.09690',
  'First large-scale ASR system designed for extensibility, supporting 1600+ languages with zero-shot extension to 5400+. Trained on 4.3M hours of multilingual audio.',
  'Below 10% CER on 78% of supported languages including 500+ never before covered by any ASR model. Apache 2.0 licensed for commercial use.',
  'Direct impact on TomorrowLabs Wave 4 mission-track work. Re-evaluates tech readiness for Khmer, K''iche'', Nahuatl, Mixtec, Hmong, and all indigenous languages of TomorrowLabs partnerships.',
  ARRAY['speech-recognition', 'multilingual-AI', 'language-technology', 'low-resource-languages'],
  ARRAY[
    (SELECT id FROM languages WHERE english_name = 'Khmer'),
    (SELECT id FROM languages WHERE english_name = 'K''iche'''),
    (SELECT id FROM languages WHERE english_name = 'Lao'),
    (SELECT id FROM languages WHERE english_name = 'Hmong')
  ]::uuid[],
  true,
  '11111111-1111-1111-1111-111111111103'
);

-- =====================================================================
-- PART 15: STRATEGIC VIEWS
-- =====================================================================

-- What changed for TomorrowLabs this year?
CREATE OR REPLACE VIEW recent_sector_changes AS
SELECT 
  se.event_name,
  se.event_date,
  se.event_type,
  se.significance,
  se.description,
  se.affects_tomorrowlabs_directly,
  se.tomorrowlabs_response_taken,
  ARRAY(
    SELECT l.english_name FROM languages l 
    WHERE l.id = ANY(se.primary_affected_languages)
  ) AS affected_languages
FROM sector_events se
WHERE se.event_date >= CURRENT_DATE - INTERVAL '365 days'
ORDER BY se.event_date DESC, 
  CASE se.significance 
    WHEN 'transformative' THEN 1 
    WHEN 'significant' THEN 2 
    WHEN 'moderate' THEN 3 
    ELSE 4 
  END;

-- Diaspora story per language: where did speakers come from, when, why?
CREATE OR REPLACE VIEW diaspora_origin_stories AS
SELECT 
  l.english_name AS language,
  origin_p.english_name AS origin_country,
  dest_p.english_name AS destination_country,
  mf.observation_year AS migration_year,
  mf.estimated_flow_count AS approximate_count,
  mf.flow_type,
  mf.driving_factors,
  mf.policy_context
FROM migration_flows mf
INNER JOIN places origin_p ON origin_p.id = mf.origin_place_id
INNER JOIN places dest_p ON dest_p.id = mf.destination_place_id
INNER JOIN LATERAL unnest(mf.associated_language_ids) lang_id ON true
INNER JOIN languages l ON l.id = lang_id
ORDER BY l.english_name, mf.observation_year;

-- Compliance deadlines coming up
CREATE OR REPLACE VIEW upcoming_compliance_deadlines AS
SELECT 
  p.english_name AS place,
  re.event_name,
  re.event_type,
  re.affected_domain,
  re.summary,
  re.compliance_deadline,
  re.compliance_owner,
  re.compliance_status,
  (re.compliance_deadline - CURRENT_DATE) AS days_until_deadline
FROM regulatory_events re
INNER JOIN places p ON p.id = re.place_id
WHERE re.compliance_required = true 
  AND re.compliance_deadline >= CURRENT_DATE
  AND re.compliance_status != 'compliant'
ORDER BY re.compliance_deadline ASC;

-- Watershed tech moments per language
CREATE OR REPLACE VIEW tech_watershed_moments AS
SELECT 
  l.english_name AS language,
  trh.observation_date,
  trh.stt_quality_tier,
  trh.tts_quality_tier,
  trh.notable_change,
  trh.significance
FROM tech_readiness_history trh
INNER JOIN languages l ON l.id = trh.language_id
WHERE trh.significance IN ('transformative', 'significant')
ORDER BY trh.observation_date DESC, l.english_name;

-- Funding pipeline intelligence: who's funding what in our space
CREATE OR REPLACE VIEW market_funding_intelligence AS
SELECT 
  funder.legal_name AS funder,
  ff.grant_announced_date,
  ff.grant_amount_usd,
  ff.purpose,
  ff.focus_areas,
  ARRAY(
    SELECT l.english_name FROM languages l 
    WHERE l.id = ANY(ff.target_language_ids)
  ) AS target_languages,
  ARRAY(
    SELECT p.english_name FROM places p 
    WHERE p.id = ANY(ff.target_place_ids)
  ) AS target_places,
  COALESCE(recipient.legal_name, ff.recipient_name_if_not_in_db) AS recipient,
  ff.strategic_significance
FROM funding_flows ff
LEFT JOIN organizations funder ON funder.id = ff.funder_organization_id
LEFT JOIN organizations recipient ON recipient.id = ff.recipient_organization_id
WHERE ff.is_strategic_signal = true
ORDER BY ff.grant_announced_date DESC;

-- Observation freshness: what's getting stale?
CREATE OR REPLACE VIEW observation_freshness AS
WITH latest_obs AS (
  SELECT 
    'place_demographics' AS table_name,
    place_id::text AS entity_id,
    MAX(assessment_date) AS latest_observation
  FROM place_demographics
  GROUP BY place_id
  
  UNION ALL
  
  SELECT 
    'place_economic_indicators' AS table_name,
    place_id::text AS entity_id,
    MAX(assessment_date) AS latest_observation
  FROM place_economic_indicators
  GROUP BY place_id
  
  UNION ALL
  
  SELECT 
    'place_infrastructure' AS table_name,
    place_id::text AS entity_id,
    MAX(assessment_date) AS latest_observation
  FROM place_infrastructure
  GROUP BY place_id
)
SELECT 
  lo.table_name,
  reg.expected_cadence,
  lo.entity_id,
  lo.latest_observation,
  (CURRENT_DATE - lo.latest_observation) AS days_since_observation,
  CASE 
    WHEN reg.expected_cadence = 'annual' AND (CURRENT_DATE - lo.latest_observation) > 400 THEN 'stale'
    WHEN reg.expected_cadence = 'quarterly' AND (CURRENT_DATE - lo.latest_observation) > 120 THEN 'stale'
    WHEN reg.expected_cadence = 'monthly' AND (CURRENT_DATE - lo.latest_observation) > 45 THEN 'stale'
    ELSE 'current'
  END AS freshness_status
FROM latest_obs lo
LEFT JOIN observation_registry reg ON reg.table_name = lo.table_name;

-- =====================================================================
-- END MIGRATION 004
-- =====================================================================
