-- migration-011-constructed-languages.sql
--
-- Sets is_constructed = true for artificial/constructed languages.
--
-- Glottolog CLDF has no explicit boolean for this; the seed script now
-- detects from Family_ID = 'arti1235' (Glottolog's artificial-language family),
-- but existing seeded records still have is_constructed = false.
--
-- Run this once to fix existing data. Future seed reruns are self-correcting.
--
-- Verify before applying:
--   SELECT english_name, glottocode FROM languages
--   WHERE english_name = ANY(ARRAY[
--     'Esperanto','Ido','Interlingua','Lojban','Volapük','Interlingue',
--     'Novial','Lingua Franca Nova','Toki Pona','Láadan','Klingon',
--     'Quenya','Na''vi','Sambahsa','Kotava','Solresol','Occidental'
--   ])
--   ORDER BY english_name;

UPDATE languages
SET
  is_constructed = true,
  updated_at     = now()
WHERE english_name = ANY(ARRAY[
  'Esperanto',
  'Ido',
  'Interlingua',
  'Lojban',
  'Volapük',
  'Interlingue',
  'Novial',
  'Lingua Franca Nova',
  'Toki Pona',
  'Láadan',
  'Klingon',
  'Quenya',
  'Na''vi',
  'Sambahsa',
  'Kotava',
  'Solresol',
  'Occidental'
]);

-- Verify: SELECT english_name, glottocode FROM languages WHERE is_constructed = true ORDER BY english_name;
-- Expected: 5–15 rows (only the names above that exist in Glottolog CLDF)
