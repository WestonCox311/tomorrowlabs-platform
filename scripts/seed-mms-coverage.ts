/**
 * seed-mms-coverage.ts
 *
 * Seeds language_models rows for Meta MMS (Massively Multilingual Speech).
 * Covers 1,107 languages for both ASR (STT) and TTS.
 * Uses ISO 639-3 codes which map directly to our languages.iso_639_3 column.
 *
 * Source: https://dl.fbaipublicfiles.com/mms/ (CC-BY-NC 4.0, no auth needed)
 *
 * Run: npm run seed:mms
 */

import { supabase } from './lib/supabase';

const MMS_ASR_URL = 'https://dl.fbaipublicfiles.com/mms/asr/mms1b_l1107_langs.html';
const MMS_TTS_URL = 'https://dl.fbaipublicfiles.com/mms/tts/all-tts-languages.html';

const SOURCE_ID = '11111111-0000-0000-0000-000000000011';
const PROVIDER = 'meta';
const LICENSE = 'cc-by-nc-4.0';
const MODEL_REPO = 'https://github.com/facebookresearch/fairseq/tree/main/examples/mms';

// MMS quality: usable for most languages, production only for high-resource ones.
// We mark the base as 'usable' — low-resource/endangered languages may be experimental
// but MMS is still the best available option for them.
const DEFAULT_QUALITY: 'usable' = 'usable';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Parse MMS HTML: each non-empty line (after stripping HTML tags) contains
 * either "iso_code\tLanguageName" or "iso_code   LanguageName" (with &emsp;).
 */
function parseMMSHtml(html: string): string[] {
  // Strip all HTML tags, decode &emsp; → space
  const text = html
    .replace(/<[^>]+>/g, '')
    .replace(/&emsp;/g, '\t')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  const codes: string[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Line format: "ace\tAbidji" or "ace Abidji"
    const parts = trimmed.split(/[\t\s]+/);
    const code = parts[0]?.trim();
    // ISO 639-3 codes are 3 lowercase letters
    if (code && /^[a-z]{3}$/.test(code)) {
      codes.push(code);
    }
  }
  return [...new Set(codes)]; // deduplicate
}

async function fetchAndParse(url: string, label: string): Promise<string[]> {
  console.log(`Fetching ${label}…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const codes = parseMMSHtml(html);
  console.log(`  → ${codes.length} language codes`);
  return codes;
}

async function seedModelType(
  codes: string[],
  modelName: string,
  modelType: 'stt' | 'tts',
  sourceUrl: string
): Promise<number> {
  const CHUNK = 50;
  let inserted = 0;

  for (let i = 0; i < codes.length; i += CHUNK) {
    const chunk = codes.slice(i, i + CHUNK);

    const { data: langRows, error } = await supabase
      .from('languages')
      .select('id, english_name')
      .in('iso_639_3', chunk);

    if (error) throw error;
    if (!langRows || langRows.length === 0) continue;

    const rows = langRows.map((lang) => ({
      language_id: lang.id,
      model_name: modelName,
      provider: PROVIDER,
      model_type: modelType,
      quality_tier: DEFAULT_QUALITY,
      is_open_source: true,
      license: LICENSE,
      source_url: sourceUrl,
      source_id: SOURCE_ID,
      notes: 'Coverage from Meta MMS mms1b model (1B parameter). Quality varies — production-grade for high-resource languages, experimental for low-resource.',
      last_verified_at: new Date().toISOString().slice(0, 10),
    }));

    const { error: insertErr } = await supabase
      .from('language_models')
      .insert(rows);

    if (insertErr && !insertErr.message.includes('duplicate')) {
      console.warn(`  Insert warning (chunk ${i}): ${insertErr.message}`);
    } else {
      inserted += rows.length;
    }

    if (i % 500 === 0 && i > 0) {
      console.log(`  ${modelName} — ${i}/${codes.length} processed…`);
      await sleep(200);
    }
  }

  return inserted;
}

async function main() {
  const [asrCodes, ttsCodes] = await Promise.all([
    fetchAndParse(MMS_ASR_URL, 'MMS ASR'),
    fetchAndParse(MMS_TTS_URL, 'MMS TTS'),
  ]);

  console.log('\nSeeding MMS ASR (STT)…');
  const asrInserted = await seedModelType(
    asrCodes,
    'MMS ASR (mms1b)',
    'stt',
    MODEL_REPO
  );
  console.log(`  Inserted: ${asrInserted}`);

  console.log('\nSeeding MMS TTS…');
  const ttsInserted = await seedModelType(
    ttsCodes,
    'MMS TTS',
    'tts',
    MODEL_REPO
  );
  console.log(`  Inserted: ${ttsInserted}`);

  const { count } = await supabase
    .from('language_models')
    .select('*', { count: 'exact', head: true })
    .eq('provider', 'meta');

  console.log(`\nDone. Total Meta MMS rows in DB: ${count}`);
  console.log('Note: Run migration-013 first if English is missing from results.');
}

main().catch((e) => { console.error(e); process.exit(1); });
