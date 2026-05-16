# Cross-Cutting Concerns

The infrastructure that runs through every layer. These aren't features of any single layer — they're the connective tissue that makes the architecture cohere.

---

## The seven cross-cutting concerns

### Sources
**What:** Every fact in the database resolves to a citation.
**Where it lives:** `sources` table, referenced by every observation and claim.
**Why it matters:** Defensibility. When a funder asks "where did that statistic come from?", the answer is one join away.

### Confidence
**What:** Every fact carries an explicit confidence level (high, medium, low, estimated).
**Where it lives:** `confidence_level` enum on every table making claims.
**Why it matters:** Surfaces gaps rather than hiding them. Estimated data is more honest than no data.

### Consent
**What:** Operational decisions check consent_records before acting.
**Where it lives:** `consent_records` table + `consent_audit_chain` (immutable audit trail).
**Why it matters:** Makes the philosophy commitment to community sovereignty enforceable rather than aspirational. The audit chain is append-only, enforced by database triggers.

### Audit log
**What:** Every meaningful access to sensitive data is logged.
**Where it lives:** `access_log` table + decision_log for strategic choices.
**Why it matters:** Retroactive accountability. Lets the organization answer "who saw what, when, and why?"

### Identity resolution
**What:** UUID primary keys with explicit cross-system mapping.
**Where it lives:** Every table uses UUIDs as primary keys. External identifiers (Glottocode, GeoNames ID, etc.) are stored separately.
**Why it matters:** Same real-world entity may appear under different IDs across sources. UUIDs are the canonical internal identifier; external IDs are mappings.

### Privacy
**What:** Sensitivity classifications on PII columns + structural minimum-necessary defaults.
**Where it lives:** Column comments in `people` table + `pii_sensitivity` enum.
**Why it matters:** Makes data classification visible at the schema level. Sensitive columns are tagged so access policies can govern them automatically.

### Access control
**What:** Structural policies, not just developer discipline.
**Where it lives:** `access_control_policies` table — queryable rules that application code checks.
**Why it matters:** Lets the system answer "where is sensitive data X accessible?" and "what does role Y have permission for?" The schema makes access control auditable.

## How they connect to the philosophy

Each cross-cutting concern is the structural expression of a philosophical commitment:

| Concern | Philosophical commitment |
|---------|-------------------------|
| Sources | "Every fact resolves to a source" |
| Confidence | "Confidence is a first-class data type" |
| Consent | "Community-contributed data belongs to the community" |
| Audit log | "Decisions close the loop" |
| Identity resolution | "Glottolog as tool, not truth" (allows multiple identifier systems) |
| Privacy | "Community-contributed data belongs to the community" |
| Access control | The operational expression of all of the above |

## The most important commitment

**Consent infrastructure sits structurally above operational logic.** Layer 3 (operational) can read from consent_records but cannot override it. If Babagigi wants to send a push notification to drive subscription conversion, but the user's consent state says "no marketing communications," the operational logic cannot push through.

This is the architectural commitment that makes the philosophy enforceable. Without it, "we respect consent" would be a policy that erodes under operational pressure.

## What's not yet structural

The architecture supports these patterns. It doesn't enforce them automatically — application code still has to actually use them. Specifically:

- Application code must check `access_control_policies` before granting access
- Application code must write to `consent_audit_chain` before consent-dependent operations
- Application code must populate `sources` and confidence fields when adding data

The schema is ready. The application discipline is the work that follows.

---

**See also:**
- `../03-schema/migration-007-honest-gaps-urgent.sql` — the access control and consent audit chain implementation
- `../01-philosophy/data-philosophy-v1.md` — the commitments these concerns enforce
