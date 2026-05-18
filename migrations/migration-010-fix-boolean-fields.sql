-- migration-010-fix-boolean-fields.sql
--
-- Corrects is_signed_language for all records seeded from Glottolog CLDF.
-- The seed script only writes name/glottocode/iso/granularity — boolean
-- fields defaulted to false for every row, including sign languages.
--
-- Detection: Glottolog consistently includes "Sign Language" in the English
-- name of sign languages (American Sign Language, British Sign Language,
-- Nicaraguan Sign Language, etc.). This catches ~140 records.
--
-- is_constructed is intentionally NOT updated here — Glottolog CLDF has no
-- explicit flag for constructed languages, and the affected set is small
-- (Esperanto, Lojban, Interlingua, etc.). Fix those manually via Edit.

UPDATE languages
SET
  is_signed_language = true,
  updated_at         = now()
WHERE
  english_name ILIKE '%sign language%'
  OR english_name ILIKE '%signed language%';

-- Verify: select count(*) from languages where is_signed_language = true;
-- Expected: ~140–160 rows
