/**
 * seed-phoible.ts
 *
 * Fetches PHOIBLE CLDF and upserts phonological inventories into
 * linguistic_features. Each row = one phoneme present in one language's
 * inventory.
 *
 *   feature_code  = 'PHOIBLE:' + phoneme symbol  (e.g. 'PHOIBLE:kʰ')
 *   feature_value = segment class ('consonant', 'vowel', 'tone')
 *   feature_name  = phoneme symbol  (e.g. 'kʰ')
 *
 * PHOIBLE sometimes has multiple source inventories for the same language.
 * Rows are deduplicated by (language, phoneme) — if any source lists a
 * phoneme for a language, it's stored as present. The UNIQUE constraint
 * on linguistic_features(language_id, feature_code) handles this.
 *
 * Coverage: ~2,177 languages, ~3,164 distinct phonemes, ~105K source rows.
 * After deduplication: ~60K–80K (language, phoneme) pairs.
 *
 * Match strategy: PHOIBLE uses Glottocodes → joined to languages.glottocode.
 * Run time: ~2–3 min.
 * Safe to re-run: upsert on UNIQUE(language_id, feature_code).
 *
 * Source: https://github.com/cldf-datasets/phoible (CC BY 4.0)
 * Citation: Moran & McCloy (eds.) 2019, PHOIBLE 2.0.
 */

import { supabase } from './lib/supabase';

const PARAMS_URL =
  'https://raw.githubusercontent.com/cldf-datasets/phoible/master/cldf/parameters.csv';
const VALUES_URL =
  'https://raw.githubusercontent.com/cldf-datasets/phoible/master/cldf/values.csv';
const SOURCE_ID = '11111111-0000-0000-0000-000000000018';
const BATCH_SIZE = 1000;
const FEATURE_PREFIX = 'PHOIBLE:';

async function main() {
  // Register source
  const { error: srcErr } = await supabase.from('sources').upsert(
    {
      id: SOURCE_ID,
      name: 'PHOIBLE',
      type: 'academic',
      url: 'https://github.com/cldf-datasets/phoible',
      reliability_rating: 'high',
      notes:
        'PHOIBLE 2.0 CLDF. ~3,000 phonological inventories across ~2,177 languages. ' +
        'Moran & McCloy (eds.) 2019. CC BY 4.0.',
    },
    { onConflict: 'id' }
  );
  if (srcErr) throw new Error(`Source upsert failed: ${srcErr.message}`);

  // ------------------------------------------------------------------
  // 1. Load parameters.csv — build phoneme UUID → {symbol, segmentClass}
  //    Columns: ID, Name, Description, SegmentClass, ...
  //    None of the first 4 columns have commas — safe to use indexOf split.
  // ------------------------------------------------------------------
  console.log('Fetching PHOIBLE parameters.csv...');
  const paramsRes = await fetch(PARAMS_URL);
  if (!paramsRes.ok) throw new Error(`HTTP ${paramsRes.status}: ${paramsRes.statusText}`);
  const paramsText = await paramsRes.text();

  const paramMap = new Map<string, { symbol: string; segmentClass: string }>();
  const plines = paramsText.split('\n');
  for (let i = 1; i < plines.length; i++) {
    const line = plines[i]?.trim();
    if (!line) continue;
    const c1 = line.indexOf(',');
    const c2 = line.indexOf(',', c1 + 1);
    const c3 = line.indexOf(',', c2 + 1);
    const c4 = line.indexOf(',', c3 + 1);
    if (c4 === -1) continue;
    const uuid = line.slice(0, c1).trim();
    const symbol = line.slice(c1 + 1, c2).trim();
    const segmentClass = line.slice(c3 + 1, c4).trim();
    if (uuid && symbol && segmentClass) {
      paramMap.set(uuid, { symbol, segmentClass });
    }
  }
  console.log(`  ${paramMap.size} phoneme definitions loaded`);

  // ------------------------------------------------------------------
  // 2. Load values.csv — build Set of (glottocode, phoneme_symbol) pairs
  //    Columns: ID, Language_ID, Parameter_ID, Value, ...
  //    Deduplicate across inventory sources.
  // ------------------------------------------------------------------
  console.log('Fetching PHOIBLE values.csv...');
  const valuesRes = await fetch(VALUES_URL);
  if (!valuesRes.ok) throw new Error(`HTTP ${valuesRes.status}: ${valuesRes.statusText}`);
  const valuesText = await valuesRes.text();

  // glottocode → Map<phoneme_symbol, segment_class>
  const byGlottocode = new Map<string, Map<string, string>>();
  const vlines = valuesText.split('\n');
  let parseErrors = 0;

  for (let i = 1; i < vlines.length; i++) {
    const line = vlines[i]?.trim();
    if (!line) continue;
    const c1 = line.indexOf(',');
    const c2 = line.indexOf(',', c1 + 1);
    const c3 = line.indexOf(',', c2 + 1);
    const c4 = line.indexOf(',', c3 + 1);
    if (c4 === -1) { parseErrors++; continue; }

    const glottocode = line.slice(c1 + 1, c2).trim();
    const paramUuid = line.slice(c2 + 1, c3).trim();
    const phoneme = line.slice(c3 + 1, c4).trim();

    if (!glottocode || !paramUuid || !phoneme) continue;

    const param = paramMap.get(paramUuid);
    const segmentClass = param?.segmentClass ?? 'consonant';

    if (!byGlottocode.has(glottocode)) byGlottocode.set(glottocode, new Map());
    byGlottocode.get(glottocode)!.set(phoneme, segmentClass);
  }

  const totalPairs = Array.from(byGlottocode.values()).reduce((s, m) => s + m.size, 0);
  console.log(`  ${byGlottocode.size} languages, ${totalPairs} unique (language, phoneme) pairs`);
  if (parseErrors > 0) console.warn(`  ${parseErrors} lines skipped (parse errors)`);

  // ------------------------------------------------------------------
  // 3. Build glottocode → language_id map
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
    feature_name: string;
    feature_value: string;
    confidence: 'estimated';
  };

  const rows: FeatureRow[] = [];
  for (const [glottocode, phonemes] of byGlottocode) {
    const languageId = glottocodeToId.get(glottocode);
    if (!languageId) continue;
    for (const [phoneme, segmentClass] of phonemes) {
      rows.push({
        language_id: languageId,
        source_id: SOURCE_ID,
        feature_code: FEATURE_PREFIX + phoneme,
        feature_name: phoneme,
        feature_value: segmentClass,
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
    if (inserted % 20000 === 0) console.log(`  ${inserted} / ${rows.length} rows...`);
  }

  console.log(`\nPHOIBLE seed complete: ${inserted} rows upserted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
