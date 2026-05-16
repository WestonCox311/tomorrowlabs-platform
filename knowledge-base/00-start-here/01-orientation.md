# Orientation — Five-Minute Overview

For when you're coming back to this work after time away, or showing it to someone for the first time.

---

## What TomorrowLabs is

A for-profit entity with a nonprofit arm in formation, building language preservation infrastructure that bridges commercial product success and humanitarian impact. Operating philosophy: capitalist mechanics → post-capitalist intentions.

**Active products:**
- **Babagigi** — bilingual storybook platform where grandparents record stories in heritage languages
- **Little Digital Library (LDL)** — offline-first educational devices for foundational literacy in mother-tongue languages
- **MissionAssist** — digital strategy consulting for Portland nonprofits (revenue bridge)

**Active field partners:**
- Golden Leaf Foundation (Cambodia)
- California Rotary (Guatemala — K'iche' and Kaqchikel)
- N50 Project (Mexico City — Nahuatl and Mixtec)

## What this knowledge base contains

Twelve significant artifacts produced across multiple deep working sessions. The work is organized into seven major bodies of thinking:

1. **Data philosophy** — what TomorrowLabs believes about data and how it should be treated
2. **Architectural critique** — a pressure-test of the philosophy by its strongest critics
3. **Four-layer architecture** — reference, observational, operational, decision support
4. **Schema and migrations** — ~75 tables across seven SQL migrations
5. **Architectural omissions** — what wasn't built and why
6. **Strategic roadmaps** — Babagigi language waves, deployment readiness
7. **Reference library** — external sources (Glottolog, GeoNames, etc.) the architecture builds on

## Where it stands today

The architecture is **fully designed**. Almost nothing is **populated** beyond seed data demonstrating structure. The database does not yet exist outside the SQL files.

Three different scales of "next step" are possible:

- **Documentation work** (this knowledge base) — preserve what exists, make it findable
- **Database work** — run the schema in Supabase, populate the spine entities
- **Operational work** — execute one decision protocol against real data

The current state is at the start of documentation work.

## The single most important commitment

The data philosophy commits to **community co-authorship** of how TomorrowLabs holds data about communities. The pressure-test document acknowledged that the v1 philosophy was drafted *without* such co-authorship. Several honest-gaps in the architecture remain deferred specifically because they cannot be designed without community partners in the room.

This means: even when the rest of the architecture gets implemented, certain pieces are designed to wait for relational conditions that don't yet exist. Building them without community input would betray the philosophy more than leaving them unbuilt.

## Where to go next

- **To understand the work:** Continue to `02-what-exists.md` for the artifact inventory
- **To find a specific document:** Use `03-index-by-question.md`
- **To continue the work:** Read `04-where-we-left-off.md`
