import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

const WAVES = [
  { key: 'wave-1', label: 'Wave 1', subtitle: 'Commercial foundation' },
  { key: 'wave-2', label: 'Wave 2', subtitle: 'Demand expansion' },
  { key: 'wave-3', label: 'Wave 3', subtitle: 'Aging heritage' },
  { key: 'wave-4', label: 'Wave 4', subtitle: 'Mission track' },
];

const STATUS_COLORS: Record<string, string> = {
  live: 'bg-green-100 text-green-800',
  'in-development': 'bg-blue-100 text-blue-800',
  planned: 'bg-amber-100 text-amber-800',
  deferred: 'bg-muted text-muted-foreground',
  sunset: 'bg-red-100 text-red-700',
};

const ETHNOLOGUE_COLORS: Record<string, string> = {
  International: 'text-green-700',
  National: 'text-blue-700',
  Vigorous: 'text-indigo-600',
  Threatened: 'text-amber-700',
  Shifting: 'text-orange-700',
  Moribund: 'text-red-700',
};

export default async function BabagigPipelinePage() {
  const supabase = createAdminClient();

  const [pipelineResult, communitiesResult] = await Promise.all([
    supabase
      .from('product_status')
      .select(`
        id,
        wave,
        status,
        target_launch_date,
        language_id,
        languages (
          id,
          english_name,
          endonym,
          glottocode,
          ethnologue_status
        )
      `)
      .eq('product', 'babagigi')
      .order('wave'),

    supabase
      .from('communities')
      .select('id, english_name, primary_language_ids'),
  ]);

  const pipeline = pipelineResult.data ?? [];
  const allCommunities = communitiesResult.data ?? [];

  // Build a map: language_id → community count
  const commCountByLang: Record<string, { count: number; names: string[] }> = {};
  for (const c of allCommunities) {
    for (const langId of c.primary_language_ids ?? []) {
      if (!commCountByLang[langId]) commCountByLang[langId] = { count: 0, names: [] };
      commCountByLang[langId].count++;
      commCountByLang[langId].names.push(c.english_name);
    }
  }

  // Group pipeline entries by wave
  const byWave: Record<string, typeof pipeline> = {};
  for (const entry of pipeline) {
    const w = entry.wave ?? 'unassigned';
    if (!byWave[w]) byWave[w] = [];
    byWave[w].push(entry);
  }

  const totalLanguages = pipeline.length;
  const totalWithCommunities = pipeline.filter(
    (p) => (commCountByLang[p.language_id]?.count ?? 0) > 0
  ).length;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink">Babagigi Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Language readiness across all four waves
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground">Total languages</p>
          <p className="text-2xl font-semibold text-ink mt-1">{totalLanguages}</p>
        </div>
        <div className="border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground">With communities</p>
          <p className="text-2xl font-semibold text-ink mt-1">{totalWithCommunities}</p>
        </div>
        <div className="border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground">Live</p>
          <p className="text-2xl font-semibold text-green-700 mt-1">
            {pipeline.filter((p) => p.status === 'live').length}
          </p>
        </div>
        <div className="border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground">Planned</p>
          <p className="text-2xl font-semibold text-amber-700 mt-1">
            {pipeline.filter((p) => p.status === 'planned').length}
          </p>
        </div>
      </div>

      {/* Wave sections */}
      <div className="space-y-8">
        {WAVES.map(({ key, label, subtitle }) => {
          const entries = byWave[key] ?? [];
          return (
            <section key={key}>
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="text-sm font-semibold text-ink">{label}</h2>
                <span className="text-sm text-muted-foreground">— {subtitle}</span>
                <span className="ml-auto text-xs text-muted-foreground">{entries.length} languages</span>
              </div>

              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground italic px-4 py-3 border border-border rounded-lg">
                  No languages assigned to this wave.
                </p>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Language</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Ethnologue</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Communities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {entries.map((entry) => {
                        const lang = Array.isArray(entry.languages)
                          ? entry.languages[0]
                          : entry.languages;
                        if (!lang) return null;
                        const comms = commCountByLang[entry.language_id];
                        return (
                          <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-2.5">
                              <Link
                                href={`/admin/languages/${lang.id}`}
                                className="font-medium text-ink hover:text-moss transition-colors"
                              >
                                {lang.english_name}
                              </Link>
                              {lang.endonym && lang.endonym !== lang.english_name && (
                                <span className="ml-2 text-muted-foreground text-xs">{lang.endonym}</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {lang.ethnologue_status ? (
                                <span className={`text-xs font-medium ${ETHNOLOGUE_COLORS[lang.ethnologue_status] ?? 'text-muted-foreground'}`}>
                                  {lang.ethnologue_status}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[entry.status ?? ''] ?? 'bg-muted text-muted-foreground'}`}>
                                {entry.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              {comms ? (
                                <span
                                  className="text-xs text-moss font-medium cursor-default"
                                  title={comms.names.join(', ')}
                                >
                                  {comms.count}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
