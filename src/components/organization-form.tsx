'use client';

import type { Database } from '@/lib/database.types';

type Organization = Database['public']['Tables']['organizations']['Row'];

const ORG_TYPES: Database['public']['Enums']['organization_type'][] = [
  'community-organization', 'nonprofit-formal', 'foundation', 'government-agency',
  'intergovernmental', 'academic-institution', 'religious-institution', 'cultural-institution',
  'for-profit-aligned', 'for-profit-vendor', 'media-organization', 'professional-association',
  'informal-collective', 'individual-practitioner', 'peer-organization', 'competitor',
];

const TYPE_LABELS: Record<string, string> = {
  'community-organization': 'Community Org',
  'nonprofit-formal': 'Nonprofit',
  'foundation': 'Foundation',
  'government-agency': 'Government',
  'intergovernmental': 'Intergovernmental',
  'academic-institution': 'Academic',
  'religious-institution': 'Religious',
  'cultural-institution': 'Cultural',
  'for-profit-aligned': 'For-profit (aligned)',
  'for-profit-vendor': 'Vendor',
  'media-organization': 'Media',
  'professional-association': 'Professional Assoc.',
  'informal-collective': 'Informal',
  'individual-practitioner': 'Individual',
  'peer-organization': 'Peer Org',
  'competitor': 'Competitor',
};

const INCORPORATION_STATUSES: Database['public']['Enums']['incorporation_status'][] = [
  'incorporated-nonprofit', 'incorporated-for-profit', 'incorporated-cooperative',
  'fiscally-sponsored', 'community-collective', 'informal-unincorporated', 'individual',
];

const INC_LABELS: Record<string, string> = {
  'incorporated-nonprofit': 'Incorporated nonprofit',
  'incorporated-for-profit': 'Incorporated for-profit',
  'incorporated-cooperative': 'Cooperative',
  'fiscally-sponsored': 'Fiscally sponsored',
  'community-collective': 'Community collective',
  'informal-unincorporated': 'Informal / unincorporated',
  'individual': 'Individual',
};

const FUNDER_CATEGORIES: Database['public']['Enums']['funder_category'][] = [
  'not-a-funder', 'private-foundation', 'family-foundation', 'corporate-foundation',
  'community-foundation', 'public-charity', 'government-grant', 'multilateral-agency',
  'individual-donor', 'crowdfunding',
];

const FUNDER_LABELS: Record<string, string> = {
  'not-a-funder': 'Not a funder',
  'private-foundation': 'Private foundation',
  'family-foundation': 'Family foundation',
  'corporate-foundation': 'Corporate foundation',
  'community-foundation': 'Community foundation',
  'public-charity': 'Public charity',
  'government-grant': 'Government grant',
  'multilateral-agency': 'Multilateral agency',
  'individual-donor': 'Individual donor',
  'crowdfunding': 'Crowdfunding',
};

const GEOGRAPHIC_SCOPES = ['global', 'regional', 'national', 'local'] as const;

interface PlaceOption {
  id: string;
  english_name: string;
  granularity: string;
}

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Organization>;
  cancelHref: string;
  error?: string;
  places?: PlaceOption[];
}

const PLACE_GROUP_ORDER = ['metro-area', 'city', 'county', 'state-province', 'country'];
const PLACE_GROUP_LABELS: Record<string, string> = {
  'metro-area': 'Metro Areas',
  'city': 'Cities',
  'county': 'Counties',
  'state-province': 'States / Provinces',
  'country': 'Countries',
};

export function OrganizationForm({ action, defaultValues, cancelHref, error, places = [] }: Props) {
  const focusAreasDefault = defaultValues?.focus_areas?.join(', ') ?? '';

  const groupedPlaces = PLACE_GROUP_ORDER.reduce<Record<string, PlaceOption[]>>((acc, g) => {
    const items = places.filter((p) => p.granularity === g);
    if (items.length > 0) acc[g] = items;
    return acc;
  }, {});
  const otherPlaces = places.filter((p) => !PLACE_GROUP_ORDER.includes(p.granularity));

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
            {ORG_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>)}
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
            {INCORPORATION_STATUSES.map((s) => <option key={s} value={s}>{INC_LABELS[s] ?? s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Funder category</label>
          <select
            name="funder_category"
            defaultValue={defaultValues?.funder_category ?? 'not-a-funder'}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            {FUNDER_CATEGORIES.map((c) => <option key={c} value={c}>{FUNDER_LABELS[c] ?? c}</option>)}
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
          <label className="block text-sm font-medium text-ink mb-1">Headquarters location</label>
          <select
            name="headquarters_place_id"
            defaultValue={defaultValues?.headquarters_place_id ?? ''}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <option value="">— No location set —</option>
            {Object.entries(groupedPlaces).map(([granularity, items]) => (
              <optgroup key={granularity} label={PLACE_GROUP_LABELS[granularity] ?? granularity}>
                {items.map((p) => <option key={p.id} value={p.id}>{p.english_name}</option>)}
              </optgroup>
            ))}
            {otherPlaces.length > 0 && (
              <optgroup label="Other">
                {otherPlaces.map((p) => <option key={p.id} value={p.id}>{p.english_name}</option>)}
              </optgroup>
            )}
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
