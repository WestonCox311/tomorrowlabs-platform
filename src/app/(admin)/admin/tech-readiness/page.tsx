import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { InfoTooltip } from '@/components/info-tooltip';
import { ClickableRow } from '@/components/clickable-row';
import { SortHeader } from '@/components/sort-header';
import type { Database } from '@/lib/database.types';

type TechQuality = Database['public']['Enums']['tech_quality_tier'];

const TIER_COLORS: Record<TechQuality, string> = {
  production: 'bg-green-100 text-green-800',
  usable: 'bg-blue-100 text-blue-800',
  experimental: 'bg-amber-100 text-amber-800',
  none: 'bg-muted text-muted-foreground',
};

const TIERS: TechQuality[] = ['production', 'usable', 'experimental', 'none'];

const TIER_ORDER: Record<string, number> = { production: 0, usable: 1, experimental: 2, none: 3 };

function TierBadge({ tier }: { tier: TechQuality | null }) {
  if (!tier) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[tier]}`}>
      {tier}
    </span>
  );
}

const ALLOWED_SORT = ['english_name', 'stt_quality_tier', 'tts_quality_tier', 'omnilingual_cer', 'common_voice_hours_validated', 'assessed_at'] as const;

interface Props {
  searchParams: Promise<{ stt?: string; tts?: string; babagigi?: string; sort?: string; dir?: string }>;
}

export default async function TechReadinessPage({ searchParams }: Props) {
  const { stt, tts, babagigi, sort: sortParam, dir: dirParam } = await searchParams;

  const sortCol = (ALLOWED_SORT as readonly string[]).includes(sortParam ?? '') ? sortParam! : 'stt_quality_tier';
  const sortDir = dirParam === 'desc' ? 'desc' : 'asc';

  const supabase = createAdminClient();

  const [trResult, babagigResult] = await Promise.all([
    supabase
      .from('tech_readiness')
      .select(`
        id,
        language_id,
        stt_quality_tier,
        tts_quality_tier,
        omnilingual_supported,
        omnilingual_cer,
        common_voice_hours_validated,
        ipa_pipeline_viable,
        assessed_at,
        languages (
          id,
          english_name,
          endonym,
          glottocode
        )
      `),

    supabase
      .from('product_status')
      .select('language_id')
      .eq('product', 'babagigi'),
  ]);

  const allRows = trResult.data ?? [];
  const babagigLangIds = new Set((babagigResult.data ?? []).map((r) => r.language_id));

  // Apply filters
  let rows = allRows;
  if (stt) rows = rows.filter((r) => r.stt_quality_tier === stt);
  if (tts) rows = rows.filter((r) => r.tts_quality_tier === tts);
  if (babagigi === 'true') rows = rows.filter((r) => babagigLangIds.has(r.language_id));

  // JS sort
  rows = [...rows].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    const langA = Array.isArray(a.languages) ? a.languages[0] : a.languages;
    const langB = Array.isArray(b.languages) ? b.languages[0] : b.languages;

    switch (sortCol) {
      case 'english_name': {
        const na = langA?.english_name ?? '';
        const nb = langB?.english_name ?? '';
        return mul * na.localeCompare(nb);
      }
      case 'stt_quality_tier': {
        const wa = TIER_ORDER[a.stt_quality_tier ?? 'none'] ?? 99;
        const wb = TIER_ORDER[b.stt_quality_tier ?? 'none'] ?? 99;
        return mul * (wa - wb);
      }
      case 'tts_quality_tier': {
        const wa = TIER_ORDER[a.tts_quality_tier ?? 'none'] ?? 99;
        const wb = TIER_ORDER[b.tts_quality_tier ?? 'none'] ?? 99;
        return mul * (wa - wb);
      }
      case 'omnilingual_cer': {
        const ca = a.omnilingual_cer ?? Infinity;
        const cb = b.omnilingual_cer ?? Infinity;
        return mul * (ca - cb);
      }
      case 'common_voice_hours_validated': {
        const ha = a.common_voice_hours_validated ?? -1;
        const hb = b.common_voice_hours_validated ?? -1;
        return mul * (hb - ha); // higher hours = better, so invert for asc
      }
      case 'assessed_at': {
        const da = a.assessed_at ?? '';
        const db = b.assessed_at ?? '';
        return mul * da.localeCompare(db);
      }
      default:
        return 0;
    }
  });

  const hasFilters = stt || tts || babagigi;

  function sortHref(col: string) {
    const params = new URLSearchParams();
    if (stt) params.set('stt', stt);
    if (tts) params.set('tts', tts);
    if (babagigi) params.set('babagigi', babagigi);
    params.set('sort', col);
    params.set('dir', sortCol === col && sortDir === 'asc' ? 'desc' : 'asc');
    return `/admin/tech-readiness?${params.toString()}`;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Tech Readiness</h1>
          <p className="text-sm text-muted-foreground mt-1">
            STT and TTS capability snapshot per language
          </p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {TIERS.map((tier) => {
          const count = allRows.filter((r) => r.stt_quality_tier === tier).length;
          return (
            <div key={tier} className="border border-border rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground capitalize">STT {tier}</p>
              <p className={`text-2xl font-semibold mt-1 ${tier === 'production' ? 'text-green-700' : tier === 'usable' ? 'text-blue-700' : tier === 'experimental' ? 'text-amber-700' : 'text-muted-foreground'}`}>
                {count}
              </p>
            </div>
          );
        })}
      </div>

      <form method="GET" className="flex gap-3 mb-6 flex-wrap">
        <select
          name="stt"
          defaultValue={stt ?? ''}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
        >
          <option value="">All STT tiers</option>
          {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          name="tts"
          defaultValue={tts ?? ''}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
        >
          <option value="">All TTS tiers</option>
          {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          name="babagigi"
          defaultValue={babagigi ?? ''}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
        >
          <option value="">All languages</option>
          <option value="true">Babagigi pipeline only</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-moss/10 transition-colors"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/admin/tech-readiness"
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <SortHeader href={sortHref('english_name')} label="Language" isActive={sortCol === 'english_name'} isAsc={sortDir === 'asc'} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('stt_quality_tier')} label="STT" isActive={sortCol === 'stt_quality_tier'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="Speech-to-Text quality tier: production = commercial-grade; usable = functional with review; experimental = research-stage; none = no viable solution." />
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('tts_quality_tier')} label="TTS" isActive={sortCol === 'tts_quality_tier'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="Text-to-Speech quality tier. Same scale as STT." />
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('omnilingual_cer')} label="Omnilingual" isActive={sortCol === 'omnilingual_cer'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="Whether Meta's Omnilingual ASR (1600+ languages, Apache 2.0) supports this language. CER = Character Error Rate — below 10% is production-viable." />
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('common_voice_hours_validated')} label="CV hours" isActive={sortCol === 'common_voice_hours_validated'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="Hours of validated audio in Mozilla Common Voice (CC0). Higher = more fine-tuning data available." />
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  IPA path
                  <InfoTooltip text="Whether a text-to-IPA-to-phoneme TTS pipeline is viable for this language. An alternative path for languages without commercial TTS." />
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <SortHeader href={sortHref('assessed_at')} label="Assessed" isActive={sortCol === 'assessed_at'} isAsc={sortDir === 'asc'} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length > 0 ? rows.map((row) => {
              const lang = Array.isArray(row.languages) ? row.languages[0] : row.languages;
              if (!lang) return null;
              const isBabagigi = babagigLangIds.has(row.language_id);
              return (
                <ClickableRow key={row.id} href={`/admin/languages/${lang.id}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{lang.english_name}</span>
                      {isBabagigi && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-moss/10 text-moss uppercase tracking-wide">
                          Babagigi
                        </span>
                      )}
                    </div>
                    {lang.endonym && lang.endonym !== lang.english_name && (
                      <p className="text-xs text-muted-foreground mt-0.5">{lang.endonym}</p>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <TierBadge tier={row.stt_quality_tier} />
                  </td>
                  <td className="px-4 py-2.5">
                    <TierBadge tier={row.tts_quality_tier} />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">
                    {row.omnilingual_supported
                      ? <span className="text-green-700 font-medium">
                          ✓{row.omnilingual_cer != null ? ` ${row.omnilingual_cer}% CER` : ''}
                        </span>
                      : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">
                    {row.common_voice_hours_validated != null && row.common_voice_hours_validated > 0
                      ? row.common_voice_hours_validated.toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {row.ipa_pipeline_viable
                      ? <span className="text-blue-700 font-medium">✓</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">
                    {row.assessed_at ?? '—'}
                  </td>
                </ClickableRow>
              );
            }) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  {hasFilters ? 'No languages match your filters.' : 'No tech readiness data yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {rows.length} language{rows.length !== 1 ? 's' : ''} with tech readiness data
        {allRows.length !== rows.length ? ` (${allRows.length} total)` : ''}
      </p>
    </div>
  );
}
