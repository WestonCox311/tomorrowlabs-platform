/**
 * seed-common-voice.ts
 *
 * Fetches Mozilla Common Voice language statistics and inserts audio_corpora rows.
 * Also updates tech_readiness.common_voice_hours_validated for languages not yet
 * having that value set.
 *
 * Coverage: ~130 languages with validated audio hours (CC0).
 *
 * Matching: CV uses BCP 47 locale codes. We match against languages via:
 *   1. iso_639_3 for 3-character codes (e.g. "kmr", "ckb")
 *   2. iso_639_1 for 2-character codes (e.g. "en", "fr")
 *   3. Base of subtag codes (e.g. "pt-BR" → "pt" → iso_639_1)
 *
 * Idempotency: audio_corpora rows for source='mozilla-common-voice' from
 * this source_id are deleted before re-insert.
 *
 * Source: https://commonvoice.mozilla.org (CC0)
 */

import { supabase } from './lib/supabase';

const CV_API_URL = 'https://commonvoice.mozilla.org/api/v1/stats/languages';
const CV_DATASET_URL = 'https://commonvoice.mozilla.org/en/datasets';
const SOURCE_ID = '11111111-0000-0000-0000-000000000004';

type CVLanguageStat = {
  locale: string;
  hours_validated?: number;
  validatedHours?: number;
  num_speakers?: number;
  numSpeakers?: number;
  speakers?: number;
  [key: string]: unknown;
};

async function fetchCVStats(): Promise<CVLanguageStat[]> {
  const res = await fetch(CV_API_URL, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'TomorrowLabs-seed/1.0 (https://tomorrowlabs.org)',
    },
  });
  if (!res.ok) throw new Error(`Common Voice API HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json() as CVLanguageStat[] | Record<string, unknown>;
  // API may return array or object keyed by locale
  if (Array.isArray(data)) return data;
  // If it's an object, convert to array
  return Object.entries(data).map(([locale, val]) => ({
    locale,
    ...(typeof val === 'object' && val !== null ? (val as Record<string, unknown>) : {}),
  }));
}

function extractHours(stat: CVLanguageStat): number | null {
  const raw = stat.hours_validated ?? stat.validatedHours ?? stat['validated_hours'] ?? null;
  if (raw == null) return null;
  const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
  return isNaN(n) || n <= 0 ? null : n;
}

function extractSpeakers(stat: CVLanguageStat): number | null {
  const raw = stat.num_speakers ?? stat.numSpeakers ?? stat.speakers ?? null;
  if (raw == null) return null;
  const n = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
  return isNaN(n) || n <= 0 ? null : n;
}

async function main() {
  const { error: srcErr } = await supabase.from('sources').upsert({
    id: SOURCE_ID,
    name: 'Mozilla Common Voice',
    type: 'academic',
    url: CV_DATASET_URL,
    reliability_rating: 'high',
    notes: 'Mozilla Common Voice crowdsourced speech dataset. CC0 license. Updated with each dataset release.',
  }, { onConflict: 'id' });
  if (srcErr) throw new Error(`Source upsert failed: ${srcErr.message}`);

  console.log('Fetching Mozilla Common Voice language stats...');
  const stats = await fetchCVStats();
  console.log(`  ${stats.length} languages returned from CV API\n`);

  if (stats.length === 0) {
    console.error('No data from Common Voice API — the endpoint may have changed.');
    console.error(`Tried: ${CV_API_URL}`);
    process.exit(1);
  }

  // Load all DB languages with their ISO codes for matching
  console.log('Loading languages from database...');
  const DB_PAGE = 1000;
  const languages: Array<{ id: string; glottocode: string; iso_639_3: string | null; iso_639_1: string | null }> = [];
  for (let from = 0; ; from += DB_PAGE) {
    const { data, error } = await supabase
      .from('languages')
      .select('id, glottocode, iso_639_3, iso_639_1')
      .range(from, from + DB_PAGE - 1);
    if (error) throw new Error(`DB fetch: ${error.message}`);
    if (!data?.length) break;
    languages.push(...data);
    if (data.length < DB_PAGE) break;
  }
  console.log(`  ${languages.length} languages in DB\n`);

  // Build lookup maps
  const byIso3 = new Map<string, string>(); // iso_639_3 → language_id
  const byIso1 = new Map<string, string>(); // iso_639_1 → language_id
  for (const l of languages) {
    if (l.iso_639_3) byIso3.set(l.iso_639_3, l.id);
    if (l.iso_639_1) byIso1.set(l.iso_639_1, l.id);
  }

  // Load existing tech_readiness to know which languages already have CV hours set
  const { data: trData } = await supabase
    .from('tech_readiness')
    .select('id, language_id, common_voice_hours_validated');
  const trByLang = new Map<string, { id: string; cv_hours: number | null }>();
  for (const tr of trData ?? []) {
    trByLang.set(tr.language_id, { id: tr.id, cv_hours: tr.common_voice_hours_validated });
  }

  // Match CV locales to language IDs
  type MatchedStat = CVLanguageStat & { language_id: string; hours: number };
  const matched: MatchedStat[] = [];
  const unmatched: string[] = [];

  for (const stat of stats) {
    const hours = extractHours(stat);
    if (!hours) continue;

    const locale = stat.locale ?? '';
    const base = locale.includes('-') ? locale.split('-')[0] : locale;

    let langId: string | undefined;
    if (base.length === 3) {
      langId = byIso3.get(base);
    } else if (base.length === 2) {
      langId = byIso1.get(base);
    }

    if (langId) {
      matched.push({ ...stat, language_id: langId, hours });
    } else {
      unmatched.push(locale);
    }
  }

  console.log(`Matched ${matched.length} CV languages to DB entries`);
  if (unmatched.length > 0) {
    console.log(`Unmatched locales (${unmatched.length}): ${unmatched.join(', ')}\n`);
  }

  // Delete existing audio_corpora rows from this source, then insert
  console.log('\nClearing existing Common Voice audio_corpora rows...');
  const { error: delErr } = await supabase
    .from('audio_corpora')
    .delete()
    .eq('source_id', SOURCE_ID);
  if (delErr) console.warn(`  Delete warning: ${delErr.message}`);

  const today = new Date().toISOString().split('T')[0];
  const corpusRows: Array<Record<string, unknown>> = matched.map((s) => ({
    language_id: s.language_id,
    corpus_name: `Common Voice ${s.locale}`,
    source: 'mozilla-common-voice',
    validated_hours: s.hours,
    speaker_count: extractSpeakers(s),
    speech_type: 'read',
    license: 'CC0',
    community_consent_documented: false,
    audio_quality: 'variable',
    url: `https://commonvoice.mozilla.org/en/datasets`,
    last_updated: today,
    source_id: SOURCE_ID,
    notes: `BCP 47 locale: ${s.locale}`,
  }));

  let inserted = 0;
  const BATCH = 200;
  for (let i = 0; i < corpusRows.length; i += BATCH) {
    const { error } = await supabase.from('audio_corpora').insert(corpusRows.slice(i, i + BATCH));
    if (!error) inserted += Math.min(BATCH, corpusRows.length - i);
    else console.warn(`  audio_corpora insert error: ${error.message}`);
    process.stdout.write(`\r  Inserting audio_corpora rows: ${inserted}/${corpusRows.length}...`);
  }
  console.log(`\n  Inserted ${inserted} audio_corpora rows\n`);

  // Update tech_readiness.common_voice_hours_validated where not yet set
  console.log('Updating tech_readiness.common_voice_hours_validated...');
  let trUpdated = 0;
  for (const s of matched) {
    const tr = trByLang.get(s.language_id);
    if (!tr) continue; // no tech_readiness row for this language
    if (tr.cv_hours != null) continue; // already set, don't overwrite

    const { error } = await supabase
      .from('tech_readiness')
      .update({ common_voice_hours_validated: s.hours })
      .eq('id', tr.id)
      .is('common_voice_hours_validated', null);
    if (!error) trUpdated++;
  }
  console.log(`  Updated ${trUpdated} tech_readiness rows with CV hours\n`);

  console.log('=== Done ===');
  console.log(`  CV languages from API:      ${stats.length}`);
  console.log(`  Matched to DB languages:    ${matched.length}`);
  console.log(`  audio_corpora rows:         ${inserted}`);
  console.log(`  tech_readiness updated:     ${trUpdated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
