import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Suspense } from 'react';
import { InfoTooltip } from '@/components/info-tooltip';
import { FilterBar } from '@/components/filter-bar';
import { ClickableRow } from '@/components/clickable-row';
import { SortHeader } from '@/components/sort-header';
import type { Database } from '@/lib/database.types';

type Community = Database['public']['Tables']['communities']['Row'];
type CommunityRow = Pick<Community, 'id' | 'english_name' | 'endonym' | 'community_type' | 'estimated_global_population' | 'estimated_population_confidence' | 'is_self_identified_community'>;

const COMMUNITY_TYPES = ['diaspora', 'indigenous', 'religious', 'linguistic', 'professional', 'cultural'] as const;
const ALLOWED_SORT = ['english_name', 'community_type', 'estimated_global_population'] as const;

interface Props {
  searchParams: Promise<{ q?: string; type?: string; self_identified?: string; sort?: string; dir?: string }>;
}

export default async function CommunitiesPage({ searchParams }: Props) {
  const { q, type, self_identified, sort: sortParam, dir: dirParam } = await searchParams;

  const sortCol = (ALLOWED_SORT as readonly string[]).includes(sortParam ?? '') ? sortParam! : 'english_name';
  const sortDir = dirParam === 'desc' ? 'desc' : 'asc';

  const supabase = createAdminClient();

  let query = supabase
    .from('communities')
    .select('id, english_name, endonym, community_type, estimated_global_population, estimated_population_confidence, is_self_identified_community')
    .order(sortCol, { ascending: sortDir === 'asc', nullsFirst: false });

  if (q) {
    query = query.ilike('english_name', `%${q}%`);
  }
  if (type) {
    query = query.eq('community_type', type);
  }
  if (self_identified === 'true') {
    query = query.eq('is_self_identified_community', true);
  } else if (self_identified === 'false') {
    query = query.eq('is_self_identified_community', false);
  }

  const { data, error } = await query;
  const communities = data as CommunityRow[] | null;

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive font-mono text-sm bg-destructive/10 p-4 rounded-md">
          Supabase error: {error.message}
        </p>
      </div>
    );
  }

  const hasFilters = q || type || self_identified;

  function sortHref(col: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type) params.set('type', type);
    if (self_identified) params.set('self_identified', self_identified);
    params.set('sort', col);
    params.set('dir', sortCol === col && sortDir === 'asc' ? 'desc' : 'asc');
    return `/admin/communities?${params.toString()}`;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Communities</h1>
        <Link
          href="/admin/communities/new"
          className="px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
        >
          Add community
        </Link>
      </div>

      <Suspense>
        <FilterBar
          basePath="/admin/communities"
          searchPlaceholder="Search by name…"
          filters={[
            {
              param: 'type',
              label: 'Type',
              defaultLabel: 'All types',
              options: COMMUNITY_TYPES.map((t) => ({ value: t, label: t })),
            },
            {
              param: 'self_identified',
              label: 'Self-identified',
              defaultLabel: 'All communities',
              options: [
                { value: 'true', label: 'Self-identified only' },
                { value: 'false', label: 'Not self-identified' },
              ],
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
                <SortHeader href={sortHref('community_type')} label="Type" isActive={sortCol === 'community_type'} isAsc={sortDir === 'asc'} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('estimated_global_population')} label="Est. population" isActive={sortCol === 'estimated_global_population'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="Estimated global population of this community. The confidence level in parentheses indicates how reliable the estimate is: high = census-grade data; medium = reliable secondary sources; low = extrapolated; estimated = best guess from indirect evidence." />
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  Self-identified
                  <InfoTooltip text="Whether this community self-identifies as a community. TomorrowLabs only records communities that have defined themselves — we don't impose groupings onto people." />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {communities && communities.length > 0 ? (
              communities.map((community) => (
                <ClickableRow key={community.id} href={`/admin/communities/${community.id}`}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{community.english_name}</span>
                    {community.endonym && (
                      <p className="text-xs text-muted-foreground mt-0.5">{community.endonym}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {community.community_type ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                        {community.community_type}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {community.estimated_global_population != null
                      ? <>
                          {community.estimated_global_population.toLocaleString()}
                          {community.estimated_population_confidence && (
                            <span className="ml-1 text-xs opacity-60">({community.estimated_population_confidence})</span>
                          )}
                        </>
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {community.is_self_identified_community === false ? 'No' : 'Yes'}
                  </td>
                </ClickableRow>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  {hasFilters ? 'No communities match your filters.' : 'No communities yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {communities && (
        <p className="mt-3 text-xs text-muted-foreground">
          {communities.length} communit{communities.length !== 1 ? 'ies' : 'y'}
        </p>
      )}
    </div>
  );
}
