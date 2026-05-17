import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { ClickableRow } from '@/components/clickable-row';
import type { Database } from '@/lib/database.types';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrgRow = Pick<Organization, 'id' | 'legal_name' | 'display_name' | 'organization_type' | 'is_active' | 'founding_year' | 'geographic_scope'>;

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
};

interface Props {
  searchParams: Promise<{ q?: string; type?: string; active?: string }>;
}

export default async function OrganizationsPage({ searchParams }: Props) {
  const { q, type, active } = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from('organizations')
    .select('id, legal_name, display_name, organization_type, is_active, founding_year, geographic_scope')
    .order('legal_name');

  if (q) {
    query = query.or(`legal_name.ilike.%${q}%,display_name.ilike.%${q}%`);
  }
  if (type) {
    query = query.eq('organization_type', type as Database['public']['Enums']['organization_type']);
  }
  if (active === 'true') {
    query = query.eq('is_active', true);
  } else if (active === 'false') {
    query = query.eq('is_active', false);
  }

  const { data, error } = await query;
  const organizations = data as OrgRow[] | null;

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive font-mono text-sm bg-destructive/10 p-4 rounded-md">
          Supabase error: {error.message}
        </p>
      </div>
    );
  }

  const hasFilters = q || type || active;

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

      <form method="GET" className="flex gap-3 mb-6 flex-wrap">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-border rounded-md bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent"
        />
        <select
          name="type"
          defaultValue={type ?? ''}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
        >
          <option value="">All types</option>
          {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          name="active"
          defaultValue={active ?? ''}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
        >
          <option value="">Active + inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-moss/10 transition-colors"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/admin/organizations"
            className="px-4 py-2 text-sm text-muted-foreground hover:text-ink transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Scope</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Founded</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {organizations && organizations.length > 0 ? (
              organizations.map((org) => (
                <ClickableRow key={org.id} href={`/admin/organizations/${org.id}`}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{org.display_name ?? org.legal_name}</span>
                    {org.display_name && org.display_name !== org.legal_name && (
                      <p className="text-xs text-muted-foreground mt-0.5">{org.legal_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[org.organization_type] ?? 'bg-muted text-muted-foreground'}`}>
                      {org.organization_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{org.geographic_scope ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{org.founding_year ?? '—'}</td>
                  <td className="px-4 py-3">
                    {org.is_active === false ? (
                      <span className="text-xs text-rust">Inactive</span>
                    ) : (
                      <span className="text-xs text-moss">Active</span>
                    )}
                  </td>
                </ClickableRow>
              ))
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
