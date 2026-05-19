import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Suspense } from 'react';
import { ClickableRow } from '@/components/clickable-row';
import { FilterBar } from '@/components/filter-bar';
import { SortHeader } from '@/components/sort-header';
import type { Database } from '@/lib/database.types';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrgRow = Pick<Organization, 'id' | 'legal_name' | 'display_name' | 'organization_type' | 'is_active' | 'founding_year' | 'headquarters_place_id' | 'focus_areas'>;

// Use string instead of the enum so new values (active-customer, active-client, active-distributor)
// work before migration-022 types are regenerated.
type RelationshipStatus = string;

const TYPE_LABELS: Record<string, string> = {
  'community-organization': 'Community Org',
  'nonprofit-formal': 'Nonprofit',
  'foundation': 'Foundation',
  'government-agency': 'Government',
  'intergovernmental': 'Intergovernmental',
  'academic-institution': 'Academic',
  'religious-institution': 'Religious',
  'cultural-institution': 'Cultural',
  'for-profit-aligned': 'For-profit (aligned)',
  'for-profit-vendor': 'Vendor',
  'media-organization': 'Media',
  'professional-association': 'Professional Assoc.',
  'informal-collective': 'Informal',
  'individual-practitioner': 'Individual',
  'peer-organization': 'Peer Org',
  'competitor': 'Competitor',
};

const ORG_TYPES: Database['public']['Enums']['organization_type'][] = [
  'community-organization', 'nonprofit-formal', 'foundation', 'government-agency',
  'intergovernmental', 'academic-institution', 'religious-institution', 'cultural-institution',
  'for-profit-aligned', 'for-profit-vendor', 'media-organization', 'professional-association',
  'informal-collective', 'individual-practitioner', 'peer-organization', 'competitor',
];

const TYPE_COLORS: Partial<Record<Database['public']['Enums']['organization_type'], string>> = {
  'community-organization': 'bg-moss/10 text-moss',
  'foundation': 'bg-blue-50 text-blue-700',
  'government-agency': 'bg-purple-50 text-purple-700',
  'for-profit-vendor': 'bg-rust/10 text-rust',
  'competitor': 'bg-rust/10 text-rust',
  'academic-institution': 'bg-indigo-50 text-indigo-700',
  'cultural-institution': 'bg-amber-50 text-amber-700',
  'media-organization': 'bg-pink-50 text-pink-700',
  'nonprofit-formal': 'bg-teal-50 text-teal-700',
};

const REL_STATUSES: { value: RelationshipStatus; label: string }[] = [
  { value: 'active-partner',           label: 'Active partner' },
  { value: 'active-customer',          label: 'Active customer' },
  { value: 'active-client',            label: 'Active client' },
  { value: 'active-distributor',       label: 'Active distributor' },
  { value: 'active-funder',            label: 'Active funder' },
  { value: 'active-grantee',           label: 'Active grantee' },
  { value: 'active-vendor',            label: 'Active vendor' },
  { value: 'exploratory-conversation', label: 'Exploratory' },
  { value: 'prospect-not-contacted',   label: 'Prospect' },
  { value: 'historical-partner',       label: 'Historical' },
  { value: 'observed-only',            label: 'Observed only' },
  { value: 'do-not-engage',            label: 'Do not engage' },
];

const REL_COLORS: Partial<Record<RelationshipStatus, string>> = {
  'active-partner':           'bg-moss/10 text-moss',
  'active-customer':          'bg-emerald-50 text-emerald-700',
  'active-client':            'bg-teal-50 text-teal-700',
  'active-distributor':       'bg-cyan-50 text-cyan-700',
  'active-funder':            'bg-blue-50 text-blue-700',
  'active-grantee':           'bg-indigo-50 text-indigo-700',
  'active-vendor':            'bg-violet-50 text-violet-700',
  'exploratory-conversation': 'bg-amber-50 text-amber-700',
  'prospect-not-contacted':   'bg-muted text-muted-foreground',
  'historical-partner':       'bg-muted text-muted-foreground',
  'do-not-engage':            'bg-rust/10 text-rust',
  'observed-only':            'bg-muted text-muted-foreground',
};

const ALLOWED_SORT = ['legal_name', 'organization_type', 'founding_year'] as const;

interface Props {
  searchParams: Promise<{ q?: string; type?: string; active?: string; rel?: string; place?: string; sort?: string; dir?: string }>;
}

export default async function OrganizationsPage({ searchParams }: Props) {
  const { q, type, active, rel, place, sort: sortParam, dir: dirParam } = await searchParams;

  const sortCol = (ALLOWED_SORT as readonly string[]).includes(sortParam ?? '') ? sortParam! : 'legal_name';
  const sortDir = dirParam === 'desc' ? 'desc' : 'asc';

  const supabase = createAdminClient();

  // Fetch organizations with location + focus area data
  let query = supabase
    .from('organizations')
    .select('id, legal_name, display_name, organization_type, is_active, founding_year, headquarters_place_id, focus_areas')
    .order(sortCol, { ascending: sortDir === 'asc', nullsFirst: false });

  if (q) query = query.or(`legal_name.ilike.%${q}%,display_name.ilike.%${q}%`);
  if (type) query = query.eq('organization_type', type as Database['public']['Enums']['organization_type']);
  if (active === 'true') query = query.eq('is_active', true);
  else if (active === 'false') query = query.eq('is_active', false);

  const { data, error } = await query;
  let organizations = data as OrgRow[] | null;

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive font-mono text-sm bg-destructive/10 p-4 rounded-md">
          Supabase error: {error.message}
        </p>
      </div>
    );
  }

  // Fetch latest relationship status per org
  const orgIds = (organizations ?? []).map((o) => o.id);
  const relMap = new Map<string, RelationshipStatus>();

  if (orgIds.length > 0) {
    const { data: rels } = await supabase
      .from('organization_relationships')
      .select('organization_id, relationship_status, assessment_date')
      .in('organization_id', orgIds)
      .order('assessment_date', { ascending: false });

    for (const row of rels ?? []) {
      if (!relMap.has(row.organization_id)) {
        relMap.set(row.organization_id, row.relationship_status as RelationshipStatus);
      }
    }
  }

  // Build place lookup for all distinct HQ place IDs
  const distinctPlaceIds = [...new Set(
    (organizations ?? []).map((o) => o.headquarters_place_id).filter((id): id is string => !!id)
  )];

  const placeMap = new Map<string, string>();
  if (distinctPlaceIds.length > 0) {
    const { data: placesData } = await supabase
      .from('places')
      .select('id, english_name')
      .in('id', distinctPlaceIds);
    for (const p of placesData ?? []) {
      placeMap.set(p.id, p.english_name);
    }
  }

  // Client-side filters for rel and place
  if (rel && organizations) {
    organizations = organizations.filter((o) => relMap.get(o.id) === rel);
  }
  if (place && organizations) {
    organizations = organizations.filter((o) => o.headquarters_place_id === place);
  }

  // Build place filter options from all orgs (before client-side place filter)
  const placeFilterOptions = Array.from(placeMap.entries())
    .map(([id, name]) => ({ value: id, label: name }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const hasFilters = q || type || active || rel || place;

  function sortHref(col: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type) params.set('type', type);
    if (active) params.set('active', active);
    if (rel) params.set('rel', rel);
    if (place) params.set('place', place);
    params.set('sort', col);
    params.set('dir', sortCol === col && sortDir === 'asc' ? 'desc' : 'asc');
    return `/admin/organizations?${params.toString()}`;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Organizations</h1>
        <Link
          href="/admin/organizations/new"
          className="px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
        >
          Add organization
        </Link>
      </div>

      <Suspense>
        <FilterBar
          basePath="/admin/organizations"
          searchPlaceholder="Search by name…"
          filters={[
            {
              param: 'type',
              label: 'Type',
              defaultLabel: 'All types',
              options: ORG_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] ?? t })),
            },
            {
              param: 'rel',
              label: 'TL relationship',
              defaultLabel: 'All relationships',
              options: REL_STATUSES.map((r) => ({ value: r.value, label: r.label })),
            },
            ...(placeFilterOptions.length > 0 ? [{
              param: 'place',
              label: 'Location',
              defaultLabel: 'All locations',
              options: placeFilterOptions,
            }] : []),
            {
              param: 'active',
              label: 'Status',
              defaultLabel: 'Active + inactive',
              options: [
                { value: 'true', label: 'Active only' },
                { value: 'false', label: 'Inactive only' },
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
                <SortHeader href={sortHref('legal_name')} label="Name" isActive={sortCol === 'legal_name'} isAsc={sortDir === 'asc'} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <SortHeader href={sortHref('organization_type')} label="Type" isActive={sortCol === 'organization_type'} isAsc={sortDir === 'asc'} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">TL Relationship</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <SortHeader href={sortHref('founding_year')} label="Founded" isActive={sortCol === 'founding_year'} isAsc={sortDir === 'asc'} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {organizations && organizations.length > 0 ? (
              organizations.map((org) => {
                const relStatus = relMap.get(org.id);
                const relLabel = REL_STATUSES.find((r) => r.value === relStatus)?.label;
                const relColor = relStatus ? (REL_COLORS[relStatus] ?? 'bg-muted text-muted-foreground') : '';
                const locationName = org.headquarters_place_id ? placeMap.get(org.headquarters_place_id) : null;
                const visibleFocus = (org.focus_areas ?? []).slice(0, 3);
                const hiddenCount = (org.focus_areas?.length ?? 0) - visibleFocus.length;
                return (
                  <ClickableRow key={org.id} href={`/admin/organizations/${org.id}`}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{org.display_name ?? org.legal_name}</span>
                      {org.display_name && org.display_name !== org.legal_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">{org.legal_name}</p>
                      )}
                      {visibleFocus.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {visibleFocus.map((area) => (
                            <span key={area} className="inline-flex items-center px-1.5 py-0 rounded text-[10px] bg-muted/60 text-muted-foreground leading-5">
                              {area}
                            </span>
                          ))}
                          {hiddenCount > 0 && (
                            <span className="text-[10px] text-muted-foreground leading-5">+{hiddenCount}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[org.organization_type] ?? 'bg-muted text-muted-foreground'}`}>
                        {TYPE_LABELS[org.organization_type] ?? org.organization_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {relLabel ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${relColor}`}>
                          {relLabel}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {locationName ?? (org.is_active === false ? <span className="text-rust text-xs">Inactive</span> : '—')}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{org.founding_year ?? '—'}</td>
                  </ClickableRow>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  {hasFilters ? 'No organizations match your filters.' : 'No organizations yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {organizations && (
        <p className="mt-3 text-xs text-muted-foreground">
          {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
