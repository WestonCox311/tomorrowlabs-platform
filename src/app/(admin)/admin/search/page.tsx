import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  if (!q?.trim()) {
    return (
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink mb-6">Search</h1>
        <SearchForm q="" />
        <p className="mt-8 text-sm text-muted-foreground">
          Search across languages, places, organizations, and communities.
        </p>
      </div>
    );
  }

  const supabase = createAdminClient();
  const term = `%${q}%`;

  const [languages, places, organizations, communities] = await Promise.all([
    supabase
      .from('languages')
      .select('id, english_name, endonym, granularity')
      .or(`english_name.ilike.${term},endonym.ilike.${term},glottocode.ilike.${term},iso_639_3.ilike.${term}`)
      .order('english_name')
      .limit(10),
    supabase
      .from('places')
      .select('id, english_name, endonym, granularity')
      .or(`english_name.ilike.${term},endonym.ilike.${term},geonames_id.ilike.${term},iso_3166_1_alpha2.ilike.${term}`)
      .order('english_name')
      .limit(10),
    supabase
      .from('organizations')
      .select('id, legal_name, display_name, organization_type')
      .or(`legal_name.ilike.${term},display_name.ilike.${term}`)
      .order('legal_name')
      .limit(10),
    supabase
      .from('communities')
      .select('id, english_name, endonym, community_type')
      .or(`english_name.ilike.${term},endonym.ilike.${term}`)
      .order('english_name')
      .limit(10),
  ]);

  const totalHits =
    (languages.data?.length ?? 0) +
    (places.data?.length ?? 0) +
    (organizations.data?.length ?? 0) +
    (communities.data?.length ?? 0);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink mb-6">Search</h1>
      <SearchForm q={q} />

      <p className="mt-6 mb-4 text-sm text-muted-foreground">
        {totalHits === 0
          ? `No results for "${q}"`
          : `${totalHits} result${totalHits !== 1 ? 's' : ''} for "${q}"`}
      </p>

      <div className="space-y-6">
        {languages.data && languages.data.length > 0 && (
          <ResultGroup
            title="Languages"
            results={languages.data.map((l) => ({
              id: l.id,
              href: `/admin/languages/${l.id}`,
              primary: l.english_name,
              secondary: l.endonym ?? undefined,
              badge: l.granularity,
            }))}
          />
        )}

        {places.data && places.data.length > 0 && (
          <ResultGroup
            title="Places"
            results={places.data.map((p) => ({
              id: p.id,
              href: `/admin/places/${p.id}`,
              primary: p.english_name,
              secondary: p.endonym ?? undefined,
              badge: p.granularity,
            }))}
          />
        )}

        {organizations.data && organizations.data.length > 0 && (
          <ResultGroup
            title="Organizations"
            results={organizations.data.map((o) => ({
              id: o.id,
              href: `/admin/organizations/${o.id}`,
              primary: o.display_name ?? o.legal_name,
              secondary: o.display_name ? o.legal_name : undefined,
              badge: o.organization_type,
            }))}
          />
        )}

        {communities.data && communities.data.length > 0 && (
          <ResultGroup
            title="Communities"
            results={communities.data.map((c) => ({
              id: c.id,
              href: `/admin/communities/${c.id}`,
              primary: c.english_name,
              secondary: c.endonym ?? undefined,
              badge: c.community_type ?? undefined,
            }))}
          />
        )}
      </div>
    </div>
  );
}

function SearchForm({ q }: { q: string }) {
  return (
    <form method="GET" className="flex gap-2">
      <input
        name="q"
        defaultValue={q}
        autoFocus
        placeholder="Search languages, places, organizations, communities…"
        className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent"
      />
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-moss/10 transition-colors"
      >
        Search
      </button>
    </form>
  );
}

interface ResultItem {
  id: string;
  href: string;
  primary: string;
  secondary?: string;
  badge?: string;
}

function ResultGroup({ title, results }: { title: string; results: ResultItem[] }) {
  return (
    <div>
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</h2>
      <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
        {results.map((r) => (
          <Link
            key={r.id}
            href={r.href}
            className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-ink">{r.primary}</span>
              {r.secondary && (
                <span className="text-sm text-muted-foreground ml-2">{r.secondary}</span>
              )}
            </div>
            {r.badge && (
              <span className="ml-4 shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                {r.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
