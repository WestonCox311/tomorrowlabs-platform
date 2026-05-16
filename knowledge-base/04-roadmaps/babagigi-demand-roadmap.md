# Babagigi Demand-First Roadmap

**Source artifact:** `../08-artifacts-archive/babagigi-demand-roadmap.jsx`
**Status:** Current canonical roadmap for Babagigi language expansion
**Last updated:** May 2026

---

## Two parallel tracks

### Commercial Track (20 languages across 3 waves)
Demand-driven. Funded by Babagigi revenue. Wave timing tied to:
- US heritage speaker counts
- Age 60+ percentage of speakers (grandparent demographic)
- Tech readiness (STT, TTS, font rendering)
- Commercial viability of the segment

### Mission Track (6 languages, ongoing)
Cross-subsidized. Funded by grants + commercial track surplus. Selection tied to:
- Endangerment urgency
- Field partnership presence
- Community readiness for digital intervention
- Generational transmission risk

## Wave assignments

### Wave 1 — Launch (Q2 2027 target)
**Commercial:** Spanish, Mandarin, Tagalog, Vietnamese, Korean, Arabic, French, Portuguese

Tagalog elevated to Wave 1 because 33% of US Tagalog speakers are 60+ — the strongest grandparent demographic in the dataset. Spanish, Mandarin, Vietnamese, Korean, Arabic are obvious by size. French and Portuguese round out the Romance/European set with strong diaspora communities.

### Wave 2 — Fast Follow (post-launch)
**Commercial:** Cantonese, Russian, Polish, Italian, Hindi

Cantonese separated from Mandarin — distinct communities, distinct demographics, aging out faster. Russian and Polish for Eastern European diaspora. Italian for older Italian-American grandparent demographic. Hindi for the large South Asian diaspora.

### Wave 3 — Depth
**Commercial:** German, Japanese, Greek, Hebrew, Punjabi, Urdu, Gujarati

European heritage languages moved here despite high speaker counts because transmission is past peak — the grandparent generation is already largely gone. Japanese for the smaller but distinct Japanese-American community. Greek and Hebrew for diaspora cultural transmission contexts. Punjabi, Urdu, Gujarati for the deeper South Asian portfolio.

### Wave 4 — Mission Track
**Mission:** Khmer, K'iche', Lao, Hmong, Nahuatl, Mixtec

These languages had no viable STT in early 2025. Meta's Omnilingual ASR release (November 2025) changed that — all six now have usable speech recognition. Mission-track work continues to require dedicated grant funding because commercial viability is limited, but the technical floor is now in place.

## Strategic implications

**The connection to LDL:** Babagigi diaspora work (US grandparents recording stories) and LDL field work (community deployment in origin countries) share infrastructure but serve different audiences. Both contribute to the same data flywheel.

**The Cambodian story specifically:** Cambodian-American grandparents are bearers of pre-genocide cultural memory. They're in their 70s and 80s now. Their stories, recorded in Babagigi, become foundational corpus material that flows back to Cambodia via Golden Leaf Foundation partnership and LDL deployments.

**The Omnilingual moment:** The November 2025 release was a watershed for mission-track work. Tracked in the database as a sector event in migration 004. The seven languages it newly enabled all have field partnership pathways.

## Wave assignment as a recurring decision

The decision to assign a language to a wave is one of TomorrowLabs's standing decision protocols (`STRAT-BB-WAVE` in migration 006). Reviewed biannually with explicit data inputs:
- Tech readiness changes since last assignment
- Demographic shifts (especially aging-out pressure)
- Partnership readiness
- Cross-subsidization economics

## What's NOT in the roadmap

- Specific UI/UX adaptations per language
- Per-language pricing strategy
- Marketing channel mix per audience
- Partner-led language additions outside the planned set

Those decisions get made separately. The roadmap is about which languages, in which sequence, with what cross-subsidization logic.

---

**See also:**
- `../03-schema/migration-006-layer-4-decision-support.sql` — the STRAT-BB-WAVE protocol
- `../06-reference/language-data-reference-library.md` — sources for demand and tech data
- `../05-decisions/decision-log.md` — specific wave assignment decisions
