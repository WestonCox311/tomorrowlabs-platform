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

const INC_LABELS: Record<string, string> = {
  'incorporated-nonprofit': 'Incorporated nonprofit',
  'incorporated-for-profit': 'Incorporated for-profit',
  'incorporated-cooperative': 'Cooperative',
  'fiscally-sponsored': 'Fiscally sponsored',
  'community-collective': 'Community collective',
  'informal-unincorporated': 'Informal / unincorporated',
  'individual': 'Individual',
};

const FUNDER_LABELS: Record<string, string> = {
  'not-a-funder': 'Not a funder',
  'private-foundation': 'Private foundation',
  'family-foundation': 'Family foundation',
  'corporate-foundation': 'Corporate foundation',
  'community-foundation': 'Community foundation',
  'public-charity': 'Public charity',
  'government-grant': 'Government grant',
  'multilateral-agency': 'Multilateral agency',
  'individual-donor': 'Individual donor',
  'crowdfunding': 'Crowdfunding',
};

const REL_LABELS: Record<string, string> = {
  'active-partner':           'Active partner',
  'active-customer':          'Active customer',
  'active-client':            'Active client',
  'active-distributor':       'Active distributor',
  'active-funder':            'Active funder',
  'active-grantee':           'Active grantee',
  'active-vendor':            'Active vendor',
  'exploratory-conversation': 'Exploratory',
  'prospect-not-contacted':   'Prospect',
  'historical-partner':       'Historical',
  'declined-mutual':          'Declined (mutual)',
  'declined-by-them':         'Declined (by them)',
  'declined-by-us':           'Declined (by us)',
  'observed-only':            'Observed only',
  'do-not-engage':            'Do not engage',
};

const TRUST_LABELS: Record<string, string> = {
  'deeply-trusted': 'Deeply trusted',
  'trusted': 'Trusted',
  'developing': 'Developing',
  'cautious': 'Cautious',
  'damaged': 'Damaged',
  'unknown': 'Unknown',
};

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

  // Resolve HQ place name + parent breadcrumb
  type PlaceWithParent = { id: string; english_name: string; parent_place_id: string | null };
  type PlaceSimple = { id: string; english_name: string };

  let hqPlace: PlaceWithParent | null = null;
  let parentPlace: PlaceSimple | null = null;

  if (org.headquarters_place_id) {
    const { data: hqData } = await supabase
      .from('places')
      .select('id, english_name, parent_place_id')
      .eq('id', org.headquarters_place_id)
      .single();
    hqPlace = hqData as PlaceWithParent | null;

    if (hqData?.parent_place_id) {
      const { data: parentData } = await supabase
        .from('places')
        .select('id, english_name')
        .eq('id', hqData.parent_place_id)
        .single();
      parentPlace = parentData as PlaceSimple | null;
    }
  }

  const deleteAction = deleteOrganization.bind(null, id);

  const hasExternalIds = org.ein || org.wikidata_id || org.candid_id || org.guidestar_id || org.crunchbase_id || org.primary_url;

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/organizations" className="hover:text-ink">Organizations</Link>
        <span>/</span>
        <span className="text-ink">{org.display_name ?? org.legal_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{org.display_name ?? org.legal_name}</h1>
          {org.display_name && org.display_name !== org.legal_name && (
            <p className="text-muted-foreground mt-0.5 text-sm">{org.legal_name}</p>
          )}
          {hqPlace && (
            <p className="text-sm text-muted-foreground mt-1">
              {hqPlace.english_name}{parentPlace && <span> · {parentPlace.english_name}</span>}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
              {TYPE_LABELS[org.organization_type] ?? org.organization_type}
            </span>
            {org.is_active === false && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rust/10 text-rust">
                Inactive
              </span>
            )}
            {latestRel && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${REL_COLORS[latestRel.relationship_status] ?? 'bg-muted text-muted-foreground'}`}>
                {REL_LABELS[latestRel.relationship_status] ?? latestRel.relationship_status}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 ml-4">
          {org.primary_url && (
            <a
              href={org.primary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
            >
              Website ↗
            </a>
          )}
          <Link
            href={`/admin/organizations/${id}/edit`}
            className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            Edit
          </Link>
          <DeleteButton action={deleteAction} label="Delete organization" />
        </div>
      </div>

      {/* Mission statement callout */}
      {org.mission_statement && (
        <div className="bg-muted/30 border border-border rounded-lg p-4 mb-8 text-sm text-ink/80 italic leading-relaxed">
          {org.mission_statement}
        </div>
      )}

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
                <dt className="w-44 shrink-0 font-medium text-muted-foreground">Status</dt>
                <dd className="flex-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${REL_COLORS[latestRel.relationship_status] ?? 'bg-muted text-muted-foreground'}`}>
                    {REL_LABELS[latestRel.relationship_status] ?? latestRel.relationship_status}
                  </span>
                </dd>
              </div>
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-44 shrink-0 font-medium text-muted-foreground">Trust level</dt>
                <dd className="text-ink flex-1">{latestRel.trust_level ? (TRUST_LABELS[latestRel.trust_level] ?? latestRel.trust_level) : '—'}</dd>
              </div>
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-44 shrink-0 font-medium text-muted-foreground">Assessed</dt>
                <dd className="text-ink flex-1">{latestRel.assessment_date}</dd>
              </div>
              {latestRel.tomorrowlabs_relationship_owner && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-44 shrink-0 font-medium text-muted-foreground">TL owner</dt>
                  <dd className="text-ink flex-1">{latestRel.tomorrowlabs_relationship_owner}</dd>
                </div>
              )}
              {latestRel.primary_contact_name && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-44 shrink-0 font-medium text-muted-foreground">Primary contact</dt>
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
                  <dt className="w-44 shrink-0 font-medium text-muted-foreground">Active projects</dt>
                  <dd className="text-ink flex-1">{latestRel.active_projects_count}</dd>
                </div>
              )}
              {latestRel.last_meaningful_contact && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-44 shrink-0 font-medium text-muted-foreground">Last contact</dt>
                  <dd className="text-ink flex-1">{latestRel.last_meaningful_contact}</dd>
                </div>
              )}
              {latestRel.next_planned_contact && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-44 shrink-0 font-medium text-muted-foreground">Next contact</dt>
                  <dd className="text-ink flex-1">{latestRel.next_planned_contact}</dd>
                </div>
              )}
              {latestRel.notes && (
                <div className="flex px-4 py-3 text-sm">
                  <dt className="w-44 shrink-0 font-medium text-muted-foreground">Notes</dt>
                  <dd className="text-ink flex-1 whitespace-pre-line">{latestRel.notes}</dd>
                </div>
              )}
            </dl>

            {relationships.length > 1 && (
              <div className="border-t border-border bg-muted/20 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">History ({relationships.length} assessments)</p>
                <div className="space-y-1">
                  {relationships.slice(1).map((r) => (
                    <div key={r.id} className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{r.assessment_date}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${REL_COLORS[r.relationship_status] ?? 'bg-muted text-muted-foreground'}`}>
                        {REL_LABELS[r.relationship_status] ?? r.relationship_status}
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

      {/* Key Facts */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-ink mb-3">Key Facts</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-border">
            {[
              org.founding_year && ['Founded', String(org.founding_year)],
              org.ceased_operations_year && ['Ceased operations', String(org.ceased_operations_year)],
              org.geographic_scope && ['Geographic scope', org.geographic_scope],
              org.incorporation_status && ['Incorporation', INC_LABELS[org.incorporation_status] ?? org.incorporation_status],
              org.funder_category && org.funder_category !== 'not-a-funder' && ['Funder category', FUNDER_LABELS[org.funder_category] ?? org.funder_category],
              ['Active', org.is_active === false ? 'No — inactive' : 'Yes'],
            ].filter(Boolean).map((row) => {
              const [label, value] = row as [string, string];
              return (
                <div key={label} className="px-4 py-3 text-sm">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
                  <p className="text-ink">{value}</p>
                </div>
              );
            })}
          </div>
          {org.focus_areas && org.focus_areas.length > 0 && (
            <div className="border-t border-border px-4 py-3 text-sm">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Focus areas</p>
              <div className="flex flex-wrap gap-1.5">
                {org.focus_areas.map((area) => (
                  <span key={area} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          {org.endonym && (
            <div className="border-t border-border px-4 py-3 text-sm">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">Endonym</p>
              <p className="text-ink">{org.endonym}</p>
            </div>
          )}
        </div>
      </section>

      {/* External Links & IDs */}
      {hasExternalIds && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-ink mb-3">External Links &amp; IDs</h2>
          <dl className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {org.primary_url && (
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-44 shrink-0 font-medium text-muted-foreground">Website</dt>
                <dd className="flex-1">
                  <a href={org.primary_url} target="_blank" rel="noopener noreferrer" className="text-moss hover:underline break-all">
                    {org.primary_url}
                  </a>
                </dd>
              </div>
            )}
            {org.ein && (
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-44 shrink-0 font-medium text-muted-foreground">EIN</dt>
                <dd className="font-mono text-ink">{org.ein}</dd>
              </div>
            )}
            {org.wikidata_id && (
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-44 shrink-0 font-medium text-muted-foreground">Wikidata</dt>
                <dd className="flex-1">
                  <a
                    href={`https://www.wikidata.org/wiki/${org.wikidata_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-moss hover:underline"
                  >
                    {org.wikidata_id}
                  </a>
                </dd>
              </div>
            )}
            {org.candid_id && (
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-44 shrink-0 font-medium text-muted-foreground">Candid ID</dt>
                <dd className="font-mono text-ink">{org.candid_id}</dd>
              </div>
            )}
            {org.guidestar_id && (
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-44 shrink-0 font-medium text-muted-foreground">GuideStar ID</dt>
                <dd className="font-mono text-ink">{org.guidestar_id}</dd>
              </div>
            )}
            {org.crunchbase_id && (
              <div className="flex px-4 py-3 text-sm">
                <dt className="w-44 shrink-0 font-medium text-muted-foreground">Crunchbase ID</dt>
                <dd className="font-mono text-ink">{org.crunchbase_id}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Notes + Admin */}
      {(org.notes || org.created_at) && (
        <section>
          <h2 className="text-base font-semibold text-ink mb-3">Notes &amp; Admin</h2>
          <div className="border border-border rounded-lg overflow-hidden divide-y divide-border text-sm">
            {org.notes && (
              <div className="px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                <p className="text-ink whitespace-pre-line leading-relaxed">{org.notes}</p>
              </div>
            )}
            <div className="px-4 py-3 text-muted-foreground">
              <p>ID: <span className="font-mono text-ink">{org.id}</span></p>
              {org.created_at && <p className="mt-1">Created: {new Date(org.created_at).toLocaleDateString()}</p>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
