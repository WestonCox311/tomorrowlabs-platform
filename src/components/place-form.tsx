'use client';

import type { Database } from '@/lib/database.types';

type Place = Database['public']['Tables']['places']['Row'];

const GRANULARITIES: Database['public']['Enums']['place_granularity'][] = [
  'world', 'continent', 'sub-continent', 'country', 'state-province',
  'metro-area', 'county', 'city', 'neighborhood', 'indigenous-territory', 'community-designated',
];

const STATUSES: Database['public']['Enums']['place_status'][] = [
  'active', 'historical', 'disputed', 'depopulated',
];

const GOVERNANCE_TYPES: Database['public']['Enums']['governance_type'][] = [
  'sovereign-state', 'autonomous-region', 'colonial-territory', 'disputed-territory',
  'tribal-governance', 'municipal', 'unincorporated', 'occupied',
];

const TERRITORY_RECOGNITIONS: Database['public']['Enums']['territory_recognition'][] = [
  'internationally-recognized', 'partially-recognized', 'unrecognized', 'self-declared', 'historical-only',
];

const CLIMATE_ZONES: Database['public']['Enums']['climate_zone'][] = [
  'tropical-wet', 'tropical-dry', 'arid', 'semi-arid', 'mediterranean',
  'humid-subtropical', 'humid-continental', 'oceanic', 'subarctic', 'polar', 'highland',
];

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Place>;
  cancelHref: string;
  error?: string;
}

export function PlaceForm({ action, defaultValues, cancelHref, error }: Props) {
  return (
    <form action={action} className="space-y-6">
      {error && (
        <p className="text-destructive font-mono text-sm bg-destructive/10 p-3 rounded-md">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">English name <span className="text-destructive">*</span></label>
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
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Granularity <span className="text-destructive">*</span></label>
          <select
            name="granularity"
            required
            defaultValue={defaultValues?.granularity ?? 'country'}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            {GRANULARITIES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Status</label>
          <select
            name="status"
            defaultValue={defaultValues?.status ?? 'active'}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Governance type</label>
          <select
            name="governance_type"
            defaultValue={defaultValues?.governance_type ?? ''}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <option value="">—</option>
            {GOVERNANCE_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <fieldset className="border border-border rounded-md p-4">
        <legend className="text-xs font-medium text-muted-foreground px-1">External identifiers</legend>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">GeoNames ID</label>
            <input name="geonames_id" defaultValue={defaultValues?.geonames_id ?? ''} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Wikidata ID</label>
            <input name="wikidata_id" defaultValue={defaultValues?.wikidata_id ?? ''} placeholder="e.g. Q424" className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">ISO 3166-1 α2</label>
            <input name="iso_3166_1_alpha2" defaultValue={defaultValues?.iso_3166_1_alpha2 ?? ''} placeholder="e.g. KH" maxLength={2} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono uppercase focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">ISO 3166-1 α3</label>
            <input name="iso_3166_1_alpha3" defaultValue={defaultValues?.iso_3166_1_alpha3 ?? ''} placeholder="e.g. KHM" maxLength={3} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono uppercase focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">ISO 3166-2</label>
            <input name="iso_3166_2" defaultValue={defaultValues?.iso_3166_2 ?? ''} placeholder="e.g. US-CA" className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Native Land CA ID</label>
            <input name="native_land_ca_id" defaultValue={defaultValues?.native_land_ca_id ?? ''} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink font-mono focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-border rounded-md p-4">
        <legend className="text-xs font-medium text-muted-foreground px-1">Geography</legend>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Latitude</label>
            <input name="latitude" type="number" step="any" defaultValue={defaultValues?.latitude ?? ''} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Longitude</label>
            <input name="longitude" type="number" step="any" defaultValue={defaultValues?.longitude ?? ''} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Area (km²)</label>
            <input name="area_sq_km" type="number" step="any" defaultValue={defaultValues?.area_sq_km ?? ''} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Timezone (IANA)</label>
            <input name="primary_timezone" defaultValue={defaultValues?.primary_timezone ?? ''} placeholder="e.g. Asia/Phnom_Penh" className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Climate zone</label>
            <select name="climate_zone" defaultValue={defaultValues?.climate_zone ?? ''} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss">
              <option value="">—</option>
              {CLIMATE_ZONES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Territory recognition</label>
            <select name="territory_recognition" defaultValue={defaultValues?.territory_recognition ?? ''} className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss">
              <option value="">—</option>
              {TERRITORY_RECOGNITIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
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
