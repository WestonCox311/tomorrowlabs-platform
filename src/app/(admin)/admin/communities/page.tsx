import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';

type Community = Database['public']['Tables']['communities']['Row'];
type CommunityRow = Pick<Community, 'id' | 'english_name' | 'endonym' | 'community_type' | 'estimated_global_population' | 'estimated_population_confidence' | 'is_self_identified_community'>;

const COMMUNITY_TYPES = ['diaspora', 'indigenous', 'religious', 'linguistic', 'professional', 'cultural'] as const;

interface Props {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function CommunitiesPage({ searchParams }: Props) {
  const { q, type } = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from('communities')
    .select('id, english_name, endonym, community_type, estimated_global_population, estimated_population_confidence, is_self_identified_community')
    .order('english_name');

  if (q) {
    query = query.ilike('english_name', `%${q}%`);
  }
  if (type) {
    query = query.eq('community_type', type);
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

  const hasFilters = q || type;

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
          {COMMUNITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-moss/10 transition-colors"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/admin/communities"
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Est. population</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Self-identified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {communities && communities.length > 0 ? (
              communities.map((community) => (
                <tr key={community.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/communities/${community.id}`} className="font-medium text-ink hover:text-moss">
                      {community.english_name}
                    </Link>
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
                </tr>
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
