/**
 * seed-geonames.ts
 *
 * Fetches GeoNames countryInfo.txt and upserts all ~250 countries into the
 * `places` table. Safe to run multiple times — conflicts on geonames_id are
 * ignored so that manually seeded records (Cambodia, Guatemala, etc.) are
 * left intact.
 *
 * Source: https://download.geonames.org/export/dump/countryInfo.txt (CC BY 4.0)
 */

import { supabase } from './lib/supabase';

const GEONAMES_URL =
  'https://download.geonames.org/export/dump/countryInfo.txt';

const BATCH_SIZE = 50;

async function main() {
  console.log('Fetching GeoNames countryInfo.txt...');
  const res = await fetch(GEONAMES_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();

  type PlaceRow = {
    english_name: string;
    granularity: 'country';
    geonames_id: string;
    iso_3166_1_alpha2: string;
    iso_3166_1_alpha3: string | null;
    status: 'active';
    geonames_validated: boolean;
    geonames_last_synced: string;
  };

  const records: PlaceRow[] = [];

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    // Skip comment lines and the header line
    if (!line || line.startsWith('#')) continue;

    const cols = line.split('\t');
    // countryInfo.txt columns (0-indexed):
    // 0: ISO  1: ISO3  2: ISO-Numeric  3: fips  4: Country  5: Capital
    // 6: Area  7: Population  8: Continent  9: tld  10: CurrencyCode
    // 11: CurrencyName  12: Phone  13: PostalCodeFormat  14: PostalCodeRegex
    // 15: Languages  16: geonameid  17: neighbours  18: EquivalentFipsCode
    const iso2 = cols[0]?.trim() ?? '';
    const iso3 = cols[1]?.trim() || null;
    const name = cols[4]?.trim() ?? '';
    const geonameid = cols[16]?.trim() ?? '';

    if (!iso2 || !name || !geonameid) continue;

    records.push({
      english_name: name,
      granularity: 'country',
      geonames_id: geonameid,
      iso_3166_1_alpha2: iso2,
      iso_3166_1_alpha3: iso3,
      status: 'active',
      geonames_validated: true,
      geonames_last_synced: new Date().toISOString().split('T')[0]!,
    });
  }

  console.log(`Parsed ${records.length} countries`);
  console.log('Upserting to Supabase (skipping conflicts on geonames_id)...');

  let total = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error, data } = await supabase
      .from('places')
      .upsert(batch, {
        onConflict: 'geonames_id',
        ignoreDuplicates: true,
      })
      .select('id');

    if (error) {
      console.error(`\nError at batch starting index ${i}: ${error.message}`);
      errors++;
      if (errors > 3) {
        console.error('Too many errors — aborting.');
        process.exit(1);
      }
    } else {
      const inserted = data?.length ?? 0;
      const batchSkipped = batch.length - inserted;
      total += inserted;
      skipped += batchSkipped;
    }

    process.stdout.write(
      `\r  ${total} inserted, ${skipped} already existed...`
    );
  }

  console.log(`\n\nDone. ${total} countries inserted, ${skipped} already existed.`);
  if (errors > 0) console.warn(`${errors} batch(es) had errors.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
