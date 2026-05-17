import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/delete-button';
import { deleteOrganization } from '@/app/actions/organizations';
import type { Database } from '@/lib/database.types';

type Organization = Database['public']['Tables']['organizations']['Row'];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();
  const org = data as Organization;

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
