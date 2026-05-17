import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/delete-button';
import { deleteCommunity } from '@/app/actions/communities';
import type { Database } from '@/lib/database.types';

type Community = Database['public']['Tables']['communities']['Row'];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommunityDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();
  const community = data as Community;

  const deleteAction = deleteCommunity.bind(null, id);

  const fields: [string, string | number | boolean | null | undefined][] = [
    ['English name', community.english_name],
    ['Endonym', community.endonym],
    ['Type', community.community_type],
    ['Self-identified', community.is_self_identified_community],
    ['Self-identification basis', community.self_identification_basis],
    ['Est. global population', community.estimated_global_population != null
      ? community.estimated_global_population.toLocaleString()
      : null],
    ['Population confidence', community.estimated_population_confidence],
    ['Notes', community.notes],
  ];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/communities" className="hover:text-ink">Communities</Link>
        <span>/</span>
        <span className="text-ink">{community.english_name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{community.english_name}</h1>
          {community.endonym && (
            <p className="text-muted-foreground mt-1">{community.endonym}</p>
          )}
          {community.community_type && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground mt-2">
              {community.community_type}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/communities/${id}/edit`}
            className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            Edit
          </Link>
          <DeleteButton action={deleteAction} label="Delete community" />
        </div>
      </div>

      <dl className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {fields.map(([label, value]) => (
          <div key={label} className="flex px-4 py-3 text-sm">
            <dt className="w-52 shrink-0 font-medium text-muted-foreground">{label}</dt>
            <dd className="text-ink">
              {value === null || value === undefined
                ? <span className="text-muted-foreground">—</span>
                : typeof value === 'boolean'
                ? value ? 'Yes' : 'No'
                : String(value)}
            </dd>
          </div>
        ))}
      </dl>

      {(community.primary_language_ids?.length || community.primary_place_ids?.length || community.origin_place_id) && (
        <div className="mt-6 p-4 border border-border rounded-lg bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground mb-2">Linked entities</p>
          {community.origin_place_id && (
            <p className="text-sm text-muted-foreground">
              Origin place: <span className="font-mono text-xs">{community.origin_place_id}</span>
            </p>
          )}
          {community.primary_language_ids && community.primary_language_ids.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Languages: {community.primary_language_ids.length} linked
            </p>
          )}
          {community.primary_place_ids && community.primary_place_ids.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Places: {community.primary_place_ids.length} linked
            </p>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        ID: <span className="font-mono">{community.id}</span>
      </p>
    </div>
  );
}
