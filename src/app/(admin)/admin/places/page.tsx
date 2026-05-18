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

const ALLOWED_SORT = ['english_name', 'endonym', 'granularity', 'iso_3166_1_alpha2', 'status'] as const;

interface Props {
  searchParams: Promise<{ q?: string; granularity?: string; status?: string; sort?: string; dir?: string }>;
}

export default async function PlacesPage({ searchParams }: Props) {
  const { q, granularity, status, sort: sortParam, dir: dirParam } = await searchParams;

  const sortCol = (ALLOWED_SORT as readonly string[]).includes(sortParam ?? '') ? sortParam! : 'english_name';
  const sortDir = dirParam === 'desc' ? 'desc' : 'asc';

  const supabase = createAdminClient();

  let query = supabase
    .from('places')
    .select('id, english_name, endonym, granularity, status, iso_3166_1_alpha2, parent_place_id')
    .order(sortCol, { ascending: sortDir === 'asc', nullsFirst: false });

  if (q) {
    query = query.or(`english_name.ilike.%${q}%,geonames_id.ilike.%${q}%,iso_3166_1_alpha2.ilike.%${q}%,iso_3166_1_alpha3.ilike.%${q}%`);
  }
  if (granularity) {
    query = query.eq('granularity', granularity as Database['public']['Enums']['place_granularity']);
  }
  if (status) {
    query = query.eq('status', status as Database['public']['Enums']['place_status']);
  }

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

  const hasFilters = q || granularity || status;

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
        <h1 className="text-2xl font-semibold text-ink">Places</h1>
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
          searchPlaceholder="Search by name, GeoNames ID, ISO code…"
          filters={[
            {
              param: 'granularity',
              label: 'Granularity',
              defaultLabel: 'All granularities',
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('granularity')} label="Granularity" isActive={sortCol === 'granularity'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="How specific this place is in the geographic hierarchy: country, state-province, metro-area, indigenous-territory, community-designated, etc." />
                </span>
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
            {places && places.length > 0 ? (
              places.map((place) => (
                <ClickableRow key={place.id} href={`/admin/places/${place.id}`}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{place.english_name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{place.endonym ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {place.granularity}
                    </span>
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
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  {hasFilters ? 'No places match your filters.' : 'No places yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {places && (
        <p className="mt-3 text-xs text-muted-foreground">{places.length} place{places.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}
