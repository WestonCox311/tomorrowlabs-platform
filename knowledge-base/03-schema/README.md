# Schema & Migrations

The SQL migrations defining TomorrowLabs's data architecture. Seven migrations totaling ~75 tables across four layers.

## The migrations

| File | What it adds | Tables added |
|------|-------------|--------------|
| `migration-000-initial.sql` | *(Not in this folder — represents the original 21-table language database)* | 21 |
| `migration-001-omnilingual-cv-ipa.sql` | Omnilingual & Common Voice schema extensions | 0 new (extensions to existing) |
| `migration-002-depth.sql` | Vitality, transmission, orthographies, documentation | 11 |
| `migration-003-places-organizations.sql` | Phase 1 spine — places, organizations, communities | 12 |
| `migration-004-layer-2-observational.sql` | Layer 2 time-series infrastructure | 11 |
| `migration-005-layer-3-operational.sql` | Layer 3 — programs, deployments, content, consent, finance | 15 |
| `migration-006-layer-4-decision-support.sql` | Layer 4 — protocols, outcomes, metrics, views | 5 tables + 13 views |
| `migration-007-honest-gaps-urgent.sql` | People, access control, consent audit chain | 5 |

**Note:** Migration 000 (the original language database) is referenced but not in this folder. It exists in the conversation history that produced this work.

## How to run these

### Against Supabase (recommended)

1. Create a new Supabase project at https://supabase.com
2. Open the SQL editor
3. Run each migration in order, 000 through 007
4. Check for errors after each migration before continuing
5. The migrations include seed data — you'll have something to query immediately

### Against local Postgres

```bash
createdb tomorrowlabs_dev
psql tomorrowlabs_dev < migration-000-initial.sql
psql tomorrowlabs_dev < migration-001-omnilingual-cv-ipa.sql
psql tomorrowlabs_dev < migration-002-depth.sql
psql tomorrowlabs_dev < migration-003-places-organizations.sql
psql tomorrowlabs_dev < migration-004-layer-2-observational.sql
psql tomorrowlabs_dev < migration-005-layer-3-operational.sql
psql tomorrowlabs_dev < migration-006-layer-4-decision-support.sql
psql tomorrowlabs_dev < migration-007-honest-gaps-urgent.sql
```

### Order matters

Each migration assumes the previous ones have run. They include `CREATE TYPE`, `CREATE TABLE`, and `INSERT INTO` statements that depend on earlier definitions. Running them out of order will fail.

## What you'll have after running them

A queryable database with:
- ~75 tables across four architectural layers
- ~30 PostgreSQL enums for typed columns
- ~20 strategic views in Layer 4
- Seed data demonstrating each table's structure (mostly minimal — designed for you to populate with real data)
- Triggers enforcing append-only behavior on `consent_audit_chain`
- Functions like `execute_person_deletion()` for proper PII removal

## What you won't have

- **Application code** that uses these tables (none exists yet)
- **Production data** populating the tables (only seed examples)
- **Integration with operational tools** (no Asana/Stripe/analytics connections)
- **A UI** for browsing or editing the data (use Supabase Studio for now)
- **Authentication or row-level security** policies enabled (the schema documents what should exist, but you need to configure Supabase RLS separately)

## Schema design principles

Reading the migrations, you'll notice repeated patterns:

- **UUID primary keys** on every table
- **Source citations** required for facts (`source_id` foreign keys)
- **Confidence levels** required for claims (`confidence_level` enum)
- **Timestamps** on all rows (`created_at`, `updated_at`)
- **Append-only** discipline on observational tables
- **Hierarchical structures** via self-referencing parent IDs (languages, places)
- **Granularity awareness** via enums (varieties, dialects, neighborhoods)
- **Community-respectful** override mechanisms throughout

## Updating the schema

If you need to make changes after running these migrations, **never modify these files**. Add a new migration file (numbered 008, 009, etc.) that contains the changes. This preserves the audit trail of how the schema evolved.

The data philosophy commitment: time-series never overwrites. The same principle applies to the schema itself.

## What's NOT in these migrations

See `../07-honest-gaps/` for the five tables that were deliberately not built. Three require community co-authorship. Two were scope decisions.

---

**See also:**
- `../02-architecture/architecture-map.md` — the complete table inventory
- `../07-honest-gaps/` — what's not built and why
- `../00-start-here/04-where-we-left-off.md` — current implementation status
