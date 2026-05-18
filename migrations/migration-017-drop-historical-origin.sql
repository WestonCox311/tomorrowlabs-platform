-- Migration 017: Drop is_historical_origin from geographic_concentrations
--
-- This column was added in migration-002 but never seeded by any script and
-- never read by any UI component. It was always NULL / false. Removing it
-- keeps the schema honest and avoids confusing future contributors.
--
-- If a "historical origin" concept is needed in future (e.g. tracking where
-- a language originated before diaspora), add it back with a clear definition
-- and a seed script at that point.

ALTER TABLE geographic_concentrations
  DROP COLUMN IF EXISTS is_historical_origin;
