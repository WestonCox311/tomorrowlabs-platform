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

  const [langResult, babagigi, linkedCommunities] = await Promise.all([
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
  ]);

  if (!langResult.data) notFound();
  const lang = langResult.data as Language;

  const deleteAction = deleteLanguage.bind(null, id);

  const ps = babagigi.data;
  const communities = linkedCommunities.data ?? [];

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

      <p className="mt-6 text-xs text-muted-foreground">
        ID: <span className="font-mono">{lang.id}</span>
      </p>
    </div>
  );
}
