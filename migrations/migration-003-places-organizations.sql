-- =====================================================================
-- Migration 003: Phase 1 Spine — Places and Organizations
-- 
-- Extends the language database with the other two foundational
-- reference entities. Together with languages, these form the
-- Layer 1 spine that everything else in the TomorrowLabs data
-- architecture references.
--
-- Design principles (carried forward from languages):
--   - Hierarchical, with self-referencing parent relationships
--   - Multiple canonical external identifiers (not just one)
--   - Confidence levels and source citations on every fact
--   - Community-respectful (community positions override academic when needed)
--   - Time-series-friendly (separate tables for state that changes)
--   - Multi-generational durability in mind
-- =====================================================================

-- =====================================================================
-- PART 1: ENUMS FOR PLACES
-- =====================================================================

CREATE TYPE place_granularity AS ENUM (
  'world',              -- The world (root)
  'continent',          -- Continents, supra-national
  'sub-continent',      -- Regions like 'Southeast Asia', 'Central America'
  'country',            -- Sovereign nations
  'state-province',     -- First-level admin division
  'metro-area',         -- Metropolitan statistical areas
  'county',             -- Second-level admin division (county, district)
  'city',               -- Cities, towns
  'neighborhood',       -- Sub-city geographic divisions
  'indigenous-territory', -- Indigenous lands (often crosses political boundaries)
  'community-designated' -- Places communities recognize that don't fit other categories
);

CREATE TYPE place_status AS ENUM (
  'active',
  'historical',        -- No longer exists but historically significant
  'disputed',          -- Sovereignty or boundaries contested
  'depopulated'        -- Place exists geographically but population displaced
);

CREATE TYPE climate_zone AS ENUM (
  'tropical-wet',
  'tropical-dry',
  'arid',
  'semi-arid',
  'mediterranean',
  'humid-subtropical',
  'humid-continental',
  'oceanic',
  'subarctic',
  'polar',
  'highland'
);

CREATE TYPE governance_type AS ENUM (
  'sovereign-state',
  'autonomous-region',
  'colonial-territory',
  'disputed-territory',
  'tribal-governance',
  'municipal',
  'unincorporated',
  'occupied'
);

CREATE TYPE territory_recognition AS ENUM (
  'internationally-recognized',
  'partially-recognized',
  'unrecognized',
  'self-declared',
  'historical-only'
);

-- =====================================================================
-- PART 2: ENUMS FOR ORGANIZATIONS
-- =====================================================================

CREATE TYPE organization_type AS ENUM (
  'community-organization',  -- Community-rooted, often grassroots
  'nonprofit-formal',        -- Formal 501(c)(3) or international equivalent
  'foundation',              -- Grantmaking foundations
  'government-agency',       -- Government bodies
  'intergovernmental',       -- UN agencies, etc.
  'academic-institution',    -- Universities, research centers
  'religious-institution',   -- Churches, temples, mosques, etc.
  'cultural-institution',    -- Museums, archives, cultural centers
  'for-profit-aligned',      -- For-profits whose mission aligns with TomorrowLabs
  'for-profit-vendor',       -- Commercial vendors we work with
  'media-organization',
  'professional-association',
  'informal-collective',     -- Groups without formal incorporation
  'individual-practitioner', -- Independent researchers, consultants
  'peer-organization',       -- Other orgs doing similar work
  'competitor'               -- Honest acknowledgment of competitive landscape
);

CREATE TYPE relationship_status AS ENUM (
  'active-partner',
  'active-vendor',
  'active-funder',
  'active-grantee',          -- TomorrowLabs as the grantmaker
  'exploratory-conversation',
  'prospect-not-contacted',
  'historical-partner',
  'declined-mutual',
  'declined-by-them',
  'declined-by-us',
  'observed-only',           -- Tracking but no relationship
  'do-not-engage'            -- Active decision not to engage
);

CREATE TYPE trust_level AS ENUM (
  'deeply-trusted',          -- Years of work together, demonstrated reciprocity
  'trusted',                 -- Established working relationship
  'developing',              -- Newer relationship, going well
  'cautious',                -- Some concerns, monitoring
  'damaged',                 -- Specific issues in the relationship
  'unknown'                  -- Haven't worked together
);

CREATE TYPE incorporation_status AS ENUM (
  'incorporated-nonprofit',
  'incorporated-for-profit',
  'incorporated-cooperative',
  'fiscally-sponsored',
  'community-collective',
  'informal-unincorporated',
  'individual'
);

CREATE TYPE funder_category AS ENUM (
  'private-foundation',
  'family-foundation',
  'corporate-foundation',
  'community-foundation',
  'public-charity',
  'government-grant',
  'multilateral-agency',
  'individual-donor',
  'crowdfunding',
  'not-a-funder'
);

-- =====================================================================
-- PART 3: PLACES TABLE
-- =====================================================================

CREATE TABLE places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Canonical names
  english_name text NOT NULL,
  endonym text,                    -- Local name in local language
  endonym_language_id uuid REFERENCES languages(id),  -- Which language is the endonym in
  alternate_names text[],
  
  -- Hierarchical structure
  granularity place_granularity NOT NULL,
  parent_place_id uuid REFERENCES places(id),
  
  -- External canonical identifiers (multiple, not just one — matches Glottolog/ISO approach)
  geonames_id text UNIQUE,         -- GeoNames is the primary structural backbone
  wikidata_id text,                -- e.g., 'Q424' for Cambodia
  iso_3166_1_alpha2 text,          -- For countries, e.g., 'KH'
  iso_3166_1_alpha3 text,          -- e.g., 'KHM'
  iso_3166_2 text,                 -- For sub-national divisions
  un_m49_code text,                -- UN statistical division codes
  fips_code text,                  -- US-specific, also used for some international
  osm_relation_id text,            -- OpenStreetMap reference
  
  -- For indigenous territories
  native_land_ca_id text,          -- native-land.ca identifier
  community_designated_by_id uuid REFERENCES organizations(id),  -- If place is community-designated
  
  -- Geographic data
  latitude decimal(10, 7),
  longitude decimal(10, 7),
  area_sq_km decimal(15, 2),
  
  -- Classification
  status place_status DEFAULT 'active',
  governance_type governance_type,
  territory_recognition territory_recognition,
  climate_zone climate_zone,
  primary_timezone text,           -- IANA format, e.g., 'Asia/Phnom_Penh'
  
  -- Validation tracking
  geonames_validated boolean DEFAULT false,
  geonames_last_synced date,
  
  -- Cross-references to other systems
  primary_languages_used uuid[],   -- Array of language_id (denormalized for performance, primary languages only)
  
  -- Free-form
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_places_parent ON places(parent_place_id);
CREATE INDEX idx_places_granularity ON places(granularity);
CREATE INDEX idx_places_geonames ON places(geonames_id);
CREATE INDEX idx_places_iso2 ON places(iso_3166_1_alpha2);
CREATE INDEX idx_places_name ON places(english_name);

COMMENT ON TABLE places IS
  'Layer 1 reference entity for geographic and political places. Hierarchical via parent_place_id. Anchored to GeoNames where possible; supports indigenous and community-designated places that fall outside GeoNames.';

COMMENT ON COLUMN places.community_designated_by_id IS
  'If this place is community-designated rather than from GeoNames/canonical source, which organization designated it. Honors community geographic naming that may not appear in canonical sources.';

-- =====================================================================
-- PART 4: ORGANIZATIONS TABLE
-- =====================================================================

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Canonical identification
  legal_name text NOT NULL,        -- Formal legal name
  display_name text,               -- How they prefer to be called (often shorter)
  endonym text,                    -- Name in their own language if different
  endonym_language_id uuid REFERENCES languages(id),
  alternate_names text[],
  
  -- Hierarchical structure (parent/subsidiary)
  parent_organization_id uuid REFERENCES organizations(id),
  
  -- Classification
  organization_type organization_type NOT NULL,
  incorporation_status incorporation_status,
  funder_category funder_category DEFAULT 'not-a-funder',
  
  -- Geographic anchors
  headquarters_place_id uuid REFERENCES places(id),
  primary_operating_places uuid[],  -- Array of place_id where they operate
  
  -- Mission and scope
  mission_statement text,
  focus_areas text[],              -- Free-form tags: ['language-preservation', 'education', 'indigenous-rights']
  geographic_scope text,           -- 'global', 'regional', 'national', 'local'
  
  -- External identifiers
  ein text,                        -- US 501(c)(3) Employer ID Number
  wikidata_id text,
  crunchbase_id text,              -- For commercial orgs
  guidestar_id text,               -- US nonprofit registry
  charity_navigator_id text,
  candid_id text,                  -- Candid (formerly Foundation Center) ID
  
  -- Web presence
  primary_url text,
  social_handles jsonb,            -- {twitter: '@handle', linkedin: 'url', ...}
  
  -- Languages they work in (canonical list, time-invariant)
  primary_languages_used uuid[],   -- Array of language_id
  
  -- Founding context
  founding_year integer,
  founding_story text,             -- For community organizations especially, the origin story matters
  
  -- Status
  is_active boolean DEFAULT true,
  ceased_operations_year integer,  -- If no longer operating
  
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_orgs_type ON organizations(organization_type);
CREATE INDEX idx_orgs_parent ON organizations(parent_organization_id);
CREATE INDEX idx_orgs_hq ON organizations(headquarters_place_id);
CREATE INDEX idx_orgs_name ON organizations(legal_name);
CREATE INDEX idx_orgs_active ON organizations(is_active) WHERE is_active = true;

COMMENT ON TABLE organizations IS
  'Layer 1 reference entity for organizations TomorrowLabs interacts with, observes, or could interact with. Includes partners, funders, peers, vendors, governments, and competitors.';

-- =====================================================================
-- PART 5: TIME-SERIES TABLES FOR PLACES
-- =====================================================================

-- Demographics by place over time
CREATE TABLE place_demographics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  
  assessment_date date NOT NULL,
  
  -- Population
  population_total bigint,
  population_under_5 bigint,
  population_5_to_18 bigint,
  population_18_to_65 bigint,
  population_65_plus bigint,
  
  -- Distribution
  pct_urban decimal(5,2),
  pct_rural decimal(5,2),
  
  -- Economic
  median_household_income_usd decimal(12,2),
  pct_below_poverty_line decimal(5,2),
  gini_coefficient decimal(5,4),    -- Inequality measure (0 = perfect equality, 1 = perfect inequality)
  
  -- Education
  pct_literate_adults decimal(5,2),
  pct_completed_secondary decimal(5,2),
  pct_completed_tertiary decimal(5,2),
  
  -- Connectivity (Digital Divide indicators)
  pct_with_internet_access decimal(5,2),
  pct_with_smartphone decimal(5,2),
  pct_with_reliable_electricity decimal(5,2),
  median_mobile_speed_mbps decimal(8,2),
  median_fixed_speed_mbps decimal(8,2),
  
  -- Health
  life_expectancy_years decimal(4,1),
  under_5_mortality_per_1000 decimal(6,2),
  
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'medium',
  data_year integer,                -- Year the data describes (may differ from assessment_date)
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_place_demo_lookup ON place_demographics(place_id, assessment_date DESC);

-- Economic context by place over time
CREATE TABLE place_economic_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  
  assessment_date date NOT NULL,
  
  -- Macroeconomic
  gdp_usd decimal(18,2),
  gdp_per_capita_usd decimal(12,2),
  gdp_ppp_per_capita_usd decimal(12,2),   -- Purchasing power parity
  inflation_rate_pct decimal(5,2),
  unemployment_rate_pct decimal(5,2),
  
  -- Currency
  primary_currency_code text,             -- ISO 4217, e.g., 'KHR' for Cambodian Riel
  secondary_currency_code text,           -- Where dual-currency common (e.g., USD in Cambodia)
  
  -- Market readiness signals
  ecommerce_penetration_pct decimal(5,2),
  digital_payment_penetration_pct decimal(5,2),
  credit_card_penetration_pct decimal(5,2),
  primary_payment_methods text[],         -- ['mobile-money', 'cash', 'bank-transfer', etc.]
  
  -- Cost benchmarks
  big_mac_index_usd decimal(8,2),         -- Economist's PPP indicator
  median_book_price_usd decimal(8,2),     -- Useful for Babagigi pricing
  
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'medium',
  data_year integer,
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_place_econ_lookup ON place_economic_indicators(place_id, assessment_date DESC);

-- Infrastructure by place over time
CREATE TABLE place_infrastructure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  
  assessment_date date NOT NULL,
  
  -- Physical infrastructure
  postal_reliability text,                -- 'excellent', 'good', 'variable', 'poor', 'absent'
  shipping_carriers_available text[],     -- ['USPS', 'DHL', 'local-courier']
  international_shipping_days_avg integer,
  customs_complexity text,                -- 'simple', 'moderate', 'complex', 'restrictive'
  
  -- Digital infrastructure  
  internet_penetration_pct decimal(5,2),
  mobile_penetration_pct decimal(5,2),
  smartphone_penetration_pct decimal(5,2),
  electricity_reliability text,           -- 'excellent', 'good', 'variable', 'poor', 'off-grid'
  
  -- Logistics
  print_on_demand_partners_available text[],  -- ['Gelato', 'local-print-shop']
  customs_data_protection_concerns boolean,
  
  -- Educational infrastructure
  primary_school_enrollment_pct decimal(5,2),
  secondary_school_enrollment_pct decimal(5,2),
  mother_tongue_education_status text,    -- 'mandated', 'permitted', 'restricted', 'banned'
  
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'medium',
  data_year integer,
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_place_infra_lookup ON place_infrastructure(place_id, assessment_date DESC);

-- Regulatory and legal environment by place
CREATE TABLE place_regulatory_environment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  
  assessment_date date NOT NULL,
  
  -- Data protection
  primary_data_protection_law text,       -- 'GDPR', 'CCPA', 'LGPD', 'DPDP', 'PIPEDA', etc.
  data_protection_law_url text,
  child_data_protection_law text,         -- 'COPPA', 'GDPR-K', etc.
  age_of_digital_consent integer,         -- Age at which a minor can consent to data processing
  
  -- Content regulation
  content_restriction_level text,         -- 'none', 'minimal', 'moderate', 'significant', 'restrictive'
  language_content_restrictions text,
  educational_content_approval_required boolean,
  
  -- Indigenous rights
  has_indigenous_data_sovereignty_law boolean,
  indigenous_recognition_status text,
  
  -- Nonprofit operations
  foreign_nonprofit_registration_required boolean,
  foreign_funding_restrictions text,
  
  -- IP and commercial
  trademark_office text,
  copyright_term_years integer,
  
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_place_reg_lookup ON place_regulatory_environment(place_id, assessment_date DESC);

-- Cultural calendar (timeless reference, place-specific)
CREATE TABLE place_cultural_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  
  event_name text NOT NULL,
  event_name_local text,
  event_type text,                        -- 'religious', 'national-holiday', 'cultural', 'seasonal'
  
  -- Timing (varies by event)
  typical_month integer,                  -- 1-12, null if calendar-dependent
  typical_day integer,                    -- Day of month, null if movable
  is_movable boolean,                     -- True if based on lunar/religious calendar
  calendar_basis text,                    -- 'gregorian', 'lunar', 'lunisolar', 'islamic', 'jewish', 'buddhist'
  
  duration_days integer,
  
  -- Significance
  is_business_holiday boolean,
  affects_shipping boolean,
  affects_school_calendar boolean,
  is_storytelling_associated boolean,     -- Particularly relevant for Babagigi
  
  significance_to_diaspora text,          -- How does diaspora community observe?
  
  source_id uuid REFERENCES sources(id),
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_place_cal_lookup ON place_cultural_calendar(place_id);

-- =====================================================================
-- PART 6: TIME-SERIES TABLES FOR ORGANIZATIONS
-- =====================================================================

-- Relationship state with each organization over time
CREATE TABLE organization_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- State at this assessment
  assessment_date date NOT NULL,
  relationship_status relationship_status NOT NULL,
  trust_level trust_level,
  
  -- TomorrowLabs context
  tomorrowlabs_relationship_owner text,   -- Who at TL owns this relationship
  
  -- Connection points
  primary_contact_name text,
  primary_contact_role text,
  primary_contact_email text,
  primary_contact_notes text,
  
  -- Relationship character
  reciprocity_assessment text,            -- 'highly-reciprocal', 'balanced', 'extractive-from-us', 'extractive-from-them'
  cultural_fit_notes text,
  power_dynamic_notes text,               -- Honest assessment of power balance
  
  -- Active engagement
  active_projects_count integer DEFAULT 0,
  last_meaningful_contact date,
  next_planned_contact date,
  
  source_id uuid REFERENCES sources(id),
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_org_rel_lookup ON organization_relationships(organization_id, assessment_date DESC);

COMMENT ON TABLE organization_relationships IS
  'Time-series state of TomorrowLabs relationship with each organization. New row when state materially changes. Power dynamic and reciprocity assessments are deliberately included — they should be tracked honestly, not avoided.';

-- Financial profile of organizations (especially funders)
CREATE TABLE organization_financial_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  assessment_date date NOT NULL,
  fiscal_year integer,
  
  -- Scale
  annual_budget_usd decimal(15,2),
  total_assets_usd decimal(15,2),
  total_endowment_usd decimal(15,2),
  staff_count integer,
  
  -- For funders
  annual_grantmaking_usd decimal(15,2),
  typical_grant_size_usd decimal(12,2),
  smallest_typical_grant_usd decimal(12,2),
  largest_typical_grant_usd decimal(12,2),
  number_of_grants_made integer,
  
  -- Funding focus
  grant_focus_areas text[],
  geographic_grantmaking_areas text[],
  multi_year_grants_typical boolean,
  general_operating_support_available boolean,
  
  source_id uuid REFERENCES sources(id),
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_org_finprofile_lookup ON organization_financial_profile(organization_id, assessment_date DESC);

-- Programs and initiatives organizations run
CREATE TABLE organization_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  program_name text NOT NULL,
  program_url text,
  
  -- Scope
  focus_area text,
  geographic_focus_place_ids uuid[],     -- Array of place_id
  languages_served uuid[],                -- Array of language_id
  
  -- Timeline
  start_year integer,
  end_year integer,                       -- null if ongoing
  
  -- Scale
  annual_budget_usd decimal(12,2),
  participant_count integer,
  
  -- Outcomes
  documented_outcomes text,
  external_evaluations text[],            -- References to published evaluations
  
  -- Relevance to TomorrowLabs
  relevance_to_tomorrowlabs text,
  potential_collaboration_notes text,
  
  source_id uuid REFERENCES sources(id),
  last_reviewed date DEFAULT CURRENT_DATE,
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_org_prog_org ON organization_programs(organization_id);

-- Interactions log — every meaningful touch with an organization
CREATE TABLE organization_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  interaction_date date NOT NULL,
  interaction_type text,                  -- 'meeting', 'email', 'call', 'site-visit', 'event', 'formal-proposal'
  
  -- Who
  tomorrowlabs_participants text[],
  partner_participants text[],
  
  -- What
  summary text NOT NULL,
  topics_discussed text[],
  outcomes text,
  follow_up_required text,
  follow_up_owner text,
  follow_up_by_date date,
  
  -- Honest assessment
  went_well boolean,
  concerns_raised text,
  
  source_id uuid REFERENCES sources(id),
  notes text,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_org_interactions_org_date ON organization_interactions(organization_id, interaction_date DESC);
CREATE INDEX idx_org_interactions_followup ON organization_interactions(follow_up_by_date) WHERE follow_up_required IS NOT NULL;

-- =====================================================================
-- PART 7: CROSS-ENTITY RELATIONSHIPS
-- =====================================================================

-- Which organizations work in which places
CREATE TABLE organization_place_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  
  presence_type text,                     -- 'headquarters', 'office', 'program-site', 'fiscal-sponsor', 'remote'
  presence_start_year integer,
  presence_end_year integer,
  
  staff_count_local integer,
  notes text,
  
  source_id uuid REFERENCES sources(id),
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id, place_id, presence_type)
);

CREATE INDEX idx_org_place_org ON organization_place_presence(organization_id);
CREATE INDEX idx_org_place_place ON organization_place_presence(place_id);

-- Communities (defined as groups that may span multiple places and languages)
CREATE TABLE communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  english_name text NOT NULL,
  endonym text,
  endonym_language_id uuid REFERENCES languages(id),
  alternate_names text[],
  
  community_type text,                    -- 'diaspora', 'religious', 'indigenous', 'professional', 'linguistic'
  
  -- Constituent dimensions
  primary_language_ids uuid[],            -- Array of language_id
  primary_place_ids uuid[],               -- Array of place_id (where this community lives)
  origin_place_id uuid REFERENCES places(id), -- Ancestral or historical origin
  
  -- Identification
  is_self_identified_community boolean DEFAULT true,
  self_identification_basis text,         -- How does the community define itself?
  
  -- Estimated size (informational, not authoritative)
  estimated_global_population bigint,
  estimated_population_confidence confidence_level,
  
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_communities_name ON communities(english_name);

COMMENT ON TABLE communities IS
  'Communities that may not map cleanly to either places or languages alone. Diaspora networks, religious communities, indigenous nations whose membership cuts across multiple places and languages.';

-- =====================================================================
-- PART 8: SEED DATA
-- =====================================================================

-- Sources for places and orgs
INSERT INTO sources (id, name, type, url, accessed_date, reliability_rating, notes) VALUES
  ('11111111-1111-1111-1111-111111111201', 'GeoNames', 'academic', 
   'https://www.geonames.org/', '2026-05-15', 'high',
   'Canonical source for geographic identifiers and hierarchical place data.'),
  ('11111111-1111-1111-1111-111111111202', 'native-land.ca', 'community',
   'https://native-land.ca/', '2026-05-15', 'high',
   'Indigenous territory mapping. Note: Community-maintained, identifies as a starting point not authority.'),
  ('11111111-1111-1111-1111-111111111203', 'Wikidata', 'academic',
   'https://www.wikidata.org/', '2026-05-15', 'medium',
   'Broad coverage but quality varies by entry.'),
  ('11111111-1111-1111-1111-111111111204', 'Candid (Foundation Directory)', 'academic',
   'https://candid.org/', '2026-05-15', 'high',
   'US-focused. Primary source for US foundation data.'),
  ('11111111-1111-1111-1111-111111111205', 'TomorrowLabs internal organization records', 'internal',
   null, '2026-05-15', 'high',
   'Direct knowledge from team interactions and partnership work.');


-- Seed places: focus on TomorrowLabs's active geography
INSERT INTO places (id, english_name, endonym, granularity, geonames_id, wikidata_id, 
                    iso_3166_1_alpha2, iso_3166_1_alpha3, latitude, longitude,
                    governance_type, territory_recognition, climate_zone, primary_timezone,
                    geonames_validated, geonames_last_synced, notes) VALUES

-- Countries
('33333333-0000-0000-0000-000000000001', 'United States', 'United States', 'country',
 '6252001', 'Q30', 'US', 'USA', 39.76, -98.50,
 'sovereign-state', 'internationally-recognized', 'humid-continental', 'America/Chicago',
 true, '2026-05-15', 'TomorrowLabs primary market for Babagigi diaspora users.'),

('33333333-0000-0000-0000-000000000002', 'Cambodia', 'កម្ពុជា', 'country',
 '1831722', 'Q424', 'KH', 'KHM', 12.57, 104.99,
 'sovereign-state', 'internationally-recognized', 'tropical-wet', 'Asia/Phnom_Penh',
 true, '2026-05-15', 'TomorrowLabs Golden Leaf Foundation partnership location. Origin of TomorrowLabs mission inspiration.'),

('33333333-0000-0000-0000-000000000003', 'Guatemala', 'Guatemala', 'country',
 '3595528', 'Q774', 'GT', 'GTM', 15.78, -90.23,
 'sovereign-state', 'internationally-recognized', 'tropical-wet', 'America/Guatemala',
 true, '2026-05-15', 'California Rotary partnership location. K''iche'' and Kaqchikel communities.'),

('33333333-0000-0000-0000-000000000004', 'Mexico', 'México', 'country',
 '3996063', 'Q96', 'MX', 'MEX', 23.63, -102.55,
 'sovereign-state', 'internationally-recognized', 'arid', 'America/Mexico_City',
 true, '2026-05-15', 'N50 Project partnership location. Nahuatl and Mixtec language preservation context.'),

('33333333-0000-0000-0000-000000000005', 'Thailand', 'ประเทศไทย', 'country',
 '1605651', 'Q869', 'TH', 'THA', 15.87, 100.99,
 'sovereign-state', 'internationally-recognized', 'tropical-wet', 'Asia/Bangkok',
 true, '2026-05-15', 'Weston secondary base. Relevant for regional Southeast Asia work.'),

-- US states relevant for diaspora work
('33333333-0000-0000-0000-000000000010', 'California', 'California', 'state-province',
 '5332921', 'Q99', 'US', null, 36.77, -119.42,
 'autonomous-region', 'internationally-recognized', 'mediterranean', 'America/Los_Angeles',
 true, '2026-05-15', 'Largest US state by population. Major diaspora concentrations for Cambodian, Mexican, Tagalog, Vietnamese, and others.'),

('33333333-0000-0000-0000-000000000011', 'Oregon', 'Oregon', 'state-province',
 '5744337', 'Q824', 'US', null, 43.80, -120.55,
 'autonomous-region', 'internationally-recognized', 'oceanic', 'America/Los_Angeles',
 true, '2026-05-15', 'TomorrowLabs primary US base. Portland metro.'),

-- Sub-state regions
('33333333-0000-0000-0000-000000000020', 'Portland Metro Area', 'Portland Metro Area', 'metro-area',
 '5746545', null, 'US', null, 45.52, -122.68,
 'autonomous-region', 'internationally-recognized', 'oceanic', 'America/Los_Angeles',
 true, '2026-05-15', 'TomorrowLabs HQ region. Significant Vietnamese, Russian, Latino diaspora.'),

('33333333-0000-0000-0000-000000000021', 'Long Beach Metro', 'Long Beach Metro', 'metro-area',
 '5367929', null, 'US', null, 33.77, -118.19,
 'autonomous-region', 'internationally-recognized', 'mediterranean', 'America/Los_Angeles',
 true, '2026-05-15', 'Largest Cambodian-American community outside Cambodia. Critical for Babagigi Wave 4 mission work.');

-- Set parent relationships
UPDATE places SET parent_place_id = '33333333-0000-0000-0000-000000000001'
  WHERE id IN ('33333333-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000011');

UPDATE places SET parent_place_id = '33333333-0000-0000-0000-000000000010'
  WHERE id = '33333333-0000-0000-0000-000000000021';

UPDATE places SET parent_place_id = '33333333-0000-0000-0000-000000000011'
  WHERE id = '33333333-0000-0000-0000-000000000020';


-- Seed organizations: TomorrowLabs's active partnership ecosystem
INSERT INTO organizations (id, legal_name, display_name, organization_type, incorporation_status, funder_category,
                          headquarters_place_id, mission_statement, focus_areas, geographic_scope,
                          founding_year, founding_story, primary_url, notes) VALUES

-- TomorrowLabs itself (we should be in our own database)
('44444444-0000-0000-0000-000000000001', 'TomorrowLabs', 'TomorrowLabs', 'for-profit-aligned', 'incorporated-for-profit', 'not-a-funder',
 '33333333-0000-0000-0000-000000000020',
 'Building language preservation infrastructure that bridges commercial product success and humanitarian impact.',
 ARRAY['language-preservation', 'education-technology', 'heritage-storytelling', 'indigenous-data-sovereignty'],
 'global', 2023, 
 'Founded following a tuk-tuk driver encounter in Cambodia approximately 3 years ago that surfaced the need for community-rooted educational technology.',
 'https://tomorrowlabs.org',
 'Two-entity model planned: for-profit commercial arm + international nonprofit arm in formation.'),

-- Active field partners
('44444444-0000-0000-0000-000000000002', 'Golden Leaf Foundation', 'Golden Leaf Foundation', 'community-organization', 'incorporated-nonprofit', 'not-a-funder',
 '33333333-0000-0000-0000-000000000002',
 'Education access and community development in Cambodia.',
 ARRAY['education', 'community-development', 'rural-cambodia'],
 'national', null,
 'TomorrowLabs origin partnership. The relationship that began the mission.',
 null,
 'Active partner. Cambodia field work foundation.'),

('44444444-0000-0000-0000-000000000003', 'California Rotary', 'California Rotary', 'community-organization', 'incorporated-nonprofit', 'not-a-funder',
 '33333333-0000-0000-0000-000000000010',
 'Service organization with international development programs.',
 ARRAY['community-development', 'international-service', 'guatemala-projects'],
 'regional', null,
 null, null,
 'Active partner for K''iche'' and Kaqchikel community work in Guatemala highlands.'),

('44444444-0000-0000-0000-000000000004', 'N50 Project', 'N50', 'community-organization', 'incorporated-nonprofit', 'not-a-funder',
 '33333333-0000-0000-0000-000000000004',
 'Indigenous language and cultural preservation work in Mexico.',
 ARRAY['indigenous-language-preservation', 'mexico-city', 'cultural-heritage'],
 'national', null,
 null, null,
 'Active partner. Mexico City base. Nahuatl and Mixtec connection.'),

-- Reference/peer organizations
('44444444-0000-0000-0000-000000000010', 'Mozilla Foundation', 'Mozilla Foundation', 'foundation', 'incorporated-nonprofit', 'private-foundation',
 null,
 'Working to ensure the internet remains a global public resource, open and accessible to all.',
 ARRAY['internet-health', 'language-data', 'open-source', 'common-voice'],
 'global', 2003,
 null,
 'https://foundation.mozilla.org',
 'Operates Common Voice, the largest open-source language dataset effort. Potential strategic partnership for TomorrowLabs.'),

('44444444-0000-0000-0000-000000000011', 'University of Hawaiʻi at Mānoa - Department of Linguistics', 'UHM Linguistics', 'academic-institution', 'incorporated-nonprofit', 'not-a-funder',
 null,
 'Linguistic research and language documentation, with focus on endangered Pacific languages.',
 ARRAY['endangered-languages', 'pacific-linguistics', 'elcat', 'language-documentation'],
 'global', null,
 null,
 'https://manoa.hawaii.edu/linguistics/',
 'Maintains ELCat (Catalogue of Endangered Languages) and Endangered Languages Project. Reference partner for academic credibility.'),

('44444444-0000-0000-0000-000000000012', 'First Peoples'' Cultural Council', 'FPCC', 'community-organization', 'incorporated-nonprofit', 'not-a-funder',
 null,
 'Supporting the revitalization of First Nations languages, arts, and cultures in British Columbia.',
 ARRAY['first-nations-languages', 'indigenous-rights', 'language-revitalization', 'british-columbia'],
 'regional', 1990,
 null,
 'https://fpcc.ca',
 'Co-leads Endangered Languages Project. Model for indigenous-led language work. Reference partner.'),

-- Potential funders
('44444444-0000-0000-0000-000000000020', 'Henry Luce Foundation', 'Luce Foundation', 'foundation', 'incorporated-nonprofit', 'private-foundation',
 null,
 'Encouraging the highest standards of scholarship and innovation in the humanities, especially Asia, religion, theology, public policy.',
 ARRAY['asian-studies', 'humanities', 'religion', 'theology'],
 'global', 1936,
 null,
 'https://www.hluce.org',
 'Funded the Catalogue of Endangered Languages. Strong potential funder for TomorrowLabs Asia work.'),

('44444444-0000-0000-0000-000000000021', 'National Science Foundation - Documenting Endangered Languages', 'NSF DEL', 'government-agency', 'incorporated-nonprofit', 'government-grant',
 null,
 'US government program supporting endangered language documentation.',
 ARRAY['endangered-language-documentation', 'linguistic-research'],
 'national', null,
 null,
 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=12816',
 'Major US grant program for language documentation. Joint program with NEH.');


-- Establish relationship records for active partners
INSERT INTO organization_relationships (organization_id, assessment_date, relationship_status, trust_level,
                                        tomorrowlabs_relationship_owner, reciprocity_assessment,
                                        active_projects_count, last_meaningful_contact, notes) VALUES

('44444444-0000-0000-0000-000000000002', '2026-05-15', 'active-partner', 'deeply-trusted',
 'Weston', 'highly-reciprocal',
 1, '2026-04-15',
 'Origin partnership. Strong mutual commitment. Cambodia field deployment infrastructure being built together.'),

('44444444-0000-0000-0000-000000000003', '2026-05-15', 'active-partner', 'trusted',
 'Weston', 'balanced',
 1, '2026-03-20',
 'Active partner for Guatemala highland K''iche'' and Kaqchikel community work.'),

('44444444-0000-0000-0000-000000000004', '2026-05-15', 'active-partner', 'trusted',
 'Weston', 'balanced',
 1, '2026-04-02',
 'Mexico City partnership. Nahuatl and Mixtec indigenous language preservation context.'),

('44444444-0000-0000-0000-000000000010', '2026-05-15', 'exploratory-conversation', 'developing',
 'Weston', 'highly-reciprocal',
 0, null,
 'Strategic partnership opportunity around Common Voice contributions. Conversations not yet initiated formally.'),

('44444444-0000-0000-0000-000000000020', '2026-05-15', 'prospect-not-contacted', 'unknown',
 'Weston', null,
 0, null,
 'Identified as strong potential funder for TomorrowLabs Asia work. No outreach yet.');


-- =====================================================================
-- PART 9: USEFUL VIEWS
-- =====================================================================

-- Where does TomorrowLabs work? Active partnerships geographically
CREATE OR REPLACE VIEW active_partnership_geography AS
SELECT 
  o.legal_name AS partner,
  o.organization_type,
  p.english_name AS partner_country,
  p_hq.english_name AS partner_hq,
  rel.relationship_status,
  rel.trust_level,
  rel.tomorrowlabs_relationship_owner,
  rel.last_meaningful_contact,
  rel.next_planned_contact
FROM organizations o
LEFT JOIN places p_hq ON p_hq.id = o.headquarters_place_id
LEFT JOIN places p ON p.id = p_hq.parent_place_id OR p.id = p_hq.id
LEFT JOIN LATERAL (
  SELECT * FROM organization_relationships r 
  WHERE r.organization_id = o.id 
  ORDER BY r.assessment_date DESC LIMIT 1
) rel ON true
WHERE rel.relationship_status IN ('active-partner', 'active-vendor', 'active-funder');

-- Communities by language and place (joins three core entities)
CREATE OR REPLACE VIEW community_summary AS
SELECT 
  c.english_name AS community,
  c.community_type,
  ARRAY(
    SELECT l.english_name 
    FROM languages l 
    WHERE l.id = ANY(c.primary_language_ids)
  ) AS languages,
  ARRAY(
    SELECT p.english_name 
    FROM places p 
    WHERE p.id = ANY(c.primary_place_ids)
  ) AS places,
  origin.english_name AS origin_place,
  c.estimated_global_population,
  c.estimated_population_confidence
FROM communities c
LEFT JOIN places origin ON origin.id = c.origin_place_id;

-- Funder pipeline: who could fund what
CREATE OR REPLACE VIEW funder_pipeline AS
SELECT 
  o.legal_name AS funder,
  o.funder_category,
  fp.annual_grantmaking_usd,
  fp.typical_grant_size_usd,
  fp.grant_focus_areas,
  rel.relationship_status,
  rel.last_meaningful_contact,
  CASE 
    WHEN rel.relationship_status = 'active-funder' THEN 'current'
    WHEN rel.relationship_status = 'exploratory-conversation' THEN 'in-pipeline'
    WHEN rel.relationship_status = 'prospect-not-contacted' THEN 'identified'
    ELSE 'other'
  END AS pipeline_stage
FROM organizations o
LEFT JOIN LATERAL (
  SELECT * FROM organization_financial_profile fp 
  WHERE fp.organization_id = o.id 
  ORDER BY fp.assessment_date DESC LIMIT 1
) fp ON true
LEFT JOIN LATERAL (
  SELECT * FROM organization_relationships r 
  WHERE r.organization_id = o.id 
  ORDER BY r.assessment_date DESC LIMIT 1
) rel ON true
WHERE o.funder_category != 'not-a-funder'
ORDER BY 
  CASE rel.relationship_status
    WHEN 'active-funder' THEN 1
    WHEN 'exploratory-conversation' THEN 2
    WHEN 'prospect-not-contacted' THEN 3
    ELSE 4
  END;

-- Cross-entity query: where can we deploy Babagigi based on existing language + partner presence?
CREATE OR REPLACE VIEW deployment_readiness_assessment AS
SELECT 
  l.english_name AS language,
  p.english_name AS place,
  o.legal_name AS partner,
  rel.trust_level,
  rel.relationship_status,
  ps.wave AS babagigi_wave
FROM languages l
INNER JOIN field_partnerships fp ON fp.language_id = l.id
INNER JOIN organizations o ON o.legal_name = fp.partner_organization
LEFT JOIN organization_relationships rel ON rel.organization_id = o.id
LEFT JOIN places p ON p.id = o.headquarters_place_id
LEFT JOIN product_status ps ON ps.language_id = l.id AND ps.product = 'babagigi'
WHERE fp.partner_status = 'active'
ORDER BY 
  CASE rel.trust_level
    WHEN 'deeply-trusted' THEN 1
    WHEN 'trusted' THEN 2
    WHEN 'developing' THEN 3
    ELSE 4
  END;

-- =====================================================================
-- END MIGRATION 003
-- =====================================================================
