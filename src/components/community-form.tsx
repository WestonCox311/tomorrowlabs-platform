'use client';

import type { Database } from '@/lib/database.types';

type Community = Database['public']['Tables']['communities']['Row'];

const COMMUNITY_TYPES = ['diaspora', 'indigenous', 'religious', 'linguistic', 'professional', 'cultural'] as const;
const CONFIDENCE_LEVELS: Database['public']['Enums']['confidence_level'][] = ['high', 'medium', 'low', 'estimated'];

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Community>;
  cancelHref: string;
  error?: string;
}

export function CommunityForm({ action, defaultValues, cancelHref, error }: Props) {
  return (
    <form action={action} className="space-y-6">
      {error && (
        <p className="text-destructive font-mono text-sm bg-destructive/10 p-3 rounded-md">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">
            English name <span className="text-destructive">*</span>
          </label>
          <input
            name="english_name"
            required
            defaultValue={defaultValues?.english_name ?? ''}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Endonym</label>
          <input
            name="endonym"
            defaultValue={defaultValues?.endonym ?? ''}
            placeholder="Name in the community's own language"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Community type</label>
          <select
            name="community_type"
            defaultValue={defaultValues?.community_type ?? ''}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <option value="">—</option>
            {COMMUNITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Self-identified community</label>
          <select
            name="is_self_identified_community"
            defaultValue={defaultValues?.is_self_identified_community === false ? 'false' : 'true'}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <option value="true">Yes — community defines itself this way</option>
            <option value="false">No — externally classified</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Self-identification basis</label>
          <input
            name="self_identification_basis"
            defaultValue={defaultValues?.self_identification_basis ?? ''}
            placeholder="How does the community define itself?"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>
      </div>

      <fieldset className="border border-border rounded-md p-4">
        <legend className="text-xs font-medium text-muted-foreground px-1">Population estimate</legend>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Global population</label>
            <input
              name="estimated_global_population"
              type="number"
              min="0"
              defaultValue={defaultValues?.estimated_global_population ?? ''}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Confidence</label>
            <select
              name="estimated_population_confidence"
              defaultValue={defaultValues?.estimated_population_confidence ?? ''}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
            >
              <option value="">—</option>
              {CONFIDENCE_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Informational only — not authoritative. Use &ldquo;estimated&rdquo; when the number is a rough order-of-magnitude.
        </p>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Notes</label>
        <textarea
          name="notes"
          rows={4}
          defaultValue={defaultValues?.notes ?? ''}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
        >
          Save
        </button>
        <a
          href={cancelHref}
          className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
