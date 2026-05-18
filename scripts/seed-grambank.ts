/**
 * seed-grambank.ts
 *
 * Fetches Grambank CLDF data and upserts into linguistic_features.
 * Covers 2,467 languages × 195 grammatical features (word order, morphology,
 * tonal structure, article systems, case marking, etc.).
 *
 * Values: '0'=absent, '1'=present, '2'/'3'=multi-value, '?'=undetermined.
 * All stored — '?' is meaningful ("coded but unclear"), not the same as missing.
 *
 * Match strategy: Grambank uses Glottocodes. Joined to languages.glottocode.
 * Expected: ~360K rows matched (some Grambank glottocodes won't be in our DB
 * because we only seed level='language' from Glottolog, not dialects).
 *
 * Run time: ~5–10 min (443K rows, batches of 1000).
 * Safe to re-run: upsert on UNIQUE(language_id, feature_code).
 *
 * Source: https://github.com/grambank/grambank (CC BY 4.0)
 * Citation: Skirgård et al. 2023, Science Advances.
 */

import { supabase } from './lib/supabase';

const PARAMS_URL =
  'https://raw.githubusercontent.com/grambank/grambank/master/cldf/parameters.csv';
const VALUES_URL =
  'https://raw.githubusercontent.com/grambank/grambank/master/cldf/values.csv';
const SOURCE_ID = '11111111-0000-0000-0000-000000000016';
const BATCH_SIZE = 1000;

async function main() {
  // Register source
  const { error: srcErr } = await supabase.from('sources').upsert(
    {
      id: SOURCE_ID,
      name: 'Grambank',
      type: 'academic',
      url: 'https://github.com/grambank/grambank',
      reliability_rating: 'high',
      notes:
        'Grambank CLDF release. 2,467 languages × 195 grammatical features. ' +
        'Skirgård et al. 2023 (Science Advances). CC BY 4.0.',
    },
    { onConflict: 'id' }
  );
  if (srcErr) throw new Error(`Source upsert failed: ${srcErr.message}`);

  // ------------------------------------------------------------------
  // 1. Load feature names from parameters.csv
  //    The Description field has embedded newlines (quoted), so we parse
  //    line-by-line and only extract lines that start with a GB code.
  // ------------------------------------------------------------------
  console.log('Fetching Grambank parameters.csv...');
  const paramsRes = await fetch(PARAMS_URL);
  if (!paramsRes.ok) throw new Error(`HTTP ${paramsRes.status}: ${paramsRes.statusText}`);
  const paramsText = await paramsRes.text();

  const featureNames = new Map<string, string>();
  const gbLineRe = /^(GB\d{3}),([^,\n]+)/;
  for (const line of paramsText.split('\n')) {
    const m = line.match(gbLineRe);
    if (m) {
      const name = m[2]!.replace(/^"|"$/g, '').trim();
      featureNames.set(m[1]!, name);
    }
  }
  console.log(`  ${featureNames.size} feature definitions loaded`);

  // ------------------------------------------------------------------
  // 2. Load values.csv (~52 MB)
  //    Columns: ID, Language_ID, Parameter_ID, Value, Code_ID, Comment, ...
  //    First 4 columns are always plain (no commas / quotes) so we can
  //    use indexOf-based splitting safely.
  // ------------------------------------------------------------------
  console.log('Fetching Grambank values.csv (~52 MB)...');
  const valuesRes = await fetch(VALUES_URL);
  if (!valuesRes.ok) throw new Error(`HTTP ${valuesRes.status}: ${valuesRes.statusText}`);
  const valuesText = await valuesRes.text();

  // Build glottocode → [{feature_code, value}]
  const byGlottocode = new Map<string, Array<{ feature_code: string; value: string }>>();
  const vlines = valuesText.split('\n');
  let parseErrors = 0;

  for (let i = 1; i < vlines.length; i++) {
    const line = vlines[i]?.trim();
    if (!line) continue;

    // Fast field extraction for first 4 columns
    const c1 = line.indexOf(',');
    const c2 = line.indexOf(',', c1 + 1);
    const c3 = line.indexOf(',', c2 + 1);
    const c4 = line.indexOf(',', c3 + 1);
    if (c4 === -1) { parseErrors++; continue; }

    const glottocode = line.slice(c1 + 1, c2).trim();
    const featureCode = line.slice(c2 + 1, c3).trim();
    const value = line.slice(c3 + 1, c4).trim();

    if (!glottocode || !featureCode || !value) continue;

    if (!byGlottocode.has(glottocode)) byGlottocode.set(glottocode, []);
    byGlottocode.get(glottocode)!.push({ feature_code: featureCode, value });
  }

  console.log(`  ${byGlottocode.size} unique glottocodes in values`);
  if (parseErrors > 0) console.warn(`  ${parseErrors} lines skipped (parse errors)`);

  // ------------------------------------------------------------------
  // 3. Build glottocode → language_id map from our DB
  //    Query in pages of 1000 to stay within Supabase URL limits.
  // ------------------------------------------------------------------
  console.log('Loading language IDs from database...');
  const glottocodes = Array.from(byGlottocode.keys());
  const glottocodeToId = new Map<string, string>();
  const PAGE = 1000;

  for (let offset = 0; offset < glottocodes.length; offset += PAGE) {
    const batch = glottocodes.slice(offset, offset + PAGE);
    const { data, error } = await supabase
      .from('languages')
      .select('id, glottocode')
      .in('glottocode', batch);
    if (error) throw new Error(`Language lookup failed: ${error.message}`);
    for (const lang of data ?? []) {
      if (lang.glottocode) glottocodeToId.set(lang.glottocode, lang.id);
    }
  }
  console.log(`  ${glottocodeToId.size} / ${glottocodes.length} glottocodes matched in DB`);

  // ------------------------------------------------------------------
  // 4. Build upsert rows
  // ------------------------------------------------------------------
  type FeatureRow = {
    language_id: string;
    source_id: string;
    feature_code: string;
    feature_name: string | null;
    feature_value: string;
    confidence: 'estimated';
  };

  const rows: FeatureRow[] = [];
  for (const [glottocode, features] of byGlottocode) {
    const languageId = glottocodeToId.get(glottocode);
    if (!languageId) continue;
    for (const { feature_code, value } of features) {
      rows.push({
        language_id: languageId,
        source_id: SOURCE_ID,
        feature_code,
        feature_name: featureNames.get(feature_code) ?? null,
        feature_value: value,
        confidence: 'estimated',
      });
    }
  }
  console.log(`  ${rows.length} rows to upsert`);

  // ------------------------------------------------------------------
  // 5. Batch upsert
  // ------------------------------------------------------------------
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('linguistic_features')
      .upsert(batch, { onConflict: 'language_id,feature_code' });
    if (error) throw new Error(`Upsert failed at offset ${i}: ${error.message}`);
    inserted += batch.length;
    if (inserted % 50000 === 0) console.log(`  ${inserted} / ${rows.length} rows...`);
  }

  console.log(`\nGrambank seed complete: ${inserted} rows upserted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
