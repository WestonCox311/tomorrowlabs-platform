import { createAdminClient } from '@/lib/supabase/admin';

const RELIABILITY_STYLES: Record<string, string> = {
  high: 'bg-green-50 text-green-800 border border-green-200',
  medium: 'bg-amber-50 text-amber-800 border border-amber-200',
  low: 'bg-red-50 text-red-800 border border-red-200',
};

const TYPE_STYLES: Record<string, string> = {
  academic: 'bg-blue-50 text-blue-800 border border-blue-200',
  community: 'bg-purple-50 text-purple-800 border border-purple-200',
  internal: 'bg-gray-50 text-gray-700 border border-gray-200',
  census: 'bg-teal-50 text-teal-800 border border-teal-200',
  survey: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  'expert-estimate': 'bg-orange-50 text-orange-800 border border-orange-200',
  'partner-report': 'bg-pink-50 text-pink-800 border border-pink-200',
};

export default async function SourcesPage() {
  const supabase = createAdminClient();
  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;

  const byType = (sources ?? []).reduce<Record<string, typeof sources>>((acc, s) => {
    const t = s.type ?? 'other';
    if (!acc[t]) acc[t] = [];
    acc[t]!.push(s);
    return acc;
  }, {});

  const typeOrder = ['academic', 'census', 'survey', 'expert-estimate', 'community', 'partner-report', 'internal', 'other'];
  const sortedTypes = [
    ...typeOrder.filter((t) => byType[t]),
    ...Object.keys(byType).filter((t) => !typeOrder.includes(t)),
  ];

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink">Sources</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every factual claim in the database references one of these sources.
          {sources && ` ${sources.length} sources registered.`}
        </p>
      </div>

      <div className="space-y-8">
        {sortedTypes.map((type) => (
          <section key={type}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b border-border">
              {type.replace('-', ' ')}
            </h2>
            <div className="space-y-3">
              {byType[type]!.map((source) => (
                <div
                  key={source.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-ink">{source.name}</h3>
                        {source.type && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_STYLES[source.type] ?? 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                            {source.type}
                          </span>
                        )}
                        {source.reliability_rating && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${RELIABILITY_STYLES[source.reliability_rating] ?? ''}`}>
                            {source.reliability_rating} reliability
                          </span>
                        )}
                      </div>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-moss hover:underline mt-1 block truncate"
                        >
                          {source.url}
                        </a>
                      )}
                      {source.notes && (
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {source.notes}
                        </p>
                      )}
                    </div>
                    {source.accessed_date && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        Accessed {source.accessed_date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
