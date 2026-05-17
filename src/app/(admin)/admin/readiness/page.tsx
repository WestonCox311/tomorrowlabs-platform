import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Suspense } from 'react';
import { InfoTooltip } from '@/components/info-tooltip';
import { SortHeader } from '@/components/sort-header';
import { FilterBar } from '@/components/filter-bar';

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

const VITALITY_COLORS: Record<string, string> = {
  safe: 'text-green-700',
  vulnerable: 'text-blue-700',
  'definitely-endangered': 'text-amber-700',
  'severely-endangered': 'text-orange-700',
  'critically-endangered': 'text-red-700',
  extinct: 'text-muted-foreground',
};

const WAVE_COLORS: Record<string, string> = {
  'wave-1': 'bg-green-100 text-green-800',
  'wave-2': 'bg-blue-100 text-blue-800',
  'wave-3': 'bg-amber-100 text-amber-800',
  'wave-4': 'bg-purple-100 text-purple-800',
};

const WAVE_ORDER: Record<string, number> = {
  'wave-1': 0, 'wave-2': 1, 'wave-3': 2, 'wave-4': 3,
};
const TIER_ORDER: Record<string, number> = {
  production: 0, usable: 1, experimental: 2, none: 3,
};
const VITALITY_ORDER: Record<string, number> = {
  safe: 0, vulnerable: 1, 'definitely-endangered': 2,
  'severely-endangered': 3, 'critically-endangered': 4, extinct: 5,
};
const STATUS_ORDER: Record<string, number> = {
  live: 0, 'in-development': 1, planned: 2, deferred: 3, sunset: 4,
};

const ALLOWED_SORT = ['wave', 'language', 'stt', 'tts', 'vitality', 'status', 'us_speakers'] as const;

interface Props {
  searchParams: Promise<{
    sort?: string;
    dir?: string;
    wave?: string;
    stt?: string;
    tts?: string;
  }>;
}

export default async function ReadinessDashboardPage({ searchParams }: Props) {
  const { sort: sortParam, dir: dirParam, wave, stt, tts } = await searchParams;

  const sortCol = (ALLOWED_SORT as readonly string[]).includes(sortParam ?? '') ? sortParam! : 'wave';
  const sortDir = dirParam === 'desc' ? 'desc' : 'asc';

  const supabase = createAdminClient();

  // Step 1: all Babagigi languages from the scorecard VIEW
  const { data: scorecards } = await supabase
    .from('language_strategic_scorecard')
    .select('*')
    .not('babagigi_wave', 'is', null);

  const glottocodes = (scorecards ?? []).map((r) => r.glottocode).filter(Boolean) as string[];

  // Step 2: get language IDs + ethnologue_status for those glottocodes
  const [langResult, commResult] = await Promise.all([
    supabase
      .from('languages')
      .select('id, glottocode, ethnologue_status')
      .in('glottocode', glottocodes),
    supabase
      .from('communities')
      .select('id, english_name, primary_language_ids'),
  ]);

  // Step 3: build lookup maps
  const langByGlottocode: Record<string, { id: string; ethnologue_status: string | null }> = {};
  for (const l of langResult.data ?? []) {
    if (l.glottocode) langByGlottocode[l.glottocode] = { id: l.id, ethnologue_status: l.ethnologue_status };
  }

  const commsByLangId: Record<string, { count: number; names: string[] }> = {};
  for (const c of commResult.data ?? []) {
    for (const langId of c.primary_language_ids ?? []) {
      if (!commsByLangId[langId]) commsByLangId[langId] = { count: 0, names: [] };
      commsByLangId[langId].count++;
      commsByLangId[langId].names.push(c.english_name);
    }
  }

  // Merge scorecard with language details
  type Row = NonNullable<typeof scorecards>[number] & {
    lang_id?: string;
    ethnologue_status?: string | null;
  };

  let rows: Row[] = (scorecards ?? []).map((sc) => {
    const langDetail = sc.glottocode ? langByGlottocode[sc.glottocode] : undefined;
    return {
      ...sc,
      lang_id: langDetail?.id,
      ethnologue_status: langDetail?.ethnologue_status,
    };
  });

  // Apply filters
  if (wave) rows = rows.filter((r) => r.babagigi_wave === wave);
  if (stt) rows = rows.filter((r) => (r.current_stt_tier ?? 'none') === stt);
  if (tts) rows = rows.filter((r) => (r.current_tts_tier ?? 'none') === tts);

  // Summary stats from the pre-filter full list
  const allRows = (scorecards ?? []);
  const totalLanguages = allRows.length;
  const totalLive = allRows.filter((r) => r.babagigi_status === 'live').length;
  const totalSttViable = allRows.filter(
    (r) => r.current_stt_tier === 'production' || r.current_stt_tier === 'usable'
  ).length;
  const totalPartners = allRows.reduce((sum, r) => sum + (Number(r.active_partnerships) ?? 0), 0);

  // Sort
  rows.sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    switch (sortCol) {
      case 'wave': {
        const oa = WAVE_ORDER[a.babagigi_wave ?? ''] ?? 99;
        const ob = WAVE_ORDER[b.babagigi_wave ?? ''] ?? 99;
        return mul * (oa - ob) || (a.language ?? '').localeCompare(b.language ?? '');
      }
      case 'language':
        return mul * (a.language ?? '').localeCompare(b.language ?? '');
      case 'stt': {
        const oa = TIER_ORDER[a.current_stt_tier ?? 'none'] ?? 99;
        const ob = TIER_ORDER[b.current_stt_tier ?? 'none'] ?? 99;
        return mul * (oa - ob);
      }
      case 'tts': {
        const oa = TIER_ORDER[a.current_tts_tier ?? 'none'] ?? 99;
        const ob = TIER_ORDER[b.current_tts_tier ?? 'none'] ?? 99;
        return mul * (oa - ob);
      }
      case 'vitality': {
        const oa = VITALITY_ORDER[a.vitality_status ?? ''] ?? 99;
        const ob = VITALITY_ORDER[b.vitality_status ?? ''] ?? 99;
        return mul * (oa - ob);
      }
      case 'status': {
        const oa = STATUS_ORDER[a.babagigi_status ?? ''] ?? 99;
        const ob = STATUS_ORDER[b.babagigi_status ?? ''] ?? 99;
        return mul * (oa - ob);
      }
      case 'us_speakers':
        return mul * ((b.us_speakers ?? 0) - (a.us_speakers ?? 0));
      default:
        return 0;
    }
  });

  function sortHref(col: string) {
    const params = new URLSearchParams();
    params.set('sort', col);
    params.set('dir', sortCol === col && sortDir === 'asc' ? 'desc' : 'asc');
    if (wave) params.set('wave', wave);
    if (stt) params.set('stt', stt);
    if (tts) params.set('tts', tts);
    return `/admin/readiness?${params.toString()}`;
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink">Language Readiness</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete readiness scorecard for all Babagigi wave languages
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground">Babagigi languages</p>
          <p className="text-2xl font-semibold text-ink mt-1">{totalLanguages}</p>
        </div>
        <div className="border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground">Live</p>
          <p className="text-2xl font-semibold text-green-700 mt-1">{totalLive}</p>
        </div>
        <div className="border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            STT viable
            <InfoTooltip text="Languages with production or usable speech-to-text quality." />
          </p>
          <p className="text-2xl font-semibold text-ink mt-1">{totalSttViable}</p>
        </div>
        <div className="border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Active partners
            <InfoTooltip text="Total active field partnerships across all Babagigi wave languages." />
          </p>
          <p className="text-2xl font-semibold text-ink mt-1">{totalPartners}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <Suspense>
          <FilterBar
            basePath="/admin/readiness"
            filters={[
              {
                param: 'wave',
                label: 'Wave',
                defaultLabel: 'All waves',
                options: [
                  { value: 'wave-1', label: 'Wave 1' },
                  { value: 'wave-2', label: 'Wave 2' },
                  { value: 'wave-3', label: 'Wave 3' },
                  { value: 'wave-4', label: 'Wave 4' },
                ],
              },
              {
                param: 'stt',
                label: 'STT tier',
                defaultLabel: 'All tiers',
                options: [
                  { value: 'production', label: 'Production' },
                  { value: 'usable', label: 'Usable' },
                  { value: 'experimental', label: 'Experimental' },
                  { value: 'none', label: 'None' },
                ],
              },
              {
                param: 'tts',
                label: 'TTS tier',
                defaultLabel: 'All tiers',
                options: [
                  { value: 'production', label: 'Production' },
                  { value: 'usable', label: 'Usable' },
                  { value: 'experimental', label: 'Experimental' },
                  { value: 'none', label: 'None' },
                ],
              },
            ]}
          />
        </Suspense>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground italic px-4 py-6 border border-border rounded-lg">
          No languages match the current filters.
        </p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                  <SortHeader href={sortHref('wave')} label="Wave" isActive={sortCol === 'wave'} isAsc={sortDir === 'asc'} />
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                  <SortHeader href={sortHref('language')} label="Language" isActive={sortCol === 'language'} isAsc={sortDir === 'asc'} />
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                  <SortHeader href={sortHref('status')} label="Status" isActive={sortCol === 'status'} isAsc={sortDir === 'asc'} />
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <SortHeader href={sortHref('stt')} label="STT" isActive={sortCol === 'stt'} isAsc={sortDir === 'asc'} />
                    <InfoTooltip text="Speech-to-text quality tier: production = commercial-grade; usable = functional with review; experimental = research-stage; none = no viable solution." side="top" />
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
                    Ethnologue
                    <InfoTooltip text="EGIDS classification: International = used globally; Vigorous = all generations use it; Threatened = not being passed to children at the needed rate." side="top" />
                  </span>
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <SortHeader href={sortHref('vitality')} label="UNESCO" isActive={sortCol === 'vitality'} isAsc={sortDir === 'asc'} />
                    <InfoTooltip text="UNESCO vitality classification from Wikidata. Safe = not endangered; through to Extinct." side="top" />
                  </span>
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <SortHeader href={sortHref('us_speakers')} label="US speakers" isActive={sortCol === 'us_speakers'} isAsc={sortDir === 'asc'} />
                    <InfoTooltip text="Estimated L1 speakers in the United States." side="top" />
                  </span>
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    US 60+%
                    <InfoTooltip text="Estimated share of US speakers aged 60 or older — a proxy for heritage language aging risk." side="top" />
                  </span>
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    Communities
                    <InfoTooltip text="Number of community records listing this as a primary language." side="top" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const comms = row.lang_id ? commsByLangId[row.lang_id] : undefined;
                return (
                  <tr key={row.glottocode} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      {row.babagigi_wave ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${WAVE_COLORS[row.babagigi_wave] ?? 'bg-muted text-muted-foreground'}`}>
                          {row.babagigi_wave.replace('wave-', 'W')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {row.lang_id ? (
                        <Link
                          href={`/admin/languages/${row.lang_id}`}
                          className="font-medium text-ink hover:text-moss transition-colors"
                        >
                          {row.language}
                        </Link>
                      ) : (
                        <span className="font-medium text-ink">{row.language}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {row.babagigi_status ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[row.babagigi_status] ?? 'bg-muted text-muted-foreground'}`}>
                          {row.babagigi_status}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {row.current_stt_tier ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[row.current_stt_tier] ?? 'bg-muted text-muted-foreground'}`}>
                          {row.current_stt_tier}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {row.current_tts_tier ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[row.current_tts_tier] ?? 'bg-muted text-muted-foreground'}`}>
                          {row.current_tts_tier}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {row.ethnologue_status ? (
                        <span className={`text-xs font-medium ${ETHNOLOGUE_COLORS[row.ethnologue_status] ?? 'text-muted-foreground'}`}>
                          {row.ethnologue_status}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {row.vitality_status ? (
                        <span className={`text-xs font-medium ${VITALITY_COLORS[row.vitality_status] ?? 'text-muted-foreground'}`}>
                          {row.vitality_status.replace(/-/g, ' ')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink">
                      {row.us_speakers ? row.us_speakers.toLocaleString() : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink">
                      {row.us_pct_60_plus ? `${Number(row.us_pct_60_plus).toFixed(1)}%` : <span className="text-muted-foreground">—</span>}
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

      <p className="mt-4 text-xs text-muted-foreground">
        {rows.length} of {totalLanguages} languages
      </p>
    </div>
  );
}
