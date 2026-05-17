/**
 * seed-glottolog-endangerment.ts
 *
 * Fetches Glottolog CLDF values.csv (endangerment classifications) and:
 *   1. Inserts vitality_assessments rows (egids_level + unesco_vitality)
 *   2. Updates languages.ethnologue_status where currently NULL
 *
 * Glottolog's Agglomerated Endangerment Status (AES) maps to our enums:
 *
 *   Glottolog AES     │ egids_level        │ unesco_vitality        │ ethnologue_status
 *   ──────────────────┼────────────────────┼────────────────────────┼──────────────────
 *   not endangered    │ 6a-vigorous        │ safe                   │ (skip — could be International/National)
 *   threatened        │ 6b-threatened      │ definitely-endangered  │ Threatened
 *   shifting          │ 7-shifting         │ severely-endangered    │ Shifting
 *   moribund          │ 8a-moribund        │ critically-endangered  │ Moribund
 *   nearly extinct    │ 8b-nearly-extinct  │ critically-endangered  │ Moribund
 *   extinct           │ 10-extinct         │ extinct                │ (skip — no enum value)
 *
 * Idempotency:
 *   - vitality_assessments rows for this source_id are deleted before re-insert
 *   - ethnologue_status only updated where currently NULL
 *
 * Source: https://github.com/glottolog/glottolog-cldf (CC BY 4.0)
 */

import { supabase } from './lib/supabase';

const PARAMS_CSV_URL =
  'https://raw.githubusercontent.com/glottolog/glottolog-cldf/master/cldf/parameters.csv';
const VALUES_CSV_URL =
  'https://raw.githubusercontent.com/glottolog/glottolog-cldf/master/cldf/values.csv';
const SOURCE_ID = '11111111-0000-0000-0000-000000000005';
const INSERT_BATCH = 500;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inQuotes) {
      inQuotes = true;
    } else if (ch === '"' && inQuotes) {
      if (line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = false;
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// Maps Glottolog AES value text to our enum values
type AESMapping = {
  egids: string | null;
  unesco: string | null;
  ethnologue: string | null; // our ethnologue_status enum value
};

const AES_MAPPINGS: Record<string, AESMapping> = {
  'not endangered': { egids: '6a-vigorous', unesco: 'safe', ethnologue: null },
  'threatened':     { egids: '6b-threatened', unesco: 'definitely-endangered', ethnologue: 'Threatened' },
  'shifting':       { egids: '7-shifting', unesco: 'severely-endangered', ethnologue: 'Shifting' },
  'moribund':       { egids: '8a-moribund', unesco: 'critically-endangered', ethnologue: 'Moribund' },
  'nearly extinct': { egids: '8b-nearly-extinct', unesco: 'critically-endangered', ethnologue: 'Moribund' },
  'extinct':        { egids: '10-extinct', unesco: 'extinct', ethnologue: null },
};

async function fetchCSV(url: string, label: string): Promise<string> {
  console.log(`Fetching ${label}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

async function findEndangermentParameterID(paramsText: string): Promise<string> {
  const lines = paramsText.split('\n');
  const headers = parseCSVLine(lines[0] ?? '');
  const idIdx = headers.indexOf('ID');
  const nameIdx = headers.indexOf('Name');
  if (idIdx === -1 || nameIdx === -1) {
    throw new Error(`parameters.csv missing ID or Name column. Headers: ${headers.join(', ')}`);
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;
    const cols = parseCSVLine(line);
    const name = (cols[nameIdx] ?? '').toLowerCase();
    if (name.includes('endangerment')) {
      const id = cols[idIdx]?.trim() ?? '';
      console.log(`  Found endangerment parameter: ID="${id}", Name="${cols[nameIdx]}"`);
      return id;
    }
  }
  throw new Error('No endangerment parameter found in parameters.csv');
}

async function main() {
  const { error: srcErr } = await supabase.from('sources').upsert({
    id: SOURCE_ID,
    name: 'Glottolog CLDF Endangerment',
    type: 'academic',
    url: 'https://github.com/glottolog/glottolog-cldf',
    reliability_rating: 'high',
    notes: 'Glottolog Agglomerated Endangerment Status (AES). CC BY 4.0. Academic consensus across multiple frameworks.',
  }, { onConflict: 'id' });
  if (srcErr) throw new Error(`Source upsert failed: ${srcErr.message}`);

  // Find the endangerment parameter ID
  const paramsText = await fetchCSV(PARAMS_CSV_URL, 'parameters.csv');
  const endangermentParamID = await findEndangermentParameterID(paramsText);

  // Parse values.csv for endangerment rows
  const valuesText = await fetchCSV(VALUES_CSV_URL, 'values.csv');
  const valueLines = valuesText.split('\n');
  const valueHeaders = parseCSVLine(valueLines[0] ?? '');

  const vIdx = {
    langId: valueHeaders.indexOf('Language_ID'),
    paramId: valueHeaders.indexOf('Parameter_ID'),
    value: valueHeaders.indexOf('Value'),
  };

  if (vIdx.langId === -1 || vIdx.paramId === -1 || vIdx.value === -1) {
    throw new Error(`values.csv missing expected columns. Headers: ${valueHeaders.join(', ')}`);
  }

  // glottocode → AES value text
  const endangermentMap = new Map<string, string>();
  for (let i = 1; i < valueLines.length; i++) {
    const line = valueLines[i]?.trim();
    if (!line) continue;
    const cols = parseCSVLine(line);
    const paramId = cols[vIdx.paramId]?.trim() ?? '';
    if (paramId !== endangermentParamID) continue;
    const glottocode = cols[vIdx.langId]?.trim() ?? '';
    const value = (cols[vIdx.value] ?? '').toLowerCase().trim();
    if (glottocode && value) endangermentMap.set(glottocode, value);
  }
  console.log(`\nParsed ${endangermentMap.size} endangerment records\n`);

  // Load all DB languages
  console.log('Loading languages from database...');
  const DB_PAGE = 1000;
  const languages: Array<{ id: string; glottocode: string; ethnologue_status: string | null }> = [];
  for (let from = 0; ; from += DB_PAGE) {
    const { data, error } = await supabase
      .from('languages')
      .select('id, glottocode, ethnologue_status')
      .range(from, from + DB_PAGE - 1);
    if (error) throw new Error(`DB fetch: ${error.message}`);
    if (!data?.length) break;
    languages.push(...data);
    if (data.length < DB_PAGE) break;
  }
  console.log(`  ${languages.length} languages in DB\n`);

  // Match and build update lists
  type VitalityRow = Record<string, unknown>;
  const vitRows: VitalityRow[] = [];
  const ethUpdates: Array<{ id: string; status: string }> = [];
  let matchCount = 0;

  const today = new Date().toISOString().split('T')[0];

  for (const lang of languages) {
    const aesValue = endangermentMap.get(lang.glottocode);
    if (!aesValue) continue;
    const mapping = AES_MAPPINGS[aesValue];
    if (!mapping) continue;
    matchCount++;

    // Build vitality_assessments row
    const vitRow: VitalityRow = {
      language_id: lang.id,
      assessment_date: today,
      assessment_scope: 'global',
      source_id: SOURCE_ID,
      confidence: 'medium',
      rationale: `Glottolog AES: "${aesValue}".`,
    };
    if (mapping.egids) vitRow.egids_level = mapping.egids;
    if (mapping.unesco) vitRow.unesco_vitality = mapping.unesco;
    vitRows.push(vitRow);

    // ethnologue_status update (only if currently NULL and mapping has a value)
    if (mapping.ethnologue && lang.ethnologue_status == null) {
      ethUpdates.push({ id: lang.id, status: mapping.ethnologue });
    }
  }

  console.log(`Matched ${matchCount} languages to Glottolog endangerment data`);
  console.log(`  ${vitRows.length} vitality assessment rows to insert`);
  console.log(`  ${ethUpdates.length} ethnologue_status values to fill\n`);

  // Delete existing vitality rows for this source, then insert
  console.log('Clearing existing Glottolog vitality rows...');
  const { error: delErr } = await supabase
    .from('vitality_assessments')
    .delete()
    .eq('source_id', SOURCE_ID);
  if (delErr) console.warn(`  Delete warning: ${delErr.message}`);

  let vitInserted = 0;
  for (let i = 0; i < vitRows.length; i += INSERT_BATCH) {
    const { error } = await supabase.from('vitality_assessments').insert(vitRows.slice(i, i + INSERT_BATCH));
    if (!error) vitInserted += Math.min(INSERT_BATCH, vitRows.length - i);
    else console.warn(`  vitality insert error: ${error.message}`);
    process.stdout.write(`\r  Inserting vitality rows: ${vitInserted}/${vitRows.length}...`);
  }
  console.log(`\n  Inserted ${vitInserted} vitality_assessments rows\n`);

  // Update ethnologue_status where NULL
  console.log('Updating ethnologue_status...');
  const UPDATE_BATCH = 50;
  let ethUpdated = 0;
  for (let i = 0; i < ethUpdates.length; i += UPDATE_BATCH) {
    const batch = ethUpdates.slice(i, i + UPDATE_BATCH);
    for (const u of batch) {
      const { error } = await supabase
        .from('languages')
        .update({ ethnologue_status: u.status })
        .eq('id', u.id)
        .is('ethnologue_status', null);
      if (!error) ethUpdated++;
    }
    process.stdout.write(`\r  Updating ethnologue_status: ${Math.min(i + UPDATE_BATCH, ethUpdates.length)}/${ethUpdates.length}...`);
  }
  console.log(`\n  Updated ${ethUpdated} ethnologue_status values\n`);

  console.log('=== Done ===');
  console.log(`  Languages matched:         ${matchCount}`);
  console.log(`  vitality_assessments:      ${vitInserted} rows inserted`);
  console.log(`  ethnologue_status:         ${ethUpdated} values filled`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
