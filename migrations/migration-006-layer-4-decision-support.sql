-- =====================================================================
-- Migration 006: Layer 4 — Decision Support
--
-- The layer where data becomes organizational intelligence. Holds the
-- recurring questions TomorrowLabs needs to answer well, the views that
-- answer them, and the audit trail of decisions actually made.
--
-- Architecturally distinct from Layers 1-3:
--   - Mostly views, not tables (composing rather than decomposing)
--   - Questions are the design unit, not dashboards
--   - Explicit about audience and review cadence
--   - Holds both structured views AND AI-synthesis protocols
--   - Decision outcomes tracked over time for institutional learning
-- =====================================================================

-- =====================================================================
-- PART 1: ENUMS FOR DECISION SUPPORT
-- =====================================================================

CREATE TYPE decision_protocol_type AS ENUM (
  'strategic-allocation',       -- Where to invest resources
  'partnership-evaluation',     -- Whether to engage / continue / deepen
  'product-prioritization',     -- What to build next
  'risk-response',              -- How to address identified risks
  'community-accountability',   -- Are we meeting commitments
  'mission-alignment',          -- Is the work still aligned with purpose
  'operational-health',         -- Is the org running well
  'opportunity-evaluation',     -- Should we pursue a new thing
  'sunset-decision',            -- Should we stop doing something
  'crisis-response'             -- How to respond to acute situations
);

CREATE TYPE decision_cadence AS ENUM (
  'continuous',                 -- Ongoing monitoring
  'monthly',
  'quarterly',
  'biannual',
  'annual',
  'triggered',                  -- Only when specific conditions met
  'on-demand'                   -- When explicitly invoked
);

CREATE TYPE decision_audience AS ENUM (
  'founder-direct',             -- Weston alone or with Amdal
  'leadership-team',            -- TomorrowLabs leadership
  'full-team',                  -- All team members
  'board',                      -- Governance level
  'partner-community',          -- Partner community input required
  'public'                      -- Transparency-facing
);

CREATE TYPE synthesis_method AS ENUM (
  'sql-view',                   -- Pure structured query
  'sql-view-with-narrative',    -- Query + human interpretation
  'ai-assisted-synthesis',      -- LLM-mediated cross-layer analysis
  'human-judgment-required',    -- No automation appropriate
  'community-deliberation',     -- Requires community input/process
  'mixed-method'                -- Multiple approaches combined
);

CREATE TYPE decision_outcome_status AS ENUM (
  'too-early-to-assess',
  'going-well',
  'going-as-expected',
  'mixed-results',
  'going-poorly',
  'failed',
  'reversed',                   -- We changed our mind
  'completed-successfully'
);

-- =====================================================================
-- PART 2: DECISION PROTOCOLS (the recurring questions)
-- =====================================================================
-- Each row is a formalized question TomorrowLabs asks recurrently.
-- The protocol describes the question, the data sources, the cadence,
-- and the synthesis method.

CREATE TABLE decision_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  protocol_name text NOT NULL,
  protocol_code text UNIQUE,            -- Short internal reference (e.g., 'STRAT-LDL-EXPANSION')
  
  -- The question
  primary_question text NOT NULL,       -- The recurring question being asked
  context_and_purpose text NOT NULL,    -- Why this question matters
  sub_questions text[],                 -- More granular questions the protocol addresses
  
  -- Classification
  protocol_type decision_protocol_type NOT NULL,
  
  -- Cadence and audience
  review_cadence decision_cadence NOT NULL,
  next_review_due date,
  primary_audience decision_audience NOT NULL,
  secondary_audiences decision_audience[],
  
  -- Synthesis approach
  primary_synthesis_method synthesis_method NOT NULL,
  
  -- Data inputs (references to Layer 1-3 tables/views)
  primary_data_sources text[],          -- Which tables/views feed this
  required_layer_1_entities text[],     -- Which Layer 1 reference data is needed
  required_layer_2_observations text[], -- Which Layer 2 observation streams
  required_layer_3_operational text[],  -- Which Layer 3 operational data
  
  -- For AI-assisted protocols
  ai_synthesis_prompt text,             -- The prompt template used
  ai_synthesis_review_pattern text,     -- How human review of AI output is structured
  
  -- For human-judgment protocols
  deliberation_process text,            -- How decisions are deliberated
  participants_required text[],         -- Who must be present
  
  -- Quality and learning
  protocol_owner text NOT NULL,         -- TomorrowLabs person responsible
  last_executed date,
  execution_count integer DEFAULT 0,
  
  -- Evolution
  protocol_version integer DEFAULT 1,
  last_revised date,
  revision_notes text,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_protocols_type ON decision_protocols(protocol_type);
CREATE INDEX idx_protocols_cadence ON decision_protocols(review_cadence);
CREATE INDEX idx_protocols_next_review ON decision_protocols(next_review_due);
CREATE INDEX idx_protocols_owner ON decision_protocols(protocol_owner);

COMMENT ON TABLE decision_protocols IS
  'Recurring questions TomorrowLabs asks formally. Each protocol describes WHAT to ask, HOW to synthesize an answer, WHO is involved, and WHEN to revisit. The questions are the design unit; views are downstream implementations.';

-- =====================================================================
-- PART 3: DECISION OUTCOMES (longitudinal tracking)
-- =====================================================================
-- Extends decision_log from earlier migrations to track outcomes over
-- time. Closes the loop: did the decisions we made actually work?

CREATE TABLE decision_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parent decision
  decision_log_id uuid REFERENCES decision_log(id),
  protocol_id uuid REFERENCES decision_protocols(id),
  
  -- The decision recap (for context, denormalized)
  decision_summary text NOT NULL,
  decided_at timestamptz NOT NULL,
  
  -- Outcome assessment
  assessed_at date NOT NULL,
  outcome_status decision_outcome_status NOT NULL,
  
  -- What we observed
  what_happened text NOT NULL,          -- Honest narrative
  surprising_observations text,         -- What we didn't predict
  
  -- Did the data support the decision?
  decision_used_data_well boolean,      -- Did we use what we knew?
  data_gaps_revealed text,              -- What data we wish we'd had
  
  -- Learning
  what_would_we_do_differently text,
  what_should_be_protocol_updated text,
  
  -- Stakeholder views
  partner_assessment text,              -- How partners view the outcome
  community_assessment text,            -- How affected communities view it
  
  assessed_by text NOT NULL,
  next_assessment_due date,
  
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_outcomes_decision ON decision_outcomes(decision_log_id);
CREATE INDEX idx_outcomes_protocol ON decision_outcomes(protocol_id);
CREATE INDEX idx_outcomes_status ON decision_outcomes(outcome_status);
CREATE INDEX idx_outcomes_assessed ON decision_outcomes(assessed_at DESC);

COMMENT ON TABLE decision_outcomes IS
  'Longitudinal tracking of how decisions actually played out. Closes the loop on decision_log. Holds the institutional learning that prevents repeating mistakes and reinforces what worked.';

-- =====================================================================
-- PART 4: AI SYNTHESIS RUNS (audit trail for LLM-assisted analyses)
-- =====================================================================
-- When LLM-mediated synthesis is used for decisions, we track the
-- inputs, prompts, and outputs. This is accountability infrastructure
-- for AI-assisted decision-making.

CREATE TABLE ai_synthesis_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  protocol_id uuid REFERENCES decision_protocols(id),
  invoked_at timestamptz DEFAULT now(),
  invoked_by text NOT NULL,
  
  -- What was asked
  question_asked text NOT NULL,
  prompt_used text NOT NULL,
  
  -- What was fed in
  data_inputs_summary text NOT NULL,    -- Description of data provided
  data_input_references text[],         -- References to tables/views/queries used
  
  -- What model was used
  model_name text,                      -- e.g., 'claude-opus-4-7'
  model_provider text,
  
  -- What came back
  synthesis_output text NOT NULL,
  
  -- Human review
  reviewed_by text,
  reviewed_at timestamptz,
  review_assessment text,               -- Was the synthesis useful, accurate, biased, etc.
  was_acted_upon boolean,
  action_taken text,
  
  -- Audit
  concerns_raised text,
  flags_for_protocol_revision text,
  
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ai_runs_protocol ON ai_synthesis_runs(protocol_id);
CREATE INDEX idx_ai_runs_invoked ON ai_synthesis_runs(invoked_at DESC);

COMMENT ON TABLE ai_synthesis_runs IS
  'Audit log for AI-mediated decision support. Every LLM synthesis used in significant decisions is recorded with inputs, outputs, and human review. Required for accountability when AI assists organizational decisions.';

-- =====================================================================
-- PART 5: DASHBOARD DEFINITIONS (what dashboards exist, for whom)
-- =====================================================================
-- Documents the dashboards that exist, who they're for, and which
-- protocols they support. Useful for onboarding and audit.

CREATE TABLE dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  dashboard_name text NOT NULL,
  dashboard_slug text UNIQUE NOT NULL,
  description text NOT NULL,
  
  -- Audience
  primary_audience decision_audience NOT NULL,
  
  -- Implementation
  implementation_type text,             -- 'sql-view-collection', 'BI-tool', 'custom-built', 'notion-page'
  implementation_url text,
  primary_views_used text[],            -- Which SQL views feed this dashboard
  
  -- Linkage to protocols
  supports_protocol_ids uuid[],
  
  -- Refresh
  refresh_cadence text,                 -- 'real-time', 'daily', 'weekly', 'monthly', 'on-demand'
  
  -- Ownership
  dashboard_owner text,
  
  -- Status
  is_active boolean DEFAULT true,
  last_reviewed date,
  
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_dashboards_audience ON dashboards(primary_audience);

-- =====================================================================
-- PART 6: KEY METRICS DEFINITIONS
-- =====================================================================
-- Single source of truth for "what is a 'community partner'?" or
-- "what counts as 'active'?" or "how do we calculate language reach?"
-- Avoids organizations having three definitions of the same metric.

CREATE TABLE metric_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  metric_name text NOT NULL UNIQUE,
  metric_slug text UNIQUE NOT NULL,
  
  -- Definition
  what_is_measured text NOT NULL,
  formula_description text NOT NULL,    -- Human-readable formula
  sql_definition text,                  -- Actual SQL implementation if applicable
  
  -- Category
  metric_category text,                 -- 'mission-impact', 'financial', 'operational', 'community-trust', 'product'
  
  -- Units and ranges
  unit_of_measurement text,
  expected_range text,
  
  -- Context
  why_we_track_this text,
  caveats_and_limitations text,
  
  -- Comparable benchmarks
  external_benchmark text,
  internal_target text,
  
  -- Lifecycle
  first_defined date,
  last_revised date,
  is_active boolean DEFAULT true,
  retired_date date,
  retired_reason text,
  
  -- Ownership
  metric_owner text,
  
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_metrics_category ON metric_definitions(metric_category);
CREATE INDEX idx_metrics_active ON metric_definitions(is_active) WHERE is_active = true;

COMMENT ON TABLE metric_definitions IS
  'Canonical definitions of TomorrowLabs metrics. Eliminates "we have three definitions of community partner" problem. Every metric used in dashboards or reports references its definition here.';

-- =====================================================================
-- PART 7: SEED DATA — THE STARTING PROTOCOL CATALOG
-- =====================================================================
-- Real decision protocols TomorrowLabs needs to formalize

INSERT INTO decision_protocols (
  protocol_code, protocol_name, primary_question, context_and_purpose,
  sub_questions, protocol_type, review_cadence, primary_audience,
  primary_synthesis_method, primary_data_sources,
  required_layer_1_entities, required_layer_2_observations, required_layer_3_operational,
  protocol_owner, next_review_due, notes
) VALUES

-- STRATEGIC PROTOCOLS
('STRAT-BB-WAVE', 'Babagigi Next Wave Assignment',
 'Which languages should be in the next Babagigi wave?',
 'Drives commercial product expansion. Balances demand signals, tech readiness, partnership opportunities, and mission alignment. Wrong answer costs months of engineering investment in low-impact languages.',
 ARRAY[
   'Which languages have crossed the tech readiness threshold since last wave?',
   'Where are demographic shifts creating new heritage audiences?',
   'Which heritage communities have aged-out timing pressure?',
   'Where would commercial success cross-subsidize mission work?'
 ],
 'product-prioritization', 'biannual', 'leadership-team',
 'sql-view-with-narrative',
 ARRAY['language_wave_readiness', 'tech_watershed_moments', 'diaspora_origin_stories'],
 ARRAY['languages', 'places', 'communities'],
 ARRAY['speaker_populations', 'tech_readiness_history', 'language_place_presence'],
 ARRAY['products', 'programs'],
 'Weston', '2026-08-01',
 'Established protocol. Last executed for Wave 1 assignment April 2026.'),

('STRAT-LDL-EXPANSION', 'LDL Field Deployment Site Selection',
 'Where should LDL deploy next?',
 'Determines field investment, partnership commitments, and operational capacity for 12-18 months. High-stakes due to commitment depth.',
 ARRAY[
   'Where do we have trusted partners with deployment readiness?',
   'Which contexts maximize learning from this deployment?',
   'Where would impact be most defensible to funders?',
   'Where do logistics, regulatory, and safety conditions support deployment?'
 ],
 'strategic-allocation', 'biannual', 'founder-direct',
 'human-judgment-required',
 ARRAY['active_partnership_geography', 'deployment_readiness_assessment'],
 ARRAY['places', 'organizations', 'communities'],
 ARRAY['place_infrastructure', 'place_health_safety', 'place_regulatory_environment'],
 ARRAY['programs', 'deployments', 'organization_relationships', 'operational_risks'],
 'Weston', '2026-09-01',
 'Requires Weston direct engagement. Partner trust is critical input that does not reduce to data.'),

-- PARTNERSHIP PROTOCOLS
('PART-TRUST-REVIEW', 'Partnership Trust State Review',
 'How are our active partnerships actually doing?',
 'Surfaces deteriorating relationships before they break. Acknowledges that trust changes and requires active maintenance.',
 ARRAY[
   'Which partnerships have not had meaningful contact recently?',
   'Where are reciprocity assessments shifting?',
   'Which partners may have unspoken concerns?',
   'Where should we invest renewed attention?'
 ],
 'partnership-evaluation', 'quarterly', 'founder-direct',
 'mixed-method',
 ARRAY['active_partnership_geography', 'community_trust_signals'],
 ARRAY['organizations', 'communities'],
 ARRAY['organization_relationships'],
 ARRAY['communications', 'deployments', 'benefit_sharing_agreements'],
 'Weston', '2026-08-15',
 'Includes formal partner check-ins, not just data review. Some signals are only visible in conversation.'),

-- COMMUNITY ACCOUNTABILITY
('ACCT-BENEFIT-SHARING', 'Benefit-Sharing Distribution Review',
 'Are we meeting our benefit-sharing commitments?',
 'The pressure-test commitment from the data philosophy. Holds TomorrowLabs accountable to community-facing financial commitments.',
 ARRAY[
   'Which agreements are signed but never audited?',
   'Are distributions actually flowing as agreed?',
   'Where are we late on commitments?',
   'Do partners agree with our accounting?'
 ],
 'community-accountability', 'quarterly', 'partner-community',
 'sql-view-with-narrative',
 ARRAY['benefit_sharing_accountability', 'program_financial_summary'],
 ARRAY['organizations', 'communities'],
 ARRAY[]::text[],
 ARRAY['benefit_sharing_agreements', 'financial_flows'],
 'Weston', '2026-08-31',
 'Partner community is the audience, not just the audited subject. Reports go TO partners, not ABOUT them.'),

-- OPERATIONAL HEALTH
('OPS-PROGRAM-HEALTH', 'Program Portfolio Health Review',
 'Which programs need intervention?',
 'Surfaces operational issues across the full program portfolio. Prevents single-program crises from dominating attention while others drift.',
 ARRAY[
   'Which programs are flagged yellow or red?',
   'Where is spend tracking against plan?',
   'Where are deployments stalled?',
   'Which risks are escalating?'
 ],
 'operational-health', 'monthly', 'leadership-team',
 'sql-view',
 ARRAY['active_work_summary', 'active_risk_dashboard', 'program_financial_summary'],
 ARRAY[]::text[],
 ARRAY[]::text[],
 ARRAY['programs', 'deployments', 'operational_risks', 'financial_flows'],
 'Weston', '2026-06-15',
 'Should become standing monthly review. Quick to execute when data is current.'),

-- MISSION ALIGNMENT
('STRAT-MISSION-DRIFT', 'Mission Alignment Quarterly Review',
 'Is our work still aligned with our stated mission?',
 'Forces explicit reflection on whether operational pressure is eroding mission. The protocol exists because mission drift typically happens gradually and is hardest to see from inside.',
 ARRAY[
   'Where has commercial logic colonized humanitarian commitments?',
   'Where have we made compromises we should reverse?',
   'Are communities still central to our work or have they become subjects of it?',
   'What would the pressure-test critique say about the last quarter?'
 ],
 'mission-alignment', 'quarterly', 'leadership-team',
 'ai-assisted-synthesis',
 ARRAY['recent_sector_changes', 'benefit_sharing_accountability'],
 ARRAY['communities', 'organizations'],
 ARRAY['community_trust_signals'],
 ARRAY['decision_log', 'communications', 'financial_flows'],
 'Weston', '2026-09-15',
 'AI-assisted synthesis appropriate because question requires pattern detection across heterogeneous data. Human review essential.'),

-- OPPORTUNITY EVALUATION
('OPP-NEW-LANGUAGE', 'Should We Add a New Language?',
 'When a partner or community requests TomorrowLabs add a new language, should we?',
 'Triggered protocol for language addition requests. Prevents both reflexive yeses (over-extension) and reflexive nos (missing mission opportunities).',
 ARRAY[
   'Does this language fit our existing capacity?',
   'Is there partnership commitment to make it succeed?',
   'What is the tech readiness state?',
   'What would adding this displace?',
   'Does the community contributing or being affected have voice in the decision?'
 ],
 'opportunity-evaluation', 'triggered', 'leadership-team',
 'human-judgment-required',
 ARRAY['deployment_readiness_assessment', 'tech_watershed_moments'],
 ARRAY['languages', 'communities', 'organizations'],
 ARRAY['speaker_populations', 'cultural_dimensions', 'tech_readiness_history'],
 ARRAY['organization_relationships'],
 'Weston', null,
 'Triggered when a request arrives. Must include community voice, not just internal deliberation.'),

-- RISK RESPONSE
('RISK-CRITICAL-REVIEW', 'Critical Risk Status Review',
 'What critical risks need immediate attention?',
 'Surfaces risks that are escalating or where mitigation is stalling. Prevents critical risks from being forgotten under operational load.',
 ARRAY[
   'Which critical risks have unaddressed mitigation?',
   'Where has likelihood or impact increased since last review?',
   'Which risks have been open longest?',
   'Where is the mitigation owner blocked?'
 ],
 'risk-response', 'monthly', 'leadership-team',
 'sql-view',
 ARRAY['active_risk_dashboard'],
 ARRAY[]::text[],
 ARRAY[]::text[],
 ARRAY['operational_risks'],
 'Weston', '2026-06-15',
 'Runs against active_risk_dashboard view. Should take 15 minutes if data is current.');


-- METRIC DEFINITIONS
INSERT INTO metric_definitions (
  metric_name, metric_slug, what_is_measured, formula_description, sql_definition,
  metric_category, unit_of_measurement, why_we_track_this, caveats_and_limitations,
  internal_target, metric_owner, first_defined
) VALUES

('Active Partner Organization Count', 'active-partner-count',
 'Number of organizations with active partnership status as of assessment date',
 'Count of distinct organizations with most recent organization_relationship.relationship_status = ''active-partner''',
 'SELECT COUNT(DISTINCT organization_id) FROM organization_relationships r1 WHERE relationship_status = ''active-partner'' AND assessment_date = (SELECT MAX(assessment_date) FROM organization_relationships r2 WHERE r2.organization_id = r1.organization_id)',
 'operational', 'count',
 'Measures breadth of active partnership ecosystem. Distinguishes from exploratory or dormant.',
 'Count alone misses partnership depth and quality. Use alongside trust_level distribution.',
 '8 by end of 2027', 'Weston', '2026-05-15'),

('Languages Reached', 'languages-reached',
 'Number of distinct languages TomorrowLabs products and programs actively serve',
 'Distinct count of language_ids across products.current_language_ids and active program target_language_ids',
 null,
 'mission-impact', 'count',
 'Core mission metric. Measures reach of language preservation work.',
 'Number of languages reached says nothing about depth of engagement per language. Must be read with engagement depth metrics.',
 '12 by end of 2027', 'Weston', '2026-05-15'),

('Benefit-Sharing Coverage Ratio', 'benefit-sharing-coverage',
 'Percentage of active partner organizations with signed benefit-sharing agreements',
 'COUNT(partner orgs with signed agreement) / COUNT(active partner orgs)',
 null,
 'community-trust', 'percentage',
 'Tracks the pressure-test commitment. Should approach 100% by Q2 2027.',
 'Signed does not mean honored. Use alongside benefit_sharing_accountability view.',
 '100% by Q2 2027', 'Weston', '2026-05-15'),

('Consent Records With Translation Provenance', 'consent-translation-tracked',
 'Percentage of consent records where consent_recorded_in_language is documented',
 'COUNT(consent records with consent_recorded_in_language IS NOT NULL) / COUNT(consent records)',
 null,
 'community-trust', 'percentage',
 'Surfaces whether consent infrastructure is being used correctly. Low number means consent is being collected without language provenance.',
 'A high number does not guarantee genuine consent; just that the process tracked the language.',
 '100% always', 'Weston', '2026-05-15'),

('Decision Outcome Honesty Rate', 'decision-outcome-honesty',
 'Percentage of decisions with documented outcome assessment 6+ months post-decision',
 'COUNT(decisions with outcome record) / COUNT(decisions >= 6 months old)',
 null,
 'operational', 'percentage',
 'Measures whether TomorrowLabs actually closes the loop on decisions. Most organizations make decisions and never look back.',
 'Quality of outcome assessment matters more than presence. A pro-forma assessment is worse than honest reflection.',
 '80% by end of 2027', 'Weston', '2026-05-15');


-- =====================================================================
-- PART 8: LAYER 4 STRATEGIC VIEWS
-- =====================================================================

-- THE BOARD-LEVEL DASHBOARD VIEW
-- One row summary of organizational state for governance reporting
CREATE OR REPLACE VIEW board_state_summary AS
SELECT
  CURRENT_DATE AS assessment_date,
  -- Mission scale
  (SELECT COUNT(DISTINCT id) FROM languages) AS languages_in_database,
  (SELECT COUNT(DISTINCT id) FROM languages l 
    WHERE l.id IN (SELECT unnest(current_language_ids) FROM products WHERE current_stage IN ('beta', 'launched', 'mature'))
       OR l.id IN (SELECT unnest(target_language_ids) FROM programs WHERE status IN ('active', 'pre-launch'))
  ) AS languages_actively_served,
  -- Partnership ecosystem
  (SELECT COUNT(*) FROM organization_relationships r 
    WHERE relationship_status IN ('active-partner', 'active-funder')
      AND assessment_date = (SELECT MAX(assessment_date) FROM organization_relationships r2 WHERE r2.organization_id = r.organization_id)
  ) AS active_partner_orgs,
  -- Program portfolio
  (SELECT COUNT(*) FROM programs WHERE status = 'active') AS active_programs,
  (SELECT COUNT(*) FROM programs WHERE current_health_status = 'red' AND status = 'active') AS programs_red_status,
  (SELECT COUNT(*) FROM programs WHERE current_health_status = 'yellow' AND status = 'active') AS programs_yellow_status,
  -- Operational risk
  (SELECT COUNT(*) FROM operational_risks WHERE level IN ('critical', 'high') AND resolved_date IS NULL) AS high_critical_open_risks,
  -- Accountability
  (SELECT COUNT(*) FROM benefit_sharing_agreements WHERE is_active = true) AS active_benefit_sharing_agreements,
  (SELECT COUNT(*) FROM benefit_sharing_agreements 
    WHERE is_active = true 
      AND (last_audit_date IS NULL OR last_audit_date < CURRENT_DATE - INTERVAL '13 months')
  ) AS benefit_sharing_audits_overdue,
  -- Decision quality
  (SELECT COUNT(*) FROM decision_log WHERE decision_date > CURRENT_DATE - INTERVAL '12 months') AS decisions_logged_last_12_months,
  (SELECT COUNT(*) FROM decision_outcomes WHERE assessed_at > CURRENT_DATE - INTERVAL '12 months') AS outcomes_assessed_last_12_months;


-- WHERE ARE WE STRONGEST / WEAKEST?
-- Per-language scorecard combining demand, tech, partnership, and product state
CREATE OR REPLACE VIEW language_strategic_scorecard AS
SELECT
  l.english_name AS language,
  l.glottocode,
  (SELECT cv.unesco_vitality FROM current_vitality cv WHERE cv.glottocode = l.glottocode LIMIT 1) AS vitality_status,
  -- Demand signal (US-focused)
  COALESCE((
    SELECT MAX(l1_speakers)
    FROM speaker_populations sp
    WHERE sp.language_id = l.id AND sp.country_code = 'US'
  ), 0) AS us_speakers,
  COALESCE((
    SELECT MAX(age_60_plus_pct) 
    FROM speaker_populations sp 
    WHERE sp.language_id = l.id AND sp.country_code = 'US'
  ), 0) AS us_pct_60_plus,
  -- Tech readiness
  (SELECT stt_quality_tier FROM tech_readiness tr WHERE tr.language_id = l.id ORDER BY assessed_at DESC LIMIT 1) AS current_stt_tier,
  (SELECT tts_quality_tier FROM tech_readiness tr WHERE tr.language_id = l.id ORDER BY assessed_at DESC LIMIT 1) AS current_tts_tier,
  -- Cultural urgency
  (SELECT transmission_risk FROM cultural_dimensions cd WHERE cd.language_id = l.id LIMIT 1) AS transmission_risk,
  -- Partnership state
  (SELECT COUNT(*) FROM field_partnerships fp WHERE fp.language_id = l.id AND fp.partner_status = 'active') AS active_partnerships,
  -- Product state
  (SELECT ps.status FROM product_status ps WHERE ps.language_id = l.id AND ps.product = 'babagigi' LIMIT 1) AS babagigi_status,
  (SELECT ps.wave FROM product_status ps WHERE ps.language_id = l.id AND ps.product = 'babagigi' LIMIT 1) AS babagigi_wave
FROM languages l
WHERE l.granularity IN ('language', 'macrolanguage')
ORDER BY us_speakers DESC NULLS LAST;


-- WHERE ARE WE EXPOSED?
-- Cross-layer view of risks that need attention
CREATE OR REPLACE VIEW exposure_dashboard AS
SELECT
  -- Operational risks
  'operational-risk' AS exposure_type,
  r.risk_title AS title,
  r.level AS severity,
  r.mitigation_status AS status,
  r.identified_date,
  (CURRENT_DATE - r.identified_date) AS days_open,
  r.mitigation_owner AS owner
FROM operational_risks r
WHERE r.resolved_date IS NULL AND r.level IN ('critical', 'high')

UNION ALL

SELECT
  'compliance-deadline' AS exposure_type,
  re.event_name || ' (' || p.english_name || ')' AS title,
  'high'::risk_level AS severity,
  re.compliance_status AS status,
  re.event_date AS identified_date,
  (re.compliance_deadline - CURRENT_DATE) AS days_open,
  re.compliance_owner AS owner
FROM regulatory_events re
INNER JOIN places p ON p.id = re.place_id
WHERE re.compliance_required = true 
  AND re.compliance_status != 'compliant'
  AND re.compliance_deadline IS NOT NULL

UNION ALL

SELECT
  'overdue-benefit-sharing' AS exposure_type,
  'Audit overdue: ' || o.legal_name AS title,
  'high'::risk_level AS severity,
  'audit-overdue' AS status,
  bsa.agreement_signed_date AS identified_date,
  (CURRENT_DATE - COALESCE(bsa.last_audit_date, bsa.agreement_signed_date)) AS days_open,
  'Weston' AS owner
FROM benefit_sharing_agreements bsa
LEFT JOIN organizations o ON o.id = bsa.partner_organization_id
WHERE bsa.is_active = true 
  AND (bsa.last_audit_date IS NULL OR bsa.last_audit_date < CURRENT_DATE - INTERVAL '13 months')

UNION ALL

SELECT
  'stale-partnership-contact' AS exposure_type,
  'No recent contact: ' || o.legal_name AS title,
  'moderate'::risk_level AS severity,
  'attention-needed' AS status,
  rel.assessment_date AS identified_date,
  (CURRENT_DATE - rel.last_meaningful_contact) AS days_open,
  rel.tomorrowlabs_relationship_owner AS owner
FROM organization_relationships rel
INNER JOIN organizations o ON o.id = rel.organization_id
WHERE rel.relationship_status IN ('active-partner', 'active-funder')
  AND rel.last_meaningful_contact < CURRENT_DATE - INTERVAL '90 days'
  AND rel.assessment_date = (SELECT MAX(assessment_date) FROM organization_relationships r2 WHERE r2.organization_id = rel.organization_id)

ORDER BY severity, days_open DESC;


-- THE QUARTERLY STRATEGIC REVIEW VIEW
-- Synthesized cross-layer view for leadership quarterly review
CREATE OR REPLACE VIEW quarterly_strategic_review AS
WITH program_summary AS (
  SELECT 
    COUNT(*) FILTER (WHERE status = 'active') AS programs_active,
    COUNT(*) FILTER (WHERE current_health_status = 'green' AND status = 'active') AS programs_green,
    COUNT(*) FILTER (WHERE current_health_status = 'yellow' AND status = 'active') AS programs_yellow,
    COUNT(*) FILTER (WHERE current_health_status = 'red' AND status = 'active') AS programs_red,
    SUM(approved_budget_usd) FILTER (WHERE status = 'active') AS total_active_budget,
    SUM(actual_spend_to_date_usd) FILTER (WHERE status = 'active') AS total_spend_to_date
  FROM programs
),
partnership_summary AS (
  SELECT 
    COUNT(*) FILTER (WHERE rel.relationship_status = 'active-partner') AS active_partners,
    COUNT(*) FILTER (WHERE rel.relationship_status = 'active-partner' AND rel.trust_level = 'deeply-trusted') AS deeply_trusted,
    COUNT(*) FILTER (WHERE rel.relationship_status = 'active-partner' AND rel.last_meaningful_contact < CURRENT_DATE - INTERVAL '90 days') AS partners_with_stale_contact
  FROM (
    SELECT DISTINCT ON (organization_id) *
    FROM organization_relationships
    ORDER BY organization_id, assessment_date DESC
  ) rel
),
risk_summary AS (
  SELECT
    COUNT(*) FILTER (WHERE level = 'critical' AND resolved_date IS NULL) AS critical_open,
    COUNT(*) FILTER (WHERE level = 'high' AND resolved_date IS NULL) AS high_open,
    COUNT(*) FILTER (WHERE resolved_date IS NULL AND identified_date < CURRENT_DATE - INTERVAL '180 days') AS stale_unresolved
  FROM operational_risks
),
sector_summary AS (
  SELECT 
    COUNT(*) FILTER (WHERE significance = 'transformative') AS transformative_events_last_quarter,
    COUNT(*) FILTER (WHERE affects_tomorrowlabs_directly = true) AS events_affecting_us
  FROM sector_events
  WHERE event_date > CURRENT_DATE - INTERVAL '90 days'
)
SELECT
  CURRENT_DATE AS review_date,
  ps.*,
  partnerships.*,
  risks.*,
  sector.*
FROM program_summary ps
CROSS JOIN partnership_summary partnerships
CROSS JOIN risk_summary risks
CROSS JOIN sector_summary sector;


-- THE NEXT REVIEW DUE VIEW
-- What protocols need executing soon
CREATE OR REPLACE VIEW protocols_due_for_review AS
SELECT
  dp.protocol_code,
  dp.protocol_name,
  dp.protocol_type,
  dp.review_cadence,
  dp.primary_audience,
  dp.next_review_due,
  (dp.next_review_due - CURRENT_DATE) AS days_until_review,
  dp.protocol_owner,
  dp.last_executed,
  dp.execution_count,
  CASE 
    WHEN dp.next_review_due < CURRENT_DATE THEN 'overdue'
    WHEN dp.next_review_due < CURRENT_DATE + INTERVAL '14 days' THEN 'due-soon'
    WHEN dp.next_review_due < CURRENT_DATE + INTERVAL '30 days' THEN 'upcoming'
    ELSE 'scheduled'
  END AS urgency
FROM decision_protocols dp
WHERE dp.next_review_due IS NOT NULL
ORDER BY dp.next_review_due ASC;


-- DECISION LEARNING LOOP VIEW
-- Are we actually learning from our decisions?
CREATE OR REPLACE VIEW decision_learning_health AS
SELECT
  EXTRACT(YEAR FROM dl.decision_date) AS decision_year,
  EXTRACT(QUARTER FROM dl.decision_date) AS decision_quarter,
  COUNT(dl.id) AS decisions_made,
  COUNT(dout.id) AS decisions_assessed,
  CASE
    WHEN COUNT(dl.id) > 0 THEN ROUND((COUNT(dout.id)::numeric / COUNT(dl.id) * 100), 1)
    ELSE 0
  END AS pct_with_outcome_assessment,
  COUNT(dout.id) FILTER (WHERE dout.outcome_status = 'going-well') AS going_well,
  COUNT(dout.id) FILTER (WHERE dout.outcome_status = 'going-poorly') AS going_poorly,
  COUNT(dout.id) FILTER (WHERE dout.outcome_status = 'reversed') AS reversed_decisions
FROM decision_log dl
LEFT JOIN decision_outcomes dout ON dout.decision_log_id = dl.id
WHERE dl.decision_date >= CURRENT_DATE - INTERVAL '24 months'
GROUP BY EXTRACT(YEAR FROM dl.decision_date), EXTRACT(QUARTER FROM dl.decision_date)
ORDER BY decision_year DESC, decision_quarter DESC;


-- THE PARTNER-FACING ACCOUNTABILITY VIEW
-- What a partner community could see about TomorrowLabs's work in their context
CREATE OR REPLACE VIEW partner_facing_accountability AS
SELECT
  c.english_name AS community,
  o.legal_name AS partner_organization,
  -- Active programs serving this community
  (SELECT COUNT(*) FROM programs p 
    WHERE c.id = ANY(p.target_community_ids) AND p.status = 'active'
  ) AS active_programs,
  -- Active deployments
  (SELECT COUNT(*) FROM deployments d 
    WHERE d.primary_community_id = c.id AND d.stage IN ('operating', 'launching')
  ) AS active_deployments,
  -- Languages being served for this community
  (SELECT array_agg(DISTINCT l.english_name) FROM languages l
    INNER JOIN programs p ON l.id = ANY(p.target_language_ids)
    WHERE c.id = ANY(p.target_community_ids) AND p.status IN ('active', 'pre-launch')
  ) AS languages_being_served,
  -- Benefit-sharing agreement state
  (SELECT bsa.benefit_formula FROM benefit_sharing_agreements bsa
    WHERE bsa.community_id = c.id AND bsa.is_active = true LIMIT 1
  ) AS benefit_sharing_terms,
  -- Last meaningful contact
  (SELECT rel.last_meaningful_contact FROM organization_relationships rel
    INNER JOIN organizations org ON org.id = rel.organization_id
    WHERE org.id = o.id ORDER BY rel.assessment_date DESC LIMIT 1
  ) AS last_partner_contact,
  -- Recent communications about this community
  (SELECT COUNT(*) FROM communications comm
    WHERE comm.related_community_id = c.id 
      AND comm.communication_date > CURRENT_DATE - INTERVAL '90 days'
  ) AS communications_last_90_days
FROM communities c
LEFT JOIN organizations o ON o.id IN (
  SELECT unnest(p.partner_organization_ids) FROM programs p 
  WHERE c.id = ANY(p.target_community_ids) LIMIT 1
);


-- =====================================================================
-- PART 9: SEED DASHBOARD DEFINITIONS
-- =====================================================================

INSERT INTO dashboards (dashboard_name, dashboard_slug, description, primary_audience,
                       implementation_type, primary_views_used, refresh_cadence,
                       dashboard_owner) VALUES

('Board State Summary', 'board-state',
 'One-page organizational state for quarterly board review. Mission scale, partnership ecosystem, program health, risk, accountability.',
 'board', 'sql-view-collection',
 ARRAY['board_state_summary'], 'monthly',
 'Weston'),

('Operational Weekly Review', 'ops-weekly',
 'What needs attention this week. Programs, risks, communications, obligations.',
 'leadership-team', 'sql-view-collection',
 ARRAY['active_work_summary', 'upcoming_obligations', 'active_risk_dashboard', 'exposure_dashboard'],
 'weekly', 'Weston'),

('Language Strategic Scorecard', 'language-strategy',
 'Per-language strategic state combining demand, tech, partnership, and product status.',
 'leadership-team', 'sql-view-collection',
 ARRAY['language_strategic_scorecard'], 'monthly',
 'Weston'),

('Partner Accountability View', 'partner-accountability',
 'Partner-facing view of TomorrowLabs work in their context. For sharing with partner communities.',
 'partner-community', 'sql-view-collection',
 ARRAY['partner_facing_accountability', 'benefit_sharing_accountability'], 'quarterly',
 'Weston');


-- =====================================================================
-- END MIGRATION 006
-- =====================================================================
