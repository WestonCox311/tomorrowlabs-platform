import { createAdminClient as createClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/delete-button';
import { deleteLanguage } from '@/app/actions/languages';
import { InfoTooltip } from '@/components/info-tooltip';
import { CopyButton } from '@/components/copy-button';
import type { Database } from '@/lib/database.types';

type Language = Database['public']['Tables']['languages']['Row'];

interface Props {
  params: Promise<{ id: string }>;
}

const WAVE_LABELS: Record<string, string> = {
  'wave-1': 'Wave 1 — Commercial foundation',
  'wave-2': 'Wave 2 — Demand expansion',
  'wave-3': 'Wave 3 — Aging heritage',
  'wave-4': 'Wave 4 — Mission track',
};

const STATUS_COLORS: Record<string, string> = {
  live: 'bg-green-100 text-green-800',
  'in-development': 'bg-blue-100 text-blue-800',
  planned: 'bg-amber-100 text-amber-800',
  deferred: 'bg-muted text-muted-foreground',
  sunset: 'bg-red-100 text-red-800',
};

const FIELD_TOOLTIPS: Record<string, string> = {
  'Glottocode': "Glottolog's unique identifier for this language. The primary key for cross-database joins. Example: 'stan1288' for Spanish.",
  'ISO 639-3': "Three-letter code from the ISO 639-3 standard (SIL International). More comprehensive than ISO 639-1. Not all languages have one.",
  'ISO 639-1': "Two-letter code from the ISO 639-1 standard. Only ~180 major world languages have these.",
  'Granularity': "How specific this record is: 'language' = a distinct L1 language; 'dialect' = a regional variant; 'variety' = a functional variant (e.g. formal Arabic); 'macrolanguage' = an umbrella for closely related languages.",
  'Ethnologue status': "Ethnologue's EGIDS classification: International = used globally across many countries; National = official in at least one country; Vigorous = all generations use it actively; Threatened = children are not learning it at the rate needed for long-term survival.",
  'Wikidata QID': "The Wikidata entity identifier (e.g. Q1321 for Spanish). Links this record to the broader linked-data ecosystem.",
  'WALS code': "World Atlas of Language Structures code. WALS is a typological database mapping structural features across languages. Not all languages are in WALS.",
  'Linguasphere code': "Dalby's Linguasphere Register — an alternative classification that organizes languages by acoustic and structural similarity rather than genealogy.",
  'Glottolog validated': "Whether this record has been manually verified against Glottolog's current dataset. Auto-seeded records start as unvalidated.",
  'Signed language': "Whether this is a signed (visual-gestural) language rather than a spoken one.",
  'Constructed': "Whether this language was deliberately created (like Esperanto) rather than having emerged naturally in a community.",
};

export default async function LanguageDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const lmQuery = sb
    .from('language_models')
    .select('id, model_name, provider, model_type, quality_tier, is_open_source, license, source_url, notes, last_verified_at')
    .eq('language_id', id)
    .order('model_type')
    .order('quality_tier');

  const [langResult, babagigi, linkedCommunities, techResult, lmResult, spResult, gcResult] = await Promise.all([
    supabase.from('languages').select('*').eq('id', id).single(),
    supabase
      .from('product_status')
      .select('wave, status, target_launch_date, rationale, notes')
      .eq('language_id', id)
      .eq('product', 'babagigi')
      .maybeSingle(),
    supabase
      .from('communities')
      .select('id, english_name, community_type, estimated_population_confidence')
      .contains('primary_language_ids', [id]),
    supabase
      .from('tech_readiness')
      .select('stt_quality_tier, tts_quality_tier, omnilingual_supported, omnilingual_cer, common_voice_hours_validated, ipa_pipeline_viable, notable_gaps, assessed_at')
      .eq('language_id', id)
      .maybeSingle(),
    lmQuery,
    // Speaker populations (global + per-country)
    sb
      .from('speaker_populations')
      .select('country_code, context, l1_speakers, l2_speakers, heritage_speakers, data_year, confidence, notes')
      .eq('language_id', id)
      .order('l1_speakers', { ascending: false, nullsFirst: false }),
    // Geographic concentrations (where it's spoken)
    sb
      .from('geographic_concentrations')
      .select('country_code, region, region_type, estimated_speakers, is_diaspora_concentration, data_year, confidence')
      .eq('language_id', id)
      .order('estimated_speakers', { ascending: false, nullsFirst: false })
      .limit(100),
  ]);

  if (!langResult.data) notFound();
  const lang = langResult.data as Language;

  const deleteAction = deleteLanguage.bind(null, id);

  const ps = babagigi.data;
  const communities = linkedCommunities.data ?? [];
  const tr = techResult.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const languageModels: any[] = lmResult.data ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speakerPops: any[] = spResult.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geoCons: any[] = gcResult.data ?? [];

  const globalRow = speakerPops.find((r) => r.country_code === 'GLOBAL');
  const countrySpRows = speakerPops.filter((r) => r.country_code !== 'GLOBAL');

  // Batch-resolve all unique country codes → place { id, english_name }
  const allCountryCodes = Array.from(new Set([
    ...countrySpRows.map((r) => r.country_code as string),
    ...geoCons.map((r) => r.country_code as string),
  ])).filter(Boolean);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placeByCode = new Map<string, { id: string; english_name: string }>();
  if (allCountryCodes.length > 0) {
    const { data: placesData } = await sb
      .from('places')
      .select('id, english_name, iso_3166_1_alpha2')
      .in('iso_3166_1_alpha2', allCountryCodes)
      .eq('granularity', 'country');
    for (const p of placesData ?? []) {
      if (p.iso_3166_1_alpha2) placeByCode.set(p.iso_3166_1_alpha2, { id: p.id, english_name: p.english_name });
    }
  }

  const TIER_COLORS: Record<string, string> = {
    production: 'bg-green-100 text-green-800',
    usable: 'bg-blue-100 text-blue-800',
    experimental: 'bg-amber-100 text-amber-800',
    none: 'bg-muted text-muted-foreground',
  };

  type FieldValue = string | boolean | null;
  const fields: [string, FieldValue, string?][] = [
    ['English name', lang.english_name],
    ['Endonym', lang.endonym],
    ['Glottocode', lang.glottocode, 'copy'],
    ['ISO 639-3', lang.iso_639_3, 'copy'],
    ['ISO 639-1', lang.iso_639_1, 'copy'],
    ['Granularity', lang.granularity],
    ['Ethnologue status', lang.ethnologue_status],
    ['Wikidata QID', lang.wikidata_qid, 'copy'],
    ['WALS code', lang.wals_code, 'copy'],
    ['Linguasphere code', lang.linguasphere_code],
    ['Signed language', lang.is_signed_language],
    ['Constructed', lang.is_constructed],
    ['Glottolog validated', lang.glottolog_validated],
    ['Notes', lang.notes],
  ];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/languages" className="hover:text-ink">Languages</Link>
        <span>/</span>
        <span className="text-ink">{lang.english_name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{lang.english_name}</h1>
          {lang.endonym && <p className="text-muted-foreground mt-1">{lang.endonym}</p>}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/languages/${id}/edit`}
            className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            Edit
          </Link>
          <DeleteButton action={deleteAction} label="Delete language" />
        </div>
      </div>

      <dl className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {fields.map(([label, value, hint]) => (
          <div key={label} className="flex px-4 py-3 text-sm">
            <dt className="w-48 shrink-0 font-medium text-muted-foreground flex items-center">
              {label}
              {FIELD_TOOLTIPS[label] && <InfoTooltip text={FIELD_TOOLTIPS[label]} />}
            </dt>
            <dd className="text-ink">
              {value === null || value === undefined || value === ''
                ? <span className="text-muted-foreground">—</span>
                : typeof value === 'boolean'
                ? value ? 'Yes' : 'No'
                : hint === 'copy' && typeof value === 'string'
                ? <CopyButton value={value} label={label} />
                : value}
            </dd>
          </div>
        ))}
      </dl>

      {/* ── Speaker Population ──────────────────────────────────────────── */}
      <section className="mt-6 border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-muted/30 border-b border-border">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Speaker Population</h2>
        </div>

        {globalRow ? (
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm text-ink">
              <span className="font-semibold text-base">
                ~{(globalRow.l1_speakers as number).toLocaleString()}
              </span>
              {' '}speakers globally
              {globalRow.data_year && (
                <span className="text-xs text-muted-foreground ml-1">({globalRow.data_year})</span>
              )}
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                {globalRow.confidence ?? 'low'} confidence
              </span>
            </p>
          </div>
        ) : speakerPops.length === 0 ? null : null}

        {countrySpRows.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Country</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">L1 speakers</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">L2</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Heritage</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Year</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Conf.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {countrySpRows.map((row) => {
                const place = placeByCode.get(row.country_code);
                return (
                  <tr key={row.country_code} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2 font-mono text-xs">
                      {place ? (
                        <Link href={`/admin/places/${place.id}`} className="text-moss hover:underline">
                          {row.country_code}
                        </Link>
                      ) : row.country_code}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                      {row.l1_speakers != null ? (row.l1_speakers as number).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                      {row.l2_speakers != null ? (row.l2_speakers as number).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                      {row.heritage_speakers != null ? (row.heritage_speakers as number).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{row.data_year ?? '—'}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                        {row.confidence ?? '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-3 text-sm text-muted-foreground italic">
            {globalRow
              ? 'No per-country breakdown available.'
              : 'No speaker population data. Run npm run seed:wikidata-language-countries to populate.'}
          </div>
        )}
      </section>

      {/* ── Where it's spoken ───────────────────────────────────────────── */}
      <section className="mt-4 border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-muted/30 border-b border-border">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Where it&apos;s spoken
            {geoCons.length > 0 && (
              <span className="ml-1 normal-case font-normal">({geoCons.length})</span>
            )}
          </h2>
        </div>

        {geoCons.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Country</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Region type</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Est. speakers</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Diaspora?</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {geoCons.map((row) => {
                const place = placeByCode.get(row.country_code);
                return (
                  <tr key={`${row.country_code}-${row.region}`} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2 font-mono text-xs">
                      {place ? (
                        <Link href={`/admin/places/${place.id}`} className="text-moss hover:underline">
                          {row.country_code}
                        </Link>
                      ) : row.country_code}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{row.region_type ?? row.region ?? '—'}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                      {row.estimated_speakers != null ? (row.estimated_speakers as number).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {row.is_diaspora_concentration == null ? '—' : row.is_diaspora_concentration ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{row.data_year ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-3 text-sm text-muted-foreground italic">
            {countrySpRows.length > 0
              ? 'Country-level data available in Speaker Population section above.'
              : 'No geographic distribution data. Run npm run seed:wikidata-language-countries to populate.'}
          </div>
        )}
      </section>

      {/* Babagigi pipeline section */}
      {ps && (
        <section className="mt-6 border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-moss/10 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-medium text-moss uppercase tracking-wide">Babagigi</h2>
            <Link href="/admin/babagigi" className="text-xs text-moss hover:underline">View pipeline →</Link>
          </div>
          <div className="px-4 py-3 flex items-center gap-4 text-sm">
            <span className="font-medium text-ink">
              {WAVE_LABELS[ps.wave ?? ''] ?? ps.wave}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[ps.status ?? ''] ?? 'bg-muted text-muted-foreground'}`}>
              {ps.status}
            </span>
            {ps.target_launch_date && (
              <span className="text-muted-foreground text-xs">Target: {ps.target_launch_date}</span>
            )}
          </div>
          {ps.rationale && (
            <div className="px-4 pb-3 text-sm text-muted-foreground border-t border-border pt-2">
              {ps.rationale}
            </div>
          )}
        </section>
      )}

      {/* Linked communities */}
      {communities.length > 0 && (
        <section className="mt-4 border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-muted/30 border-b border-border">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Communities ({communities.length})
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {communities.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-2.5">
                <Link href={`/admin/communities/${c.id}`} className="text-sm text-moss hover:underline">
                  {c.english_name}
                </Link>
                <div className="flex items-center gap-2">
                  {c.community_type && (
                    <span className="text-xs text-muted-foreground">{c.community_type}</span>
                  )}
                  {c.estimated_population_confidence && (
                    <span className="text-xs font-mono text-muted-foreground">{c.estimated_population_confidence}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tech readiness section */}
      <section className="mt-4 border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tech Readiness</h2>
          <Link
            href={`/admin/tech-readiness/${id}/edit`}
            className="text-xs text-moss hover:underline"
          >
            {tr ? 'Edit →' : 'Add →'}
          </Link>
        </div>
        {tr ? (
          <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground mr-1">STT</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[tr.stt_quality_tier ?? 'none'] ?? ''}`}>
                {tr.stt_quality_tier}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mr-1">TTS</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[tr.tts_quality_tier ?? 'none'] ?? ''}`}>
                {tr.tts_quality_tier}
              </span>
            </div>
            {tr.omnilingual_supported && (
              <div className="text-xs text-green-700 font-medium">
                Omnilingual ✓{tr.omnilingual_cer != null ? ` (${tr.omnilingual_cer}% CER)` : ''}
              </div>
            )}
            {tr.common_voice_hours_validated != null && tr.common_voice_hours_validated > 0 && (
              <div className="text-xs text-muted-foreground">
                CV: {tr.common_voice_hours_validated.toLocaleString()}h
              </div>
            )}
            {tr.ipa_pipeline_viable && (
              <div className="text-xs text-blue-700 font-medium">IPA path ✓</div>
            )}
            {tr.assessed_at && (
              <div className="text-xs text-muted-foreground font-mono ml-auto">
                Assessed {tr.assessed_at}
              </div>
            )}
            {tr.notable_gaps && (
              <p className="w-full text-xs text-muted-foreground border-t border-border pt-2 mt-1">
                {tr.notable_gaps}
              </p>
            )}
          </div>
        ) : (
          <div className="px-4 py-3 text-sm text-muted-foreground italic">
            No tech readiness data recorded.
          </div>
        )}
      </section>

      {/* Language Models section */}
      <section className="mt-4 border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Language Models
            {languageModels.length > 0 && (
              <span className="ml-1 normal-case font-normal">({languageModels.length})</span>
            )}
          </h2>
          <Link
            href={`/admin/language-models/new?language_id=${id}`}
            className="text-xs text-moss hover:underline"
          >
            + Add
          </Link>
        </div>

        {languageModels.length === 0 ? (
          <div className="px-4 py-3 text-sm text-muted-foreground italic">
            No model resources recorded. Run seed scripts or add manually.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Group by model_type */}
            {(['stt', 'tts', 'translation', 'llm', 'g2p'] as const).map((type) => {
              const group = languageModels.filter((m) => m.model_type === type);
              if (group.length === 0) return null;
              return (
                <div key={type}>
                  <div className="px-4 py-1.5 bg-muted/20">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {type === 'stt' ? 'Speech-to-Text' : type === 'tts' ? 'Text-to-Speech' : type === 'llm' ? 'LLM' : type === 'g2p' ? 'Grapheme-to-Phoneme' : 'Translation'}
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {group.map((m) => (
                      <li key={m.id} className="flex items-start justify-between px-4 py-2.5 gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {m.source_url ? (
                              <a
                                href={m.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-moss hover:underline truncate"
                              >
                                {m.model_name}
                              </a>
                            ) : (
                              <span className="text-sm font-medium text-ink">{m.model_name}</span>
                            )}
                            <span className="text-xs text-muted-foreground">{m.provider}</span>
                            {m.quality_tier && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${TIER_COLORS[m.quality_tier] ?? 'bg-muted text-muted-foreground'}`}>
                                {m.quality_tier}
                              </span>
                            )}
                            {m.license && (
                              <span className="text-xs font-mono text-muted-foreground">{m.license}</span>
                            )}
                            {m.is_open_source === false && (
                              <span className="text-xs text-amber-700">proprietary</span>
                            )}
                          </div>
                          {m.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {m.last_verified_at && (
                            <span className="text-xs font-mono text-muted-foreground hidden sm:block">
                              {m.last_verified_at}
                            </span>
                          )}
                          <Link
                            href={`/admin/language-models/${m.id}/edit`}
                            className="text-xs text-muted-foreground hover:text-ink transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {/* Catch-all for any other types */}
            {languageModels.filter((m) => !['stt', 'tts', 'translation', 'llm', 'g2p'].includes(m.model_type)).map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-ink">{m.model_name}</span>
                <Link href={`/admin/language-models/${m.id}/edit`} className="text-xs text-muted-foreground hover:text-ink">Edit</Link>
              </li>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        ID: <span className="font-mono">{lang.id}</span>
      </p>
    </div>
  );
}
