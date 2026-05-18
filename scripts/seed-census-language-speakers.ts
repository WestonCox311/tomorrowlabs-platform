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

// B16001_002E: "Speak only English at home" — a lower-bound count for English.
// Total English speakers are higher (bilingual speakers aren't counted here),
// but this is the best available ACS signal and still correct at ~243M nationally.
const ENGLISH_VAR = 'B16001_002E';

// Variable layout verified against ACS 2022 B16001 group definition via Census API.
// The 2022 table merged Yiddish + Pennsylvania Dutch + other West Germanic into one
// aggregate (B16001_021E), eliminating the formerly separate Scandinavian group.
// This shifted all subsequent variables 6 positions earlier vs older ACS years.
const LANG_DEFS: LangDef[] = [
  { varId: 'B16001_003E', label: 'Spanish',              glottocode: 'stan1288' },
  { varId: 'B16001_006E', label: 'French',               englishName: 'French' },
  { varId: 'B16001_009E', label: 'Haitian Creole',       glottocode: 'hait1244' },
  { varId: 'B16001_012E', label: 'Italian',              englishName: 'Italian' },
  { varId: 'B16001_015E', label: 'Portuguese',           englishName: 'Portuguese' },
  { varId: 'B16001_018E', label: 'German',               englishName: 'German' },
  // B16001_021E: "Yiddish, Pennsylvania Dutch or other West Germanic" — skip (aggregate)
  { varId: 'B16001_024E', label: 'Greek',                glottocode: 'mode1248', englishName: 'Modern Greek' },
  { varId: 'B16001_027E', label: 'Russian',              glottocode: 'russ1263' },
  { varId: 'B16001_030E', label: 'Polish',               englishName: 'Polish' },
  // B16001_033E: Serbo-Croatian — skip (politically split language pair)
  // B16001_036E: "Ukrainian or other Slavic languages" — skip (aggregate)
  { varId: 'B16001_039E', label: 'Armenian',             glottocode: 'nucl1235', englishName: 'Eastern Armenian' },
  { varId: 'B16001_042E', label: 'Persian',              glottocode: 'west2369', englishName: 'Western Farsi' },
  { varId: 'B16001_045E', label: 'Gujarati',             glottocode: 'guja1252' },
  { varId: 'B16001_048E', label: 'Hindi',                glottocode: 'hind1269' },
  { varId: 'B16001_051E', label: 'Urdu',                 glottocode: 'urdu1245' },
  { varId: 'B16001_054E', label: 'Punjabi',              glottocode: 'panj1256', englishName: 'Eastern Panjabi' },
  { varId: 'B16001_057E', label: 'Bengali',              glottocode: 'beng1280' },
  // B16001_060E: "Nepali, Marathi, or other Indic languages" — skip (aggregate)
  // B16001_063E: "Other Indo-European languages" — skip (aggregate)
  { varId: 'B16001_066E', label: 'Telugu',               glottocode: 'telu1262' },
  { varId: 'B16001_069E', label: 'Tamil',                glottocode: 'tami1289' },
  // B16001_072E: "Malayalam, Kannada, or other Dravidian languages" — skip (aggregate)
  { varId: 'B16001_075E', label: 'Chinese',              englishName: 'Mandarin Chinese' },
  { varId: 'B16001_078E', label: 'Japanese',             englishName: 'Japanese' },
  { varId: 'B16001_081E', label: 'Korean',               glottocode: 'kore1280' },
  { varId: 'B16001_084E', label: 'Hmong',                englishName: 'Hmong' },
  { varId: 'B16001_087E', label: 'Vietnamese',           glottocode: 'viet1252' },
  { varId: 'B16001_090E', label: 'Khmer',                glottocode: 'cent1989', englishName: 'Central Khmer' },
  // B16001_093E: "Thai, Lao, or other Tai-Kadai languages" — skip (aggregate)
  // B16001_096E: "Other languages of Asia" — skip (aggregate)
  { varId: 'B16001_099E', label: 'Tagalog',              glottocode: 'taga1270' },
  // B16001_102E: "Ilocano, Samoan, Hawaiian, or other Austronesian languages" — skip (aggregate)
  { varId: 'B16001_105E', label: 'Arabic',               glottocode: 'stan1318', englishName: 'Standard Arabic' },
  { varId: 'B16001_108E', label: 'Hebrew',               glottocode: 'hebr1245', englishName: 'Modern Hebrew' },
  // B16001_111E: "Amharic, Somali, or other Afro-Asiatic languages" — skip (aggregate)
  // B16001_114E: "Yoruba, Twi, Igbo, or other languages of Western Africa" — skip (aggregate)
  // B16001_117E: "Swahili or other languages of Central, Eastern, and Southern Africa" — skip (aggregate)
  { varId: 'B16001_120E', label: 'Navajo',               glottocode: 'nava1243' },
  // B16001_123E: "Other Native languages of North America" — skip (aggregate)
  // B16001_126E: "Other and unspecified languages" — skip (aggregate)
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
  const varList = [ENGLISH_VAR, ...LANG_DEFS.map(d => d.varId)].join(',');
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
    type: 'census',
    name: 'US Census Bureau — American Community Survey 5-Year Estimates',
    url: 'https://data.census.gov/table/ACSDT5Y2022.B16001',
    reliability_rating: 'high',
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

  // ── Step 3: inherit diaspora/official/indigenous flags from existing Wikidata rows
  // ACS rows coexist with Wikidata rows. Carrying flags forward prevents
  // ACS data from silently clearing diaspora/official status on the places page.
  const { data: existingUS } = await sb
    .from('geographic_concentrations')
    .select('language_id, is_diaspora_concentration, is_official_language, is_indigenous_language')
    .eq('country_code', 'US')
    .eq('region_type', 'country');

  const existingFlags = new Map<string, { isDiaspora: boolean; isOfficial: boolean; isIndigenous: boolean }>();
  for (const row of existingUS ?? []) {
    existingFlags.set(row.language_id, {
      isDiaspora: row.is_diaspora_concentration ?? false,
      isOfficial: row.is_official_language ?? false,
      isIndigenous: row.is_indigenous_language ?? false,
    });
  }
  console.log(`  Inherited flags for ${existingFlags.size} languages from Wikidata rows`);

  // ── Step 3b: fetch P37 official countries for LANG_DEFS to set diaspora flags ─
  // For ACS languages without a Wikidata US row (no inherited flags), we need to
  // know if the language is an immigrant language (has an official home country
  // that isn't the US) vs. indigenous (no official home country at all).
  const defGlottocodes = resolved
    .map(r => r.def.glottocode)
    .filter((g): g is string => !!g);
  const vals = defGlottocodes.map(g => `"${g}"`).join(' ');
  const sparql = `SELECT ?glottolog ?countryCode WHERE {
  VALUES ?glottolog { ${vals} }
  ?lang wdt:P1394 ?glottolog .
  ?country wdt:P37 ?lang .
  ?country wdt:P297 ?countryCode .
} GROUP BY ?glottolog ?countryCode`;
  let p37Map = new Map<string, Set<string>>();
  try {
    const wdRes = await fetch(
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`,
      { headers: { 'User-Agent': 'TomorrowLabs-Platform/1.0', 'Accept': 'application/sparql-results+json' } }
    );
    const wdData = await wdRes.json() as { results: { bindings: Array<{ glottolog?: { value: string }; countryCode?: { value: string } }> } };
    for (const b of wdData.results.bindings) {
      const glot = b.glottolog?.value;
      const cc = b.countryCode?.value?.toUpperCase();
      if (glot && cc && cc.length === 2) {
        if (!p37Map.has(glot)) p37Map.set(glot, new Set());
        p37Map.get(glot)!.add(cc);
      }
    }
    console.log(`  P37 data fetched for ${p37Map.size}/${defGlottocodes.length} ACS language definitions\n`);
  } catch (e) {
    console.warn(`  ⚠ P37 lookup failed, falling back to inherited flags: ${(e as Error).message}\n`);
    p37Map = new Map();
  }

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
    // Include English var alongside all language defs
    for (const varId of [ENGLISH_VAR, ...resolved.map(r => r.def.varId)]) {
      const idx = varIndex.get(varId);
      if (idx == null) continue;
      const n = parseInt(row[idx]!, 10);
      if (!isNaN(n) && n > 0) out.set(varId, n);
    }
    return out;
  }

  // Resolve English language_id
  const englishId = byGlottocode.get('stan1293') ?? byName.get('english') ?? byName.get('standard english');
  if (!englishId) console.warn('  ⚠ Could not resolve English in DB — skipping');
  else console.log('  Resolved English');

  // ── Step 5: build rows ────────────────────────────────────────────────────────
  const gcRows: object[] = [];
  const spRows: object[] = [];

  // National
  const nationalCounts = extractCounts(nationalRaw[1]!);

  // English — inserted before other languages so it doesn't interfere with resolved loop
  if (englishId) {
    const englishSpeakers = nationalCounts.get(ENGLISH_VAR) ?? null;
    const englishFlags = existingFlags.get(englishId) ?? { isDiaspora: false, isOfficial: false, isIndigenous: false };
    gcRows.push({
      language_id: englishId,
      country_code: 'US',
      region: 'national',
      region_type: 'country',
      estimated_speakers: englishSpeakers,
      is_diaspora_concentration: englishFlags.isDiaspora,
      is_official_language: englishFlags.isOfficial,
      is_indigenous_language: englishFlags.isIndigenous,
      data_year: DATA_YEAR,
      confidence: 'high',
      source_id: ACS_SOURCE_ID,
    });
    if (englishSpeakers != null) {
      spRows.push({
        language_id: englishId,
        country_code: 'US',
        context: 'home',
        l1_speakers: englishSpeakers,
        data_year: DATA_YEAR,
        confidence: 'high',
        source_id: ACS_SOURCE_ID,
        notes: 'ACS 5-year 2022: English-only home speakers (B16001_002E). Bilingual English speakers counted under their other language.',
      });
    }
  }

  for (const { def, languageId } of resolved) {
    const speakers = nationalCounts.get(def.varId) ?? null;
    const flags = existingFlags.get(languageId) ?? { isDiaspora: false, isOfficial: false, isIndigenous: false };
    // Use P37 native-country data if available; fall back to inherited Wikidata flags.
    const nativeSet = def.glottocode ? p37Map.get(def.glottocode) : undefined;
    const isDiaspora = nativeSet && nativeSet.size > 0 ? !nativeSet.has('US') : flags.isDiaspora;
    gcRows.push({
      language_id: languageId,
      country_code: 'US',
      region: 'national',
      region_type: 'country',
      estimated_speakers: speakers,
      is_diaspora_concentration: isDiaspora,
      is_official_language: flags.isOfficial,
      is_indigenous_language: flags.isIndigenous,
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

    if (englishId) {
      const s = stateCounts.get(ENGLISH_VAR) ?? null;
      if (s != null) {
        const flags = existingFlags.get(englishId) ?? { isDiaspora: false, isOfficial: false, isIndigenous: false };
        gcRows.push({ language_id: englishId, country_code: 'US', region: iso, region_type: 'state-province', estimated_speakers: s, is_diaspora_concentration: flags.isDiaspora, is_official_language: flags.isOfficial, is_indigenous_language: flags.isIndigenous, data_year: DATA_YEAR, confidence: 'high', source_id: ACS_SOURCE_ID });
      }
    }

    for (const { def, languageId } of resolved) {
      const speakers = stateCounts.get(def.varId) ?? null;
      if (speakers == null) continue; // skip truly-zero states to keep table lean
      const flags = existingFlags.get(languageId) ?? { isDiaspora: false, isOfficial: false, isIndigenous: false };
      const nativeSet = def.glottocode ? p37Map.get(def.glottocode) : undefined;
      const isDiaspora = nativeSet && nativeSet.size > 0 ? !nativeSet.has('US') : flags.isDiaspora;
      gcRows.push({
        language_id: languageId,
        country_code: 'US',
        region: iso,
        region_type: 'state-province',
        estimated_speakers: speakers,
        is_diaspora_concentration: isDiaspora,
        is_official_language: flags.isOfficial,
        is_indigenous_language: flags.isIndigenous,
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
