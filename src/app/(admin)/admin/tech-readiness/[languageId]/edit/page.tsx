import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { upsertTechReadiness } from '@/app/actions/tech-readiness';
import type { Database } from '@/lib/database.types';

type TechQuality = Database['public']['Enums']['tech_quality_tier'];
type TechReadiness = Database['public']['Tables']['tech_readiness']['Row'];

const TIERS: TechQuality[] = ['production', 'usable', 'experimental', 'none'];

const fieldClass =
  'w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss placeholder:text-muted-foreground';
const labelClass = 'block text-sm font-medium text-ink mb-1';
const hintClass = 'mt-1 text-xs text-muted-foreground';

interface Props {
  params: Promise<{ languageId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditTechReadinessPage({ params, searchParams }: Props) {
  const { languageId } = await params;
  const { error } = await searchParams;
  const supabase = createAdminClient();

  const [langResult, trResult] = await Promise.all([
    supabase.from('languages').select('id, english_name, endonym').eq('id', languageId).single(),
    supabase.from('tech_readiness').select('*').eq('language_id', languageId).maybeSingle(),
  ]);

  if (!langResult.data) notFound();
  const lang = langResult.data;
  const tr = trResult.data as TechReadiness | null;

  const action = upsertTechReadiness.bind(null, languageId);
  const isNew = !tr;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/languages" className="hover:text-ink">Languages</Link>
        <span>/</span>
        <Link href={`/admin/languages/${languageId}`} className="hover:text-ink">{lang.english_name}</Link>
        <span>/</span>
        <span className="text-ink">Tech Readiness</span>
      </div>

      <h1 className="text-2xl font-semibold text-ink mb-1">
        {isNew ? 'Add' : 'Edit'} tech readiness
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {lang.english_name}{lang.endonym && lang.endonym !== lang.english_name ? ` · ${lang.endonym}` : ''}
      </p>

      {error && (
        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={action} className="space-y-6">
        {/* STT / TTS tiers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="stt_quality_tier">STT quality tier</label>
            <select
              id="stt_quality_tier"
              name="stt_quality_tier"
              defaultValue={tr?.stt_quality_tier ?? 'none'}
              className={fieldClass}
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <p className={hintClass}>Speech-to-text quality. Production = commercial-grade.</p>
          </div>
          <div>
            <label className={labelClass} htmlFor="tts_quality_tier">TTS quality tier</label>
            <select
              id="tts_quality_tier"
              name="tts_quality_tier"
              defaultValue={tr?.tts_quality_tier ?? 'none'}
              className={fieldClass}
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <p className={hintClass}>Text-to-speech quality.</p>
          </div>
        </div>

        {/* Omnilingual */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-medium text-ink">Omnilingual ASR (Meta)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="omnilingual_supported">Supported</label>
              <select
                id="omnilingual_supported"
                name="omnilingual_supported"
                defaultValue={tr?.omnilingual_supported ? 'true' : 'false'}
                className={fieldClass}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="omnilingual_cer">CER %</label>
              <input
                id="omnilingual_cer"
                name="omnilingual_cer"
                type="number"
                step="0.1"
                min="0"
                max="100"
                defaultValue={tr?.omnilingual_cer ?? ''}
                placeholder="e.g. 8.2"
                className={fieldClass}
              />
              <p className={hintClass}>Character Error Rate. Below 10% is production-viable.</p>
            </div>
          </div>
        </div>

        {/* Common Voice */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-medium text-ink">Mozilla Common Voice</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="common_voice_hours_validated">Validated hours</label>
              <input
                id="common_voice_hours_validated"
                name="common_voice_hours_validated"
                type="number"
                min="0"
                defaultValue={tr?.common_voice_hours_validated ?? ''}
                placeholder="e.g. 580"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="common_voice_dataset_version">Dataset version</label>
              <input
                id="common_voice_dataset_version"
                name="common_voice_dataset_version"
                type="text"
                defaultValue={tr?.common_voice_dataset_version ?? ''}
                placeholder="e.g. 24.0"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* IPA pipeline */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-medium text-ink">IPA pipeline</h2>
          <div>
            <label className={labelClass} htmlFor="ipa_pipeline_viable">Viable</label>
            <select
              id="ipa_pipeline_viable"
              name="ipa_pipeline_viable"
              defaultValue={tr?.ipa_pipeline_viable ? 'true' : 'false'}
              className={fieldClass}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
            <p className={hintClass}>Text-to-IPA-to-phoneme TTS path — alternative for languages without commercial TTS.</p>
          </div>
          <div>
            <label className={labelClass} htmlFor="ipa_pipeline_notes">IPA notes</label>
            <textarea
              id="ipa_pipeline_notes"
              name="ipa_pipeline_notes"
              rows={2}
              defaultValue={tr?.ipa_pipeline_notes ?? ''}
              placeholder="Phoneme inventory, G2P tools, complexity notes…"
              className={fieldClass}
            />
          </div>
        </div>

        {/* Keyboard / font / rendering */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-medium text-ink">Input &amp; rendering</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass} htmlFor="keyboard_support">Keyboard support</label>
              <select
                id="keyboard_support"
                name="keyboard_support"
                defaultValue={tr?.keyboard_support ?? ''}
                className={fieldClass}
              >
                <option value="">Unknown</option>
                <option value="full">Full</option>
                <option value="partial">Partial</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="font_availability">Font availability</label>
              <select
                id="font_availability"
                name="font_availability"
                defaultValue={tr?.font_availability ?? ''}
                className={fieldClass}
              >
                <option value="">Unknown</option>
                <option value="commercial">Commercial</option>
                <option value="open-source">Open-source</option>
                <option value="limited">Limited</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="rendering_complexity">Rendering complexity</label>
              <select
                id="rendering_complexity"
                name="rendering_complexity"
                defaultValue={tr?.rendering_complexity ?? ''}
                className={fieldClass}
              >
                <option value="">Unknown</option>
                <option value="standard">Standard</option>
                <option value="complex-shaping">Complex shaping</option>
                <option value="bidirectional">Bidirectional</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notable gaps / notes / date */}
        <div>
          <label className={labelClass} htmlFor="notable_gaps">Notable gaps</label>
          <textarea
            id="notable_gaps"
            name="notable_gaps"
            rows={2}
            defaultValue={tr?.notable_gaps ?? ''}
            placeholder="What's missing or limiting?"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={tr?.notes ?? ''}
            placeholder="General notes, sources, context…"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="assessed_at">Assessment date</label>
          <input
            id="assessed_at"
            name="assessed_at"
            type="date"
            defaultValue={tr?.assessed_at ?? new Date().toISOString().split('T')[0]}
            className={fieldClass}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
          >
            {isNew ? 'Add tech readiness' : 'Save changes'}
          </button>
          <Link
            href={`/admin/languages/${languageId}`}
            className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
