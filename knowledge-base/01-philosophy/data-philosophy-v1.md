# Data Philosophy v1

**Source artifact:** `../08-artifacts-archive/tomorrowlabs-data-philosophy.html`
**Status:** Provisional pending community co-authorship
**Last updated:** May 2026

---

## The premise

Languages are living infrastructure. So is the data about them.

Languages are not abstractions — they are the way grandparents tell grandchildren who they are. To preserve a language is to preserve the possibility of those moments. To document a language is to record evidence of them. TomorrowLabs holds both responsibilities.

## The seven beliefs

### 01. Languages exist in hierarchies, not lists
A flat catalog flattens reality. Mandarin and Cantonese are not the same kind of thing as their shared label "Chinese." Mixtec is not one language. The schema models languages at the granularity that matters — macrolanguage, language, variety, dialect.

### 02. Confidence is a first-class data type
Every fact carries an explicit confidence level: high, medium, low, or estimated. A row marked "estimated" is more honest — and more useful — than no row at all. Hidden gaps are how research-grade data becomes vapor.

### 03. Every fact resolves to a source
No unsourced data. Every claim carries its citation, and the citation carries its reliability rating. If a fact cannot be defended in a footnote, it is treated as a question, not an answer.

### 04. Glottolog as tool, not truth
Academic linguistics provides a structural backbone for interoperability. When community classifications differ from academic ones, the schema records both, and the schema does not flatten the disagreement. Communities have the right to define what their language is.

### 05. Time-series tells the truth that snapshots cannot
A single speaker count is a number. Five speaker counts over a decade is a story. Time-series is structural from day one because trajectory matters at least as much as current state.

### 06. The archive outlasts the organization
TomorrowLabs as a corporate entity may not exist in fifty years. The corpus it builds could. Identifier systems, license structures, and data formats are chosen with that horizon in mind. The standard is *findable and usable by a grandchild in 2080*.

### 07. Community-contributed data belongs to the community
The platform thesis — communities generate data that improves models that improves products — only works if benefit-sharing is structural, not aspirational. The schema encodes this, not just the contracts.

## The hard part

Anchoring TomorrowLabs to academic structural linguistics — Glottolog, EGIDS, UNESCO frameworks — is not neutral. These traditions have histories. They reflect particular intellectual lineages, mostly European in origin, that have not always served the communities whose languages they classify.

The choice is made with eyes open. The alternative — building a custom ontology — would be worse and more presumptuous. The other alternative — refusing to commit at all — would make the work uninteroperable. So the choice is the imperfect tool, with community override mechanisms built in.

## Five operational commitments

1. Every new language carries a Glottocode, validated before appearing in any product
2. Decision log maintained for every significant classification or roadmap choice
3. Publish under open licenses (CC-BY for documentation, CC0 where communities consent)
4. Field deployments contribute back to Common Voice and community-owned infrastructure
5. Review the philosophy annually

## The closing commitment

This is multi-generational work. The data organized now shapes what is preservable later. The classification decisions made today affect what a grandchild in 2080 will be able to find of their grandmother's voice.

That weight is not a burden. It is the reason the work is worth doing carefully.

---

**See also:**
- `pressure-test.md` — the adversarial critique of this philosophy
- `../02-architecture/` — how the philosophy becomes structural
- `../07-honest-gaps/` — where the philosophy's promises remain unfulfilled
