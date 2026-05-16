# Tasks

The sequence of work for building the TomorrowLabs admin UI. Tasks are listed in dependency order — earlier tasks must complete before later ones.

Each task is scoped to be completable in a single Claude Code session (1-2 hours of focused work). If a task feels too big, split it.

---

## Phase 1: Foundation

### Task 01: Project Setup
**Goal:** Working Next.js project with Supabase connection.

**Subtasks:**
- Initialize Next.js 15 project with App Router and TypeScript
- Install dependencies: `@supabase/ssr`, `@supabase/supabase-js`, `tailwindcss`, `lucide-react`
- Set up shadcn/ui (`npx shadcn@latest init`)
- Configure environment variables from `.env.local`
- Create `src/lib/supabase/` with server and client utilities
- Verify connection by querying `select 1` from Supabase
- Set up basic layout with Tailwind

**Success criteria:**
- `npm run dev` starts the server without errors
- A test page at `/` confirms Supabase connection works
- Code committed to GitHub

**Estimated time:** 1 session

---

### Task 02: Reconstruct Migration 000
**Goal:** Recreate the original languages-table migration so the database is complete.

**Context:** Migrations 001-007 exist in this repo. Migration 000 (the initial 21-table language database) was designed in the original conversation but not preserved here. It must be reconstructed before any of the other migrations can run cleanly.

**Subtasks:**
- Read `knowledge-base/03-schema/README.md` for context
- Read the schema catalog spreadsheet in `knowledge-base/08-artifacts-archive/` if accessible
- Reverse-engineer migration 000 from references in migrations 001-007 (every table they reference but don't create must exist in 000)
- Create `migrations/migration-000-initial.sql` with full table definitions, indexes, enums, and seed data
- Verify by running it against a fresh Supabase database
- Run migrations 001-007 against it to confirm everything works

**Success criteria:**
- All 8 migrations run cleanly against an empty Supabase database
- Spine tables (`languages`, etc.) exist with seed data
- No `relation does not exist` errors

**Estimated time:** 1-2 sessions

**Important:** This task requires Claude Code to make inferences about the original schema from downstream references. When uncertain, ask the user before guessing. The user has the original schema design context.

---

### Task 03: Database Types Generation
**Goal:** TypeScript types automatically generated from the database schema.

**Subtasks:**
- Set up Supabase CLI locally
- Generate types: `supabase gen types typescript --project-id <id> > src/lib/database.types.ts`
- Add a script to `package.json`: `"types:generate": "supabase gen types..."`
- Document the regeneration workflow in `docs/CONVENTIONS.md`
- Create utility types for the spine entities

**Success criteria:**
- `Language`, `Place`, `Organization`, `Community` types exist and match the database
- Types regenerate cleanly when schema changes
- TypeScript strict mode passes with no `any` types

**Estimated time:** 1 session

---

## Phase 2: Spine CRUD (the actual admin UI)

### Task 04: Authentication
**Goal:** Single-user admin authentication via Supabase Auth.

**Subtasks:**
- Enable Email/Password auth in Supabase dashboard (manually by user)
- Build login page at `/login`
- Build signup page (or disable signups and create user via Supabase dashboard)
- Build authenticated layout that redirects unauthenticated users to `/login`
- Build logout functionality
- Test full login/logout flow

**Success criteria:**
- Weston can sign in via the web UI
- Unauthenticated users are redirected to `/login`
- Session persists across page reloads
- Logout clears session

**Estimated time:** 1 session

---

### Task 05: Languages CRUD
**Goal:** List, view, create, edit, delete languages.

**Subtasks:**
- Build `/languages` list page with table view (sortable columns: name, glottocode, status, granularity)
- Build search/filter UI (by name, glottocode, family, status)
- Build `/languages/[id]` detail page showing all fields
- Build `/languages/new` create form
- Build `/languages/[id]/edit` edit form
- Add delete confirmation modal
- Handle errors gracefully (network, validation, permissions)
- Add proper loading states

**Success criteria:**
- All operations work end-to-end
- Form validation matches database constraints
- URLs are RESTful and bookmarkable
- Errors don't crash the page

**Estimated time:** 2 sessions

**Note:** Don't try to expose every field. Start with the most common ones; add advanced fields under a "More fields" toggle.

---

### Task 06: Places CRUD
**Goal:** Same pattern as Task 05, but for places.

**Subtasks:** Same shape as Task 05 but for the `places` table.

Special considerations:
- Hierarchical display (countries → states → metros → cities)
- Map visualization could be future, not now
- Indigenous territory granularity should be clearly distinguished

**Success criteria:** Same as Task 05.

**Estimated time:** 1-2 sessions (faster than languages because pattern is established)

---

### Task 07: Organizations CRUD
**Goal:** Same pattern, for organizations.

**Subtasks:** Same shape, with these specifics:
- Distinguish org types visually (community-org vs foundation vs vendor)
- Show related places and communities
- Link to `organization_relationships` for relationship state

**Success criteria:** Same as Task 05.

**Estimated time:** 1-2 sessions

---

### Task 08: Communities CRUD
**Goal:** Same pattern, for communities.

**Subtasks:** Same shape, with these specifics:
- Communities can span multiple places and languages — show these relationships
- Distinguish community types (diaspora, religious, indigenous, etc.)

**Success criteria:** Same as Task 05.

**Estimated time:** 1 session

---

### Task 09: Navigation and Polish
**Goal:** Tie the four spine sections together with proper navigation.

**Subtasks:**
- Sidebar navigation with links to each spine section
- Breadcrumbs on detail/edit pages
- Global search across all spine entities
- Empty states for tables with no data
- Loading skeletons
- 404 pages
- Error boundaries

**Success criteria:**
- Navigation is intuitive
- App doesn't crash on edge cases
- Empty database produces helpful onboarding rather than confusion

**Estimated time:** 1 session

---

## Phase 3: First Wave of Real Data

### Task 10: Seed Data Population
**Goal:** Real data for the spine entities, not just structural seeds.

**Subtasks:**
- Identify the top 30 languages TomorrowLabs needs (per the Babagigi roadmap)
- Populate from Glottolog API where possible
- Add the 5-10 key places (US, Cambodia, Guatemala, Mexico, Thailand, plus subdivisions)
- Add active partner organizations (Golden Leaf, California Rotary, N50, etc.)
- Add corresponding communities

**Success criteria:**
- Admin UI shows real data, not just seed examples
- Data is verifiably accurate against sources
- Source IDs are populated (every fact has provenance)
- Confidence levels are honest

**Estimated time:** 2-3 sessions

**Note:** This is the moment the architecture stops being theoretical. After this, queries return real answers.

---

## Phase 4: Decisions Beyond First Build

After Phase 3, the user (Weston) decides what comes next. Several directions are possible:

- **Data ingestion pipelines** — automated population from Glottolog, GeoNames, Common Voice, etc.
- **Layer 4 dashboards** — start executing decision protocols against real data
- **Integration with operational tools** — connect to Asana, Stripe, Notion
- **Public-facing pages** — when ready (probably not soon)
- **Partner-facing views** — only after community co-design conversations

These aren't pre-planned tasks. They get added to this file as decisions get made.

---

## How tasks work

**At the start of each session:**
1. Confirm with the user which task to work on
2. Update `CURRENT_TASK.md` with what you're doing
3. Begin work

**Task scope discipline:**
- Each task should be completable in one session
- If a task is too big, split it into subtasks
- If a task has unclear dependencies, surface them before starting

**When you finish a task:**
1. Test it works end-to-end
2. Commit your work
3. Update `CURRENT_TASK.md` (move to "Last completed")
4. Suggest the next task

**When you can't finish:**
1. Commit what works
2. Document where you stopped in `CURRENT_TASK.md`
3. Note any blockers
4. Clear path for next session to pick up

---

## What's NOT in this task list

Things that are deliberately deferred — see `knowledge-base/07-honest-gaps/`:
- Community internal dynamics modeling
- Community co-governance records
- Community-facing dashboards

These require community co-authorship and shouldn't be built in this phase.

Also deferred:
- Climate observations table
- Conflict and political events tracking
- ML model performance tracking
- Public reports archive

These are scope decisions — build when needed, not speculatively.

---

**Last updated:** Initial creation. Add updates when tasks complete or new tasks emerge.
