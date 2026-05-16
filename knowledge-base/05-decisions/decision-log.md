# Decision Log

Reverse chronological — newest decisions at the top. Don't delete entries; if a decision is reversed, log the reversal as a new entry referencing the original.

---

## 2026-05-16: Build documentation knowledge base as next concrete move

**Context:** Architecture work is fully designed but unused. The gap between "designed" and "used" was creating risk that the work would slowly become inaccessible.

**Options considered:**
- Build documentation site (chosen)
- Run schema in Supabase
- Execute one decision protocol end-to-end
- Polish for external audience
- Help figure out what matters most

**Decision:** Build documentation knowledge base in markdown format, personal scope, functional rather than polished.

**Rationale:** Lowest cost, highest preservation value. Other moves can happen in parallel later. Without organized documentation, the rest of the work degrades into forgotten files.

**Who decided:** Weston

**Revisit when:** When team expands beyond Weston and shared access becomes needed (likely Notion migration at that point).

**Related artifacts:** This entire `/home/claude/tomorrowlabs-docs/` knowledge base.

---

## 2026-05-16: Build three of eight honest-gap tables; defer five

**Context:** The architectural omissions document identified eight tables tagged "honest-gap." Three were urgent operational/legal exposure issues. Five required community co-authorship or were scope decisions.

**Options considered:**
- Build all eight, mark three as drafts pending co-authorship
- Build the five not requiring community input (chosen)
- Build only the most urgent three (chosen alternative)
- Build all eight at full depth

**Decision:** Build only the three urgent items — `people`, `access_control_policies`, `consent_audit_chain`. Defer the rest.

**Rationale:** Building community-dependent infrastructure without community input would replicate exactly the problem the honest-gap tag was meant to flag. The three urgent items address real legal/operational exposure (privacy, access, consent enforceability) without requiring community involvement to design properly.

**Who decided:** Weston

**Revisit when:** Community co-authorship conversations begin (target: within 12 months per pressure-test commitment).

**Related artifacts:** `migration-007-honest-gaps-urgent.sql`, `tomorrowlabs-architectural-omissions.html`

---

## 2026-05-16: Build Layer 4 (decision support) as final architectural layer

**Context:** Three layers built. Layer 4 completes the architecture.

**Decision:** Build Layer 4 with decision protocols, outcomes tracking, AI synthesis audit, strategic views.

**Rationale:** The architecture was incomplete without the decision support layer that turns data into organizational intelligence. Decision protocols (the recurring questions TomorrowLabs needs to ask well) are the architectural unit, not dashboards.

**Who decided:** Weston

**Revisit when:** Never — Layer 4 is intentionally the layer that adapts continuously rather than being "finished."

**Related artifacts:** `migration-006-layer-4-decision-support.sql`

---

## 2026-05-16: Use four-layer model rather than flat schema or microservices

**Context:** When discussing how to architect cross-referenceable databases for languages, places, education, market readiness, etc.

**Options considered:**
- Build multiple separate databases per domain
- Build one flat schema combining everything
- Build a layered architecture distinguishing reference / observational / operational / decision support (chosen)

**Decision:** Four-layer model with cross-cutting infrastructure.

**Rationale:** Three timescales of decision-making (strategic, operational, real-time) demand different data architectures. Conflating them produces mediocre results. The layers distinguish by cadence and epistemic status. Cross-cutting infrastructure (sources, consent, audit) keeps the layers cohering.

**Who decided:** Weston

**Revisit when:** If a fundamentally different decision pattern emerges that doesn't fit the four layers. So far, every additional question has fit cleanly.

**Related artifacts:** `tomorrowlabs-data-architecture.html`, `tomorrowlabs-architecture-map.html`

---

## 2026-05-16: Consent infrastructure sits structurally above operational logic

**Context:** When designing Layer 3 (operational), the question arose of how to ensure operational pressure couldn't override community consent commitments.

**Decision:** Consent infrastructure is cross-cutting, not within any layer. Operational logic (Layer 3) reads from `consent_records` but cannot override it. The schema enforces this — there is no path for Layer 3 to mutate consent state.

**Rationale:** If the architecture doesn't enforce the values, operational pressure will erode them over time. Making consent structurally superior to operational logic is the only way to keep the philosophy commitment.

**Who decided:** Weston

**Revisit when:** Never — this is intended as a permanent architectural commitment.

**Related artifacts:** `migration-005-layer-3-operational.sql` (consent_records), `migration-007-honest-gaps-urgent.sql` (consent_audit_chain)

---

## 2026-05-16: Glottolog as primary linguistic identifier; ISO 639-3 as required secondary; community positions can override

**Context:** When designing the languages table, the question of which external identifier system to anchor to.

**Options considered:**
- ISO 639-3 only (insufficient for varieties and dialects)
- Custom internal IDs (uninteroperable)
- Glottolog only (academic but stable)
- Glottolog primary + ISO 639-3 secondary + community override mechanism (chosen)

**Decision:** Glottocode is the structural backbone. ISO 639-3 required for vendor integration. Community positions stored in `community_positions` table can override academic classifications in TomorrowLabs products.

**Rationale:** Glottolog provides the structural hierarchy that interoperates with academic and research ecosystems. ISO codes are required for working with commercial AI vendors. Community positions are the philosophical commitment from belief #4 ("Glottolog as tool, not truth").

**Who decided:** Weston

**Revisit when:** If a new identifier system emerges with stronger community accountability or better hierarchy modeling.

**Related artifacts:** `migration-000-initial.sql` (languages table)

---

## 2026-05-16: Two-entity model — for-profit + nonprofit arm in formation

**Context:** Organizational structure decision predating this knowledge base work.

**Decision:** TomorrowLabs operates as a for-profit entity with a nonprofit arm being established.

**Rationale:** Commercial product success (Babagigi, etc.) funds research-grade infrastructure and field deployment work. Nonprofit arm in formation will hold community-co-owned assets and seek foundation grants that require 501(c)(3) status.

**Who decided:** Weston

**Revisit when:** Annually as part of structural review.

**Related artifacts:** `tomorrowlabs-data-philosophy.html` (the hybrid model is referenced in pressure-test critique #3)

---

## Earlier decisions

Decisions made before this knowledge base existed are documented in the original conversation history and the artifact files themselves. Key ones include:

- **Babagigi v1 is QR-only** (NFC deferred)
- **Tagalog elevated to Wave 1** (33% speakers 60+)
- **Cantonese separated from Mandarin** in waves
- **Gelato as POD partner** for Babagigi physical books
- **DIY PDF generation pipeline** (avoiding Gelato's Personalization Studio to preserve portability)

These should be retroactively added to this log when there's time, with as much context as can be reconstructed.
