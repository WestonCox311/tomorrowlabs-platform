/**
 * seed-census-language-speakers.ts
 *
 * Seeds US language speaker counts from the American Community Survey (ACS)
 * 5-year estimates, table B16001: "Language Spoken at Home by Ability to
 * Speak English for the Population 5 Years and Over."
 *
 * Produces:
 *   geographic_concentrations — national row + one row per state/territory
 *   speaker_populations       — national US rows
 *
 * Source: US Census Bureau ACS 2022 5-year (covering 2018–2022).
 * Counts represent population 5+ years speaking the language at home.
 * Aggregate Census groups (e.g. "Thai, Lao, or other Tai-Kadai") are skipped;
 * only variables that map to a single language are included.
 *
 * Run: npm run seed:census-language-speakers
 * Optional: set CENSUS_API_KEY in .env.local for higher rate limits (500 req/day without key).
 *
 * NOTE: Run seed:wikidata-language-countries first so that is_diaspora_concentration
 * and is_official_language flags exist on US rows — this script inherits those flags.
 */

import { supabase } from './lib/supabase';

// ── constants ─────────────────────────────────────────────────────────────────

const ACS_YEAR = '2022';
const DATA_YEAR = 2022;

// Deterministic UUID for this source — must match any existing sources row.
const ACS_SOURCE_ID = '33333333-0000-0000-0000-000000000001';

// ── B16001 language variable map ──────────────────────────────────────────────
// Each ACS language group has 3 variables: total speakers, speak English well,
// speak English not well. We use the first (total) variable in each group.
// Pattern: group N's total is at B16001_{N*3}E.
// Aggregate groups (multiple unrelated languages) are omitted.

interface LangDef {
  varId: string;
  label: string;
  glottocode?: string;   // preferred lookup
  englishName?: string;  // fallback lookup against languages.english_name
}

const LANG_DEFS: LangDef[] = [
  { varId: 'B16001_003E', label: 'Spanish',              glottocode: 'stan1288' },
  { varId: 'B16001_006E', label: 'French',               englishName: 'French' },
  { varId: 'B16001_009E', label: 'Haitian Creole',       glottocode: 'hait1244' },
  { varId: 'B16001_012E', label: 'Italian',              englishName: 'Italian' },
  { varId: 'B16001_015E', label: 'Portuguese',           englishName: 'Portuguese' },
  { varId: 'B16001_018E', label: 'German',               englishName: 'German' },
  { varId: 'B16001_021E', label: 'Yiddish',              englishName: 'Yiddish' },
  // B16001_024E: Other West Germanic — skip (aggregate)
  // B16001_027E: Scandinavian — skip (aggregate)
  { varId: 'B16001_030E', label: 'Greek',                englishName: 'Greek' },
  { varId: 'B16001_033E', label: 'Russian',              glottocode: 'russ1263' },
  { varId: 'B16001_036E', label: 'Polish',               englishName: 'Polish' },
  // B16001_039E: Serbo-Croatian — skip (aggregate)
  { varId: 'B16001_042E', label: 'Ukrainian',            englishName: 'Ukrainian' },
  { varId: 'B16001_045E', label: 'Armenian',             englishName: 'Armenian' },
  { varId: 'B16001_048E', label: 'Persian',              englishName: 'Persian' },
  { varId: 'B16001_051E', label: 'Gujarati',             glottocode: 'guja1252' },
  { varId: 'B16001_054E', label: 'Hindi',                glottocode: 'hind1269' },
  { varId: 'B16001_057E', label: 'Urdu',                 glottocode: 'urdu1245' },
  { varId: 'B16001_060E', label: 'Punjabi',              englishName: 'Punjabi' },
  { varId: 'B16001_063E', label: 'Bengali',              glottocode: 'beng1280' },
  // B16001_066E: Nepali, Marathi, or other Indic — skip (aggregate)
  { varId: 'B16001_069E', label: 'Telugu',               glottocode: 'telu1262' },
  { varId: 'B16001_072E', label: 'Tamil',                glottocode: 'tami1289' },
  // B16001_075E: Malayalam, Kannada, or other Dravidian — skip (aggregate)
  { varId: 'B16001_078E', label: 'Sinhala',              englishName: 'Sinhala' },
  // B16001_081E: Other Indo-European — skip (aggregate)
  { varId: 'B16001_084E', label: 'Vietnamese',           glottocode: 'viet1252' },
  { varId: 'B16001_087E', label: 'Khmer',                glottocode: 'khme1253' },
  { varId: 'B16001_090E', label: 'Hmong',                englishName: 'Hmong' },
  // B16001_093E: Thai, Lao, or other Tai-Kadai — skip (aggregate)
  { varId: 'B16001_096E', label: 'Japanese',             englishName: 'Japanese' },
  { varId: 'B16001_099E', label: 'Korean',               glottocode: 'kore1280' },
  { varId: 'B16001_102E', label: 'Chinese',              englishName: 'Mandarin Chinese' },
  { varId: 'B16001_105E', label: 'Tagalog',              glottocode: 'taga1270' },
  // B16001_108E: Ilocano, Samoan, Hawaiian, or other Austronesian — skip (aggregate)
  { varId: 'B16001_111E', label: 'Arabic',               englishName: 'Arabic' },
  { varId: 'B16001_114E', label: 'Hebrew',               englishName: 'Hebrew' },
  // B16001_117E: Amharic, Somali, or other Afro-Asiatic — skip (aggregate)
  // B16001_120E: Yoruba, Twi, Igbo, or other West Africa — skip (aggregate)
  // B16001_123E: Swahili or other Bantu — skip (aggregate)
  { varId: 'B16001_126E', label: 'Navajo',               glottocode: 'nava1243' },
  // B16001_129E: Other Native North American — skip (aggregate)
];

// ── state FIPS → ISO 3166-2 ───────────────────────────────────────────────────

const FIPS_TO_ISO: Record<string, string> = {
  '01': 'US-AL', '02': 'US-AK', '04': 'US-AZ', '05': 'US-AR', '06': 'US-CA',
  '08': 'US-CO', '09': 'US-CT', '10': 'US-DE', '11': 'US-DC', '12': 'US-FL',
  '13': 'US-GA', '15': 'US-HI', '16': 'US-ID', '17': 'US-IL', '18': 'US-IN',
  '19': 'US-IA', '20': 'US-KS', '21': 'US-KY', '22': 'US-LA', '23': 'US-ME',
  '24': 'US-MD', '25': 'US-MA', '26': 'US-MI', '27': 'US-MN', '28': 'US-MS',
  '29': 'US-MO', '30': 'US-MT', '31': 'US-NE', '32': 'US-NV', '33': 'US-NH',
  '34': 'US-NJ', '35': 'US-NM', '36': 'US-NY', '37': 'US-NC', '38': 'US-ND',
  '39': 'US-OH', '40': 'US-OK', '41': 'US-OR', '42': 'US-PA', '44': 'US-RI',
  '45': 'US-SC', '46': 'US-SD', '47': 'US-TN', '48': 'US-TX', '49': 'US-UT',
  '50': 'US-VT', '51': 'US-VA', '53': 'US-WA', '54': 'US-WV', '55': 'US-WI',
  '56': 'US-WY', '72': 'US-PR',
};

// ── Census API ────────────────────────────────────────────────────────────────

async function fetchACS(geography: 'national' | 'states'): Promise<string[][]> {
  const varList = LANG_DEFS.map(d => d.varId).join(',');
  const forParam = geography === 'national' ? 'us:1' : 'state:*';
  const key = process.env.CENSUS_API_KEY;
  const keyParam = key ? `&key=${key}` : '';
  const url = `https://api.census.gov/data/${ACS_YEAR}/acs/acs5?get=NAME,${varList}&for=${forParam}${keyParam}`;

  console.log(`  Fetching ${geography} data from Census API...`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TomorrowLabs-Platform/1.0 (language-data-seed)' },
  });

  const body = await res.text();

  // Census API returns HTML for auth errors instead of JSON
  if (body.trimStart().startsWith('<')) {
    throw new Error(
      `Census API returned HTML (likely requires an API key).\n` +
      `Get a free key at: https://api.census.gov/data/key_signup.html\n` +
      `Then add CENSUS_API_KEY=your_key to .env.local and re-run.`
    );
  }

  if (!res.ok) {
    throw new Error(`Census API ${res.status}: ${body.slice(0, 200)}`);
  }

  return JSON.parse(body) as string[][];
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Census ACS Language Speaker Seed ===\n');

  // ── Step 1: ensure source record ─────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb.from('sources').upsert({
    id: ACS_SOURCE_ID,
    source_type: 'government_census',
    name: 'US Census Bureau — American Community Survey 5-Year Estimates',
    url: 'https://data.census.gov/table/ACSDT5Y2022.B16001',
    notes: 'Table B16001: Language Spoken at Home by Ability to Speak English, pop. 5 years and over. ACS 2022 5-year estimates (2018–2022).',
  }, { onConflict: 'id', ignoreDuplicates: false });

  // ── Step 2: build language lookup maps ───────────────────────────────────────
  console.log('Loading languages from DB...');
  const allLangs: Array<{ id: string; english_name: string; glottocode: string | null }> = [];
  const PAGE = 1000;
  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .from('languages')
      .select('id, english_name, glottocode')
      .range(page * PAGE, (page + 1) * PAGE - 1);
    if (error) throw new Error(`Failed to load languages page ${page}: ${error.message}`);
    if (!data?.length) break;
    allLangs.push(...data);
    if (data.length < PAGE) break;
  }
  console.log(`  Loaded ${allLangs.length} languages from DB`);

  const byGlottocode = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const lang of allLangs) {
    if (lang.glottocode) byGlottocode.set(lang.glottocode, lang.id);
    byName.set(lang.english_name.toLowerCase(), lang.id);
  }

  // Resolve each LangDef to a language_id
  type Resolved = { def: LangDef; languageId: string };
  const resolved: Resolved[] = [];
  for (const def of LANG_DEFS) {
    let id: string | undefined;
    if (def.glottocode) id = byGlottocode.get(def.glottocode);
    if (!id && def.englishName) id = byName.get(def.englishName.toLowerCase());
    if (!id) {
      console.warn(`  ⚠ No DB match: "${def.label}" (glottocode=${def.glottocode ?? '—'}, name=${def.englishName ?? '—'})`);
      continue;
    }
    resolved.push({ def, languageId: id });
  }
  console.log(`  Resolved ${resolved.length}/${LANG_DEFS.length} language definitions\n`);

  // ── Step 3: inherit diaspora/official flags from existing Wikidata rows ───────
  // ACS rows coexist with Wikidata rows. Carrying flags forward prevents
  // ACS data from silently clearing diaspora/official status on the places page.
  const { data: existingUS } = await sb
    .from('geographic_concentrations')
    .select('language_id, is_diaspora_concentration, is_official_language')
    .eq('country_code', 'US')
    .eq('region_type', 'country');

  const existingFlags = new Map<string, { isDiaspora: boolean; isOfficial: boolean }>();
  for (const row of existingUS ?? []) {
    existingFlags.set(row.language_id, {
      isDiaspora: row.is_diaspora_concentration ?? false,
      isOfficial: row.is_official_language ?? false,
    });
  }
  console.log(`  Inherited flags for ${existingFlags.size} languages from Wikidata rows\n`);

  // ── Step 4: fetch ACS data ────────────────────────────────────────────────────
  const [nationalRaw, statesRaw] = await Promise.all([
    fetchACS('national'),
    fetchACS('states'),
  ]);

  // First row of each response is the header
  const headers = nationalRaw[0]!;
  const varIndex = new Map<string, number>(headers.map((h, i) => [h, i]));

  function extractCounts(row: string[]): Map<string, number> {
    const out = new Map<string, number>();
    for (const { def } of resolved) {
      const idx = varIndex.get(def.varId);
      if (idx == null) continue;
      const n = parseInt(row[idx]!, 10);
      if (!isNaN(n) && n > 0) out.set(def.varId, n);
    }
    return out;
  }

  // ── Step 5: build rows ────────────────────────────────────────────────────────
  const gcRows: object[] = [];
  const spRows: object[] = [];

  // National
  const nationalCounts = extractCounts(nationalRaw[1]!);
  for (const { def, languageId } of resolved) {
    const speakers = nationalCounts.get(def.varId) ?? null;
    const flags = existingFlags.get(languageId) ?? { isDiaspora: false, isOfficial: false };
    gcRows.push({
      language_id: languageId,
      country_code: 'US',
      region: 'national',
      region_type: 'country',
      estimated_speakers: speakers,
      is_diaspora_concentration: flags.isDiaspora,
      is_official_language: flags.isOfficial,
      data_year: DATA_YEAR,
      confidence: 'high',
      source_id: ACS_SOURCE_ID,
    });
    if (speakers != null) {
      spRows.push({
        language_id: languageId,
        country_code: 'US',
        context: 'home',
        l1_speakers: speakers,
        data_year: DATA_YEAR,
        confidence: 'high',
        source_id: ACS_SOURCE_ID,
        notes: 'ACS 5-year 2022: population 5+ speaking language at home',
      });
    }
  }

  // States
  const stateHeaders = statesRaw[0]!;
  const stateFipsIdx = stateHeaders.indexOf('state');

  for (const stateRow of statesRaw.slice(1)) {
    const fips = stateRow[stateFipsIdx]!;
    const iso = FIPS_TO_ISO[fips];
    if (!iso) { console.warn(`  ⚠ Unknown FIPS: ${fips}`); continue; }

    const stateCounts = extractCounts(stateRow);
    for (const { def, languageId } of resolved) {
      const speakers = stateCounts.get(def.varId) ?? null;
      if (speakers == null) continue; // skip truly-zero states to keep table lean
      const flags = existingFlags.get(languageId) ?? { isDiaspora: false, isOfficial: false };
      gcRows.push({
        language_id: languageId,
        country_code: 'US',
        region: iso,
        region_type: 'state-province',
        estimated_speakers: speakers,
        is_diaspora_concentration: flags.isDiaspora,
        is_official_language: flags.isOfficial,
        data_year: DATA_YEAR,
        confidence: 'high',
        source_id: ACS_SOURCE_ID,
      });
    }
  }

  console.log(`\n  geographic_concentrations: ${gcRows.length} rows to insert`);
  console.log(`  speaker_populations:       ${spRows.length} rows to insert\n`);

  // ── Step 6: delete existing ACS rows and reinsert ─────────────────────────────
  console.log('Deleting existing ACS rows...');
  const { error: delGcErr } = await sb
    .from('geographic_concentrations')
    .delete()
    .eq('source_id', ACS_SOURCE_ID);
  if (delGcErr) throw new Error(`Delete gc failed: ${delGcErr.message}`);

  const { error: delSpErr } = await sb
    .from('speaker_populations')
    .delete()
    .eq('source_id', ACS_SOURCE_ID);
  if (delSpErr) throw new Error(`Delete sp failed: ${delSpErr.message}`);

  const BATCH = 500;

  let gcDone = 0;
  for (let i = 0; i < gcRows.length; i += BATCH) {
    const { error } = await sb.from('geographic_concentrations').insert(gcRows.slice(i, i + BATCH));
    if (error) throw new Error(`GC insert at ${i}: ${error.message}`);
    gcDone += Math.min(BATCH, gcRows.length - i);
    process.stdout.write(`\r  geographic_concentrations: ${gcDone}/${gcRows.length}`);
  }
  console.log();

  let spDone = 0;
  for (let i = 0; i < spRows.length; i += BATCH) {
    const { error } = await sb.from('speaker_populations').insert(spRows.slice(i, i + BATCH));
    if (error) throw new Error(`SP insert at ${i}: ${error.message}`);
    spDone += Math.min(BATCH, spRows.length - i);
    process.stdout.write(`\r  speaker_populations:       ${spDone}/${spRows.length}`);
  }
  console.log();

  console.log('\n✓ Done');
  console.log(`  Languages seeded: ${resolved.length}`);
  console.log(`  National rows: ${resolved.length} (gc) + ${spRows.length} (sp)`);
  console.log(`  State rows: ${gcRows.length - resolved.length} (gc)`);
  if (resolved.length < LANG_DEFS.length) {
    console.log(`\n  Note: ${LANG_DEFS.length - resolved.length} language definitions had no DB match.`);
    console.log('  Re-run seed:glottolog to ensure full language coverage, then retry.');
  }
}

main().catch(err => {
  console.error('\n✗ Fatal:', err.message ?? err);
  process.exit(1);
});
