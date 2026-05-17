'use client';

import type { Database } from '@/lib/database.types';

type Organization = Database['public']['Tables']['organizations']['Row'];

const ORG_TYPES: Database['public']['Enums']['organization_type'][] = [
  'community-organization', 'nonprofit-formal', 'foundation', 'government-agency',
  'intergovernmental', 'academic-institution', 'religious-institution', 'cultural-institution',
  'for-profit-aligned', 'for-profit-vendor', 'media-organization', 'professional-association',
  'informal-collective', 'individual-practitioner', 'peer-organization', 'competitor',
];

const INCORPORATION_STATUSES: Database['public']['Enums']['incorporation_status'][] = [
  'incorporated-nonprofit', 'incorporated-for-profit', 'incorporated-cooperative',
  'fiscally-sponsored', 'community-collective', 'informal-unincorporated', 'individual',
];

const FUNDER_CATEGORIES: Database['public']['Enums']['funder_category'][] = [
  'not-a-funder', 'private-foundation', 'family-foundation', 'corporate-foundation',
  'community-foundation', 'public-charity', 'government-grant', 'multilateral-agency',
  'individual-donor', 'crowdfunding',
];

const GEOGRAPHIC_SCOPES = ['global', 'regional', 'national', 'local'] as const;

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Organization>;
  cancelHref: string;
  error?: string;
}

export function OrganizationForm({ action, defaultValues, cancelHref, error }: Props) {
  const focusAreasDefault = defaultValues?.focus_areas?.join(', ') ?? '';

  return (
    <form action={action} className="space-y-6">
      {error && (
        <p className="text-destructive font-mono text-sm bg-destructive/10 p-3 rounded-md">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">
            Legal name <span className="text-destructive">*</span>
          </label>
          <input
            name="legal_name"
            required
            defaultValue={defaultValues?.legal_name ?? ''}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Display name</label>
          <input
            name="display_name"
            defaultValue={defaultValues?.display_name ?? ''}
            placeholder="Shorter preferred name"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Endonym</label>
          <input
            name="endonym"
            defaultValue={defaultValues?.endonym ?? ''}
            placeholder="Name in their own language"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Organization type <span className="text-destructive">*</span>
          </label>
          <select
            name="organization_type"
            required
            defaultValue={defaultValues?.organization_type ?? 'nonprofit-formal'}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Incorporation status</label>
          <select
            name="incorporation_status"
            defaultValue={defaultValues?.incorporation_status ?? ''}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <option value="">—</option>
            {INCORPORATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Funder category</label>
          <select
            name="funder_category"
            defaultValue={defaultValues?.funder_category ?? 'not-a-funder'}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            {FUNDER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Geographic scope</label>
          <select
            name="geographic_scope"
            defaultValue={defaultValues?.geographic_scope ?? ''}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <option value="">—</option>
            {GEOGRAPHIC_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Founding year</label>
          <input
            name="founding_year"
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            defaultValue={defaultValues?.founding_year ?? ''}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Website</label>
          <input
            name="primary_url"
            type="url"
            defaultValue={defaultValues?.primary_url ?? ''}
            placeholder="https://…"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div className="col-span-2 flex items-center gap-3">
          <label className="text-sm font-medium text-ink">Active</label>
          <select
            name="is_active"
            defaultValue={defaultValues?.is_active === false ? 'false' : 'true'}
            className="px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Mission statement</label>
        <textarea
          name="mission_statement"
          rows={3}
          defaultValue={defaultValues?.mission_statement ?? ''}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Focus areas</label>
        <input
          name="focus_areas"
          defaultValue={focusAreasDefault}
          placeholder="language-preservation, education, indigenous-rights (comma-separated)"
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
        />
        <p className="mt-1 text-xs text-muted-foreground">Comma-separated tags</p>
      </div>

      <fieldset className="border border-border rounded-md p-4">
        <legend className="text-xs font-medium text-muted-foreground px-1">External identifiers</legend>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">EIN</label>
            <input name="ein" defaultValue={defaultValues?.ein ?? ''} placeholder="XX-XXXXXXX" className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Wikidata ID</label>
            <input name="wikidata_id" defaultValue={defaultValues?.wikidata_id ?? ''} placeholder="e.g. Q12345" className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Candid ID</label>
            <input name="candid_id" defaultValue={defaultValues?.candid_id ?? ''} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">GuideStar ID</label>
            <input name="guidestar_id" defaultValue={defaultValues?.guidestar_id ?? ''} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Crunchbase ID</label>
            <input name="crunchbase_id" defaultValue={defaultValues?.crunchbase_id ?? ''} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Notes</label>
        <textarea
          name="notes"
          rows={3}
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
