# CLAUDE.md

**This file is read by Claude Code at the start of every session.** It tells you what this project is, how it's organized, what conventions to follow, and what's in scope vs. out of scope.

Read this carefully before starting work. Read `docs/CURRENT_TASK.md` to see what's currently being worked on.

---

## What this project is

TomorrowLabs is a for-profit entity with a nonprofit arm in formation, building language preservation infrastructure. This repository is the **TomorrowLabs Platform** — the technical implementation of the data architecture designed in months of strategic work prior to this codebase existing.

The strategic design work is complete. The code is just starting. Your job is to build, not redesign.

## What this project is NOT

- This is **not** a greenfield design exercise. The data architecture is settled. The schema is settled. The philosophy is settled. Refer to `knowledge-base/` for everything pre-decided.
- This is **not** the place for novel architectural decisions. If you find yourself wanting to fundamentally change the schema, the four-layer model, or the consent infrastructure — stop and ask the user.
- This is **not** for community-facing features yet. Several things are deliberately deferred pending community co-authorship (see `knowledge-base/07-honest-gaps/`).

## What you're building first

A simple admin UI for browsing and editing the database. The minimum viable version is a CRUD interface over the four spine entities (languages, places, organizations, communities).

**Explicitly in scope for the first build:**
- Next.js 15 with App Router
- Supabase as the database backend
- Tailwind CSS for styling
- shadcn/ui for components
- List/view/edit pages for the four spine tables
- Basic search and filtering
- Authentication via Supabase Auth (single-user for now)

**Explicitly OUT of scope for the first build (don't build these yet):**
- Dashboards or data visualization
- Decision protocol execution
- Integration with external tools (Asana, Stripe, etc.)
- Public-facing pages
- Community-facing views (those require community co-design)
- Mobile-optimized UX
- Internationalization of the admin UI itself

The first build is for the user (Weston) to use internally. Don't over-engineer it.

## Repository structure

```
tomorrowlabs-platform/
├── CLAUDE.md                  ← This file (read at every session start)
├── README.md                  ← Public-facing description (minimal for now)
├── SETUP.md                   ← One-time setup instructions
├── docs/
│   ├── CURRENT_TASK.md        ← What's currently being worked on
│   ├── TASKS.md               ← The full task sequence
│   ├── DECISIONS.md           ← Decisions made during development
│   └── CONVENTIONS.md         ← Code conventions for this project
├── migrations/                ← SQL migrations (001-007 exist, run in order)
├── scripts/                   ← Migration runner, seed scripts, utilities
├── src/
│   ├── app/                   ← Next.js App Router pages
│   ├── components/            ← React components (shadcn/ui based)
│   └── lib/                   ← Supabase client, utilities, types
├── public/                    ← Static assets
└── knowledge-base/            ← The full strategic context (READ-ONLY for you)
```

## How to think about the knowledge base

The `knowledge-base/` folder contains months of strategic design work. **Treat it as read-only context.** It explains:

- The data philosophy (`knowledge-base/01-philosophy/`)
- The four-layer architecture (`knowledge-base/02-architecture/`)
- The complete schema (`knowledge-base/03-schema/`)
- Strategic roadmaps (`knowledge-base/04-roadmaps/`)
- Decision history (`knowledge-base/05-decisions/`)
- What's deferred and why (`knowledge-base/07-honest-gaps/`)

When you encounter a question about *why* something is shaped a particular way, the answer is probably in the knowledge base. Read before asking — but also, ask if reading doesn't resolve it.

**Do not modify files in `knowledge-base/`.** If you discover something that needs to be updated, flag it to the user in your response. They'll decide whether to update it.

## Critical architectural commitments you must honor

These are encoded in the schema and the philosophy. Honor them in every line of code you write:

### 01. Consent infrastructure sits structurally above operational logic
Application code that touches user data, content, or community contributions **must** check `consent_records` before acting. Operations that depend on consent **must** write to `consent_audit_chain`. If you find yourself writing code that would bypass consent checks "just for now," stop and discuss with the user.

### 02. Every fact resolves to a source
When you write code that inserts data into tables with a `source_id` foreign key, you must populate it. Never insert facts without provenance, even in seed scripts.

### 03. Confidence is a first-class data type
Tables with a `confidence_level` column require it to be populated. Don't default to 'high' without thought. Honest 'estimated' is better than dishonest 'high'.

### 04. Time-series never overwrites
Tables in Layer 2 (observational) are append-only. Never write UPDATE statements against them. If correction is needed, add a new row with the corrected data and reasoning.

### 05. Sensitive data requires structural protection
The `people` table has sensitivity classifications in column comments. The `access_control_policies` table defines what should be queryable by whom. Application code must enforce these — Supabase RLS policies should be aligned with the access_control_policies table.

### 06. The schema is settled — extensions are additive
Need to add a column or table? Create a new migration file (numbered 008, 009, etc.). Never modify existing migration files. Never run DROP statements against production without explicit user approval.

## Code conventions

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` and narrow)
- Database types auto-generated from Supabase schema
- Component props always typed via interface or type

### React / Next.js
- Server Components by default; Client Components only when needed
- File naming: `kebab-case.tsx` for files, `PascalCase` for component names
- Co-locate component-specific files: `components/language-list/index.tsx` with adjacent helpers
- Use Next.js App Router conventions (not Pages Router)

### Database access
- Always go through the typed Supabase client in `src/lib/supabase/`
- Never write raw SQL in application code (use Supabase queries)
- For complex queries, create database views in a new migration
- Use Supabase Row Level Security (RLS) — never expose service role key to client

### Naming
- Database tables: `snake_case`, plural (`languages`, `organizations`)
- TypeScript types: `PascalCase`, singular (`Language`, `Organization`)
- React components: `PascalCase`
- Functions and variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Commits
- Conventional commits format: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Reference the task from TASKS.md if applicable
- Keep commits small and focused — one logical change per commit

## How to handle uncertainty

When something is genuinely ambiguous or you need user input:

1. **Check the knowledge base first.** The answer is probably there.
2. **Check `docs/DECISIONS.md`.** If a similar question was asked before, the resolution is recorded.
3. **If still uncertain, ask the user clearly.** Don't guess on architectural questions. Don't guess on philosophical commitments.
4. **For implementation choices that are reversible**, make a reasonable call and document it in `docs/DECISIONS.md`.
5. **For implementation choices that are hard to reverse** (data shape, security boundaries, public APIs), always ask before deciding.

## What to do at the start of every session

1. Read this file (you're doing that now)
2. Read `docs/CURRENT_TASK.md` to see what's currently being worked on
3. If `docs/CURRENT_TASK.md` says "nothing in progress," read `docs/TASKS.md` to see the next task
4. Check `docs/DECISIONS.md` for recent decisions that affect your work
5. Confirm with the user what they want to work on this session

## What to do at the end of every session

1. Update `docs/CURRENT_TASK.md` with what was completed and what's next
2. Add any decisions made to `docs/DECISIONS.md`
3. Commit your work with clear messages
4. Summarize for the user: what was done, what's left, what blockers exist

## Working with the user

The user is Weston, founder of TomorrowLabs. He:
- Has done extensive strategic and architectural design work (visible in `knowledge-base/`)
- Values direct, honest engagement over validation
- Identifies as AuDHD (autism + ADHD) — clear structure helps, vague open-ended choices don't
- Prefers concrete recommendations over open-ended question lists
- Wants to push back honestly when something seems wrong, not be cheered through bad decisions

**Direct is good. Honest is good. Validating without evidence is not helpful.**

When you make recommendations, be specific. When you disagree with a direction, say so clearly with reasoning. When you don't know something, say that.

## Mission context

Why this project exists, briefly:

TomorrowLabs builds language preservation infrastructure. Babagigi (a bilingual storybook platform) helps diaspora grandparents record stories in heritage languages. Little Digital Library (LDL) is an offline-first educational platform for partner communities. The data architecture you're implementing supports both.

The philosophy is "capitalist mechanics → post-capitalist intentions." Commercial product success funds humanitarian field work. The architecture treats community data with research-grade seriousness while maintaining commercial viability.

**The work matters.** The communities whose languages this serves — Cambodian, K'iche', Nahuatl, Mixtec, and many more — deserve infrastructure that treats their data with the care the philosophy commits to.

Don't lose sight of this when you're deep in code. Every column you write is part of how that commitment becomes real.

---

**Last updated:** Initial creation, May 2026.

**When to update this file:** When conventions change, when scope expands, when major architectural decisions are made. The file should evolve as the project does, but core commitments (consent, sources, confidence, time-series) should not change without significant deliberation.
