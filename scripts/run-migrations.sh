#!/usr/bin/env bash
# run-migrations.sh — apply all migrations to a Postgres database in order
#
# Usage:
#   DATABASE_URL=postgres://... ./scripts/run-migrations.sh
#
# Or with Supabase CLI:
#   ./scripts/run-migrations.sh --supabase

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/../migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Error: migrations directory not found at $MIGRATIONS_DIR"
  exit 1
fi

# Check that migration 000 exists — it's required
if [ ! -f "$MIGRATIONS_DIR/migration-000-initial.sql" ]; then
  echo "Warning: migration-000-initial.sql not found."
  echo "This is the foundational migration that creates the languages table"
  echo "and other initial tables. Without it, subsequent migrations will fail."
  echo ""
  echo "See knowledge-base/03-schema/README.md for context."
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Determine the mode
if [[ "${1:-}" == "--supabase" ]]; then
  # Run via Supabase CLI
  echo "Running migrations via Supabase CLI..."
  for f in "$MIGRATIONS_DIR"/migration-*.sql; do
    if [ -f "$f" ]; then
      filename=$(basename "$f")
      echo "→ Applying $filename"
      supabase db push --file "$f" || {
        echo "Error applying $filename. Stopping."
        exit 1
      }
    fi
  done
elif [ -n "${DATABASE_URL:-}" ]; then
  # Run via psql
  echo "Running migrations via psql..."
  echo "Database: $DATABASE_URL"
  echo ""
  for f in "$MIGRATIONS_DIR"/migration-*.sql; do
    if [ -f "$f" ]; then
      filename=$(basename "$f")
      echo "→ Applying $filename"
      psql "$DATABASE_URL" -f "$f" -v ON_ERROR_STOP=1 || {
        echo "Error applying $filename. Stopping."
        exit 1
      }
    fi
  done
else
  echo "Error: No database connection method specified."
  echo ""
  echo "Either:"
  echo "  Set DATABASE_URL: DATABASE_URL=postgres://... ./scripts/run-migrations.sh"
  echo "  Or use Supabase: ./scripts/run-migrations.sh --supabase"
  exit 1
fi

echo ""
echo "✓ All migrations applied successfully."
echo ""
echo "Next steps:"
echo "  1. Verify tables exist: SELECT count(*) FROM languages;"
echo "  2. Check seed data: SELECT english_name FROM languages LIMIT 10;"
echo "  3. Generate TypeScript types from the schema (see TASKS.md Task 03)"
