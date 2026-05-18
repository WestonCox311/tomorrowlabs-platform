/**
 * seed-whisper-coverage.ts
 *
 * Seeds language_models rows for all languages supported by OpenAI Whisper.
 * Source: LANGUAGES dict in whisper/tokenizer.py (MIT license, no auth needed).
 *
 * Run: npm run seed:whisper
 */

import { supabase } from './lib/supabase';

const TOKENIZER_URL =
  'https://raw.githubusercontent.com/openai/whisper/main/whisper/tokenizer.py';

const SOURCE_ID = '11111111-0000-0000-0000-000000000010';
const MODEL_NAME = 'Whisper Large v3';
const PROVIDER = 'openai';
const MODEL_TYPE = 'stt';
const QUALITY_TIER = 'production';
const LICENSE = 'mit';
const SOURCE_URL = 'https://github.com/openai/whisper';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Extract the LANGUAGES dict from whisper/tokenizer.py */
function parseWhisperLanguages(source: string): Record<string, string> {
  // Match: LANGUAGES = {\n  "en": "english",\n ...}
  const match = source.match(/LANGUAGES\s*=\s*\{([^}]+)\}/s);
  if (!match) throw new Error('Could not find LANGUAGES dict in tokenizer.py');

  const entries: Record<string, string> = {};
  const lineRe = /"([^"]+)"\s*:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(match[1])) !== null) {
    entries[m[1]] = m[2];
  }
  return entries;
}

async function main() {
  console.log('Fetching Whisper tokenizer.py…');
  const res = await fetch(TOKENIZER_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const source = await res.text();

  const languages = parseWhisperLanguages(source);
  const codes = Object.keys(languages);
  console.log(`Found ${codes.length} Whisper languages`);

  // Look up language_ids by iso_639_1 in batches
  const CHUNK = 50;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < codes.length; i += CHUNK) {
    const chunk = codes.slice(i, i + CHUNK);

    const { data: langRows, error: langErr } = await supabase
      .from('languages')
      .select('id, english_name, iso_639_1, iso_639_3')
      .in('iso_639_1', chunk);

    if (langErr) throw langErr;
    if (!langRows || langRows.length === 0) {
      skipped += chunk.length;
      continue;
    }

    // Also try matching via iso_639_3 for 3-letter Whisper codes (e.g. 'haw', 'yue')
    const threeLetterCodes = chunk.filter((c) => c.length === 3);
    let extraRows: typeof langRows = [];
    if (threeLetterCodes.length > 0) {
      // Exclude languages already matched by iso_639_1
      const alreadyMatchedIds = new Set(langRows.map((r) => r.id));
      const { data: extra } = await supabase
        .from('languages')
        .select('id, english_name, iso_639_1, iso_639_3')
        .in('iso_639_3', threeLetterCodes);
      extraRows = (extra ?? []).filter((r) => !alreadyMatchedIds.has(r.id));
    }

    const allMatched = [...langRows, ...extraRows];

    const rows = allMatched.map((lang) => ({
      language_id: lang.id,
      model_name: MODEL_NAME,
      provider: PROVIDER,
      model_type: MODEL_TYPE,
      quality_tier: QUALITY_TIER,
      is_open_source: true,
      license: LICENSE,
      source_url: SOURCE_URL,
      source_id: SOURCE_ID,
      last_verified_at: new Date().toISOString().slice(0, 10),
    }));

    if (rows.length === 0) {
      skipped += chunk.length;
      continue;
    }

    // Upsert — skip if language already has a Whisper STT row
    const { error: upsertErr } = await supabase
      .from('language_models')
      .upsert(rows, { onConflict: 'language_id,model_name,model_type', ignoreDuplicates: true });

    if (upsertErr) {
      // No unique constraint exists — use insert with duplicate handling
      const { error: insertErr } = await supabase
        .from('language_models')
        .insert(rows);

      if (insertErr && !insertErr.message.includes('duplicate')) {
        console.warn(`Insert warning at chunk ${i}: ${insertErr.message}`);
      }
    }

    inserted += rows.length;
    skipped += chunk.length - rows.length;

    if (i % 200 === 0 && i > 0) {
      console.log(`  Processed ${i}/${codes.length}…`);
      await sleep(500);
    }
  }

  // Verify
  const { count } = await supabase
    .from('language_models')
    .select('*', { count: 'exact', head: true })
    .eq('provider', 'openai');

  console.log(`\nDone. Inserted: ${inserted}, Skipped (no match): ${skipped}`);
  console.log(`Total Whisper rows in DB: ${count}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
