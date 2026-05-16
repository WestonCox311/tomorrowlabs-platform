-- =====================================================================
-- Migration 005: Layer 3 — Operational Data
--
-- TomorrowLabs's active work, made queryable. High-velocity tables
-- that reference Layer 1 entities and integrate with external 
-- operational tools (Asana, Stripe, product analytics).
--
-- The discipline of this layer:
--   - Consent layer sits ABOVE operational logic (not within it)
--   - Don't rebuild what tools already do — reference and summarize
--   - Track verb tense: relationships have momentum, deployments have journeys
--   - Every operational decision is auditable
--   - Personal data has strict access controls
--   - Benefit-sharing is structural, not aspirational
-- =====================================================================

-- =====================================================================
-- PART 1: NEW ENUMS FOR OPERATIONAL LAYER
-- =====================================================================

CREATE TYPE program_status AS ENUM (
  'proposed',                -- Concept stage
  'planning',                -- Active design work
  'pre-launch',              -- Resourced, preparing to start
  'active',                  -- Currently running
  'paused',                  -- Temporarily on hold
  'winding-down',            -- Planned conclusion in progress
  'completed',               -- Successfully completed
  'discontinued',            -- Stopped before completion
  'archived'                 -- Closed and documented for record
);

CREATE TYPE deployment_stage AS ENUM (
  'scoping',                 -- Defining what the deployment is
  'partner-alignment',       -- Working out details with field partner
  'resourcing',              -- Securing budget, materials, people
  'logistics',               -- Shipping, customs, on-the-ground setup
  'launching',               -- In active launch
  'operating',               -- Running successfully
  'reviewing',               -- Active assessment of outcomes
  'transitioning',           -- Handing off to community ownership
  'completed',               -- Concluded
  'failed'                   -- Honest acknowledgment when deployments don't work
);

CREATE TYPE product_lifecycle_stage AS ENUM (
  'concept',                 -- Idea stage
  'design',                  -- Active design work
  'prototype',               -- Internal testing
  'alpha',                   -- Limited external testing
  'beta',                    -- Broader user testing
  'launched',                -- Publicly available
  'mature',                  -- Established and stable
  'sunsetting',              -- Planned wind-down
  'sunset',                  -- No longer available
  'archived'                 -- Historical record
);

CREATE TYPE content_status AS ENUM (
  'concept',
  'in-development',
  'in-review',
  'community-review',        -- Specifically: with the community whose language/culture it represents
  'approved',
  'published',
  'needs-revision',
  'deprecated',
  'archived'
);

CREATE TYPE consent_status AS ENUM (
  'not-asked',
  'pending-decision',
  'granted',
  'granted-with-conditions',
  'denied',
  'revoked',                 -- Was granted, since withdrawn
  'expired',                 -- Time-limited consent has elapsed
  'pending-renewal'
);

CREATE TYPE consent_scope AS ENUM (
  'product-use-only',
  'service-improvements',    -- Use of data to improve TomorrowLabs products
  'community-research',      -- Use within community-aligned research
  'academic-research',       -- Use in academic research
  'public-corpus',           -- Contribution to public datasets like Common Voice
  'commercial-use',          -- Use in commercial products beyond TomorrowLabs
  'marketing-communications',
  'press-and-media'
);

CREATE TYPE risk_level AS ENUM (
  'critical',                -- Immediate threat to mission or organization
  'high',                    -- Significant threat, requires active management
  'moderate',                -- Worth monitoring and addressing
  'low',                     -- Minor concern, periodic review
  'monitoring-only'          -- Tracked but no action currently needed
);

CREATE TYPE risk_category AS ENUM (
  'financial',
  'operational',
  'partnership',
  'reputational',
  'community-trust',
  'regulatory-compliance',
  'data-security',
  'technical',
  'mission-drift',
  'team-capacity',
  'strategic'
);

CREATE TYPE financial_flow_type AS ENUM (
  'grant-received',
  'grant-disbursed',         -- TomorrowLabs as grantmaker
  'revenue-product',
  'revenue-services',
  'revenue-licensing',
  'expense-operating',
  'expense-program',
  'benefit-sharing-distribution',  -- Outflow to community partners
  'partnership-payment',
  'vendor-payment',
  'investment-received',
  'loan-received',
  'loan-disbursed'
);

CREATE TYPE communication_channel AS ENUM (
  'email',
  'video-call',
  'phone-call',
  'in-person-meeting',
  'site-visit',
  'conference-event',
  'slack',
  'whatsapp',
  'signal',
  'sms',
  'mail',
  'social-media',
  'partner-portal'
);

-- =====================================================================
-- PART 2: PROGRAMS (TomorrowLabs's active initiatives)
-- =====================================================================
-- Programs are the highest unit of work organization. A program has
-- a mission, a budget, an owner, multiple deployments, and a defined
-- scope. Examples: "Babagigi Wave 1 Launch", "LDL Cambodia Pilot 2027".

CREATE TABLE programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  program_name text NOT NULL,
  program_code text UNIQUE,              -- Short internal reference (e.g., 'BB-W1-2026')
  description text NOT NULL,
  
  -- Classification
  program_type text,                     -- 'product-launch', 'field-deployment', 'research', 'partnership-development'
  related_product_id uuid,               -- Forward reference to products table
  
  -- Scope
  target_language_ids uuid[],            -- Layer 1 references
  target_place_ids uuid[],               -- Layer 1 references
  target_community_ids uuid[],           -- Layer 1 references
  partner_organization_ids uuid[],       -- Layer 1 references
  
  -- Status and timeline
  status program_status NOT NULL DEFAULT 'proposed',
  planned_start_date date,
  actual_start_date date,
  planned_end_date date,
  actual_end_date date,
  
  -- Ownership
  program_owner text NOT NULL,           -- TomorrowLabs person
  program_team text[],
  steering_committee text[],
  
  -- Resources
  approved_budget_usd decimal(15,2),
  actual_spend_to_date_usd decimal(15,2),
  funding_source_ids uuid[],             -- References to grants or revenue streams
  
  -- Goals
  primary_objectives text[],
  success_criteria text[],
  
  -- External tool references (don't rebuild what already exists)
  asana_project_url text,
  notion_workspace_url text,
  drive_folder_url text,
  github_repo text,
  
  -- Health
  current_health_status text,            -- 'green', 'yellow', 'red'
  health_last_assessed date,
  health_assessment_notes text,
  
  -- Learning
  hypotheses_being_tested text[],
  decisions_pending text[],
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_owner ON programs(program_owner);
CREATE INDEX idx_programs_health ON programs(current_health_status);
CREATE INDEX idx_programs_languages ON programs USING gin(target_language_ids);
CREATE INDEX idx_programs_places ON programs USING gin(target_place_ids);
CREATE INDEX idx_programs_partners ON programs USING gin(partner_organization_ids);

COMMENT ON TABLE programs IS
  'Highest-level unit of organized work. References Layer 1 entities (languages, places, organizations, communities). Integrates with external tools rather than replicating their data.';

-- =====================================================================
-- PART 3: DEPLOYMENTS (instances of programs in the field)
-- =====================================================================
-- A deployment is a specific instance of a program in a specific place,
-- with a specific partner, on a specific timeline. Example: 
-- "LDL Cambodia Pilot 2027" might have deployments in three villages.

CREATE TABLE deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parent
  program_id uuid NOT NULL REFERENCES programs(id),
  
  -- Identity
  deployment_name text NOT NULL,
  deployment_code text UNIQUE,           -- e.g., 'LDL-KH-V01-2027'
  
  -- Scope
  primary_place_id uuid NOT NULL REFERENCES places(id),
  additional_place_ids uuid[],
  primary_language_ids uuid[],
  primary_community_id uuid REFERENCES communities(id),
  partner_organization_id uuid REFERENCES organizations(id),
  
  -- Stage and timeline
  stage deployment_stage NOT NULL DEFAULT 'scoping',
  stage_entered_at date,
  planned_start_date date,
  actual_start_date date,
  planned_completion_date date,
  actual_completion_date date,
  
  -- Scale
  target_participant_count integer,
  actual_participant_count integer,
  target_household_count integer,
  actual_household_count integer,
  
  -- Resources
  approved_budget_usd decimal(12,2),
  actual_spend_usd decimal(12,2),
  
  -- On-the-ground
  on_ground_coordinator text,            -- Who is physically present
  field_visit_dates date[],
  next_field_visit_planned date,
  
  -- Status
  deployment_health text,                -- 'on-track', 'minor-issues', 'significant-concerns', 'crisis'
  current_blockers text,
  active_risks text[],
  
  -- Documentation
  pre_deployment_assessment_url text,
  baseline_measurements_recorded boolean DEFAULT false,
  midpoint_assessment_completed boolean DEFAULT false,
  completion_assessment_completed boolean DEFAULT false,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_deployments_program ON deployments(program_id);
CREATE INDEX idx_deployments_stage ON deployments(stage);
CREATE INDEX idx_deployments_place ON deployments(primary_place_id);
CREATE INDEX idx_deployments_partner ON deployments(partner_organization_id);

-- =====================================================================
-- PART 4: PRODUCTS (canonical record of what TomorrowLabs has built)
-- =====================================================================

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  product_name text NOT NULL,
  product_slug text UNIQUE NOT NULL,     -- e.g., 'babagigi', 'ldl', 'queerstory'
  description text NOT NULL,
  
  -- Type and lifecycle
  product_type text,                     -- 'physical-product', 'mobile-app', 'web-app', 'service', 'platform'
  current_stage product_lifecycle_stage NOT NULL DEFAULT 'concept',
  stage_entered_at date,
  
  -- Ownership
  product_owner text NOT NULL,
  product_team text[],
  
  -- Audience and scope
  primary_audiences text[],              -- 'diaspora-families', 'partner-communities', 'institutional'
  current_language_ids uuid[],           -- Languages product currently supports
  current_place_ids uuid[],              -- Places product is currently available
  
  -- Status
  is_revenue_generating boolean DEFAULT false,
  is_mission_aligned boolean DEFAULT true,
  
  -- Business model
  pricing_model text,                    -- 'subscription', 'one-time', 'freemium', 'free', 'tiered'
  pricing_notes text,
  
  -- Technical
  primary_codebase_repo text,
  primary_hosting_provider text,
  
  -- External references
  public_url text,
  app_store_urls jsonb,                  -- {ios: 'url', android: 'url'}
  
  -- Timeline
  concept_date date,
  first_user_date date,
  public_launch_date date,
  sunset_date date,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_products_stage ON products(current_stage);
CREATE INDEX idx_products_slug ON products(product_slug);

-- Add forward reference now that products exists
ALTER TABLE programs ADD CONSTRAINT fk_programs_product 
  FOREIGN KEY (related_product_id) REFERENCES products(id);

-- =====================================================================
-- PART 5: CONTENT (storybooks, recordings, curricula, assets)
-- =====================================================================
-- The actual things TomorrowLabs creates and distributes. Each row
-- is a content item with its own lifecycle, rights, and consent state.

CREATE TABLE content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  title text NOT NULL,
  internal_id text UNIQUE,               -- Internal reference (e.g., 'BG-STORY-KH-001')
  
  -- Type
  content_type text NOT NULL,            -- 'storybook', 'audio-recording', 'curriculum-unit', 'illustration', 'translation'
  format text,                           -- 'pdf', 'epub', 'mp3', 'wav', 'png', 'svg'
  
  -- Categorization
  product_id uuid REFERENCES products(id),
  primary_language_id uuid REFERENCES languages(id),
  additional_language_ids uuid[],        -- For bilingual content
  
  -- Cultural context
  cultural_origin_community_id uuid REFERENCES communities(id),
  cultural_origin_place_id uuid REFERENCES places(id),
  
  -- Status
  status content_status NOT NULL DEFAULT 'concept',
  status_entered_at date,
  
  -- Creators and contributors
  primary_creator text,                  -- Could be TL team, partner, community member, AI-assisted
  contributors text[],
  attribution_required text,             -- How attribution must appear
  
  -- Community contribution
  was_contributed_by_community boolean DEFAULT false,
  contributing_community_id uuid REFERENCES communities(id),
  community_contributors_anonymized boolean,
  
  -- Rights
  license text,                          -- 'CC-BY', 'CC0', 'all-rights-reserved', 'community-restricted'
  license_url text,
  rights_holder text,
  benefit_sharing_terms text,            -- How benefits flow back to contributors
  
  -- Storage
  storage_location text,                 -- 'aws-s3', 'community-archive', 'gelato', 'archive-partner'
  file_url text,                         -- Internal access only
  public_url text,                       -- If publicly accessible
  archive_partner_organization_id uuid REFERENCES organizations(id),  -- External archive holding copy
  
  -- Provenance
  source_recording_id uuid,              -- Self-reference for derived content
  derivation_notes text,
  
  -- Usage tracking
  used_in_deployment_ids uuid[],
  total_distribution_count integer DEFAULT 0,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_content_product ON content_items(product_id);
CREATE INDEX idx_content_language ON content_items(primary_language_id);
CREATE INDEX idx_content_status ON content_items(status);
CREATE INDEX idx_content_community ON content_items(cultural_origin_community_id);
CREATE INDEX idx_content_contributed ON content_items(was_contributed_by_community) WHERE was_contributed_by_community = true;

COMMENT ON TABLE content_items IS
  'Canonical record of all content TomorrowLabs creates, holds, or distributes. Includes rights, consent, and benefit-sharing fields as first-class — not afterthoughts.';

-- =====================================================================
-- PART 6: CONSENT INFRASTRUCTURE — sits ABOVE operational logic
-- =====================================================================
-- This is the architectural commitment from the philosophy. Consent
-- state is read by operational layers; operational layers cannot 
-- override consent.

CREATE TABLE consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who consented (subject)
  subject_type text NOT NULL,            -- 'individual', 'household', 'community', 'organization'
  subject_user_id uuid,                  -- Reference to users.id if individual
  subject_community_id uuid REFERENCES communities(id),
  subject_organization_id uuid REFERENCES organizations(id),
  subject_name text,                     -- For individuals (with strict access controls)
  
  -- What they consented to
  scope consent_scope NOT NULL,
  specific_data_types text[],            -- What data is covered: 'audio-recordings', 'photographs', 'transcripts', 'user-behavior'
  
  -- State
  status consent_status NOT NULL,
  status_changed_at timestamptz DEFAULT now(),
  
  -- Conditions and limits
  conditions text,                       -- Any specific conditions attached
  expires_at date,                       -- If consent is time-limited
  geographic_limits text[],              -- If consent applies only in certain places
  
  -- How consent was obtained
  consent_method text,                   -- 'in-person-conversation', 'signed-form', 'in-app-flow', 'partner-mediated'
  consent_witness text,                  -- For high-stakes consent
  consent_artifact_url text,             -- Link to signed document if applicable
  consent_recorded_in_language uuid REFERENCES languages(id),  -- Critical: what language was consent obtained in?
  consent_translated boolean,            -- Was translation involved?
  
  -- Provenance
  consent_obtained_by text NOT NULL,     -- TomorrowLabs person who obtained
  consent_obtained_at date NOT NULL,
  
  -- Renewal and review
  next_review_due date,
  
  -- Revocation
  revoked_at timestamptz,
  revoked_by text,                       -- Subject's name or 'subject-direct-request'
  revocation_reason text,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_consent_user ON consent_records(subject_user_id);
CREATE INDEX idx_consent_community ON consent_records(subject_community_id);
CREATE INDEX idx_consent_status ON consent_records(status);
CREATE INDEX idx_consent_expiring ON consent_records(expires_at) WHERE status IN ('granted', 'granted-with-conditions');
CREATE INDEX idx_consent_review ON consent_records(next_review_due) WHERE status IN ('granted', 'granted-with-conditions');

COMMENT ON TABLE consent_records IS
  'Consent state for individuals, households, communities, and organizations. This table is referenced by operational logic; it cannot be overridden by operational pressure. The architectural commitment from the data philosophy made structural.';

-- =====================================================================
-- PART 7: USERS (with privacy-respecting design)
-- =====================================================================

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Account identity (minimum necessary)
  email_hashed text UNIQUE,              -- We don't store raw email if avoidable
  account_handle text UNIQUE,            -- Public-safe identifier
  
  -- Account state
  account_status text DEFAULT 'active',  -- 'active', 'paused', 'self-deleted', 'admin-suspended'
  account_created_at timestamptz DEFAULT now(),
  
  -- Product engagement (high-level only)
  primary_product_id uuid REFERENCES products(id),
  account_role text,                     -- 'family-storyteller', 'partner-coordinator', 'researcher', 'admin'
  
  -- Geographic context (for product personalization, not surveillance)
  declared_country_place_id uuid REFERENCES places(id),
  
  -- Languages of use
  ui_language_id uuid REFERENCES languages(id),
  content_language_ids uuid[],
  
  -- Privacy preferences
  marketing_communications_allowed boolean DEFAULT false,
  research_participation_allowed boolean DEFAULT false,
  account_visibility text DEFAULT 'private',  -- 'private', 'partner-only', 'public'
  
  -- Consent reference
  primary_consent_id uuid REFERENCES consent_records(id),
  
  notes text,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_users_status ON users(account_status);
CREATE INDEX idx_users_product ON users(primary_product_id);

-- Add forward reference
ALTER TABLE consent_records ADD CONSTRAINT fk_consent_user 
  FOREIGN KEY (subject_user_id) REFERENCES users(id);

-- User households (because Babagigi is family-scoped, not individual-scoped)
CREATE TABLE user_households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  primary_user_id uuid NOT NULL REFERENCES users(id),
  household_name text,
  
  -- Family context
  number_of_generations integer,
  heritage_language_ids uuid[],
  diaspora_origin_place_id uuid REFERENCES places(id),
  current_place_id uuid REFERENCES places(id),
  
  -- Engagement
  babagigi_book_count integer DEFAULT 0,
  last_active_date date,
  
  created_at timestamptz DEFAULT now()
);

-- =====================================================================
-- PART 8: FINANCIAL OPERATIONS
-- =====================================================================

CREATE TABLE financial_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What kind of flow
  flow_type financial_flow_type NOT NULL,
  
  -- Amount
  amount_usd decimal(15,2) NOT NULL,
  amount_original_currency decimal(15,2),
  original_currency_code text,
  fx_rate_used decimal(12,6),
  
  -- When
  flow_date date NOT NULL,
  
  -- Who
  counterparty_organization_id uuid REFERENCES organizations(id),
  counterparty_name_if_individual text,  -- For individual donors, contractors, etc.
  
  -- Why
  purpose text NOT NULL,
  related_program_id uuid REFERENCES programs(id),
  related_deployment_id uuid REFERENCES deployments(id),
  related_product_id uuid REFERENCES products(id),
  related_community_id uuid REFERENCES communities(id),  -- For benefit-sharing
  
  -- Categorization
  fiscal_year integer NOT NULL,
  accounting_category text,              -- Maps to chart of accounts
  is_restricted boolean DEFAULT false,   -- Restricted to specific use
  restriction_terms text,
  
  -- Tracking
  external_reference text,               -- Stripe charge ID, grant ID, invoice number
  source_system text,                    -- 'stripe', 'manual-entry', 'quickbooks', 'bank-import'
  
  -- Status
  is_committed boolean DEFAULT false,    -- Pledged but not yet executed
  is_executed boolean DEFAULT true,
  
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_flow_date ON financial_flows(flow_date DESC);
CREATE INDEX idx_flow_type ON financial_flows(flow_type);
CREATE INDEX idx_flow_fy ON financial_flows(fiscal_year);
CREATE INDEX idx_flow_counterparty ON financial_flows(counterparty_organization_id);
CREATE INDEX idx_flow_program ON financial_flows(related_program_id);
CREATE INDEX idx_flow_community ON financial_flows(related_community_id);

COMMENT ON TABLE financial_flows IS
  'Every financial transaction TomorrowLabs touches. Benefit-sharing distributions to communities are flow_type and tracked explicitly — making structural what the philosophy commits to.';

-- Grants in flight (a more detailed view of grant-received flows)
CREATE TABLE grants_active (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  grant_name text NOT NULL,
  grant_code text UNIQUE,
  
  -- Funder
  funder_organization_id uuid NOT NULL REFERENCES organizations(id),
  
  -- Amount and timing
  total_amount_usd decimal(15,2) NOT NULL,
  disbursement_schedule jsonb,           -- {tranches: [{date, amount}, ...]}
  
  award_date date,
  start_date date NOT NULL,
  end_date date NOT NULL,
  
  -- Status
  application_status text,               -- 'in-development', 'submitted', 'in-review', 'awarded', 'declined', 'active', 'completed'
  
  -- Scope
  purpose text NOT NULL,
  funded_program_ids uuid[],
  restricted_to_focus_areas text[],
  
  -- Compliance
  reporting_requirements text,
  next_report_due date,
  reporting_owner text,
  
  -- TomorrowLabs ownership
  grant_owner text NOT NULL,
  
  -- Documents
  application_url text,
  contract_url text,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_grants_status ON grants_active(application_status);
CREATE INDEX idx_grants_funder ON grants_active(funder_organization_id);
CREATE INDEX idx_grants_reporting ON grants_active(next_report_due) WHERE application_status = 'active';

-- =====================================================================
-- PART 9: TEAM AND CAPACITY
-- =====================================================================

CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  full_name text NOT NULL,
  preferred_name text,
  pronouns text,
  
  -- Role
  current_role text NOT NULL,
  team text,                             -- 'product', 'partnerships', 'research', 'operations'
  reports_to text,
  
  -- Engagement
  engagement_type text,                  -- 'employee', 'contractor', 'advisor', 'volunteer', 'founder'
  start_date date,
  end_date date,                         -- If no longer engaged
  capacity_hours_per_week integer,
  
  -- Location
  primary_place_id uuid REFERENCES places(id),
  
  -- Languages
  fluent_language_ids uuid[],
  
  -- Skills and focus
  focus_areas text[],
  
  -- Contact (with privacy considerations)
  primary_email text,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_team_engagement ON team_members(engagement_type);
CREATE INDEX idx_team_active ON team_members(end_date) WHERE end_date IS NULL;

-- =====================================================================
-- PART 10: COMMUNICATIONS ARCHIVE
-- =====================================================================

CREATE TABLE communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- When and how
  communication_date timestamptz NOT NULL,
  channel communication_channel NOT NULL,
  
  -- Direction
  direction text NOT NULL,               -- 'inbound', 'outbound', 'internal-meeting'
  
  -- Participants
  tomorrowlabs_participants text[] NOT NULL,
  external_participants text[],
  related_organization_id uuid REFERENCES organizations(id),
  related_community_id uuid REFERENCES communities(id),
  
  -- Content
  subject text,
  summary text NOT NULL,
  key_topics text[],
  
  -- Outcomes
  decisions_made text,
  follow_up_required text,
  follow_up_owner text,
  follow_up_due_date date,
  follow_up_completed boolean DEFAULT false,
  
  -- Honest tracking
  went_well text,
  concerns_raised text,
  
  -- References
  related_program_id uuid REFERENCES programs(id),
  related_deployment_id uuid REFERENCES deployments(id),
  
  -- Documents
  artifact_urls text[],
  
  -- Privacy
  is_confidential boolean DEFAULT false,
  access_restrictions text,
  
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_comm_date ON communications(communication_date DESC);
CREATE INDEX idx_comm_org ON communications(related_organization_id);
CREATE INDEX idx_comm_followup ON communications(follow_up_due_date) WHERE follow_up_required IS NOT NULL AND follow_up_completed = false;

-- =====================================================================
-- PART 11: TECHNICAL INFRASTRUCTURE
-- =====================================================================

CREATE TABLE infrastructure_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  dependency_name text NOT NULL,
  dependency_type text,                  -- 'ai-model', 'cloud-service', 'pod-partner', 'payment-processor', 'analytics', 'database'
  
  -- Vendor
  vendor_organization_id uuid REFERENCES organizations(id),
  
  -- Usage
  used_by_products uuid[],               -- product_ids
  used_by_programs uuid[],               -- program_ids
  purpose text,
  
  -- Cost
  monthly_cost_usd decimal(10,2),
  pricing_model text,                    -- 'usage-based', 'flat-fee', 'free-tier'
  cost_growth_trajectory text,           -- 'stable', 'growing-linear', 'growing-exponential'
  
  -- Risk and dependency
  criticality risk_level,                -- How critical is this?
  alternative_providers text[],
  switching_difficulty text,             -- 'easy', 'moderate', 'difficult', 'very-difficult'
  vendor_lock_in_concerns text,
  
  -- Compliance
  data_residency_implications text,
  has_baa boolean,                       -- Business Associate Agreement (HIPAA-style)
  has_dpa boolean,                       -- Data Processing Agreement (GDPR)
  contract_url text,
  contract_renews_at date,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_infra_criticality ON infrastructure_dependencies(criticality);
CREATE INDEX idx_infra_renewal ON infrastructure_dependencies(contract_renews_at);

-- =====================================================================
-- PART 12: OPERATIONAL RISKS REGISTRY
-- =====================================================================

CREATE TABLE operational_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  risk_title text NOT NULL,
  category risk_category NOT NULL,
  
  -- Description
  description text NOT NULL,
  trigger_conditions text,               -- What would cause this risk to materialize
  
  -- Assessment
  level risk_level NOT NULL,
  likelihood text,                       -- 'very-unlikely', 'unlikely', 'possible', 'likely', 'very-likely'
  potential_impact text,
  
  -- What's at stake
  affected_program_ids uuid[],
  affected_deployment_ids uuid[],
  affected_partner_organization_ids uuid[],
  affected_community_ids uuid[],
  
  -- Mitigation
  mitigation_strategy text,
  mitigation_owner text,
  mitigation_status text,                -- 'not-yet-addressed', 'in-progress', 'mitigated', 'accepted', 'transferred'
  
  -- Tracking
  identified_date date NOT NULL,
  identified_by text,
  last_reviewed date,
  next_review_due date,
  resolved_date date,
  resolution_notes text,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_risks_level ON operational_risks(level);
CREATE INDEX idx_risks_active ON operational_risks(resolved_date) WHERE resolved_date IS NULL;
CREATE INDEX idx_risks_review ON operational_risks(next_review_due) WHERE resolved_date IS NULL;

-- =====================================================================
-- PART 13: BENEFIT-SHARING TRACKING (specific to mission accountability)
-- =====================================================================
-- Makes the philosophy commitment to benefit-sharing structural.

CREATE TABLE benefit_sharing_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parties
  partner_organization_id uuid REFERENCES organizations(id),
  community_id uuid REFERENCES communities(id),
  
  -- Scope
  applies_to_languages uuid[],
  applies_to_products uuid[],
  applies_to_places uuid[],
  
  -- Terms
  benefit_formula text NOT NULL,         -- How benefits are calculated
  benefit_types text[],                  -- 'cash', 'in-kind-services', 'governance-role', 'infrastructure', 'capacity-building'
  percentage_or_fixed text,              -- 'percentage', 'fixed', 'tiered', 'discretionary'
  
  -- If percentage-based
  percentage_of_attributable_revenue decimal(5,2),
  
  -- If fixed
  fixed_amount_annual_usd decimal(12,2),
  
  -- Schedule
  distribution_frequency text,           -- 'annual', 'quarterly', 'project-completion'
  
  -- Governance
  agreement_signed_date date,
  agreement_url text,
  community_signatories text[],
  tomorrowlabs_signatories text[],
  
  -- Status
  is_active boolean DEFAULT true,
  expires_at date,
  
  -- Audit
  audited_annually boolean DEFAULT true,
  last_audit_date date,
  audit_findings text,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bsa_partner ON benefit_sharing_agreements(partner_organization_id);
CREATE INDEX idx_bsa_community ON benefit_sharing_agreements(community_id);
CREATE INDEX idx_bsa_active ON benefit_sharing_agreements(is_active) WHERE is_active = true;

COMMENT ON TABLE benefit_sharing_agreements IS
  'Formal agreements about how TomorrowLabs shares benefits with communities. The structural commitment from the philosophy and pressure-test. Every active partnership should have an agreement here.';

-- =====================================================================
-- PART 14: SEED DATA
-- =====================================================================
-- Real entries demonstrating operational state

-- Products
INSERT INTO products (id, product_name, product_slug, description, product_type, current_stage,
                      stage_entered_at, product_owner, primary_audiences, is_revenue_generating, is_mission_aligned,
                      pricing_model, concept_date) VALUES
('55555555-0000-0000-0000-000000000001', 'Babagigi', 'babagigi',
 'Bilingual storybook platform where grandparents record stories in their heritage language for families to co-create illustrated children''s books.',
 'mobile-app', 'beta',
 '2026-03-01', 'Weston',
 ARRAY['diaspora-families', 'heritage-language-learners'],
 false, true,
 'freemium', '2025-08-01'),

('55555555-0000-0000-0000-000000000002', 'Little Digital Library', 'ldl',
 'Offline-first educational devices for foundational literacy and numeracy. Ages 5-16. Community-deployable, mother-tongue first.',
 'physical-product', 'design',
 '2026-01-15', 'Weston',
 ARRAY['partner-communities', 'rural-schools', 'community-learning-centers'],
 false, true,
 'free', '2024-05-01'),

('55555555-0000-0000-0000-000000000003', 'MissionAssist', 'missionassist',
 'Digital strategy consulting for Portland-area nonprofits. Revenue bridge for TomorrowLabs.',
 'service', 'mature',
 '2025-01-01', 'Weston',
 ARRAY['nonprofits-portland', 'mission-aligned-organizations'],
 true, true,
 'tiered', '2024-09-01');

-- Programs
INSERT INTO programs (id, program_name, program_code, description, program_type,
                      related_product_id, target_language_ids, target_place_ids,
                      partner_organization_ids,
                      status, planned_start_date, planned_end_date,
                      program_owner, approved_budget_usd,
                      primary_objectives, success_criteria,
                      current_health_status) VALUES

('66666666-0000-0000-0000-000000000001', 'Babagigi Wave 1 Launch', 'BB-W1-2027',
 'Public launch of Babagigi covering Spanish, Mandarin, Tagalog, Vietnamese, Korean, Arabic, French, Portuguese.',
 'product-launch',
 '55555555-0000-0000-0000-000000000001',
 ARRAY[]::uuid[],   -- Would be populated with the eight language UUIDs
 ARRAY['33333333-0000-0000-0000-000000000001']::uuid[],   -- US
 ARRAY[]::uuid[],
 'planning', '2027-01-15', '2027-06-30',
 'Weston', 250000,
 ARRAY['Launch with eight Wave 1 languages', 'Establish baseline user acquisition cost', 'Validate freemium conversion'],
 ARRAY['1000 active families by month 3', '15% paid conversion', 'NPS > 50'],
 'green'),

('66666666-0000-0000-0000-000000000002', 'LDL Cambodia Pilot', 'LDL-KH-2027',
 'First LDL field deployment in Cambodia with Golden Leaf Foundation. Three villages, ages 5-12, Khmer-first content.',
 'field-deployment',
 '55555555-0000-0000-0000-000000000002',
 ARRAY[]::uuid[],   -- Khmer language UUID
 ARRAY['33333333-0000-0000-0000-000000000002']::uuid[],   -- Cambodia
 ARRAY['44444444-0000-0000-0000-000000000002']::uuid[],   -- Golden Leaf
 'planning', '2027-09-01', '2028-06-30',
 'Weston', 180000,
 ARRAY['Validate offline-first device design in field', 'Establish baseline learning outcomes', 'Refine deployment playbook'],
 ARRAY['60 children completing 6-month engagement', 'Measurable literacy gains', 'Partner-led handover plan documented'],
 'yellow');

-- Deployments
INSERT INTO deployments (id, program_id, deployment_name, deployment_code,
                        primary_place_id, partner_organization_id,
                        stage, planned_start_date,
                        target_participant_count, target_household_count,
                        approved_budget_usd, on_ground_coordinator,
                        deployment_health) VALUES
('77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000002',
 'LDL Pursat Village Site', 'LDL-KH-V01-2027',
 '33333333-0000-0000-0000-000000000002',   -- Cambodia (would be a sub-place if seeded)
 '44444444-0000-0000-0000-000000000002',
 'scoping', '2027-09-15',
 25, 20,
 65000, 'To be assigned',
 'on-track');

-- Benefit-sharing agreement for Cambodia
INSERT INTO benefit_sharing_agreements (
  partner_organization_id, applies_to_languages, applies_to_places,
  benefit_formula, benefit_types, percentage_or_fixed,
  percentage_of_attributable_revenue,
  distribution_frequency,
  is_active, audited_annually,
  notes
) VALUES (
  '44444444-0000-0000-0000-000000000002',   -- Golden Leaf
  ARRAY[]::uuid[],   -- Khmer
  ARRAY['33333333-0000-0000-0000-000000000002']::uuid[],   -- Cambodia
  'Percentage of attributable Babagigi revenue plus in-kind infrastructure investments',
  ARRAY['cash', 'infrastructure', 'capacity-building'],
  'percentage', 20.0,
  'quarterly', true, true,
  'PLACEHOLDER agreement. Final terms to be negotiated with Golden Leaf by Q2 2027 per pressure-test commitment. Recorded here to track that the commitment exists, not because terms are final.'
);

-- Active risks
INSERT INTO operational_risks (
  risk_title, category, description, trigger_conditions,
  level, likelihood, potential_impact,
  mitigation_strategy, mitigation_owner, mitigation_status,
  identified_date, identified_by, next_review_due
) VALUES

('Benefit-sharing formula not yet finalized', 'community-trust',
 'TomorrowLabs has committed publicly to benefit-sharing formulas but has not yet negotiated specific terms with partner communities. Risk of operating without explicit agreement.',
 'Continued growth of Babagigi pre-launch without resolving terms with partners.',
 'high', 'likely',
 'Partnership trust erosion; reputational risk; possible re-negotiation under pressure',
 'Negotiate specific terms with Golden Leaf, California Rotary, N50 by Q2 2027.',
 'Weston', 'in-progress',
 '2026-05-15', 'Weston', '2026-08-15'),

('Single-founder operational dependency', 'team-capacity',
 'Most operational knowledge sits with Weston. No documented succession or distributed knowledge plan.',
 'Weston unavailable due to illness, burnout, or other interruption.',
 'high', 'possible',
 'Operations stall; partnership relationships at risk; institutional memory loss',
 'Document operational knowledge systematically. Identify second-in-command for each critical function.',
 'Weston', 'not-yet-addressed',
 '2026-05-15', 'Weston', '2026-06-15'),

('Khmer typography rendering quality', 'technical',
 'Khmer script has complex shaping rules. Babagigi storybook rendering quality is highest-risk language tier per earlier analysis.',
 'Wave 4 Khmer launch without resolved typography.',
 'moderate', 'likely',
 'Product quality below acceptable standard for partner community; community trust damage',
 'Commission Khmer style system. Test extensively with Cambodian-American community before launch.',
 'Weston', 'in-progress',
 '2026-04-01', 'Weston', '2026-07-01');

-- Technical infrastructure dependencies
INSERT INTO infrastructure_dependencies (
  dependency_name, dependency_type, vendor_organization_id,
  purpose, monthly_cost_usd, pricing_model,
  criticality, switching_difficulty, vendor_lock_in_concerns
) VALUES

('Gelato Print-on-Demand', 'pod-partner', NULL,
 'Physical Babagigi book printing and shipping. Selected for global reach and quality.',
 0, 'usage-based',
 'high', 'difficult',
 'Migration would require re-establishing print quality and shipping reliability with new partner.'),

('Meta Omnilingual ASR', 'ai-model', '44444444-0000-0000-0000-000000000010',  
 'Speech recognition for Wave 4 mission-track languages where commercial STT is inadequate. Apache 2.0 licensed.',
 0, 'free-tier',
 'high', 'moderate',
 'Open license means no vendor lock-in, but model expertise is concentrated at Meta.');

-- =====================================================================
-- PART 15: STRATEGIC VIEWS
-- =====================================================================

-- All active work TomorrowLabs is doing right now
CREATE OR REPLACE VIEW active_work_summary AS
SELECT 
  p.program_name,
  p.program_code,
  p.program_type,
  p.status,
  p.current_health_status,
  p.program_owner,
  p.planned_start_date,
  p.planned_end_date,
  p.approved_budget_usd,
  p.actual_spend_to_date_usd,
  COUNT(d.id) AS deployment_count,
  array_agg(DISTINCT prod.product_name) FILTER (WHERE prod.id IS NOT NULL) AS related_products
FROM programs p
LEFT JOIN deployments d ON d.program_id = p.id
LEFT JOIN products prod ON prod.id = p.related_product_id
WHERE p.status IN ('active', 'pre-launch', 'planning')
GROUP BY p.id, prod.product_name
ORDER BY 
  CASE p.current_health_status 
    WHEN 'red' THEN 1 
    WHEN 'yellow' THEN 2 
    WHEN 'green' THEN 3 
    ELSE 4 
  END,
  p.planned_start_date;

-- Risk dashboard
CREATE OR REPLACE VIEW active_risk_dashboard AS
SELECT 
  r.risk_title,
  r.category,
  r.level,
  r.likelihood,
  r.mitigation_status,
  r.mitigation_owner,
  r.next_review_due,
  (r.next_review_due - CURRENT_DATE) AS days_until_review,
  r.identified_date,
  (CURRENT_DATE - r.identified_date) AS days_open
FROM operational_risks r
WHERE r.resolved_date IS NULL
ORDER BY 
  CASE r.level 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'moderate' THEN 3 
    WHEN 'low' THEN 4 
    ELSE 5 
  END,
  r.identified_date;

-- Compliance and follow-up tracking
CREATE OR REPLACE VIEW upcoming_obligations AS
SELECT 
  'communication-followup' AS obligation_type,
  c.summary AS description,
  c.follow_up_owner AS owner,
  c.follow_up_due_date AS due_date,
  (c.follow_up_due_date - CURRENT_DATE) AS days_remaining
FROM communications c
WHERE c.follow_up_required IS NOT NULL AND c.follow_up_completed = false

UNION ALL

SELECT 
  'grant-reporting' AS obligation_type,
  'Report due for: ' || g.grant_name AS description,
  g.reporting_owner AS owner,
  g.next_report_due AS due_date,
  (g.next_report_due - CURRENT_DATE) AS days_remaining
FROM grants_active g
WHERE g.next_report_due IS NOT NULL AND g.application_status = 'active'

UNION ALL

SELECT 
  'risk-review' AS obligation_type,
  'Risk review: ' || r.risk_title AS description,
  r.mitigation_owner AS owner,
  r.next_review_due AS due_date,
  (r.next_review_due - CURRENT_DATE) AS days_remaining
FROM operational_risks r
WHERE r.resolved_date IS NULL AND r.next_review_due IS NOT NULL

UNION ALL

SELECT 
  'consent-renewal' AS obligation_type,
  'Consent review for subject' AS description,
  cr.consent_obtained_by AS owner,
  cr.next_review_due AS due_date,
  (cr.next_review_due - CURRENT_DATE) AS days_remaining
FROM consent_records cr
WHERE cr.status IN ('granted', 'granted-with-conditions') AND cr.next_review_due IS NOT NULL

ORDER BY days_remaining ASC;

-- Benefit-sharing accountability
CREATE OR REPLACE VIEW benefit_sharing_accountability AS
SELECT 
  o.legal_name AS partner,
  c.english_name AS community,
  bsa.benefit_formula,
  bsa.percentage_or_fixed,
  bsa.percentage_of_attributable_revenue,
  bsa.distribution_frequency,
  bsa.is_active,
  bsa.last_audit_date,
  bsa.agreement_signed_date,
  (CASE 
    WHEN bsa.agreement_signed_date IS NULL THEN 'NOT-YET-SIGNED'
    WHEN bsa.last_audit_date IS NULL THEN 'SIGNED-NEVER-AUDITED'
    WHEN bsa.last_audit_date < CURRENT_DATE - INTERVAL '13 months' THEN 'AUDIT-OVERDUE'
    ELSE 'CURRENT'
  END) AS accountability_status
FROM benefit_sharing_agreements bsa
LEFT JOIN organizations o ON o.id = bsa.partner_organization_id
LEFT JOIN communities c ON c.id = bsa.community_id
WHERE bsa.is_active = true;

-- Financial summary by program
CREATE OR REPLACE VIEW program_financial_summary AS
SELECT 
  p.program_name,
  p.program_code,
  p.approved_budget_usd,
  p.actual_spend_to_date_usd,
  (p.approved_budget_usd - p.actual_spend_to_date_usd) AS remaining_budget,
  CASE 
    WHEN p.approved_budget_usd > 0 THEN 
      ROUND(((p.actual_spend_to_date_usd / p.approved_budget_usd) * 100)::numeric, 1)
    ELSE NULL 
  END AS pct_spent,
  COALESCE(SUM(ff.amount_usd) FILTER (WHERE ff.flow_type IN ('grant-received', 'revenue-product', 'revenue-services')), 0) AS total_inflow,
  COALESCE(SUM(ff.amount_usd) FILTER (WHERE ff.flow_type IN ('expense-program', 'benefit-sharing-distribution')), 0) AS total_outflow
FROM programs p
LEFT JOIN financial_flows ff ON ff.related_program_id = p.id
WHERE p.status IN ('active', 'pre-launch', 'planning', 'winding-down')
GROUP BY p.id;

-- =====================================================================
-- END MIGRATION 005
-- =====================================================================
