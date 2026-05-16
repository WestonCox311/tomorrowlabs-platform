# TomorrowLabs Knowledge Base

A working knowledge base of TomorrowLabs's data infrastructure, organizational philosophy, and operational reasoning. This is the canonical home for the work done across multiple deep working sessions.

**Owner:** Weston
**Started:** May 2026
**Last meaningful update:** May 16, 2026

---

## What this is

This knowledge base holds the institutional memory of TomorrowLabs's data architecture work. It is organized so that you (or a future collaborator) can:

- Find any document we've created
- Trace any decision back to its reasoning
- Understand what's built vs. what's deferred
- Pick up the work where it was left off

This is a **personal knowledge base** — designed for one user, optimized for findability and portability. It's not currently shared with anyone else.

## How to use this

**If you're orienting for the first time** (or coming back after months away):
1. Read `00-start-here/01-orientation.md` — the five-minute overview
2. Skim `00-start-here/02-what-exists.md` — the inventory of artifacts
3. Pick a direction based on what you need

**If you're looking for a specific document:** Use the index at `00-start-here/03-index-by-question.md` — organized by the questions you'd be trying to answer.

**If you're picking up the work:** Read `00-start-here/04-where-we-left-off.md` — the running log of what's done and what's next.

## Folder structure

```
tomorrowlabs-docs/
├── 00-start-here/        ← Orientation, indexes, "where we left off"
├── 01-philosophy/        ← Data philosophy & pressure-test
├── 02-architecture/      ← The four-layer architecture documents
├── 03-schema/            ← SQL migrations and schema catalog
├── 04-roadmaps/          ← Babagigi roadmaps, language strategy
├── 05-decisions/         ← Decision log and operating decisions
├── 06-reference/         ← External reference library, sources
├── 07-honest-gaps/       ← What we haven't built and why
└── 08-artifacts-archive/ ← Original HTML and other source artifacts
```

## Conventions

- **Numbered folders** keep ordering stable when viewed in a file browser.
- **Stable docs** (philosophy, architecture, migrations) have specific filenames and don't get renamed.
- **Evolving docs** (decisions, "where we left off") are dated in their content, not filenames.
- **Source artifacts** (HTML, SQL, spreadsheets) live in `08-artifacts-archive/` and are referenced from markdown files rather than embedded.
- **Cross-references** use relative markdown links so the whole structure stays portable.

## Status

This is a working knowledge base, not a polished public document. Content quality varies — some sections are deeply developed, some are placeholders. The structure is designed to surface that variation honestly rather than hide it.

When something is incomplete or deferred, it's marked. When something requires community co-authorship before completion, it's flagged explicitly.

---

**See also:** `00-start-here/01-orientation.md` for the proper five-minute introduction.
