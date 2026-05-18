import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Suspense } from 'react';
import { InfoTooltip } from '@/components/info-tooltip';
import { FilterBar } from '@/components/filter-bar';
import { ClickableRow } from '@/components/clickable-row';
import { SortHeader } from '@/components/sort-header';
import type { Database } from '@/lib/database.types';

type Place = Database['public']['Tables']['places']['Row'];
type PlaceRow = Pick<Place, 'id' | 'english_name' | 'endonym' | 'granularity' | 'status' | 'iso_3166_1_alpha2' | 'parent_place_id'>;

const GRANULARITIES: Database['public']['Enums']['place_granularity'][] = [
  'world', 'continent', 'sub-continent', 'country', 'state-province',
  'metro-area', 'county', 'city', 'neighborhood', 'indigenous-territory', 'community-designated',
];

const STATUSES: Database['public']['Enums']['place_status'][] = [
  'active', 'historical', 'disputed', 'depopulated',
];

const ALLOWED_SORT = ['english_name', 'endonym', 'granularity', 'iso_3166_1_alpha2', 'status', 'population'] as const;

// Country view row limit (all ~252 fit easily; cap at 300 as a safety net)
const COUNTRY_LIMIT = 300;
// Non-country view: strict limit to avoid loading 50k rows
const SEARCH_LIMIT = 500;

interface Props {
  searchParams: Promise<{ q?: string; granularity?: string; status?: string; sort?: string; dir?: string }>;
}

export default async function PlacesPage({ searchParams }: Props) {
  const { q, granularity, status, sort: sortParam, dir: dirParam } = await searchParams;

  const sortCol = (ALLOWED_SORT as readonly string[]).includes(sortParam ?? '') ? sortParam! : 'english_name';
  const sortDir = dirParam === 'desc' ? 'desc' : 'asc';

  // Default to countries unless the user has explicitly chosen a different granularity
  // or is doing a search (where finding any place by name should work).
  const isSearching = Boolean(q);
  const effectiveGranularity = granularity || (isSearching ? undefined : 'country');
  const isCountryView = effectiveGranularity === 'country';

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // Population sort is done in-memory after fetching (it lives in a separate table).
  // Fall back to english_name for the DB query when population sort is requested.
  const dbSortCol = sortCol === 'population' ? 'english_name' : sortCol;

  let query = sb
    .from('places')
    .select('id, english_name, endonym, granularity, status, iso_3166_1_alpha2, parent_place_id')
    .order(dbSortCol, { ascending: sortDir === 'asc', nullsFirst: false });

  if (q) {
    query = query.or(`english_name.ilike.%${q}%,geonames_id.ilike.%${q}%,iso_3166_1_alpha2.ilike.%${q}%,iso_3166_1_alpha3.ilike.%${q}%`);
  }
  if (effectiveGranularity) {
    query = query.eq('granularity', effectiveGranularity);
  }
  if (status) {
    query = query.eq('status', status);
  }

  query = query.limit(isCountryView ? COUNTRY_LIMIT : SEARCH_LIMIT);

  const { data, error } = await query;
  const places = data as PlaceRow[] | null;

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive font-mono text-sm bg-destructive/10 p-4 rounded-md">
          Supabase error: {error.message}
        </p>
      </div>
    );
  }

  // Fetch most recent population for each visible place
  const placeIds = (places ?? []).map((p) => p.id);
  let popMap: Record<string, { total: number; year: number | null }> = {};

  if (placeIds.length > 0) {
    const { data: demoRows } = await sb
      .from('place_demographics')
      .select('place_id, population_total, data_year')
      .in('place_id', placeIds)
      .order('assessment_date', { ascending: false })
      .limit(placeIds.length * 3); // allow a few history rows per place

    for (const row of demoRows ?? []) {
      if (row.place_id && row.population_total != null && !popMap[row.place_id]) {
        popMap[row.place_id] = { total: row.population_total, year: row.data_year ?? null };
      }
    }
  }

  // Sort by population in memory (data already fetched; works for all row counts here)
  const sortedPlaces = sortCol === 'population'
    ? [...(places ?? [])].sort((a, b) => {
        const pa = popMap[a.id]?.total ?? -1;
        const pb = popMap[b.id]?.total ?? -1;
        return sortDir === 'asc' ? pa - pb : pb - pa;
      })
    : (places ?? []);

  const hasFilters = q || granularity || status;
  const isLimited = !isCountryView && (places?.length ?? 0) >= SEARCH_LIMIT;

  function sortHref(col: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (granularity) params.set('granularity', granularity);
    if (status) params.set('status', status);
    params.set('sort', col);
    params.set('dir', sortCol === col && sortDir === 'asc' ? 'desc' : 'asc');
    return `/admin/places?${params.toString()}`;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Places</h1>
          {!hasFilters && (
            <p className="text-xs text-muted-foreground mt-1">
              Showing countries. Search by name to find any place, or drill down via a country&apos;s page.
            </p>
          )}
        </div>
        <Link
          href="/admin/places/new"
          className="px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
        >
          Add place
        </Link>
      </div>

      <Suspense>
        <FilterBar
          basePath="/admin/places"
          searchPlaceholder="Search by name, ISO code… (searches all levels)"
          filters={[
            {
              param: 'granularity',
              label: 'Level',
              defaultLabel: 'Countries',
              options: GRANULARITIES.map((g) => ({ value: g, label: g })),
            },
            {
              param: 'status',
              label: 'Status',
              defaultLabel: 'All statuses',
              options: STATUSES.map((s) => ({ value: s, label: s })),
            },
          ]}
        />
      </Suspense>

      {isLimited && (
        <p className="mb-2 text-xs text-muted-foreground">
          Showing first {SEARCH_LIMIT} results. Narrow your search to see more.
        </p>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <SortHeader href={sortHref('english_name')} label="Name" isActive={sortCol === 'english_name'} isAsc={sortDir === 'asc'} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <SortHeader href={sortHref('endonym')} label="Endonym" isActive={sortCol === 'endonym'} isAsc={sortDir === 'asc'} />
              </th>
              {!isCountryView && (
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <SortHeader href={sortHref('granularity')} label="Level" isActive={sortCol === 'granularity'} isAsc={sortDir === 'asc'} />
                    <InfoTooltip text="Geographic hierarchy level: country, state-province, county, city, etc." />
                  </span>
                </th>
              )}
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                <div className="flex justify-end">
                  <SortHeader href={sortHref('population')} label="Population" isActive={sortCol === 'population'} isAsc={sortDir === 'asc'} />
                </div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('iso_3166_1_alpha2')} label="ISO α2" isActive={sortCol === 'iso_3166_1_alpha2'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="ISO 3166-1 alpha-2 two-letter country code (e.g. 'US', 'KH' for Cambodia). Only applies to countries." />
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('status')} label="Status" isActive={sortCol === 'status'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="Active = currently exists; Historical = no longer exists as named; Disputed = political status contested; Depopulated = place exists but is uninhabited." />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedPlaces.length > 0 ? (
              sortedPlaces.map((place) => {
                const pop = popMap[place.id];
                return (
                  <ClickableRow key={place.id} href={`/admin/places/${place.id}`}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{place.english_name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{place.endonym ?? '—'}</td>
                    {!isCountryView && (
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                          {place.granularity}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                      {pop ? (
                        <>
                          <span className="text-ink font-medium">{pop.total.toLocaleString()}</span>
                          {pop.year && (
                            <span className="text-xs ml-1 text-muted-foreground">({pop.year})</span>
                          )}
                        </>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs uppercase">{place.iso_3166_1_alpha2 ?? '—'}</td>
                    <td className="px-4 py-3">
                      {place.status && place.status !== 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rust/10 text-rust">
                          {place.status}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{place.status ?? '—'}</span>
                      )}
                    </td>
                  </ClickableRow>
                );
              })
            ) : (
              <tr>
                <td colSpan={isCountryView ? 5 : 6} className="px-4 py-12 text-center text-muted-foreground">
                  {hasFilters ? 'No places match your filters.' : 'No places yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {sortedPlaces.length} place{sortedPlaces.length !== 1 ? 's' : ''}
        {isLimited && ` (capped at ${SEARCH_LIMIT} — narrow your search to see more)`}
      </p>
    </div>
  );
}
