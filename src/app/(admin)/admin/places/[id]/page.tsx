import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/delete-button';
import { deletePlace } from '@/app/actions/places';
import type { Database } from '@/lib/database.types';

type Place = Database['public']['Tables']['places']['Row'];

interface Props {
  params: Promise<{ id: string }>;
}

// ── helpers ──────────────────────────────────────────────────────────────────

interface MergedLanguage {
  id: string;
  english_name: string;
  glottocode: string | null;
  ethnologue_status: string | null;
  estimated_speakers: number | null;
  is_diaspora: boolean | null;
  is_official: boolean;
  is_signed: boolean;
  data_year: number | null;
  source: 'array' | 'concentration';
}

function LanguageTable({ langs }: { langs: MergedLanguage[] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-2 font-medium text-muted-foreground">Language</th>
            <th className="text-left px-4 py-2 font-medium text-muted-foreground">Glottocode</th>
            <th className="text-right px-4 py-2 font-medium text-muted-foreground">Speakers here</th>
            <th className="text-left px-4 py-2 font-medium text-muted-foreground">Year</th>
            <th className="text-left px-4 py-2 font-medium text-muted-foreground">Ethnologue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {langs.map((lang) => (
            <tr key={lang.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-2">
                <Link href={`/admin/languages/${lang.id}`} className="text-moss hover:underline font-medium">
                  {lang.english_name}
                </Link>
              </td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {lang.glottocode ?? '—'}
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                {lang.estimated_speakers != null ? lang.estimated_speakers.toLocaleString() : '—'}
              </td>
              <td className="px-4 py-2 text-xs text-muted-foreground">{lang.data_year ?? '—'}</td>
              <td className="px-4 py-2 text-muted-foreground">{lang.ethnologue_status ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function GranularityBadge({ granularity }: { granularity: string }) {
  return (
    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
      {granularity}
    </span>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default async function PlaceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Step 1: fetch the place itself
  const { data } = await supabase.from('places').select('*').eq('id', id).single();
  if (!data) notFound();
  const place = data as Place;

  // Step 2: run remaining queries in parallel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const [parentResult, subdivisionsResult, langsByArrayResult, langsByConcentrationResult, demographicsResult] = await Promise.all([
    // Parent place (for breadcrumb + clickable link)
    place.parent_place_id
      ? sb.from('places')
          .select('id, english_name, granularity')
          .eq('id', place.parent_place_id)
          .single()
      : Promise.resolve({ data: null }),

    // Child places (subdivisions)
    sb.from('places')
      .select('id, english_name, endonym, granularity, status, iso_3166_2')
      .eq('parent_place_id', id)
      .order('english_name')
      .limit(200),

    // Languages via primary_languages_used array
    sb.from('languages')
      .select('id, english_name, glottocode, ethnologue_status, is_signed_language')
      .contains('primary_languages_used', [id]),

    // Languages via geographic_concentrations (country-level only, by ISO alpha-2)
    place.iso_3166_1_alpha2
      ? sb.from('geographic_concentrations')
          .select('language_id, estimated_speakers, is_diaspora_concentration, is_official_language, data_year, languages(id, english_name, glottocode, ethnologue_status, is_signed_language)')
          .eq('country_code', place.iso_3166_1_alpha2)
          .limit(500)
      : Promise.resolve({ data: [] }),

    // Most recent population snapshot
    sb.from('place_demographics')
      .select('population_total, data_year, confidence, assessment_date')
      .eq('place_id', id)
      .order('assessment_date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const parent: { id: string; english_name: string; granularity: string } | null = parentResult.data ?? null;
  const demographics: { population_total: number | null; data_year: number | null; confidence: string | null } | null = demographicsResult.data ?? null;
  const subdivisions: Array<{ id: string; english_name: string; endonym: string | null; granularity: string; status: string | null; iso_3166_2: string | null }> = subdivisionsResult.data ?? [];

  // Merge languages from both sources, deduplicating on language id.
  // Prefer concentration row if it has estimated_speakers.
  const langMap = new Map<string, MergedLanguage>();

  for (const lang of (langsByArrayResult.data ?? [])) {
    langMap.set(lang.id, {
      id: lang.id,
      english_name: lang.english_name,
      glottocode: lang.glottocode ?? null,
      ethnologue_status: lang.ethnologue_status ?? null,
      estimated_speakers: null,
      is_diaspora: null,
      is_official: false,
      is_signed: lang.is_signed_language ?? false,
      data_year: null,
      source: 'array',
    });
  }

  for (const row of (langsByConcentrationResult.data ?? [])) {
    const lang = Array.isArray(row.languages) ? row.languages[0] : row.languages;
    if (!lang) continue;
    const existing = langMap.get(lang.id);
    if (existing && row.estimated_speakers == null) continue; // keep existing if this row has no speaker data
    langMap.set(lang.id, {
      id: lang.id,
      english_name: lang.english_name,
      glottocode: lang.glottocode ?? null,
      ethnologue_status: lang.ethnologue_status ?? null,
      estimated_speakers: row.estimated_speakers ?? existing?.estimated_speakers ?? null,
      // Preserve non-null/non-false flags from either source row — multiple sources
      // (e.g. Wikidata + ACS) may each have partial flag data.
      is_diaspora: row.is_diaspora_concentration ?? existing?.is_diaspora ?? null,
      is_official: (row.is_official_language ?? false) || (existing?.is_official ?? false),
      is_signed: lang.is_signed_language ?? false,
      data_year: row.data_year ?? existing?.data_year ?? null,
      source: 'concentration',
    });
  }

  const languages = Array.from(langMap.values()).sort((a, b) =>
    (b.estimated_speakers ?? -1) - (a.estimated_speakers ?? -1) ||
    a.english_name.localeCompare(b.english_name)
  );

  const spokenLangs     = languages.filter(l => !l.is_signed);
  const signedLangs     = languages.filter(l => l.is_signed);
  const topLangs        = spokenLangs.filter(l => l.estimated_speakers != null).slice(0, 10);
  const topLangIds      = new Set(topLangs.map(l => l.id));
  const indigenousLangs = spokenLangs.filter(l => !topLangIds.has(l.id) && !l.is_diaspora);
  const diasporaLangs   = spokenLangs.filter(l => !topLangIds.has(l.id) && l.is_diaspora === true);

  const deleteAction = deletePlace.bind(null, id);

  // Fields to display (parent_place_id handled separately as a Link)
  const fields: [string, React.ReactNode][] = [
    ['English name', place.english_name],
    ['Endonym', formatValue(place.endonym)],
    ['Granularity', <GranularityBadge key="gran" granularity={place.granularity} />],
    ['Status', formatValue(place.status)],
    ['Parent place', parent
      ? <Link href={`/admin/places/${parent.id}`} className="text-moss hover:underline">{parent.english_name}</Link>
      : place.parent_place_id
      ? <span className="font-mono text-xs text-muted-foreground">{place.parent_place_id}</span>
      : <span className="text-muted-foreground">—</span>
    ],
    ['Governance type', formatValue(place.governance_type)],
    ['Territory recognition', formatValue(place.territory_recognition)],
    ['Climate zone', formatValue(place.climate_zone)],
    ['Primary timezone', formatValue(place.primary_timezone)],
    ['GeoNames ID', formatValue(place.geonames_id)],
    ['Wikidata ID', formatValue(place.wikidata_id)],
    ['ISO 3166-1 α2', formatValue(place.iso_3166_1_alpha2)],
    ['ISO 3166-1 α3', formatValue(place.iso_3166_1_alpha3)],
    ['ISO 3166-2', formatValue(place.iso_3166_2)],
    ['UN M.49 code', formatValue(place.un_m49_code)],
    ['FIPS code', formatValue(place.fips_code)],
    ['OSM relation ID', formatValue(place.osm_relation_id)],
    ['Native Land CA ID', formatValue(place.native_land_ca_id)],
    ['Latitude', formatValue(place.latitude)],
    ['Longitude', formatValue(place.longitude)],
    ['Area (km²)', formatValue(place.area_sq_km)],
    ['GeoNames validated', formatValue(place.geonames_validated)],
    ['Notes', formatValue(place.notes)],
  ];

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/admin/places" className="hover:text-ink">Places</Link>
        {parent && (
          <>
            <span>/</span>
            <Link href={`/admin/places/${parent.id}`} className="hover:text-ink">{parent.english_name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink">{place.english_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{place.english_name}</h1>
          {place.endonym && <p className="text-muted-foreground mt-1">{place.endonym}</p>}
          <p className="text-xs text-muted-foreground mt-1">{place.granularity}</p>
          {demographics?.population_total != null && (
            <p className="text-sm text-muted-foreground mt-1">
              Population:{' '}
              <span className="font-medium text-ink">
                {demographics.population_total.toLocaleString()}
              </span>
              {demographics.data_year && (
                <span className="text-xs ml-1 text-muted-foreground">
                  ({demographics.data_year})
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/places/${id}/edit`}
            className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            Edit
          </Link>
          <DeleteButton action={deleteAction} label="Delete place" />
        </div>
      </div>

      {/* Fields */}
      <dl className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {fields.map(([label, node]) => (
          <div key={label} className="flex px-4 py-3 text-sm">
            <dt className="w-48 shrink-0 font-medium text-muted-foreground">{label}</dt>
            <dd className="text-ink">{node}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs text-muted-foreground">
        ID: <span className="font-mono">{place.id}</span>
      </p>

      {/* ── Subdivisions ──────────────────────────────────────────────────── */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ink">
            Subdivisions
            <span className="ml-2 text-sm font-normal text-muted-foreground">({subdivisions.length})</span>
          </h2>
          <Link
            href={`/admin/places/new?parent_id=${id}`}
            className="text-xs text-moss hover:underline"
          >
            + Add
          </Link>
        </div>

        {subdivisions.length === 0 ? (
          <div className="border border-border rounded-lg px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">No subdivisions recorded.</p>
            {place.granularity === 'country' && (
              <p className="text-xs text-muted-foreground mt-1">
                Run <code className="font-mono bg-muted px-1 rounded">npm run seed:geonames-admin1</code> to populate states and provinces.
              </p>
            )}
            {place.granularity === 'state-province' && (
              <p className="text-xs text-muted-foreground mt-1">
                Run <code className="font-mono bg-muted px-1 rounded">npm run seed:geonames-admin2</code> to populate counties and districts.
              </p>
            )}
          </div>
        ) : (
          <>
            {subdivisions.length >= 200 && (
              <p className="text-xs text-muted-foreground mb-2">Showing first 200 results.</p>
            )}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Endonym</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">ISO 3166-2</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subdivisions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2">
                        <Link href={`/admin/places/${sub.id}`} className="text-moss hover:underline font-medium">
                          {sub.english_name}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{sub.endonym ?? '—'}</td>
                      <td className="px-4 py-2 text-muted-foreground">{sub.granularity}</td>
                      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{sub.iso_3166_2 ?? '—'}</td>
                      <td className="px-4 py-2 text-muted-foreground">{sub.status ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Languages ─────────────────────────────────────────────────────── */}
      <div className="mt-10">
        <h2 className="text-base font-semibold text-ink mb-4">
          Languages
          <span className="ml-2 text-sm font-normal text-muted-foreground">({languages.length})</span>
        </h2>

        {languages.length === 0 ? (
          <div className="border border-border rounded-lg px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">No languages associated with this place.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Languages are linked via <code className="font-mono bg-muted px-1 rounded">primary_languages_used</code> on the language record,
              or via geographic concentrations for countries.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {topLangs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-ink mb-2">
                  Most spoken
                  <span className="ml-1.5 text-muted-foreground font-normal">(top {topLangs.length})</span>
                </h3>
                <LanguageTable langs={topLangs} />
              </div>
            )}

            {indigenousLangs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-ink mb-2">
                  Indigenous & minority
                  <span className="ml-1.5 text-muted-foreground font-normal">({indigenousLangs.length})</span>
                </h3>
                <LanguageTable langs={indigenousLangs} />
              </div>
            )}

            {diasporaLangs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-ink mb-2">
                  Diaspora communities
                  <span className="ml-1.5 text-muted-foreground font-normal">({diasporaLangs.length})</span>
                </h3>
                <LanguageTable langs={diasporaLangs} />
              </div>
            )}

            {signedLangs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-ink mb-2">
                  Signed languages
                  <span className="ml-1.5 text-muted-foreground font-normal">({signedLangs.length})</span>
                </h3>
                <LanguageTable langs={signedLangs} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
