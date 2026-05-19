/**
 * seed-diaspora-orgs.ts
 *
 * Seeds ~25 West Coast US diaspora community organizations into the `organizations`
 * table and creates an initial `organization_relationships` row for each, marking
 * them as `prospect-not-contacted`.
 *
 * These organizations are potential customers, clients, partners, or distributors
 * for Babagigi and Little Digital Library. Community languages served include:
 * Khmer, Vietnamese, Tagalog/Filipino, Korean, Cantonese, Mandarin, Hmong,
 * Lao, Mixtec, Oaxacan Spanish, Somali.
 *
 * DATA QUALITY NOTE:
 * All records have confidence: 'low'. Details (websites, founding years) were
 * collected via desktop research in May 2026 and should be verified before
 * any outreach. Legal names may not exactly match IRS/state filings.
 *
 * IDEMPOTENCY:
 * Script checks for existing records by legal_name before inserting.
 * Running multiple times is safe — existing orgs and relationships are skipped.
 * The `organization_relationships` table is append-only; no updates are made.
 *
 * Run: npm run seed:diaspora-orgs
 * Requires: migration-022 applied (adds active-customer, active-client, active-distributor)
 */

import { supabase } from './lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Source record
// ─────────────────────────────────────────────────────────────────────────────
const SOURCE_ID = '11111111-1111-1111-1111-111111111206';
const SOURCE_NAME = 'TomorrowLabs West Coast Diaspora Org Research — May 2026';

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
  city_lookup?: string; // English name to look up in places table
  notes: string;
}

const ORGANIZATIONS: OrgDef[] = [
  // ── Cambodian ──────────────────────────────────────────────────────────────
  {
    legal_name: 'United Cambodian Community',
    display_name: 'UCC',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 1975,
    primary_url: 'https://uccishere.org',
    mission_statement:
      'Empowering the Cambodian community in Long Beach through education, health, and social services.',
    focus_areas: ['cambodian-diaspora', 'social-services', 'health', 'education', 'khmer-language'],
    city_lookup: 'Long Beach Metro',
    notes:
      'One of the oldest and largest Cambodian-American organizations. Long Beach is the largest Cambodian diaspora community outside Cambodia. Strong candidate for Babagigi partnership. Research date: May 2026.',
  },
  {
    legal_name: 'Khmer Girls in Action',
    display_name: 'KGA',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 2000,
    primary_url: 'https://khmergirlsinaction.org',
    mission_statement:
      'Building the leadership of young Khmer women in Long Beach to lead social change.',
    focus_areas: [
      'cambodian-diaspora',
      'youth-leadership',
      'women-girls',
      'civic-engagement',
      'khmer-language',
    ],
    city_lookup: 'Long Beach Metro',
    notes:
      'Youth and women-focused Cambodian organization. Potential Babagigi distributor / program partner. Research date: May 2026.',
  },
  {
    legal_name: 'Cambodian Association of America',
    display_name: 'CAA Long Beach',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://caaofamerica.org',
    focus_areas: ['cambodian-diaspora', 'cultural-preservation', 'social-services', 'khmer-language'],
    city_lookup: 'Long Beach Metro',
    notes:
      'Long Beach-based Cambodian advocacy and services org. Verify legal name and URL before outreach. Research date: May 2026.',
  },
  {
    legal_name: 'Cambodian Community Women Association',
    display_name: 'CCWA',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    focus_areas: ['cambodian-diaspora', 'women', 'refugee-resettlement', 'khmer-language'],
    city_lookup: 'California',
    notes:
      'Seattle-area Cambodian women\'s organization. Name and location need verification — may operate under a different legal name. Research date: May 2026.',
  },

  // ── Vietnamese ─────────────────────────────────────────────────────────────
  {
    legal_name: 'Vietnamese American Arts & Letters Association',
    display_name: 'VAALA',
    organization_type: 'cultural-institution',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    founding_year: 1991,
    primary_url: 'https://vaala.org',
    mission_statement:
      'Promoting Vietnamese culture and heritage through arts and literature.',
    focus_areas: [
      'vietnamese-diaspora',
      'arts',
      'literature',
      'cultural-preservation',
      'vietnamese-language',
    ],
    city_lookup: 'California',
    notes:
      'Orange County / Los Angeles area. Major Vietnamese-American cultural organization. Arts and language-adjacent — high potential for Babagigi storytelling partnership. Research date: May 2026.',
  },
  {
    legal_name: 'Vietnamese Community of Southern California',
    display_name: 'VCSC',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    focus_areas: [
      'vietnamese-diaspora',
      'social-services',
      'community-development',
      'vietnamese-language',
    ],
    city_lookup: 'California',
    notes:
      'Southern California Vietnamese community services org. Legal name unverified — may be one of several similar organizations in Orange County. Research date: May 2026.',
  },
  {
    legal_name: 'Vietnamese American Community Center',
    display_name: 'VACC',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    focus_areas: ['vietnamese-diaspora', 'elderly', 'youth', 'social-services', 'vietnamese-language'],
    city_lookup: 'California',
    notes:
      'Bay Area / San Jose Vietnamese community center. One of several organizations serving the large Vietnamese population in Silicon Valley. Verify exact legal name. Research date: May 2026.',
  },

  // ── Filipino/Tagalog ────────────────────────────────────────────────────────
  {
    legal_name: 'Search to Involve Pilipino Americans',
    display_name: 'SIPA',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 1972,
    primary_url: 'https://sipausa.org',
    mission_statement:
      'Building a healthy and thriving Filipino community in Los Angeles through education and social services.',
    focus_areas: [
      'filipino-diaspora',
      'community-development',
      'education',
      'social-services',
      'tagalog',
    ],
    city_lookup: 'California',
    notes:
      'One of the most established Filipino-American nonprofits in LA. Pilipino/Filipino community development and services. Research date: May 2026.',
  },
  {
    legal_name: 'Filipino American Arts Exposition',
    display_name: 'FilAm Arts',
    organization_type: 'cultural-institution',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    primary_url: 'https://filam-arts.org',
    mission_statement:
      'Celebrating Filipino art, culture, and heritage through community programs in the Bay Area.',
    focus_areas: ['filipino-diaspora', 'arts', 'cultural-preservation', 'tagalog', 'bay-area'],
    city_lookup: 'California',
    notes:
      'San Francisco Bay Area Filipino arts and cultural organization. Cultural angle makes them a good Babagigi storytelling partner. Research date: May 2026.',
  },
  {
    legal_name: 'Bayanihan Community Center',
    display_name: 'Bayanihan',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    focus_areas: [
      'filipino-diaspora',
      'community-services',
      'cultural-preservation',
      'tagalog',
      'san-francisco',
    ],
    city_lookup: 'California',
    notes:
      'San Francisco Filipino community center. "Bayanihan" (community spirit) name is used by multiple Filipino orgs — verify exact legal entity. Research date: May 2026.',
  },

  // ── Korean ─────────────────────────────────────────────────────────────────
  {
    legal_name: 'Korean Resource Center',
    display_name: 'KRC',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 1983,
    primary_url: 'https://krcla.org',
    mission_statement:
      'Empowering the Korean community in Los Angeles through advocacy, civic engagement, and social services.',
    focus_areas: [
      'korean-diaspora',
      'civic-engagement',
      'advocacy',
      'social-services',
      'korean-language',
    ],
    city_lookup: 'California',
    notes:
      'Koreatown, Los Angeles. Major Korean-American advocacy organization. Strong civic engagement focus. Research date: May 2026.',
  },
  {
    legal_name: 'Korean Community Service Center',
    display_name: 'KCSC',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    focus_areas: ['korean-diaspora', 'social-services', 'elderly', 'youth', 'korean-language'],
    city_lookup: 'California',
    notes:
      'Bay Area Korean community services organization. Multiple orgs use similar names — verify before outreach. Research date: May 2026.',
  },

  // ── Chinese / Cantonese / Mandarin ──────────────────────────────────────────
  {
    legal_name: 'Chinese for Affirmative Action',
    display_name: 'CAA',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    founding_year: 1969,
    primary_url: 'https://caasf.org',
    mission_statement:
      'Advancing the civil and political rights of Chinese Americans and building a multiracial democracy.',
    focus_areas: [
      'chinese-diaspora',
      'cantonese',
      'civil-rights',
      'voting-rights',
      'language-access',
      'san-francisco',
    ],
    city_lookup: 'California',
    notes:
      'San Francisco. Historic civil rights organization. Runs language access programs — directly relevant to Babagigi and LDL mission. Research date: May 2026.',
  },
  {
    legal_name: 'Chinatown Community Development Center',
    display_name: 'Chinatown CDC',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 1977,
    primary_url: 'https://chinatowncdc.org',
    mission_statement:
      'Building a strong community in San Francisco Chinatown through affordable housing, community development, and cultural preservation.',
    focus_areas: [
      'chinese-diaspora',
      'cantonese',
      'affordable-housing',
      'community-development',
      'cultural-preservation',
    ],
    city_lookup: 'California',
    notes:
      'San Francisco Chinatown. Primarily Cantonese-speaking community. Housing and community development focus. Research date: May 2026.',
  },
  {
    legal_name: 'Chinatown Service Center',
    display_name: 'CSC',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    founding_year: 1971,
    primary_url: 'https://cscla.org',
    mission_statement:
      'Providing comprehensive social services to immigrants and refugees in the greater Los Angeles area.',
    focus_areas: [
      'chinese-diaspora',
      'cantonese',
      'mandarin',
      'immigrant-services',
      'social-services',
      'los-angeles',
    ],
    city_lookup: 'California',
    notes:
      'Los Angeles Chinatown. Serves both Cantonese and Mandarin-speaking Chinese-American communities. Research date: May 2026.',
  },

  // ── Hmong ──────────────────────────────────────────────────────────────────
  {
    legal_name: 'Hmong Cultural Center of the Central Valley',
    display_name: 'HCC Fresno',
    organization_type: 'cultural-institution',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    focus_areas: ['hmong-diaspora', 'hmong-daw', 'mong-leng', 'cultural-preservation', 'central-valley'],
    city_lookup: 'California',
    notes:
      'Fresno, CA. Central Valley has one of the largest Hmong diaspora communities in the US. Organization name is approximate — needs verification. Research date: May 2026.',
  },
  {
    legal_name: 'Hmong Community Inc.',
    display_name: 'HCI Sacramento',
    organization_type: 'community-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    focus_areas: [
      'hmong-diaspora',
      'hmong-daw',
      'mong-leng',
      'social-services',
      'refugee-resettlement',
      'sacramento',
    ],
    city_lookup: 'California',
    notes:
      'Sacramento area Hmong community organization. Sacramento has a large Hmong population. Name is approximate — may be "United Hmong" or similar. Needs verification. Research date: May 2026.',
  },

  // ── Lao ────────────────────────────────────────────────────────────────────
  {
    legal_name: 'Lao Family Community Development',
    display_name: 'Lao Family',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    founding_year: 1981,
    primary_url: 'https://laofamily.org',
    mission_statement:
      'Providing social services, health education, and community development for Lao, Hmong, Mien, and other Southeast Asian refugees and immigrants.',
    focus_areas: [
      'lao-diaspora',
      'hmong-diaspora',
      'mien-diaspora',
      'southeast-asian-diaspora',
      'refugee-resettlement',
      'social-services',
    ],
    city_lookup: 'California',
    notes:
      'Sacramento / Stockton area. Serves Lao, Hmong, Mien, and other SEA communities together. Strong community trust. Research date: May 2026.',
  },

  // ── Mixtec / Indigenous Oaxacan ────────────────────────────────────────────
  {
    legal_name: 'Frente Indígena de Organizaciones Binacionales',
    display_name: 'FIOB',
    organization_type: 'community-organization',
    incorporation_status: 'community-collective',
    geographic_scope: 'regional',
    founding_year: 1991,
    primary_url: 'https://fiob.org',
    mission_statement:
      'Defending the human rights of Oaxacan indigenous migrants in the US and Mexico, while preserving indigenous languages and cultures.',
    focus_areas: [
      'mixtec',
      'zapotec',
      'indigenous-oaxacan',
      'binational',
      'indigenous-rights',
      'indigenous-language-preservation',
      'farmworkers',
    ],
    city_lookup: 'California',
    notes:
      'Binational (California + Oaxaca, Mexico). Works with Mixtec, Zapotec, and other indigenous Oaxacan communities. Key contact for indigenous Mexico-origin speakers. Mission alignment is very high. Research date: May 2026.',
  },

  // ── Somali ─────────────────────────────────────────────────────────────────
  {
    legal_name: 'Somali Family Service of San Diego',
    display_name: 'SFSD',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://somalifamilyservice.org',
    mission_statement:
      'Providing comprehensive social services and cultural support to the Somali community in San Diego.',
    focus_areas: ['somali-diaspora', 'refugee-resettlement', 'social-services', 'san-diego'],
    city_lookup: 'California',
    notes:
      'San Diego has a significant Somali diaspora. Organization serves newly arrived refugees and established community members. Research date: May 2026.',
  },

  // ── Multi-ethnic / General ──────────────────────────────────────────────────
  {
    legal_name: 'Coalition for Humane Immigrant Rights',
    display_name: 'CHIRLA',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    founding_year: 1986,
    primary_url: 'https://chirla.org',
    mission_statement:
      'Advancing the human and civil rights of immigrants and refugees through leadership development, organizing, and advocacy.',
    focus_areas: [
      'immigrant-rights',
      'advocacy',
      'civic-engagement',
      'multi-ethnic',
      'los-angeles',
      'language-access',
    ],
    city_lookup: 'California',
    notes:
      'Los Angeles. Major immigrant rights advocacy organization. Broad community reach across many language communities. Policy and advocacy angle. Research date: May 2026.',
  },
  {
    legal_name: 'Ethnic Media Services',
    display_name: 'EMS',
    organization_type: 'media-organization',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'regional',
    founding_year: 1999,
    primary_url: 'https://ethnicmediaservices.org',
    mission_statement:
      'Connecting journalists from ethnic media outlets with stories and resources to serve immigrant and multicultural communities.',
    focus_areas: [
      'ethnic-media',
      'multilingual-media',
      'immigrant-communities',
      'journalism',
      'language-access',
    ],
    city_lookup: 'California',
    notes:
      'San Francisco-based. Connects English-language news with ethnic/multilingual media outlets. Strategic communications partner — can amplify TomorrowLabs reach into diaspora communities. Research date: May 2026.',
  },
  {
    legal_name: 'International Rescue Committee — Los Angeles',
    display_name: 'IRC Los Angeles',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://rescue.org/united-states/los-angeles-ca',
    mission_statement:
      'Helping refugees and other vulnerable people rebuild their lives in Los Angeles through resettlement, integration, and wellness programs.',
    focus_areas: [
      'refugee-resettlement',
      'multi-ethnic',
      'social-services',
      'language-access',
      'los-angeles',
    ],
    city_lookup: 'California',
    notes:
      'LA office of the international IRC. Serves refugees from many language backgrounds. Large reach — potential distributor channel for LDL. Research date: May 2026.',
  },
  {
    legal_name: 'International Rescue Committee — San Diego',
    display_name: 'IRC San Diego',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'local',
    primary_url: 'https://rescue.org/united-states/san-diego-ca',
    mission_statement:
      'Helping refugees and vulnerable people rebuild their lives in San Diego.',
    focus_areas: [
      'refugee-resettlement',
      'multi-ethnic',
      'social-services',
      'language-access',
      'san-diego',
      'somali',
    ],
    city_lookup: 'California',
    notes:
      'San Diego office of IRC. Significant Somali and East African refugee population in San Diego. Research date: May 2026.',
  },
  {
    legal_name: 'Southeast Asia Resource Action Center',
    display_name: 'SEARAC',
    organization_type: 'nonprofit-formal',
    incorporation_status: 'incorporated-nonprofit',
    geographic_scope: 'national',
    founding_year: 1979,
    primary_url: 'https://searac.org',
    mission_statement:
      'Empowering Southeast Asian Americans to create thriving communities through advocacy, capacity-building, and research.',
    focus_areas: [
      'southeast-asian-diaspora',
      'cambodian-diaspora',
      'lao-diaspora',
      'vietnamese-diaspora',
      'hmong-diaspora',
      'advocacy',
      'policy',
    ],
    city_lookup: 'California',
    notes:
      'DC-based but serves West Coast communities; has strong California connections. National advocacy and research on SEA communities — useful data partner and credibility reference. Research date: May 2026.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' seed-diaspora-orgs: West Coast Diaspora Organizations');
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
          'TomorrowLabs internal desktop research, May 2026. Organization details (URLs, founding years, legal names) require verification before outreach. Confidence is low — treat as a starting point.',
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
    // Check if org already exists
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

    // Check if a relationship already exists for this org (any status)
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
            'Initial prospecting entry from May 2026 West Coast diaspora research. No contact made. Verify organization details before outreach.',
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
