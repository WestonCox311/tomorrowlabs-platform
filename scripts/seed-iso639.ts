/**
 * seed-iso639.ts
 *
 * Fetches the ISO 639-3 code table from SIL International and fills
 * languages.iso_639_1 (two-letter codes) where currently NULL.
 *
 * The SIL file is tab-separated with columns:
 *   Id          — ISO 639-3 (3-letter code, matches our iso_639_3)
 *   Part2B      — ISO 639-2 bibliographic
 *   Part2T      — ISO 639-2 terminological
 *   Part1       — ISO 639-1 (2-letter, what we want)
 *   Scope       — I=Individual, M=Macrolanguage, S=Special
 *   Language_Type — Living, Extinct, Ancient, Historical, Constructed, Special
 *   Ref_Name    — Reference name
 *   Comment
 *
 * Only updates where Part1 is non-empty and our iso_639_1 is currently NULL.
 * Safe to re-run.
 *
 * Source: https://iso639-3.sil.org (public standard)
 */

import { supabase } from './lib/supabase';

const ISO639_TAB_URL =
  'https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3.tab';
const SOURCE_ID = '11111111-0000-0000-0000-000000000006';
const UPDATE_BATCH = 50;

async function main() {
  const { error: srcErr } = await supabase.from('sources').upsert({
    id: SOURCE_ID,
    name: 'ISO 639-3 SIL International',
    type: 'academic',
    url: 'https://iso639-3.sil.org',
    reliability_rating: 'high',
    notes: 'Authoritative ISO 639-3 code table maintained by SIL International. Public standard.',
  }, { onConflict: 'id' });
  if (srcErr) throw new Error(`Source upsert failed: ${srcErr.message}`);

  console.log('Fetching ISO 639-3 code table from SIL...');
  const res = await fetch(ISO639_TAB_URL, {
    headers: { 'User-Agent': 'TomorrowLabs-seed/1.0 (https://tomorrowlabs.org)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();

  const lines = text.split('\n');
  const headers = lines[0]?.split('\t') ?? [];

  const colIdx = {
    id: headers.indexOf('Id'),
    part1: headers.indexOf('Part1'),
    scope: headers.indexOf('Scope'),
    type: headers.indexOf('Language_Type'),
  };

  if (colIdx.id === -1) throw new Error(`No 'Id' column. Headers: ${headers.join(', ')}`);
  if (colIdx.part1 === -1) throw new Error(`No 'Part1' column. Headers: ${headers.join(', ')}`);

  // Build map: iso_639_3 → iso_639_1
  const iso1Map = new Map<string, string>();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;
    const cols = line.split('\t');
    const iso3 = cols[colIdx.id]?.trim() ?? '';
    const iso1 = cols[colIdx.part1]?.trim() ?? '';
    if (iso3 && iso1) iso1Map.set(iso3, iso1);
  }
  console.log(`Parsed ${iso1Map.size} ISO 639-3 → ISO 639-1 mappings\n`);

  // Fetch all DB languages that need iso_639_1 (paginated)
  console.log('Loading languages where iso_639_1 is NULL...');
  const DB_PAGE = 1000;
  const languages: Array<{ id: string; iso_639_3: string | null }> = [];
  for (let from = 0; ; from += DB_PAGE) {
    const { data, error } = await supabase
      .from('languages')
      .select('id, iso_639_3')
      .is('iso_639_1', null)
      .not('iso_639_3', 'is', null)
      .range(from, from + DB_PAGE - 1);
    if (error) throw new Error(`DB fetch: ${error.message}`);
    if (!data?.length) break;
    languages.push(...data);
    if (data.length < DB_PAGE) break;
  }
  console.log(`  ${languages.length} languages have iso_639_3 but no iso_639_1\n`);

  // Match and update
  const updates = languages.filter((l) => l.iso_639_3 && iso1Map.has(l.iso_639_3));
  console.log(`  ${updates.length} have an ISO 639-1 two-letter code available\n`);

  if (updates.length === 0) {
    console.log('Nothing to update.');
    return;
  }

  let updated = 0;
  let errors = 0;

  for (let i = 0; i < updates.length; i += UPDATE_BATCH) {
    const batch = updates.slice(i, i + UPDATE_BATCH);
    for (const lang of batch) {
      const iso1 = iso1Map.get(lang.iso_639_3!);
      if (!iso1) continue;
      const { error } = await supabase
        .from('languages')
        .update({ iso_639_1: iso1 })
        .eq('id', lang.id)
        .is('iso_639_1', null); // safety: never overwrite
      if (!error) updated++;
      else { errors++; }
    }
    process.stdout.write(`\r  ${Math.min(i + UPDATE_BATCH, updates.length)}/${updates.length} processed...`);
  }

  console.log(`\n\n=== Done ===`);
  console.log(`  ${updated} languages got iso_639_1`);
  console.log(`  ${updates.length - updated - errors} already had iso_639_1 (skipped by safety check)`);
  if (errors > 0) console.warn(`  ${errors} errors`);
  console.log(`  ${languages.length - updates.length} languages have no ISO 639-1 equivalent (normal — most languages don't)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
