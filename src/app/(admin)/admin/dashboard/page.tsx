import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

async function getCounts() {
  const supabase = createAdminClient();
  const [languages, places, organizations, communities] = await Promise.all([
    supabase.from('languages').select('id', { count: 'exact', head: true }),
    supabase.from('places').select('id', { count: 'exact', head: true }),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('communities').select('id', { count: 'exact', head: true }),
  ]);
  return {
    languages: languages.count ?? 0,
    places: places.count ?? 0,
    organizations: organizations.count ?? 0,
    communities: communities.count ?? 0,
  };
}

export default async function DashboardPage() {
  const counts = await getCounts();

  const cards = [
    { label: 'Languages', href: '/admin/languages', count: counts.languages, description: 'Language records and metadata' },
    { label: 'Places', href: '/admin/places', count: counts.places, description: 'Geographic and political places' },
    { label: 'Organizations', href: '/admin/organizations', count: counts.organizations, description: 'Partners, funders, and institutions' },
    { label: 'Communities', href: '/admin/communities', count: counts.communities, description: 'Community records and relationships' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-ink mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">Spine entity overview</p>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-5 border border-border rounded-lg hover:border-moss/50 hover:shadow-sm transition-all bg-background"
          >
            <div className="flex items-baseline justify-between mb-1">
              <p className="font-medium text-ink">{card.label}</p>
              <span className="text-2xl font-semibold text-moss tabular-nums">
                {card.count.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
