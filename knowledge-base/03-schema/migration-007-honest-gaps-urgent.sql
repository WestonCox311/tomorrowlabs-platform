-- =====================================================================
-- Migration 007: Honest Gaps — Urgent Privacy & Access Infrastructure
--
-- Builds three of the eight tables tagged "honest-gap" in the
-- architectural omissions document:
--   - people (with privacy-respecting design)
--   - access_control_policies (structural rather than policy-only)
--   - consent_audit_chain (immutable record of consent checks)
--
-- The other five honest-gap items are deferred:
--   - climate_observations          → Layer 2, scope decision
--   - conflict_and_political_events → Layer 2, scope decision
--   - community_internal_dynamics   → requires community co-authorship
--   - community_co_governance       → requires community co-authorship
--   - community_facing_dashboards   → requires community co-authorship
--
-- The deferred items will be built when conditions allow community
-- co-design, not before.
--
-- Design discipline for this migration:
--   - Minimum-necessary is the default. Optional fields stay optional.
--   - Sensitive fields are explicitly tagged in column comments.
--   - Deletion is a real operation. Soft-deletion still removes PII.
--   - Audit chains are append-only with sequence ordering.
--   - The schema makes doing the wrong thing structurally harder.
-- =====================================================================

-- =====================================================================
-- PART 1: ENUMS
-- =====================================================================

CREATE TYPE person_record_status AS ENUM (
  'active',                   -- Live record, currently relevant
  'inactive',                 -- No longer engaged but record retained for history
  'consent-restricted',       -- Subject has restricted certain uses
  'deletion-requested',       -- Subject has requested deletion, pending execution
  'deleted',                  -- PII removed; minimum stub retained for referential integrity
  'minor-protected'           -- Subject is a minor; additional protections apply
);

CREATE TYPE pii_sensitivity AS ENUM (
  'public',                   -- Information the person has made public themselves
  'professional',             -- Standard professional information (work email, role)
  'personal',                 -- Personal but not particularly sensitive (preferred name, pronouns)
  'sensitive',                -- Sensitive personal data (home address, personal phone)
  'highly-sensitive',         -- Health, financial, immigration, sexual orientation, religion
  'minor-protected'           -- Any data about minors gets this classification
);

CREATE TYPE access_principle AS ENUM (
  'public-read',              -- Anyone authenticated can read
  'team-read',                -- TomorrowLabs team members only
  'leadership-read',          -- Leadership team only
  'role-restricted',          -- Specific roles only
  'owner-only',               -- Only the record owner and explicit admins
  'subject-only',             -- The data subject themselves (for self-service access)
  'no-direct-access',         -- Only accessible via specific application paths
  'community-controlled'      -- Access governed by community partner agreement
);

CREATE TYPE access_action AS ENUM (
  'read',                     -- Reading data
  'list',                     -- Appearing in lists/searches
  'aggregate',                -- Included in aggregations/counts
  'export',                   -- Exporting to file or external system
  'modify',                   -- Changing the data
  'delete',                   -- Removing the data
  'share-external',           -- Sharing outside TomorrowLabs
  'use-in-research',          -- Using in research outputs
  'use-in-marketing'          -- Using in marketing materials
);

CREATE TYPE consent_check_result AS ENUM (
  'consent-granted',          -- Active consent found and matched the operation
  'consent-conditional',      -- Consent granted with conditions; operation evaluated against them
  'consent-denied',           -- Active consent specifically denied this operation
  'consent-not-found',        -- No consent record exists for this scope
  'consent-expired',          -- Consent existed but has expired
  'consent-revoked',          -- Consent was granted then revoked
  'consent-pending',          -- Consent decision is pending
  'consent-not-required',     -- Operation doesn't require consent (e.g., aggregated anonymous data)
  'consent-bypassed-emergency' -- Emergency override (very rare, heavily audited)
);

CREATE TYPE deletion_basis AS ENUM (
  'subject-request',          -- Person asked for deletion (GDPR Article 17)
  'consent-withdrawal',       -- Person revoked consent
  'retention-policy',         -- Automatic per retention rules
  'data-minimization',        -- Cleanup of unnecessary data
  'legal-compliance',         -- Required by law or court order
  'data-breach-response',     -- Response to security incident
  'organization-decision'     -- TomorrowLabs decided to remove
);

-- =====================================================================
-- PART 2: PEOPLE TABLE
-- =====================================================================
-- Canonical record for individuals. Minimum-necessary by default.
-- Highly sensitive fields are flagged structurally.

CREATE TABLE people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Status (controls what queries can return)
  record_status person_record_status NOT NULL DEFAULT 'active',
  
  -- Public-safe identifier (used when displaying the person without exposing PII)
  display_name text,                    -- "Jane D." style by default, not full name
  pronouns text,
  
  -- Identifying information (sensitive by default)
  legal_first_name text,                -- HIGHLY-SENSITIVE
  legal_last_name text,                 -- HIGHLY-SENSITIVE
  preferred_name text,                  -- PERSONAL
  endonym_name text,                    -- Name in their own language/script
  endonym_language_id uuid REFERENCES languages(id),
  
  -- Demographic context (optional, sensitive)
  birth_year integer,                   -- PERSONAL — year only, not full DOB
  is_minor boolean DEFAULT false,       -- Triggers minor-protection rules
  
  -- Contact (separated by sensitivity)
  professional_email text,              -- PROFESSIONAL
  personal_email_hash text,             -- HIGHLY-SENSITIVE — hashed only
  professional_phone text,              -- PROFESSIONAL
  personal_phone_hash text,             -- HIGHLY-SENSITIVE — hashed only
  
  -- Affiliations (links to existing organizational structure)
  primary_organization_id uuid REFERENCES organizations(id),
  primary_community_id uuid REFERENCES communities(id),
  primary_place_id uuid REFERENCES places(id),
  
  -- Languages
  spoken_language_ids uuid[],
  preferred_communication_language_id uuid REFERENCES languages(id),
  
  -- Role context (what is this person to TomorrowLabs?)
  relationship_types text[],            -- ['partner-contact', 'community-leader', 'researcher', 'team-member', 'advisor', 'donor']
  
  -- Self-determination
  self_described_identity text,         -- How the person describes themselves; their words
  
  -- Consent linkage
  primary_consent_id uuid,              -- Forward reference to consent_records
  
  -- Notes (handled carefully)
  internal_notes text,                  -- TEAM-READ only by default
  
  -- Provenance
  record_created_by text NOT NULL,
  record_created_at timestamptz DEFAULT now(),
  record_last_modified_by text,
  record_last_modified_at timestamptz DEFAULT now(),
  
  -- Deletion tracking
  deletion_requested_at timestamptz,
  deletion_requested_by text,           -- Subject name or 'subject-direct-request'
  deletion_executed_at timestamptz,
  deletion_basis deletion_basis,
  deletion_notes text                   -- Why, with what consultation
);

-- Indexes — note that we deliberately do NOT index by name fields to discourage casual lookups
CREATE INDEX idx_people_status ON people(record_status);
CREATE INDEX idx_people_org ON people(primary_organization_id);
CREATE INDEX idx_people_community ON people(primary_community_id);
CREATE INDEX idx_people_minor ON people(is_minor) WHERE is_minor = true;
CREATE INDEX idx_people_pending_deletion ON people(deletion_requested_at) WHERE deletion_requested_at IS NOT NULL AND deletion_executed_at IS NULL;

-- Column comments documenting sensitivity classifications
COMMENT ON COLUMN people.legal_first_name IS 'HIGHLY-SENSITIVE: Legal name. Access restricted to leadership-read by default.';
COMMENT ON COLUMN people.legal_last_name IS 'HIGHLY-SENSITIVE: Legal name. Access restricted to leadership-read by default.';
COMMENT ON COLUMN people.personal_email_hash IS 'HIGHLY-SENSITIVE: Hashed only — never store raw personal email. Used only for matching, never for outreach.';
COMMENT ON COLUMN people.personal_phone_hash IS 'HIGHLY-SENSITIVE: Hashed only. Same rules as personal_email_hash.';
COMMENT ON COLUMN people.birth_year IS 'PERSONAL: Year only — never collect full date of birth unless legally required.';
COMMENT ON COLUMN people.is_minor IS 'When true, all data is reclassified as minor-protected and additional access restrictions apply.';

COMMENT ON TABLE people IS
  'Canonical record for individuals. Minimum-necessary by default. Sensitive fields are flagged structurally and access-controlled via access_control_policies. Deletion is a real operation that removes PII while preserving referential integrity via stub records.';

-- Now add the forward reference for consent_records → people
-- (This was deferred from migration 005 because consent_records existed before people)
-- Note: subject_user_id already references users; we add subject_person_id as separate
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS subject_person_id uuid REFERENCES people(id);
ALTER TABLE consent_records ADD CONSTRAINT consent_subject_check 
  CHECK (
    (subject_type = 'individual' AND (subject_person_id IS NOT NULL OR subject_user_id IS NOT NULL)) OR
    (subject_type IN ('household', 'community', 'organization'))
  );

-- Add forward reference for people.primary_consent_id
ALTER TABLE people ADD CONSTRAINT fk_people_consent 
  FOREIGN KEY (primary_consent_id) REFERENCES consent_records(id);

-- =====================================================================
-- PART 3: PERSON ROLES (longitudinal — roles change over time)
-- =====================================================================
-- A person can be many things over time and to many different parts
-- of TomorrowLabs's work. This table captures that without forcing
-- the people table to hold time-varying state.

CREATE TABLE person_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  
  -- Role context
  role_type text NOT NULL,              -- 'partner-contact', 'community-leader', 'team-member', etc.
  role_title text,                      -- Specific title in that context
  
  -- Where this role applies
  organization_id uuid REFERENCES organizations(id),
  community_id uuid REFERENCES communities(id),
  program_id uuid REFERENCES programs(id),
  
  -- Timeline
  role_started date,
  role_ended date,                      -- Null if still active
  is_primary boolean DEFAULT false,     -- Is this their primary identification?
  
  -- Authority
  speaks_on_behalf_of text[],           -- What entities they can authoritatively represent
  decision_authority_notes text,        -- What they can decide unilaterally
  
  -- TomorrowLabs context
  internal_relationship_owner text,     -- Who at TL owns this relationship
  
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_person_roles_person ON person_roles(person_id);
CREATE INDEX idx_person_roles_org ON person_roles(organization_id);
CREATE INDEX idx_person_roles_active ON person_roles(role_ended) WHERE role_ended IS NULL;

-- =====================================================================
-- PART 4: ACCESS CONTROL POLICIES
-- =====================================================================
-- Structural rather than policy-only. Each policy is a queryable rule
-- that the application layer must check before access.

CREATE TABLE access_control_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What this policy applies to
  policy_name text NOT NULL,
  policy_code text UNIQUE NOT NULL,     -- Stable identifier referenced by application code
  
  -- Scope: what table/data this governs
  governs_table text NOT NULL,          -- The table whose access this controls
  governs_columns text[],               -- Specific columns; null = whole row
  applies_to_sensitivity pii_sensitivity[],  -- Which sensitivity levels this covers
  
  -- Who can do what
  access_principle access_principle NOT NULL,
  permitted_actions access_action[] NOT NULL,
  permitted_roles text[],               -- Specific roles that can perform these actions
  permitted_user_ids uuid[],            -- Specific users (rare; prefer roles)
  
  -- Conditions
  requires_consent_check boolean DEFAULT false,
  consent_scope_required text,          -- What consent scope must be present
  requires_purpose_specification boolean DEFAULT false,  -- Caller must declare why
  permitted_purposes text[],            -- If specified, only these purposes allowed
  
  -- Aggregation rules (some queries are dangerous even if individual access is permitted)
  permits_aggregation boolean DEFAULT true,
  min_aggregation_size integer,         -- Minimum group size for aggregate queries
  permits_export boolean DEFAULT false,
  permits_cross_join_with text[],       -- Other tables this can be joined with safely
  prohibits_cross_join_with text[],     -- Tables this should NEVER be joined with
  
  -- Audit
  requires_audit_log boolean DEFAULT false,
  audit_log_table text,                 -- Where access events should be logged
  
  -- Geographic restrictions
  geographic_restrictions text[],       -- Some data can only be accessed from certain places
  
  -- Time restrictions
  applies_during_hours text,            -- Some data only during business hours
  
  -- Lifecycle
  is_active boolean DEFAULT true,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_until date,
  
  -- Governance
  policy_owner text NOT NULL,
  approved_by text,
  approved_at timestamptz,
  
  -- Documentation
  rationale text NOT NULL,              -- WHY this policy exists
  related_legal_basis text,             -- GDPR Article, etc.
  related_community_agreement_id uuid REFERENCES benefit_sharing_agreements(id),
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_acp_table ON access_control_policies(governs_table);
CREATE INDEX idx_acp_active ON access_control_policies(is_active) WHERE is_active = true;
CREATE INDEX idx_acp_principle ON access_control_policies(access_principle);

COMMENT ON TABLE access_control_policies IS
  'Structural access control. Application code must check policies here before performing access actions. Policies are queryable so the system can answer "where is sensitive data X accessible?" and "what does role Y have permission for?" The schema makes access control auditable.';

-- =====================================================================
-- PART 5: ACCESS LOG (every meaningful access logged)
-- =====================================================================
-- For tables flagged as requires_audit_log, every access is recorded.

CREATE TABLE access_log (
  id bigserial PRIMARY KEY,
  
  -- When and who
  accessed_at timestamptz NOT NULL DEFAULT now(),
  accessor_user_id uuid REFERENCES users(id),
  accessor_team_member_id uuid REFERENCES team_members(id),
  accessor_role text,
  accessor_ip_address text,             -- For incident investigation
  
  -- What was accessed
  table_accessed text NOT NULL,
  row_id_accessed uuid,                 -- Specific row, if applicable
  columns_accessed text[],
  action_performed access_action NOT NULL,
  
  -- Why
  stated_purpose text,                  -- What the accessor declared as the reason
  related_program_id uuid REFERENCES programs(id),
  related_protocol_id uuid REFERENCES decision_protocols(id),
  
  -- Policy reference
  policy_id_applied uuid REFERENCES access_control_policies(id),
  
  -- Result
  access_was_granted boolean NOT NULL,
  denial_reason text,                   -- If access_was_granted = false
  
  -- For aggregations
  was_aggregation_query boolean DEFAULT false,
  aggregation_size integer,             -- How many rows aggregated
  
  -- For exports
  was_export boolean DEFAULT false,
  export_destination text,              -- Where data went
  export_record_count integer
);

-- This table will get large. Time-based partitioning recommended in production.
CREATE INDEX idx_access_log_time ON access_log(accessed_at DESC);
CREATE INDEX idx_access_log_user ON access_log(accessor_user_id, accessed_at DESC);
CREATE INDEX idx_access_log_table ON access_log(table_accessed, accessed_at DESC);
CREATE INDEX idx_access_log_export ON access_log(was_export, accessed_at DESC) WHERE was_export = true;

COMMENT ON TABLE access_log IS
  'Append-only log of access events for sensitive tables. Used for security investigation, compliance reporting, and detecting anomalous patterns. Should be partitioned by time in production. Never UPDATEd or DELETEd.';

-- =====================================================================
-- PART 6: CONSENT AUDIT CHAIN
-- =====================================================================
-- Append-only immutable record of every consent check that preceded
-- an operational decision. This is what makes consent commitments
-- enforceable retroactively.

CREATE TABLE consent_audit_chain (
  -- Sequence (the chain's ordering)
  chain_sequence bigserial PRIMARY KEY,
  
  -- When the check happened
  check_performed_at timestamptz NOT NULL DEFAULT now(),
  
  -- What was being attempted
  attempted_operation text NOT NULL,    -- 'send-marketing-email', 'use-in-research', 'publish-recording', etc.
  
  -- Whose consent was being checked
  subject_type text NOT NULL,           -- 'individual', 'household', 'community', 'organization'
  subject_person_id uuid REFERENCES people(id),
  subject_user_id uuid REFERENCES users(id),
  subject_community_id uuid REFERENCES communities(id),
  subject_organization_id uuid REFERENCES organizations(id),
  
  -- What consent was looked for
  required_scope consent_scope NOT NULL,
  required_data_types text[],
  
  -- What was found
  consent_record_id uuid REFERENCES consent_records(id),
  check_result consent_check_result NOT NULL,
  check_result_details text,            -- Specific notes on the result
  
  -- What happened next
  operation_proceeded boolean NOT NULL,
  operation_modified text,              -- If operation was modified instead of denied
  
  -- Who/what initiated the check
  initiated_by_user_id uuid REFERENCES users(id),
  initiated_by_system text,             -- Application/service name
  initiated_in_program_id uuid REFERENCES programs(id),
  
  -- Cryptographic integrity (optional but recommended)
  previous_chain_hash text,             -- Hash of previous entry in chain
  this_entry_hash text,                 -- Hash of this entry's content
  
  -- For emergency bypasses (rare and heavily scrutinized)
  was_emergency_bypass boolean DEFAULT false,
  bypass_authorized_by text,
  bypass_justification text,
  bypass_reviewed_after boolean DEFAULT false,
  bypass_review_outcome text
);

-- Append-only enforcement: no UPDATE or DELETE allowed
CREATE OR REPLACE FUNCTION prevent_consent_chain_modification()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'consent_audit_chain is append-only. Existing entries cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consent_chain_no_update
  BEFORE UPDATE ON consent_audit_chain
  FOR EACH ROW EXECUTE FUNCTION prevent_consent_chain_modification();

CREATE TRIGGER consent_chain_no_delete
  BEFORE DELETE ON consent_audit_chain
  FOR EACH ROW EXECUTE FUNCTION prevent_consent_chain_modification();

CREATE INDEX idx_cac_time ON consent_audit_chain(check_performed_at DESC);
CREATE INDEX idx_cac_subject_person ON consent_audit_chain(subject_person_id);
CREATE INDEX idx_cac_subject_community ON consent_audit_chain(subject_community_id);
CREATE INDEX idx_cac_operation ON consent_audit_chain(attempted_operation, check_performed_at DESC);
CREATE INDEX idx_cac_bypass ON consent_audit_chain(was_emergency_bypass) WHERE was_emergency_bypass = true;
CREATE INDEX idx_cac_denied ON consent_audit_chain(operation_proceeded) WHERE operation_proceeded = false;

COMMENT ON TABLE consent_audit_chain IS
  'Append-only immutable record of every consent check that preceded an operation. Cannot be modified or deleted (enforced by trigger). Provides retroactive enforceability of consent commitments — proves the system actually checked consent before acting. Critical infrastructure for community trust.';

-- =====================================================================
-- PART 7: PERSON DATA DELETION OPERATIONS
-- =====================================================================
-- Deletion of person records is a real operation, not a status change.
-- This function executes proper deletion while preserving referential
-- integrity for analytical purposes.

CREATE OR REPLACE FUNCTION execute_person_deletion(
  p_person_id uuid,
  p_basis deletion_basis,
  p_requested_by text,
  p_notes text
)
RETURNS void AS $$
BEGIN
  -- Verify a deletion was requested
  IF NOT EXISTS (
    SELECT 1 FROM people 
    WHERE id = p_person_id 
      AND deletion_requested_at IS NOT NULL 
      AND deletion_executed_at IS NULL
  ) THEN
    RAISE EXCEPTION 'No pending deletion request found for person %', p_person_id;
  END IF;
  
  -- Replace PII with deletion markers; preserve stub for referential integrity
  UPDATE people SET
    record_status = 'deleted',
    display_name = '[DELETED]',
    legal_first_name = NULL,
    legal_last_name = NULL,
    preferred_name = NULL,
    endonym_name = NULL,
    birth_year = NULL,
    professional_email = NULL,
    personal_email_hash = NULL,
    professional_phone = NULL,
    personal_phone_hash = NULL,
    self_described_identity = NULL,
    internal_notes = NULL,
    deletion_executed_at = now(),
    deletion_basis = p_basis,
    deletion_notes = p_notes,
    record_last_modified_by = p_requested_by,
    record_last_modified_at = now()
  WHERE id = p_person_id;
  
  -- Log the deletion in access_log
  INSERT INTO access_log (
    accessor_role,
    table_accessed,
    row_id_accessed,
    action_performed,
    stated_purpose,
    access_was_granted
  ) VALUES (
    'system-deletion-handler',
    'people',
    p_person_id,
    'delete',
    'Person deletion request: ' || p_basis::text,
    true
  );
  
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION execute_person_deletion IS
  'Executes proper deletion of person record. Removes all PII while preserving the row stub for referential integrity (foreign keys from other tables remain valid). The deletion is logged in access_log and is irreversible.';

-- =====================================================================
-- PART 8: SEED POLICIES
-- =====================================================================
-- Foundational access control policies that need to exist before any
-- person data or sensitive data is touched.

INSERT INTO access_control_policies (
  policy_name, policy_code, governs_table, governs_columns, applies_to_sensitivity,
  access_principle, permitted_actions, permitted_roles,
  requires_consent_check, requires_purpose_specification,
  permits_aggregation, min_aggregation_size, permits_export,
  requires_audit_log, audit_log_table,
  policy_owner, rationale, related_legal_basis
) VALUES

-- People table — highly sensitive PII
('People · Legal Names', 'ACP-PEOPLE-LEGAL-NAMES',
 'people', ARRAY['legal_first_name', 'legal_last_name'],
 ARRAY['highly-sensitive']::pii_sensitivity[],
 'leadership-read', ARRAY['read', 'modify']::access_action[],
 ARRAY['leadership-team', 'data-governance-officer'],
 true, true,
 false, NULL, false,
 true, 'access_log',
 'Weston',
 'Legal names are not needed for most operational work. Most TomorrowLabs activity should use display_name or preferred_name. Access to legal names should require declared purpose and be logged.',
 'GDPR Article 5(1)(c) data minimization; GDPR Article 32 security of processing'),

('People · Contact Information', 'ACP-PEOPLE-CONTACT',
 'people', ARRAY['personal_email_hash', 'personal_phone_hash', 'professional_email', 'professional_phone'],
 ARRAY['professional', 'highly-sensitive']::pii_sensitivity[],
 'role-restricted', ARRAY['read']::access_action[],
 ARRAY['leadership-team', 'partnership-coordinator'],
 false, true,
 false, NULL, false,
 true, 'access_log',
 'Weston',
 'Contact information should be available to people who need to communicate with the person, but not generally accessible. Personal contact info is hashed only and never used directly for outreach.',
 'GDPR Article 5(1)(c) data minimization'),

('People · Minor Records', 'ACP-PEOPLE-MINORS',
 'people', NULL,  -- All columns
 ARRAY['minor-protected']::pii_sensitivity[],
 'owner-only', ARRAY['read', 'modify']::access_action[],
 ARRAY['leadership-team', 'child-protection-officer'],
 true, true,
 false, NULL, false,
 true, 'access_log',
 'Weston',
 'Any data about minors gets maximum protection. Access requires explicit purpose, consent check, audit logging. Aggregation prohibited.',
 'GDPR-K, COPPA, varies by jurisdiction'),

-- Communities — community-controlled access
('Communities · Internal Dynamics Notes', 'ACP-COMMUNITIES-INTERNAL',
 'communities', NULL,
 ARRAY['sensitive']::pii_sensitivity[],
 'community-controlled', ARRAY['read', 'modify']::access_action[],
 ARRAY['leadership-team'],
 false, true,
 false, NULL, false,
 true, 'access_log',
 'Weston',
 'Information about community internal dynamics is sensitive. Access governed by partnership agreements. Communities should be able to see what TomorrowLabs holds about them.',
 'Community partnership agreements; UN Declaration on the Rights of Indigenous Peoples Articles 11-13'),

-- Consent records — operational but audited
('Consent Records · Access', 'ACP-CONSENT-RECORDS',
 'consent_records', NULL,
 ARRAY['highly-sensitive']::pii_sensitivity[],
 'team-read', ARRAY['read', 'modify']::access_action[],
 ARRAY['leadership-team', 'partnership-coordinator', 'researcher'],
 false, true,
 false, NULL, false,
 true, 'access_log',
 'Weston',
 'Consent records must be checked operationally but every check is logged in consent_audit_chain. Modifications require leadership approval.',
 'GDPR Article 7 consent requirements'),

-- Financial flows — sensitive but business-critical
('Financial Flows · Aggregate Access', 'ACP-FINANCE-AGGREGATE',
 'financial_flows', NULL,
 ARRAY['sensitive']::pii_sensitivity[],
 'role-restricted', ARRAY['read', 'aggregate']::access_action[],
 ARRAY['leadership-team', 'finance-administrator'],
 false, false,
 true, 5, true,  -- Aggregations require min 5 rows; export permitted with logging
 true, 'access_log',
 'Weston',
 'Financial details are sensitive but board and audit functions require access. Individual transaction details restricted; aggregates available with minimum group size.',
 'Standard nonprofit financial governance'),

-- Default deny for unspecified tables
('Default · No Implicit Access', 'ACP-DEFAULT-DENY',
 '*', NULL,
 NULL,
 'no-direct-access', ARRAY[]::access_action[],
 ARRAY[]::text[],
 false, false,
 false, NULL, false,
 false, NULL,
 'Weston',
 'No table should have implicit access. New tables require an explicit access control policy. This is a meta-policy enforcing that.',
 'Defense in depth principle');

-- =====================================================================
-- PART 9: STRATEGIC VIEWS
-- =====================================================================

-- Where is sensitive data accessible?
CREATE OR REPLACE VIEW sensitive_data_map AS
SELECT 
  acp.governs_table,
  acp.policy_name,
  acp.applies_to_sensitivity,
  acp.access_principle,
  acp.permitted_roles,
  acp.requires_consent_check,
  acp.requires_audit_log
FROM access_control_policies acp
WHERE acp.is_active = true
  AND ('highly-sensitive' = ANY(acp.applies_to_sensitivity)
       OR 'minor-protected' = ANY(acp.applies_to_sensitivity)
       OR 'sensitive' = ANY(acp.applies_to_sensitivity))
ORDER BY 
  CASE 
    WHEN 'minor-protected' = ANY(acp.applies_to_sensitivity) THEN 1
    WHEN 'highly-sensitive' = ANY(acp.applies_to_sensitivity) THEN 2
    WHEN 'sensitive' = ANY(acp.applies_to_sensitivity) THEN 3
    ELSE 4
  END,
  acp.governs_table;

-- Recent access patterns (security monitoring)
CREATE OR REPLACE VIEW access_patterns_recent AS
SELECT 
  table_accessed,
  action_performed,
  COUNT(*) AS access_count,
  COUNT(*) FILTER (WHERE access_was_granted = false) AS denied_count,
  COUNT(*) FILTER (WHERE was_export = true) AS export_count,
  COUNT(DISTINCT accessor_user_id) AS unique_accessors,
  MAX(accessed_at) AS most_recent_access
FROM access_log
WHERE accessed_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY table_accessed, action_performed
ORDER BY access_count DESC;

-- Pending consent reviews
CREATE OR REPLACE VIEW consent_state_overview AS
SELECT 
  status,
  scope,
  COUNT(*) AS record_count,
  COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at < CURRENT_DATE + INTERVAL '60 days') AS expiring_soon,
  COUNT(*) FILTER (WHERE next_review_due IS NOT NULL AND next_review_due < CURRENT_DATE + INTERVAL '30 days') AS review_due_soon,
  COUNT(*) FILTER (WHERE revoked_at IS NOT NULL) AS revoked_records
FROM consent_records
GROUP BY status, scope
ORDER BY 
  CASE status
    WHEN 'revoked' THEN 1
    WHEN 'pending-renewal' THEN 2
    WHEN 'pending-decision' THEN 3
    WHEN 'granted-with-conditions' THEN 4
    WHEN 'granted' THEN 5
    ELSE 6
  END;

-- Consent audit chain integrity check
CREATE OR REPLACE VIEW consent_audit_chain_integrity AS
SELECT 
  DATE_TRUNC('month', check_performed_at) AS month,
  COUNT(*) AS total_checks,
  COUNT(*) FILTER (WHERE operation_proceeded = false) AS denied_operations,
  COUNT(*) FILTER (WHERE check_result = 'consent-not-found') AS missing_consent_attempts,
  COUNT(*) FILTER (WHERE was_emergency_bypass = true) AS emergency_bypasses,
  COUNT(*) FILTER (WHERE was_emergency_bypass = true AND bypass_reviewed_after = false) AS bypasses_not_yet_reviewed
FROM consent_audit_chain
WHERE check_performed_at > CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', check_performed_at)
ORDER BY month DESC;

-- Pending person deletions
CREATE OR REPLACE VIEW pending_person_deletions AS
SELECT 
  p.id AS person_id,
  p.display_name,
  p.deletion_requested_at,
  p.deletion_requested_by,
  (CURRENT_DATE - p.deletion_requested_at::date) AS days_pending,
  (SELECT COUNT(*) FROM person_roles pr WHERE pr.person_id = p.id) AS related_roles,
  CASE 
    WHEN (CURRENT_DATE - p.deletion_requested_at::date) > 30 THEN 'overdue-critical'
    WHEN (CURRENT_DATE - p.deletion_requested_at::date) > 14 THEN 'overdue'
    WHEN (CURRENT_DATE - p.deletion_requested_at::date) > 7 THEN 'needs-attention'
    ELSE 'within-sla'
  END AS urgency
FROM people p
WHERE p.deletion_requested_at IS NOT NULL 
  AND p.deletion_executed_at IS NULL
ORDER BY p.deletion_requested_at ASC;

-- Where do we still have gaps?
CREATE OR REPLACE VIEW remaining_honest_gaps AS
SELECT 'climate_observations' AS gap_name, 
       'Layer 2' AS architectural_layer,
       'scope-decision' AS reason_deferred,
       'Build when first deployment decision is materially affected by climate considerations' AS resolution_path
UNION ALL SELECT 'conflict_and_political_events', 'Layer 2', 'scope-decision', 
       'Build when first conflict event affects an active partnership or deployment'
UNION ALL SELECT 'community_internal_dynamics', 'Layer 2', 'requires-community-co-authorship', 
       'Co-design with partner communities at the schema level'
UNION ALL SELECT 'community_co_governance_records', 'Layer 3', 'requires-community-co-authorship',
       'Co-design alongside actual co-governance practice with at least one partner community'
UNION ALL SELECT 'community_facing_dashboards', 'Layer 4', 'requires-community-co-authorship',
       'Co-design with partner communities; learn what they actually want to see';

-- =====================================================================
-- PART 10: SEED DATA
-- =====================================================================

-- Seed Weston as the first person record (the team member who's building this)
INSERT INTO people (
  id, display_name, preferred_name, pronouns,
  primary_organization_id,
  primary_place_id,
  relationship_types,
  record_created_by, record_created_at
) VALUES (
  '99999999-0000-0000-0000-000000000001',
  'Weston',
  'Weston',
  null,
  '44444444-0000-0000-0000-000000000001',  -- TomorrowLabs
  '33333333-0000-0000-0000-000000000020',  -- Portland Metro
  ARRAY['team-member', 'founder'],
  'Weston', '2026-05-16 21:00:00+00'
);

-- Seed role
INSERT INTO person_roles (
  person_id, role_type, role_title, organization_id,
  role_started, is_primary,
  internal_relationship_owner
) VALUES (
  '99999999-0000-0000-0000-000000000001',
  'team-member', 'Founder', '44444444-0000-0000-0000-000000000001',
  '2023-01-01', true,
  'self'
);

-- =====================================================================
-- END MIGRATION 007
-- =====================================================================
