/**
 * seed-language-hierarchy.ts
 *
 * Populates parent_language_id on language records using ISO 639-3
 * macrolanguage mappings. For each macrolanguage (e.g., 'zho' for
 * Chinese, 'ara' for Arabic, 'hmn' for Hmong):
 *
 *   1. Find or create the macrolanguage record in our languages table
 *   2. For each individual-language member we have in our DB, set
 *      parent_language_id → the macrolanguage record's UUID
 *
 * If a macrolanguage record doesn't exist yet (no Glottolog entry at
 * level='language' for it), one is inserted with iso_639_3, english_name
 * from the ISO reference file, and granularity='macrolanguage'.
 *
 * Only 'A' (active) members are wired; 'R' (retired) members are skipped.
 * Safe to re-run: parent_language_id is overwritten with the same value.
 *
 * Source: SIL ISO 639-3 macrolanguage table (CC0)
 * https://iso639-3.sil.org/code_tables/download_tables
 */

import { supabase } from './lib/supabase';

const MACRO_URL =
  'https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3-macrolanguages.tab';
const CODES_URL =
  'https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3.tab';

async function main() {
  // ------------------------------------------------------------------
  // 1. Fetch ISO 639-3 reference names (for macrolanguage inserts)
  //    Columns (TSV): Id, Part2B, Part2T, Part1, Scope, Language_Type,
  //                   Ref_Name, Comment
  // ------------------------------------------------------------------
  console.log('Fetching ISO 639-3 reference names...');
  const codesRes = await fetch(CODES_URL);
  if (!codesRes.ok) throw new Error(`HTTP ${codesRes.status}: ${codesRes.statusText}`);
  const codesText = await codesRes.text();

  const refNames = new Map<string, string>(); // iso_code → english name
  for (const line of codesText.split('\n').slice(1)) {
    const cols = line.split('\t');
    if (cols.length >= 7 && cols[0] && cols[6]) {
      refNames.set(cols[0].trim(), cols[6].trim());
    }
  }
  console.log(`  ${refNames.size} ISO reference names loaded`);

  // ------------------------------------------------------------------
  // 2. Fetch macrolanguage mappings
  //    Columns (TSV): M_Id, I_Id, I_Status  ('A'=active, 'R'=retired)
  // ------------------------------------------------------------------
  console.log('Fetching ISO 639-3 macrolanguage mappings...');
  const macroRes = await fetch(MACRO_URL);
  if (!macroRes.ok) throw new Error(`HTTP ${macroRes.status}: ${macroRes.statusText}`);
  const macroText = await macroRes.text();

  const macroMap = new Map<string, Set<string>>(); // macroCode → Set<childCode>
  for (const line of macroText.split('\n').slice(1)) {
    const cols = line.split('\t');
    if (cols.length < 3) continue;
    const macroCode = cols[0]!.trim();
    const childCode = cols[1]!.trim();
    const status = cols[2]!.trim();
    if (!macroCode || !childCode || status !== 'A') continue;
    if (!macroMap.has(macroCode)) macroMap.set(macroCode, new Set());
    macroMap.get(macroCode)!.add(childCode);
  }
  console.log(`  ${macroMap.size} macrolanguages, ${
    Array.from(macroMap.values()).reduce((sum, s) => sum + s.size, 0)
  } active member links`);

  // ------------------------------------------------------------------
  // 3. Load all languages from our DB that have ISO codes
  // ------------------------------------------------------------------
  console.log('Loading languages from database...');
  const { data: allLangs, error: allErr } = await supabase
    .from('languages')
    .select('id, iso_639_3, english_name, granularity')
    .not('iso_639_3', 'is', null);
  if (allErr) throw new Error(`DB query failed: ${allErr.message}`);

  const isoToLang = new Map<
    string,
    { id: string; english_name: string | null; granularity: string }
  >();
  for (const lang of allLangs ?? []) {
    if (lang.iso_639_3) isoToLang.set(lang.iso_639_3, lang);
  }
  console.log(`  ${isoToLang.size} languages with ISO codes in DB`);

  // ------------------------------------------------------------------
  // 4. Process each macrolanguage
  // ------------------------------------------------------------------
  let created = 0;
  let wired = 0;
  let macrosSkipped = 0;

  for (const [macroCode, children] of macroMap) {
    // Find children that we have in our DB
    const dbChildren: Array<{ id: string; code: string }> = [];
    for (const childCode of children) {
      const child = isoToLang.get(childCode);
      if (child) dbChildren.push({ id: child.id, code: childCode });
    }

    if (dbChildren.length === 0) {
      macrosSkipped++;
      continue; // No children in our DB — nothing to wire
    }

    // Find or create the macrolanguage record
    let macroUuid: string;
    const existing = isoToLang.get(macroCode);

    if (existing) {
      macroUuid = existing.id;
      // Ensure granularity is correctly set
      if (existing.granularity !== 'macrolanguage') {
        const { error } = await supabase
          .from('languages')
          .update({ granularity: 'macrolanguage' })
          .eq('id', macroUuid);
        if (error) console.warn(`  Could not update granularity for ${macroCode}: ${error.message}`);
      }
    } else {
      // Insert new macrolanguage record (ISO-only, no glottocode)
      const name = refNames.get(macroCode) ?? macroCode;
      const { data: inserted, error: insErr } = await supabase
        .from('languages')
        .insert({ english_name: name, iso_639_3: macroCode, granularity: 'macrolanguage' })
        .select('id')
        .single();

      if (insErr) {
        console.warn(`  Could not insert macrolanguage '${macroCode}': ${insErr.message}`);
        continue;
      }
      macroUuid = inserted.id;
      isoToLang.set(macroCode, { id: macroUuid, english_name: name, granularity: 'macrolanguage' });
      created++;
      console.log(`  + Created macrolanguage: ${name} (${macroCode})`);
    }

    // Wire children to parent in batches
    const childIds = dbChildren.map((c) => c.id);
    for (let i = 0; i < childIds.length; i += 100) {
      const batch = childIds.slice(i, i + 100);
      const { error } = await supabase
        .from('languages')
        .update({ parent_language_id: macroUuid })
        .in('id', batch);
      if (error) {
        console.warn(`  Error wiring children of ${macroCode}: ${error.message}`);
      } else {
        wired += batch.length;
      }
    }
  }

  console.log(`\nLanguage hierarchy seed complete.`);
  console.log(`  Macrolanguage records created: ${created}`);
  console.log(`  Child languages wired:         ${wired}`);
  console.log(`  Macrolanguages skipped (no DB children): ${macrosSkipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
