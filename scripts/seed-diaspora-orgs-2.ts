/**
 * seed-diaspora-orgs-2.ts
 *
 * Seeds ~28 additional diaspora and heritage-language community organizations
 * into the `organizations` table. Extends the first batch (seed-diaspora-orgs.ts)
 * with communities not yet covered: Central American indigenous (Mayan, Oaxacan),
 * Pacific Islander (Tongan, Samoan, Chamorro, Marshallese), South/Southeast Asian
 * (Punjabi/Sikh, Tamil, Karen/Burmese), East African (Ethiopian, Eritrean),
 * Haitian Creole, Urban Native, Arabic-speaking, and Andean/Quechua.
 *
 * DATA QUALITY NOTE:
 * All records have confidence: 'low'. Details were collected via desktop
 * research in May 2026 and should be verified before any outreach. Legal
 * names may not exactly match IRS/state filings.
 *
 * IDEMPOTENCY:
 * Script checks for existing records by legal_name before inserting.
 * Running multiple times is safe. The `organization_relationships` table
 * is append-only; no updates are made.
 *
 * Run: npm run seed:diaspora-orgs-2
 */

import { supabase } from './lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Source record
// ─────────────────────────────────────────────────────────────────────────────
const SOURCE_ID = '11111111-1111-1111-1111-111111111207';
const SOURCE_NAME = 'TomorrowLabs Diaspora Org Research Batch 2 — May 2026';

// ─────────────────────────────────────────────────────────────────────────────
// Organization definitions
// ─────────────────────────────────────────────────────────────────────────────
interface OrgDef {
  legal_name: string;
  display_name?: string;
  organization_type: string;
  incorporation_status: string;
  geographic_scope: string;
  founding_year?: number;
  primary_url?: string;
  mission_statement?: string;
  focus_areas: string[];
  city_lookup?: string;
  notes: string;
}

const ORGANIZATIONS: OrgDef[] = [
  // ── Central American Indigenous (Mayan / Oaxacan) ─────────────────────────
  {
    legal_name: 'Centro Binacional para el Desarrollo Indígena Oaxaqueño',
    display_name: 'CBDIO',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    primary_url: 'https://www.centrobinacional.org',
    mission_statement:
      'Organizing and advocating for Indigenous Oaxacan immigrant communities through legal, health, and cultural services.',
    focus_areas: [
      'indigenous-oaxacan',
      'mixtec',
      'zapotec',
      'triqui',
      'chatino',
      'indigenous-language-preservation',
      'farmworkers',
      'central-valley',
    ],
    city_lookup: 'Fresno',
    notes:
      'Fresno, CA (also Madera and Monterey counties). Serves 13+ indigenous Oaxacan language communities including Mixtec, Zapotec, Triqui, Chatino, Tlapaneco, and Amuzgo. Provides interpretation in indigenous languages — deep language-community alignment. Research date: May 2026.',
  },
  {
    legal_name: 'East Bay Sanctuary Covenant',
    display_name: 'EBSC',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 1982,
    primary_url: 'https://eastbaysanctuary.org',
    mission_statement:
      'Providing immigration legal services and community support for low-income immigrants and asylum seekers in the East Bay.',
    focus_areas: [
      'mam-maya',
      'guatemalan-indigenous',
      'immigration-legal-services',
      'central-american-diaspora',
      'mam-language',
    ],
    city_lookup: 'Oakland',
    notes:
      'Oakland/Berkeley, CA. Houses the Voces Maya program — the sole dedicated Mam-language outreach team in the Bay Area, operated by Mam-speaking staff. Co-founded Radio B\'alam, the first US community radio station broadcasting in Mam. Strongest documented Mam community touchpoint in California. Research date: May 2026.',
  },
  {
    legal_name: 'Mundo Maya Foundation',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://mundomayafoundation.com',
    mission_statement:
      'Serving Yucatec Maya immigrants in Los Angeles through education, immigration, health, and indigenous cultural preservation.',
    focus_areas: [
      'yucatec-maya',
      'guatemalan-indigenous',
      'mayan-languages',
      'indigenous-cultural-preservation',
      'los-angeles',
    ],
    city_lookup: 'Los Angeles',
    notes:
      'Los Angeles, CA. Serves Yucatec Maya immigrants specifically. "La Cultura Cura" (culture heals) framework — indigenous Maya cultural and language identity are core to all programs. Strong mission alignment with TomorrowLabs. Research date: May 2026.',
  },
  {
    legal_name: 'The Guatemalan-Maya Center',
    display_name: 'Centro Maya',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 1992,
    primary_url: 'https://www.guatemalanmaya.org',
    mission_statement:
      'Serving Indigenous Guatemalan-Maya refugee families through healthcare, food, education, legal services, and cultural preservation.',
    focus_areas: [
      'guatemalan-indigenous',
      'mayan-languages',
      'refugee-resettlement',
      'indigenous-cultural-preservation',
      'florida',
    ],
    city_lookup: 'Florida',
    notes:
      'Lake Worth Beach, FL. Oldest and most documented Guatemalan-Maya service organization in the US (30+ years). Founded by and for Maya people. Multiple Mayan language communities served. Strong national reference org even if no West Coast presence. Research date: May 2026.',
  },

  // ── Pacific Islander ───────────────────────────────────────────────────────
  {
    legal_name: 'Empowering Pacific Islander Communities',
    display_name: 'EPIC',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'national',
    primary_url: 'https://www.empoweredpi.org',
    mission_statement:
      'Building power and voice for Pacific Islander communities through social justice advocacy, leadership development, and research.',
    focus_areas: [
      'pacific-islander',
      'samoan',
      'tongan',
      'marshallese',
      'nhpi-advocacy',
      'los-angeles',
    ],
    city_lookup: 'Los Angeles',
    notes:
      'Los Angeles, CA. National anchor org for Native Hawaiian and Pacific Islander communities. Network of 35+ NHPI orgs across the US. Strong advocacy and data infrastructure; serves as gateway to Samoan, Tongan, Marshallese, and Chuukese communities. Research date: May 2026.',
  },
  {
    legal_name: 'Taulama for Tongans',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 2001,
    primary_url: 'https://www.taulama.org',
    mission_statement:
      'Providing health, education, and social services for Tongan and Pacific Islander communities in the San Francisco Bay Area.',
    focus_areas: ['tongan', 'pacific-islander', 'health', 'education', 'bay-area', 'tongan-language'],
    city_lookup: 'San Mateo',
    notes:
      'San Mateo, CA (serves San Mateo and Alameda counties). Maintains a translator database for Pacific Islander languages. Tongan language translation and cultural programming documented. Research date: May 2026.',
  },
  {
    legal_name: 'Tongan Community Service Center',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://tonganla.org',
    mission_statement:
      'Providing social services, immigration support, employment assistance, and cultural programs for the Southern California Tongan community.',
    focus_areas: [
      'tongan',
      'pacific-islander',
      'social-services',
      'immigration',
      'cultural-preservation',
      'tongan-language',
    ],
    city_lookup: 'Los Angeles',
    notes:
      'Hawthorne, CA (Los Angeles County). Has served Southern California Tongan community since the 1980s. Language assistance and cultural community hub. Research date: May 2026.',
  },
  {
    legal_name: 'Guam Communications Network',
    display_name: 'GCN',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://guamcomnet.wordpress.com',
    mission_statement:
      'Providing multi-service support and cultural preservation for Chamorro communities in Los Angeles and surrounding counties.',
    focus_areas: ['chamorro', 'pacific-islander', 'cultural-preservation', 'chamorro-language', 'los-angeles'],
    city_lookup: 'Long Beach Metro',
    notes:
      'Long Beach, CA. Sole multi-service agency for Chamorros in LA, Orange, Riverside, and San Bernardino counties. Created first Chamorro Arts and Cultural Center in the continental US. Chamorro language and cultural preservation is explicit in mission. Research date: May 2026.',
  },
  {
    legal_name: 'Arkansas Coalition of Marshallese',
    display_name: 'ACOM',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 2011,
    primary_url: 'https://www.arkansasmarshallese.org',
    mission_statement:
      'Providing community services, advocacy, and literacy programs for the Marshallese community in Northwest Arkansas.',
    focus_areas: [
      'marshallese',
      'pacific-islander',
      'literacy',
      'community-services',
      'marshallese-language',
    ],
    city_lookup: 'Arkansas',
    notes:
      'Springdale, AR — largest mainland Marshallese community in the US. Literacy classes delivered in Marshallese. Strong language-community alignment. Notable outside the West Coast but important for Marshallese language track. Research date: May 2026.',
  },

  // ── South / Southeast Asian (Punjabi, Tamil, Karen/Burmese) ───────────────
  {
    legal_name: 'Jakara Movement',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    primary_url: 'https://www.jakara.org',
    mission_statement:
      'Building Punjabi Sikh community power in California through grassroots leadership and civic engagement.',
    focus_areas: [
      'punjabi-diaspora',
      'sikh-community',
      'punjabi-language',
      'youth-leadership',
      'central-valley',
      'civic-engagement',
    ],
    city_lookup: 'Fresno',
    notes:
      'Fresno, CA — chapters across 15 California counties. Largest grassroots Punjabi Sikh youth org in California. Services provided in Punjabi. Strong community trust in Central Valley farmworker Punjabi community. Research date: May 2026.',
  },
  {
    legal_name: 'Punjabi American Heritage Society',
    display_name: 'PAHS',
    organization_type: 'cultural-institution',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://www.punjabiheritage.org',
    mission_statement:
      'Preserving and celebrating Punjabi American heritage through language classes, cultural instruction, and community education.',
    focus_areas: [
      'punjabi-diaspora',
      'punjabi-language',
      'cultural-preservation',
      'heritage-language-education',
      'california',
    ],
    city_lookup: 'California',
    notes:
      'Yuba City, CA. Operates Sunday Punjabi language school and senior center. Language classes, cultural instruction, and archival preservation are core programs. Direct heritage language education mission — strong Babagigi alignment. Research date: May 2026.',
  },
  {
    legal_name: 'Federation of Tamil Sangams of North America',
    display_name: 'FeTNA',
    organization_type: 'professional-association',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'national',
    primary_url: 'https://fetna.org',
    mission_statement:
      'Promoting Tamil language, literature, and cultural heritage among the Tamil diaspora across North America.',
    focus_areas: [
      'tamil-diaspora',
      'tamil-language',
      'cultural-preservation',
      'heritage-language-education',
      'diaspora-umbrella',
    ],
    notes:
      'National umbrella for Tamil diaspora associations; multiple California chapters. Tamil language preservation explicitly in mission. Supports heritage language schools. National network reach useful for Babagigi Tamil-speaking diaspora strategy. Research date: May 2026.',
  },
  {
    legal_name: 'Burma Refugee Families & Newcomers',
    display_name: 'BRFN',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://www.brfn.org',
    mission_statement:
      'Providing social services, cultural bridging, and community support for refugees from Burma and other newcomers in the Bay Area.',
    focus_areas: [
      'burmese-diaspora',
      'karen',
      'chin',
      'refugee-resettlement',
      'cultural-preservation',
      'bay-area',
    ],
    city_lookup: 'Oakland',
    notes:
      'Oakland, CA. Serves Karen, Chin, and Burmese refugees alongside East African communities. "Cultural bridging and preservation" listed as a core service. Linguistically appropriate services in multiple Myanmar languages. Research date: May 2026.',
  },
  {
    legal_name: 'Coalition for Refugees from Burma',
    display_name: 'CRB',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    focus_areas: [
      'burmese-diaspora',
      'karen',
      'chin',
      'refugee-resettlement',
      'early-childhood',
      'seattle',
    ],
    city_lookup: 'Seattle',
    notes:
      'Seattle, WA. Mutual assistance association for Burmese refugees. Culturally and linguistically appropriate services; early learning, youth, and family support in Karen, Chin, and Burmese. WA CAPAA member. Verify current URL — primarily listed through directory. Research date: May 2026.',
  },

  // ── East African (Ethiopian / Eritrean) ────────────────────────────────────
  {
    legal_name: 'Ethiopian Community in Los Angeles',
    display_name: 'ECLA',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://www.eclosangeles.org',
    mission_statement:
      'Strengthening the Ethiopian immigrant community in Los Angeles through immigration, mental health, youth, and senior programs.',
    focus_areas: [
      'ethiopian-diaspora',
      'amharic-language',
      'refugee-resettlement',
      'social-services',
      'los-angeles',
    ],
    city_lookup: 'Los Angeles',
    notes:
      'Los Angeles, CA. Civic and social services for Ethiopian immigrants in greater LA. Bilingual Amharic services throughout; Amharic language classes in program goals. Research date: May 2026.',
  },
  {
    legal_name: 'Little Ethiopia Cultural & Resource Center',
    display_name: 'LECRC',
    organization_type: 'cultural-institution',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://www.lecrc-la.com',
    mission_statement:
      'Advancing the social, economic, and cultural wellbeing of Ethiopians and other communities in Los Angeles.',
    focus_areas: [
      'ethiopian-diaspora',
      'amharic-language',
      'cultural-preservation',
      'los-angeles',
      'little-ethiopia',
    ],
    city_lookup: 'Los Angeles',
    notes:
      'Los Angeles, CA — Little Ethiopia neighborhood. Cultural education and community identity programs in Amharic. Distinct from ECLA; community-facing cultural hub vs. social services. Research date: May 2026.',
  },
  {
    legal_name: 'Eritrean Community Center of San Francisco',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 1984,
    primary_url: 'http://www.sferitrean.com',
    mission_statement:
      'Supporting Eritrean immigrant integration and community in San Francisco through ESL, legal, economic, and cultural programs.',
    focus_areas: [
      'eritrean-diaspora',
      'tigrinya-language',
      'cultural-preservation',
      'immigrant-services',
      'san-francisco',
    ],
    city_lookup: 'San Francisco',
    notes:
      'San Francisco, CA. Serving Eritrean community since 1984. Tigrinya language classes documented (high school-level heritage language instruction). Cultural preservation explicit in founding mission. Research date: May 2026.',
  },
  {
    legal_name: 'Eritrean Community Center of Oakland',
    display_name: 'ECC Oakland',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://www.eccoakland.org',
    mission_statement:
      'Helping Eritreans in the Bay Area overcome cultural, linguistic, and institutional barriers through community and cultural literacy programs.',
    focus_areas: [
      'eritrean-diaspora',
      'tigrinya-language',
      'cultural-preservation',
      'literacy',
      'oakland',
    ],
    city_lookup: 'Oakland',
    notes:
      'Oakland, CA. "Cultural Literacy" program listed on website; Tigrinya language instruction. Distinct from the SF center — serves East Bay Eritrean community. Research date: May 2026.',
  },

  // ── Haitian / Haitian Creole ───────────────────────────────────────────────
  {
    legal_name: 'Sant La Haitian Neighborhood Center',
    display_name: 'Sant La',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://www.santla.org',
    mission_statement:
      'Empowering the Haitian-American community in South Florida through education, employment, financial stability, and cultural competency programs.',
    focus_areas: [
      'haitian-diaspora',
      'haitian-creole',
      'cultural-preservation',
      'economic-mobility',
      'florida',
    ],
    city_lookup: 'Florida',
    notes:
      'North Miami, FL. Largest US Haitian diaspora is in South Florida. Runs "Survival Creole" and "Crash Creole" cultural programs; Teleskopi Creole-language TV show. Creole-forward community identity. Primary reference org for Haitian Creole heritage community. Research date: May 2026.',
  },
  {
    legal_name: 'Haitian Creole Language Institute of New York',
    display_name: 'HCLI',
    organization_type: 'academic-institution',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    primary_url: 'https://haitiancreoleinstitute.com',
    mission_statement:
      'Teaching Haitian Creole through a cultural lens with dedicated programming for heritage learners in the diaspora.',
    focus_areas: [
      'haitian-diaspora',
      'haitian-creole',
      'heritage-language-education',
      'diaspora-education',
    ],
    city_lookup: 'New York',
    notes:
      'Brooklyn, NY. Dedicated heritage learner track for diaspora children and adults. Explicit Creole language preservation mission. Language institute model — high Babagigi partnership potential for Haitian Creole content. Research date: May 2026.',
  },

  // ── Urban Native (American Indian / Alaska Native) ─────────────────────────
  {
    legal_name: 'United American Indian Involvement',
    display_name: 'UAII',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://uaii.org',
    mission_statement:
      'Providing health and human services for urban American Indians and Alaska Natives in Los Angeles while reconnecting them to their languages, cultures, and traditions.',
    focus_areas: [
      'urban-native',
      'american-indian',
      'alaska-native',
      'indigenous-language-preservation',
      'cultural-preservation',
      'los-angeles',
    ],
    city_lookup: 'Los Angeles',
    notes:
      'Los Angeles, CA. Largest nonprofit provider of health and human services for urban American Indians in LA. NADDAR program (drum, dance, regalia). Mission explicitly includes reconnecting urban Native people to languages and traditions. Strong indigenous language alignment. Research date: May 2026.',
  },
  {
    legal_name: 'American Indian Cultural Center of San Francisco',
    display_name: 'AICCSF',
    organization_type: 'cultural-institution',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://www.aiccsf.org',
    mission_statement:
      'Supporting urban Native communities in the Bay Area through cultural programs, oral tradition preservation, advocacy, and education.',
    focus_areas: [
      'urban-native',
      'american-indian',
      'indigenous-language-preservation',
      'oral-tradition',
      'cultural-preservation',
      'san-francisco',
    ],
    city_lookup: 'San Francisco',
    notes:
      'San Francisco, CA. Mission explicitly includes "oral traditions, tribal languages and cultures." Powwow Drum & Dance and traditional arts programs. Bay Area urban Native anchor org. Research date: May 2026.',
  },

  // ── Arabic-Speaking Diaspora ───────────────────────────────────────────────
  {
    legal_name: 'Arab Cultural and Community Center',
    display_name: 'ACCC',
    organization_type: 'cultural-institution',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    founding_year: 1973,
    primary_url: 'https://www.arabculturecenter.org',
    mission_statement:
      'Advancing the social, cultural, and civic wellbeing of Arab Americans and immigrants through Arabic language classes, ESL, social services, and cultural programs.',
    focus_areas: [
      'arab-diaspora',
      'arabic-language',
      'heritage-language-education',
      'cultural-preservation',
      'san-francisco',
    ],
    city_lookup: 'San Francisco',
    notes:
      'San Francisco, CA. Founded 1973 — oldest and largest Arab cultural organization in California. Arabic language classes for adults and children are a core program. Serves Lebanese, Palestinian, Yemeni, Moroccan, and Egyptian community members. Over 50 years of cultural and language work. High heritage-language alignment. Research date: May 2026.',
  },
  {
    legal_name: 'House of Palestine San Diego',
    display_name: 'House of Palestine',
    organization_type: 'cultural-institution',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://houseofpalestine.org',
    mission_statement:
      'Preserving and sharing Palestinian cultural heritage through traditional embroidery, dance, music, storytelling, and language programs.',
    focus_areas: [
      'palestinian-diaspora',
      'arabic-language',
      'cultural-preservation',
      'oral-tradition',
      'san-diego',
    ],
    city_lookup: 'California',
    notes:
      'San Diego, CA — located at Balboa Park International Cottages. Palestinian cultural center with explicit heritage and language preservation through arts: tatreez (embroidery), dabke dance, music, storytelling. Research date: May 2026.',
  },

  // ── Andean / Quechua ──────────────────────────────────────────────────────
  {
    legal_name: 'The Quechua Alliance',
    organization_type: 'informal-collective',
    incorporation_status: 'community-collective',
    geographic_scope: 'national',
    primary_url: 'https://thequechua.org',
    mission_statement:
      'Promoting and celebrating Quechua language and Andean culture among Quechua-speaking diaspora communities across the United States.',
    focus_areas: [
      'quechua',
      'andean-diaspora',
      'bolivian-quechua',
      'peruvian-quechua',
      'indigenous-language-preservation',
      'diaspora-network',
    ],
    notes:
      'US-based national network (distributed, no single city). Annual gathering hosted at universities (UC Berkeley, CUNY, etc.). Serves Bolivian, Peruvian, and Ecuadoran Quechua-speaking diaspora. Note: network/movement org, not a direct service provider — approach for partnership and community connection rather than program delivery. Research date: May 2026.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' seed-diaspora-orgs-2: Diaspora Organizations Batch 2');
  console.log('═══════════════════════════════════════════════════════════');

  // 1. Upsert source record
  console.log('\n[1/4] Ensuring source record exists...');
  const { error: sourceErr } = await (supabase as any)
    .from('sources')
    .upsert(
      {
        id: SOURCE_ID,
        name: SOURCE_NAME,
        type: 'internal',
        accessed_date: '2026-05-19',
        reliability_rating: 'low',
        notes:
          'TomorrowLabs internal desktop research, May 2026 — batch 2. Covers Mayan/Oaxacan indigenous, Pacific Islander, Punjabi/Sikh, Tamil, Karen/Burmese, Ethiopian, Eritrean, Haitian Creole, Urban Native, Arabic-speaking, and Quechua communities. Verify details before outreach.',
      },
      { onConflict: 'id' }
    );
  if (sourceErr) {
    console.error('Failed to upsert source:', sourceErr.message);
    process.exit(1);
  }
  console.log(`  ✓ Source record ready: ${SOURCE_ID}`);

  // 2. Look up TomorrowLabs org ID
  console.log('\n[2/4] Looking up TomorrowLabs organization...');
  const { data: tlOrg, error: tlErr } = await (supabase as any)
    .from('organizations')
    .select('id')
    .eq('legal_name', 'TomorrowLabs')
    .single();
  if (tlErr || !tlOrg) {
    console.error('Could not find TomorrowLabs organization. Run initial migrations first.');
    process.exit(1);
  }
  const tlOrgId: string = tlOrg.id;
  console.log(`  ✓ TomorrowLabs ID: ${tlOrgId}`);

  // 3. Build place lookup map (english_name → id)
  console.log('\n[3/4] Building place lookup...');
  const placeNames = [...new Set(ORGANIZATIONS.map((o) => o.city_lookup).filter(Boolean))];
  const { data: placesData, error: placesErr } = await (supabase as any)
    .from('places')
    .select('id, english_name')
    .in('english_name', placeNames);
  if (placesErr) {
    console.error('Failed to fetch places:', placesErr.message);
    process.exit(1);
  }
  const placeMap = new Map<string, string>(
    (placesData ?? []).map((p: { id: string; english_name: string }) => [p.english_name, p.id])
  );
  for (const name of placeNames) {
    if (name && !placeMap.has(name)) {
      console.warn(`  ⚠ Place not found: "${name}" — headquarters_place_id will be null`);
    } else if (name) {
      console.log(`  ✓ Place: ${name} → ${placeMap.get(name)}`);
    }
  }

  // 4. Insert organizations + relationships
  console.log('\n[4/4] Inserting organizations and relationship records...');
  let inserted = 0;
  let skipped = 0;
  let relInserted = 0;
  let relSkipped = 0;

  for (const orgDef of ORGANIZATIONS) {
    const { data: existing } = await (supabase as any)
      .from('organizations')
      .select('id')
      .eq('legal_name', orgDef.legal_name)
      .maybeSingle();

    let orgId: string;

    if (existing) {
      orgId = existing.id;
      console.log(`  — SKIP (exists): ${orgDef.legal_name}`);
      skipped++;
    } else {
      const headquarters_place_id =
        orgDef.city_lookup ? (placeMap.get(orgDef.city_lookup) ?? null) : null;

      const { data: newOrg, error: insertErr } = await (supabase as any)
        .from('organizations')
        .insert({
          legal_name: orgDef.legal_name,
          display_name: orgDef.display_name ?? null,
          organization_type: orgDef.organization_type,
          incorporation_status: orgDef.incorporation_status,
          funder_category: 'not-a-funder',
          geographic_scope: orgDef.geographic_scope,
          founding_year: orgDef.founding_year ?? null,
          primary_url: orgDef.primary_url ?? null,
          mission_statement: orgDef.mission_statement ?? null,
          focus_areas: orgDef.focus_areas,
          headquarters_place_id,
          is_active: true,
          notes: orgDef.notes,
        })
        .select('id')
        .single();

      if (insertErr || !newOrg) {
        console.error(`  ✗ FAILED: ${orgDef.legal_name} — ${insertErr?.message}`);
        continue;
      }

      orgId = newOrg.id;
      console.log(`  ✓ INSERT: ${orgDef.legal_name} (${orgId})`);
      inserted++;
    }

    // organization_relationships is append-only (Layer 2 time-series). Never UPDATE.
    const { data: existingRel } = await (supabase as any)
      .from('organization_relationships')
      .select('id')
      .eq('organization_id', orgId)
      .maybeSingle();

    if (existingRel) {
      relSkipped++;
    } else {
      const { error: relErr } = await (supabase as any)
        .from('organization_relationships')
        .insert({
          organization_id: orgId,
          assessment_date: '2026-05-19',
          relationship_status: 'prospect-not-contacted',
          trust_level: 'unknown',
          source_id: SOURCE_ID,
          notes:
            'Initial prospecting entry from May 2026 diaspora research batch 2. No contact made. Verify organization details before outreach.',
        });

      if (relErr) {
        console.error(`  ✗ Relationship FAILED: ${orgDef.legal_name} — ${relErr.message}`);
      } else {
        relInserted++;
      }
    }
  }

  console.log('\n─────────────────────────────────────────────────────────');
  console.log(`Organizations: ${inserted} inserted, ${skipped} skipped (already existed)`);
  console.log(`Relationships: ${relInserted} inserted, ${relSkipped} skipped`);
  console.log('─────────────────────────────────────────────────────────');
  console.log('\nDone. All records marked prospect-not-contacted with confidence: low.');
  console.log('Verify details (URLs, legal names, founding years) before outreach.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
