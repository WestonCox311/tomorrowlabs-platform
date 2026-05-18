-- migration-008-curated-data.sql
--
-- Hand-curated data population for the Babagigi production pipeline.
-- Run ONCE in the Supabase SQL Editor after migrations 000-007.
-- Safe to review in full before running — all operations are additive.
--
-- Contents:
--   Part 0 — Add 3 countries needed as diaspora origin places
--   Part 1 — Add 3 Wave 3 languages missing from initial seed
--   Part 2 — Set ethnologue_status for all 33 Babagigi languages
--   Part 3 — Record Babagigi wave assignments in product_status
--   Part 4 — Insert 6 key communities
-- =====================================================================

-- =====================================================================
-- PART 0: ADDITIONAL COUNTRIES
-- Fixed UUIDs: pattern 33333333-0000-0000-0000-000000000006-008
-- GeoNames IDs verified 2026-05-16.
-- These are referenced by community origin_place_id in Part 4.
-- =====================================================================

INSERT INTO places (
  id, english_name, granularity,
  geonames_id, iso_3166_1_alpha2, iso_3166_1_alpha3,
  latitude, longitude,
  governance_type, territory_recognition,
  status, geonames_validated, geonames_last_synced
) VALUES
  ('33333333-0000-0000-0000-000000000006',
   'Vietnam', 'country',
   '1562822', 'VN', 'VNM',
   16.17, 107.83,
   'sovereign-state', 'internationally-recognized',
   'active', true, '2026-05-16'),

  ('33333333-0000-0000-0000-000000000007',
   'South Korea', 'country',
   '1835841', 'KR', 'KOR',
   36.50, 127.75,
   'sovereign-state', 'internationally-recognized',
   'active', true, '2026-05-16'),

  ('33333333-0000-0000-0000-000000000008',
   'Philippines', 'country',
   '1694008', 'PH', 'PHL',
   13.00, 122.00,
   'sovereign-state', 'internationally-recognized',
   'active', true, '2026-05-16')

ON CONFLICT (geonames_id) DO NOTHING;


-- =====================================================================
-- PART 1: THREE MISSING WAVE 3 LANGUAGES
-- Fixed UUIDs: pattern 22222222-0000-0000-0000-000000000031-033
-- Glottocodes and ISO codes sourced from Glottolog CLDF.
-- Endonyms sourced from Omniglot and Wikipedia.
-- =====================================================================

INSERT INTO languages (id, english_name, endonym, glottocode, iso_639_3, iso_639_1, granularity) VALUES
  ('22222222-0000-0000-0000-000000000031',
   'Hebrew', 'עִברִית', 'hebr1245', 'heb', 'he', 'language'),

  ('22222222-0000-0000-0000-000000000032',
   'Punjabi', 'ਪੰਜਾਬੀ', 'panj1256', 'pan', 'pa', 'language'),

  ('22222222-0000-0000-0000-000000000033',
   'Gujarati', 'ગુજરાતી', 'guja1252', 'guj', 'gu', 'language')

ON CONFLICT (glottocode) DO NOTHING;


-- =====================================================================
-- PART 2: ETHNOLOGUE STATUS FOR ALL 33 BABAGIGI LANGUAGES
-- Source: Ethnologue (www.ethnologue.com), EGIDS level labels.
-- Accessed: 2026-05-16. Paywalled — level verified via public summaries.
-- =====================================================================

-- Wave 1 — International / commercial
UPDATE languages SET ethnologue_status = 'International'
  WHERE glottocode IN ('stan1288', 'mand1415', 'stan1318', 'stan1290', 'port1283', 'russ1263');
  -- Spanish, Mandarin Chinese, Arabic (MSA), French, Portuguese, Russian

-- Wave 1 — National languages (also dominant in their countries)
UPDATE languages SET ethnologue_status = 'National'
  WHERE glottocode IN ('taga1270', 'viet1252', 'kore1280');
  -- Tagalog, Vietnamese, Korean

-- Wave 2 — International / National
UPDATE languages SET ethnologue_status = 'International'
  WHERE glottocode IN ('stan1295', 'ital1282');
  -- German, Italian

UPDATE languages SET ethnologue_status = 'National'
  WHERE glottocode IN ('hind1269', 'poli1260', 'japa1256');
  -- Hindi, Polish, Japanese

UPDATE languages SET ethnologue_status = 'Vigorous'
  WHERE glottocode = 'cant1236';
  -- Cantonese — no official national status but ~85M speakers, widely used

-- Wave 3 — National / Vigorous
UPDATE languages SET ethnologue_status = 'National'
  WHERE glottocode IN ('mode1248', 'urdu1245', 'hebr1245', 'laoo1244');
  -- Greek, Urdu, Hebrew, Lao

UPDATE languages SET ethnologue_status = 'Vigorous'
  WHERE glottocode IN ('panj1256', 'guja1252');
  -- Punjabi, Gujarati — major Indian languages without sole national-level status

-- Wave 4 — National / Threatened
UPDATE languages SET ethnologue_status = 'National'
  WHERE glottocode = 'cent1989';
  -- Khmer — official language of Cambodia

UPDATE languages SET ethnologue_status = 'Threatened'
  WHERE glottocode IN ('kich1262', 'kaqc1270', 'east2455', 'mixt1422', 'whit1273');
  -- K'iche', Kaqchikel, Nahuatl, Mixtec, Hmong — EGIDS 6a, not being fully transmitted to children


-- =====================================================================
-- PART 3: BABAGIGI PRODUCT_STATUS (27 languages across 4 waves)
-- All status = 'planned'. Conflicts are silently ignored (idempotent).
-- Language IDs use the fixed 22222222 pattern from migration-000 + Part 1.
-- =====================================================================

INSERT INTO product_status (language_id, product, wave, status) VALUES

-- Wave 1: Commercial foundation (8 languages)
('22222222-0000-0000-0000-000000000001', 'babagigi', 'wave-1', 'planned'), -- Spanish
('22222222-0000-0000-0000-000000000002', 'babagigi', 'wave-1', 'planned'), -- Mandarin Chinese
('22222222-0000-0000-0000-000000000003', 'babagigi', 'wave-1', 'planned'), -- Tagalog
('22222222-0000-0000-0000-000000000004', 'babagigi', 'wave-1', 'planned'), -- Vietnamese
('22222222-0000-0000-0000-000000000005', 'babagigi', 'wave-1', 'planned'), -- Korean
('22222222-0000-0000-0000-000000000006', 'babagigi', 'wave-1', 'planned'), -- Arabic (MSA)
('22222222-0000-0000-0000-000000000007', 'babagigi', 'wave-1', 'planned'), -- French
('22222222-0000-0000-0000-000000000008', 'babagigi', 'wave-1', 'planned'), -- Portuguese

-- Wave 2: Demand expansion (5 languages)
('22222222-0000-0000-0000-000000000011', 'babagigi', 'wave-2', 'planned'), -- Cantonese
('22222222-0000-0000-0000-000000000009', 'babagigi', 'wave-2', 'planned'), -- Russian
('22222222-0000-0000-0000-000000000017', 'babagigi', 'wave-2', 'planned'), -- Polish
('22222222-0000-0000-0000-000000000016', 'babagigi', 'wave-2', 'planned'), -- Italian
('22222222-0000-0000-0000-000000000010', 'babagigi', 'wave-2', 'planned'), -- Hindi

-- Wave 3: Aging heritage (7 languages, including 3 added in Part 1)
('22222222-0000-0000-0000-000000000015', 'babagigi', 'wave-3', 'planned'), -- German
('22222222-0000-0000-0000-000000000012', 'babagigi', 'wave-3', 'planned'), -- Japanese
('22222222-0000-0000-0000-000000000018', 'babagigi', 'wave-3', 'planned'), -- Greek
('22222222-0000-0000-0000-000000000030', 'babagigi', 'wave-3', 'planned'), -- Urdu
('22222222-0000-0000-0000-000000000031', 'babagigi', 'wave-3', 'planned'), -- Hebrew
('22222222-0000-0000-0000-000000000032', 'babagigi', 'wave-3', 'planned'), -- Punjabi
('22222222-0000-0000-0000-000000000033', 'babagigi', 'wave-3', 'planned'), -- Gujarati

-- Wave 4: Mission track (7 languages)
('22222222-0000-0000-0000-000000000021', 'babagigi', 'wave-4', 'planned'), -- Khmer
('22222222-0000-0000-0000-000000000022', 'babagigi', 'wave-4', 'planned'), -- K'iche'
('22222222-0000-0000-0000-000000000026', 'babagigi', 'wave-4', 'planned'), -- Lao
('22222222-0000-0000-0000-000000000027', 'babagigi', 'wave-4', 'planned'), -- Hmong
('22222222-0000-0000-0000-000000000024', 'babagigi', 'wave-4', 'planned'), -- Nahuatl
('22222222-0000-0000-0000-000000000025', 'babagigi', 'wave-4', 'planned'), -- Mixtec
('22222222-0000-0000-0000-000000000023', 'babagigi', 'wave-4', 'planned')  -- Kaqchikel

ON CONFLICT (language_id, product) DO NOTHING;


-- =====================================================================
-- PART 4: KEY COMMUNITIES (6 records)
-- Population estimates from US Census / ACS (diaspora) and
-- CIA World Factbook / Glottolog (in-country). Confidence levels
-- reflect whether estimates are census-grade or modeled.
-- =====================================================================

INSERT INTO communities (
  english_name,
  community_type,
  primary_language_ids,
  primary_place_ids,
  origin_place_id,
  is_self_identified_community,
  estimated_global_population,
  estimated_population_confidence,
  notes
) VALUES

(
  'Cambodian-American Community',
  'diaspora',
  ARRAY['22222222-0000-0000-0000-000000000021']::uuid[],  -- Khmer
  ARRAY['33333333-0000-0000-0000-000000000001']::uuid[],  -- United States
  '33333333-0000-0000-0000-000000000002',                 -- Cambodia
  true,
  350000,
  'estimated',
  'Primarily concentrated in Long Beach (CA), Lowell (MA), and Philadelphia (PA). Largest Cambodian diaspora outside Southeast Asia. Babagigi Wave 4 primary target community.'
),

(
  'K''iche'' Diaspora in the United States',
  'diaspora',
  ARRAY['22222222-0000-0000-0000-000000000022']::uuid[],  -- K'iche'
  ARRAY[
    '33333333-0000-0000-0000-000000000010',               -- California
    '33333333-0000-0000-0000-000000000011'                -- Oregon
  ]::uuid[],
  '33333333-0000-0000-0000-000000000003',                 -- Guatemala
  true,
  250000,
  'estimated',
  'Concentrated in California (Los Angeles, Fresno) and Oregon (Portland metro). Many are undocumented agricultural workers. Babagigi Wave 4 partner community — active relationship with partner orgs in Portland.'
),

(
  'Vietnamese-American Community',
  'diaspora',
  ARRAY['22222222-0000-0000-0000-000000000004']::uuid[],  -- Vietnamese
  ARRAY['33333333-0000-0000-0000-000000000001']::uuid[],  -- United States
  '33333333-0000-0000-0000-000000000006',                 -- Vietnam
  true,
  2100000,
  'low',
  'Fourth-largest Asian-American group per US Census ACS. Concentrated in California, Texas, and Virginia. Strong heritage language retention across generations. Babagigi Wave 1 target community.'
),

(
  'Korean-American Community',
  'diaspora',
  ARRAY['22222222-0000-0000-0000-000000000005']::uuid[],  -- Korean
  ARRAY['33333333-0000-0000-0000-000000000001']::uuid[],  -- United States
  '33333333-0000-0000-0000-000000000007',                 -- South Korea
  true,
  1800000,
  'low',
  'Concentrated in California (Los Angeles), New York, and New Jersey. High educational attainment; strong community institutions including Korean-language schools. Babagigi Wave 1 target community.'
),

(
  'Mixtec Migrant Community in the United States',
  'diaspora',
  ARRAY['22222222-0000-0000-0000-000000000025']::uuid[],  -- Mixtec
  ARRAY['33333333-0000-0000-0000-000000000010']::uuid[],  -- California
  '33333333-0000-0000-0000-000000000004',                 -- Mexico
  true,
  500000,
  'estimated',
  'Primarily agricultural workers in California and Oregon. Many are monolingual Mixtec speakers or have limited Spanish. Multiple distinct Mixtec varieties — data reflects aggregate. Babagigi Wave 4 mission track.'
),

(
  'Khmer-Speaking Community in Cambodia',
  'linguistic',
  ARRAY['22222222-0000-0000-0000-000000000021']::uuid[],  -- Khmer
  ARRAY['33333333-0000-0000-0000-000000000002']::uuid[],  -- Cambodia
  '33333333-0000-0000-0000-000000000002',                 -- Cambodia
  true,
  16000000,
  'medium',
  'Dominant language community of Cambodia. Khmer is the sole official language. In-country partner organizations for Babagigi and LDL are embedded in this community. Population from CIA World Factbook 2025 estimate.'
);
