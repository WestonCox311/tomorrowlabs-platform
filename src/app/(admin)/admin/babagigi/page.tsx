import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { InfoTooltip } from '@/components/info-tooltip';
import { SortHeader } from '@/components/sort-header';

const WAVES = [
  {
    key: 'wave-1', label: 'Wave 1', subtitle: 'Commercial foundation',
    tooltip: '8 high-demand diaspora languages with strong US market and available voice technology. Babagigi\'s initial revenue base — commercial success here funds the mission waves.',
  },
  {
    key: 'wave-2', label: 'Wave 2', subtitle: 'Demand expansion',
    tooltip: '5 languages with demonstrated diaspora demand and developing voice technology support. Expands the commercial base while deepening community reach.',
  },
  {
    key: 'wave-3', label: 'Wave 3', subtitle: 'Aging heritage',
    tooltip: '7 languages where grandparent-generation speakers are the primary audience. Cultural preservation urgency is high — these are communities where the grandparent generation may be the last fluent speakers.',
  },
  {
    key: 'wave-4', label: 'Wave 4', subtitle: 'Mission track',
    tooltip: '7 languages serving communities with active field partnerships. Revenue is secondary to cultural survival impact. Requires deeper community co-design before full launch.',
  },
];

const TIER_COLORS: Record<string, string> = {
  production: 'bg-green-100 text-green-800',
  usable: 'bg-blue-100 text-blue-800',
  experimental: 'bg-amber-100 text-amber-800',
  none: 'bg-muted text-muted-foreground',
};

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

const TIER_ORDER: Record<string, number> = { production: 0, usable: 1, experimental: 2, none: 3 };
const ETHNOLOGUE_ORDER: Record<string, number> = {
  International: 0, National: 1, Vigorous: 2, Threatened: 3, Shifting: 4, Moribund: 5,
};
const STATUS_ORDER: Record<string, number> = {
  live: 0, 'in-development': 1, planned: 2, deferred: 3, sunset: 4,
};

const ALLOWED_SORT = ['language', 'ethnologue_status', 'stt', 'tts', 'status'] as const;

interface Props {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}

export default async function BabagigPipelinePage({ searchParams }: Props) {
  const { sort: sortParam, dir: dirParam } = await searchParams;

  const sortCol = (ALLOWED_SORT as readonly string[]).includes(sortParam ?? '') ? sortParam! : 'language';
  const sortDir = dirParam === 'desc' ? 'desc' : 'asc';

  const supabase = createAdminClient();

  const [pipelineResult, communitiesResult, techResult] = await Promise.all([
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

    supabase
      .from('tech_readiness')
      .select('language_id, stt_quality_tier, tts_quality_tier'),
  ]);

  const pipeline = pipelineResult.data ?? [];
  const allCommunities = communitiesResult.data ?? [];

  // Map: language_id → tech readiness tiers
  const techByLang: Record<string, { stt: string; tts: string }> = {};
  for (const tr of techResult.data ?? []) {
    techByLang[tr.language_id] = { stt: tr.stt_quality_tier, tts: tr.tts_quality_tier };
  }

  // Build a map: language_id → community count
  const commCountByLang: Record<string, { count: number; names: string[] }> = {};
  for (const c of allCommunities) {
    for (const langId of c.primary_language_ids ?? []) {
      if (!commCountByLang[langId]) commCountByLang[langId] = { count: 0, names: [] };
      commCountByLang[langId].count++;
      commCountByLang[langId].names.push(c.english_name);
    }
  }

  // Sort pipeline entries within each wave
  const sortedPipeline = [...pipeline].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    const langA = Array.isArray(a.languages) ? a.languages[0] : a.languages;
    const langB = Array.isArray(b.languages) ? b.languages[0] : b.languages;

    // Always group by wave first
    const waveA = a.wave ?? '';
    const waveB = b.wave ?? '';
    if (waveA !== waveB) return waveA.localeCompare(waveB);

    switch (sortCol) {
      case 'language':
        return mul * (langA?.english_name ?? '').localeCompare(langB?.english_name ?? '');
      case 'ethnologue_status': {
        const oa = ETHNOLOGUE_ORDER[langA?.ethnologue_status ?? ''] ?? 99;
        const ob = ETHNOLOGUE_ORDER[langB?.ethnologue_status ?? ''] ?? 99;
        return mul * (oa - ob);
      }
      case 'stt': {
        const oa = TIER_ORDER[techByLang[a.language_id]?.stt ?? 'none'] ?? 99;
        const ob = TIER_ORDER[techByLang[b.language_id]?.stt ?? 'none'] ?? 99;
        return mul * (oa - ob);
      }
      case 'tts': {
        const oa = TIER_ORDER[techByLang[a.language_id]?.tts ?? 'none'] ?? 99;
        const ob = TIER_ORDER[techByLang[b.language_id]?.tts ?? 'none'] ?? 99;
        return mul * (oa - ob);
      }
      case 'status': {
        const oa = STATUS_ORDER[a.status ?? ''] ?? 99;
        const ob = STATUS_ORDER[b.status ?? ''] ?? 99;
        return mul * (oa - ob);
      }
      default:
        return 0;
    }
  });

  // Group by wave (preserving sorted order within each wave)
  const byWave: Record<string, typeof pipeline> = {};
  for (const entry of sortedPipeline) {
    const w = entry.wave ?? 'unassigned';
    if (!byWave[w]) byWave[w] = [];
    byWave[w].push(entry);
  }

  const totalLanguages = pipeline.length;
  const totalWithCommunities = pipeline.filter(
    (p) => (commCountByLang[p.language_id]?.count ?? 0) > 0
  ).length;

  function sortHref(col: string) {
    const params = new URLSearchParams();
    params.set('sort', col);
    params.set('dir', sortCol === col && sortDir === 'asc' ? 'desc' : 'asc');
    return `/admin/babagigi?${params.toString()}`;
  }

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
        {WAVES.map(({ key, label, subtitle, tooltip }) => {
          const entries = byWave[key] ?? [];
          return (
            <section key={key}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-ink">{label}</h2>
                <span className="text-sm text-muted-foreground">— {subtitle}</span>
                <InfoTooltip text={tooltip} />
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
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                          <SortHeader href={sortHref('language')} label="Language" isActive={sortCol === 'language'} isAsc={sortDir === 'asc'} />
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <SortHeader href={sortHref('ethnologue_status')} label="Ethnologue" isActive={sortCol === 'ethnologue_status'} isAsc={sortDir === 'asc'} />
                            <InfoTooltip text="EGIDS classification: International = used globally; National = official in a country; Vigorous = all generations actively use it; Threatened = not being passed to children at the rate needed for long-term survival." side="top" />
                          </span>
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <SortHeader href={sortHref('stt')} label="STT" isActive={sortCol === 'stt'} isAsc={sortDir === 'asc'} />
                            <InfoTooltip text="Speech-to-text quality: production = commercial-grade; usable = functional with review; experimental = research-stage; none = no viable solution." side="top" />
                          </span>
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <SortHeader href={sortHref('tts')} label="TTS" isActive={sortCol === 'tts'} isAsc={sortDir === 'asc'} />
                            <InfoTooltip text="Text-to-speech quality. Same scale as STT." side="top" />
                          </span>
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <SortHeader href={sortHref('status')} label="Status" isActive={sortCol === 'status'} isAsc={sortDir === 'asc'} />
                            <InfoTooltip text="Pipeline status for this language in Babagigi: planned = queued for development; in-development = actively being built; live = available to users; deferred = postponed." side="top" />
                          </span>
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            Communities
                            <InfoTooltip text="Number of community records in the database that list this as a primary language. Hover a count to see community names." side="top" />
                          </span>
                        </th>
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
                              {techByLang[entry.language_id] ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[techByLang[entry.language_id].stt] ?? 'bg-muted text-muted-foreground'}`}>
                                  {techByLang[entry.language_id].stt}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {techByLang[entry.language_id] ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[techByLang[entry.language_id].tts] ?? 'bg-muted text-muted-foreground'}`}>
                                  {techByLang[entry.language_id].tts}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
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
