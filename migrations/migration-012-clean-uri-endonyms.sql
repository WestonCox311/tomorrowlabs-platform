-- migration-012-clean-uri-endonyms.sql
--
-- Removes endonyms that are Wikidata blank node URIs instead of plain strings.
-- These were written by the first run of seed-endonyms.ts before the literal
-- type filter was added. Wikidata sometimes returns P1705 (native label) as a
-- URI reference rather than a string; those are not valid endonyms.
--
-- After running this, re-run: npm run seed:endonyms

UPDATE languages
SET
  endonym    = NULL,
  updated_at = now()
WHERE
  endonym LIKE 'http://%'
  OR endonym LIKE 'https://%';

-- Verify: SELECT count(*) FROM languages WHERE endonym LIKE 'http://%' OR endonym LIKE 'https://%';
-- Expected: 0
