import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/delete-button';
import { deleteOrganization } from '@/app/actions/organizations';
import type { Database } from '@/lib/database.types';

type Organization = Database['public']['Tables']['organizations']['Row'];
// Use string instead of the enum so new values (active-customer, active-client, active-distributor)
// work before migration-022 types are regenerated.
type RelationshipStatus = string;
type TrustLevel = Database['public']['Enums']['trust_level'];

interface OrgRelRow {
  id: string;
  assessment_date: string;
  relationship_status: RelationshipStatus;
  trust_level: TrustLevel | null;
  tomorrowlabs_relationship_owner: string | null;
  primary_contact_name: string | null;
  primary_contact_role: string | null;
  primary_contact_email: string | null;
  active_projects_count: number | null;
  last_meaningful_contact: string | null;
  next_planned_contact: string | null;
  notes: string | null;
}

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

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data }, { data: rels }] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', id).single(),
    supabase
      .from('organization_relationships')
      .select('id, assessment_date, relationship_status, trust_level, tomorrowlabs_relationship_owner, primary_contact_name, primary_contact_role, primary_contact_email, active_projects_count, last_meaningful_contact, next_planned_contact, notes')
      .eq('organization_id', id)
      .order('assessment_date', { ascending: false }),
  ]);

  if (!data) notFound();
  const org = data as Organization;
  const relationships = (rels ?? []) as OrgRelRow[];
  const latestRel = relationships[0] ?? null;

  const deleteAction = deleteOrganization.bind(null, id);

  const fields: [string, string | number | boolean | string[] | null | undefined][] = [
    ['Legal name', org.legal_name],
    ['Display name', org.display_name],
    ['Endonym', org.endonym],
    ['Type', org.organization_type],
    ['Incorporation status', org.incorporation_status],
    ['Funder category', org.funder_category],
    ['Geographic scope', org.geographic_scope],
    ['Active', org.is_active],
    ['Founded', org.founding_year],
    ['Ceased operations', org.ceased_operations_year],
    ['Website', org.primary_url],
    ['Mission statement', org.mission_statement],
    ['Focus areas', org.focus_areas],
    ['EIN', org.ein],
    ['Wikidata ID', org.wikidata_id],
    ['Candid ID', org.candid_id],
    ['GuideStar ID', org.guidestar_id],
    ['Crunchbase ID', org.crunchbase_id],
    ['Notes', org.notes],
  ];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/organizations" className="hover:text-ink">Organizations</Link>
        <span>/</span>
        <span className="text-ink">{org.display_name ?? org.legal_name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{org.display_name ?? org.legal_name}</h1>
          {org.display_name && org.display_name !== org.legal_name && (
            <p className="text-muted-foreground mt-1 text-sm">{org.legal_name}</p>
          )}
          <div className="flex gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
              {org.organization_type}
            </span>
            {org.is_active === false && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rust/10 text-rust">
                Inactive
              </span>
            )}
            {latestRel && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${REL_COLORS[latestRel.relationship_status] ?? 'bg-muted text-muted-foreground'}`}>
                {latestRel.relationship_status}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/organizations/${id}/edit`}
            className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            Edit
          </Link>
          <DeleteButton action={deleteAction} label="Delete organization" />
        </div>
      </div>

      {/* TomorrowLabs Relationship */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ink">TomorrowLabs Relationship</h2>
          <Link
            href={`/admin/organizations/${id}/relationship`}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            {latestRel ? 'Update relationship' : 'Add relationship'}
          </Link>
        </div>

        {latestRel ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <dl className="divide-y divide-border">
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-48 shrink-0 font-medium text-muted-foreground">Status</dt>
                <dd className="flex-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${REL_COLORS[latestRel.relationship_status] ?? 'bg-muted text-muted-foreground'}`}>
                    {latestRel.relationship_status}
                  </span>
                </dd>
              </div>
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-48 shrink-0 font-medium text-muted-foreground">Trust level</dt>
                <dd className="text-ink flex-1">{latestRel.trust_level ?? '—'}</dd>
              </div>
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-48 shrink-0 font-medium text-muted-foreground">Assessed</dt>
                <dd className="text-ink flex-1">{latestRel.assessment_date}</dd>
              </div>
              {latestRel.tomorrowlabs_relationship_owner && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-48 shrink-0 font-medium text-muted-foreground">TL owner</dt>
                  <dd className="text-ink flex-1">{latestRel.tomorrowlabs_relationship_owner}</dd>
                </div>
              )}
              {latestRel.primary_contact_name && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-48 shrink-0 font-medium text-muted-foreground">Primary contact</dt>
                  <dd className="text-ink flex-1">
                    <span>{latestRel.primary_contact_name}</span>
                    {latestRel.primary_contact_role && (
                      <span className="text-muted-foreground"> · {latestRel.primary_contact_role}</span>
                    )}
                    {latestRel.primary_contact_email && (
                      <p className="text-xs mt-0.5">
                        <a href={`mailto:${latestRel.primary_contact_email}`} className="text-moss hover:underline">
                          {latestRel.primary_contact_email}
                        </a>
                      </p>
                    )}
                  </dd>
                </div>
              )}
              {(latestRel.active_projects_count ?? 0) > 0 && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-48 shrink-0 font-medium text-muted-foreground">Active projects</dt>
                  <dd className="text-ink flex-1">{latestRel.active_projects_count}</dd>
                </div>
              )}
              {latestRel.last_meaningful_contact && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-48 shrink-0 font-medium text-muted-foreground">Last contact</dt>
                  <dd className="text-ink flex-1">{latestRel.last_meaningful_contact}</dd>
                </div>
              )}
              {latestRel.next_planned_contact && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-48 shrink-0 font-medium text-muted-foreground">Next contact</dt>
                  <dd className="text-ink flex-1">{latestRel.next_planned_contact}</dd>
                </div>
              )}
              {latestRel.notes && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-48 shrink-0 font-medium text-muted-foreground">Notes</dt>
                  <dd className="text-ink flex-1 whitespace-pre-line">{latestRel.notes}</dd>
                </div>
              )}
            </dl>

            {/* Relationship history */}
            {relationships.length > 1 && (
              <div className="border-t border-border bg-muted/20 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">History ({relationships.length} assessments)</p>
                <div className="space-y-1">
                  {relationships.slice(1).map((r) => (
                    <div key={r.id} className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{r.assessment_date}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${REL_COLORS[r.relationship_status] ?? 'bg-muted text-muted-foreground'}`}>
                        {r.relationship_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-lg px-4 py-6 text-center text-sm text-muted-foreground">
            No relationship record yet.{' '}
            <Link href={`/admin/organizations/${id}/relationship`} className="text-moss hover:underline">
              Add one.
            </Link>
          </div>
        )}
      </section>

      {/* Organization details */}
      <h2 className="text-base font-semibold text-ink mb-3">Organization Details</h2>
      <dl className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {fields.map(([label, value]) => {
          let display: React.ReactNode;
          if (value === null || value === undefined) {
            display = <span className="text-muted-foreground">—</span>;
          } else if (typeof value === 'boolean') {
            display = value ? 'Yes' : 'No';
          } else if (Array.isArray(value)) {
            display = value.length > 0
              ? <span className="flex flex-wrap gap-1">{value.map((v) => <span key={v} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">{v}</span>)}</span>
              : <span className="text-muted-foreground">—</span>;
          } else if (label === 'Website' && typeof value === 'string') {
            display = <a href={value} target="_blank" rel="noopener noreferrer" className="text-moss hover:underline break-all">{value}</a>;
          } else {
            display = String(value);
          }

          return (
            <div key={label} className="flex px-4 py-3 text-sm">
              <dt className="w-48 shrink-0 font-medium text-muted-foreground">{label}</dt>
              <dd className="text-ink flex-1">{display}</dd>
            </div>
          );
        })}
      </dl>

      <p className="mt-4 text-xs text-muted-foreground">
        ID: <span className="font-mono">{org.id}</span>
      </p>
    </div>
  );
}
