import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { upsertRelationship } from '@/app/actions/organizations';
import type { Database } from '@/lib/database.types';

// Use string instead of the enum so new values (active-customer, active-client, active-distributor)
// work before migration-022 types are regenerated.
type RelationshipStatus = string;
type TrustLevel = Database['public']['Enums']['trust_level'];

const REL_STATUSES: { value: RelationshipStatus; label: string }[] = [
  { value: 'active-partner',           label: 'Active partner' },
  { value: 'active-customer',          label: 'Active customer' },
  { value: 'active-client',            label: 'Active client' },
  { value: 'active-distributor',       label: 'Active distributor' },
  { value: 'active-funder',            label: 'Active funder' },
  { value: 'active-grantee',           label: 'Active grantee (TL as grantmaker)' },
  { value: 'active-vendor',            label: 'Active vendor (TL paying them)' },
  { value: 'exploratory-conversation', label: 'Exploratory conversation' },
  { value: 'prospect-not-contacted',   label: 'Prospect — not contacted yet' },
  { value: 'historical-partner',       label: 'Historical partner' },
  { value: 'declined-mutual',          label: 'Declined — mutual' },
  { value: 'declined-by-them',         label: 'Declined — by them' },
  { value: 'declined-by-us',           label: 'Declined — by us' },
  { value: 'observed-only',            label: 'Observed only (no relationship)' },
  { value: 'do-not-engage',            label: 'Do not engage' },
];

const TRUST_LEVELS: { value: TrustLevel; label: string }[] = [
  { value: 'deeply-trusted', label: 'Deeply trusted — years of demonstrated reciprocity' },
  { value: 'trusted',        label: 'Trusted — established working relationship' },
  { value: 'developing',     label: 'Developing — newer relationship, going well' },
  { value: 'cautious',       label: 'Cautious — some concerns, monitoring' },
  { value: 'damaged',        label: 'Damaged — specific issues in the relationship' },
  { value: 'unknown',        label: 'Unknown — haven\'t worked together' },
];

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function RelationshipPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('organizations')
    .select('id, legal_name, display_name')
    .eq('id', id)
    .single();

  if (!data) notFound();

  const orgName = data.display_name ?? data.legal_name;
  const today = new Date().toISOString().split('T')[0];

  const action = upsertRelationship.bind(null, id);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/organizations" className="hover:text-ink">Organizations</Link>
        <span>/</span>
        <Link href={`/admin/organizations/${id}`} className="hover:text-ink">{orgName}</Link>
        <span>/</span>
        <span className="text-ink">Update relationship</span>
      </div>

      <h1 className="text-2xl font-semibold text-ink mb-1">Update TL Relationship</h1>
      <p className="text-sm text-muted-foreground mb-6">
        This creates a new assessment row — it does not overwrite history. Every change is preserved.
      </p>

      {error && (
        <p className="text-destructive font-mono text-sm bg-destructive/10 p-3 rounded-md mb-6">{error}</p>
      )}

      <form action={action} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Assessment date */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Assessment date <span className="text-destructive">*</span>
            </label>
            <input
              name="assessment_date"
              type="date"
              required
              defaultValue={today}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Relationship status <span className="text-destructive">*</span>
            </label>
            <select
              name="relationship_status"
              required
              defaultValue="prospect-not-contacted"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
            >
              {REL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Trust level */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Trust level</label>
            <select
              name="trust_level"
              defaultValue="unknown"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
            >
              {TRUST_LEVELS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* TL owner */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">TL relationship owner</label>
            <input
              name="tomorrowlabs_relationship_owner"
              placeholder="e.g. Weston"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          {/* Active projects */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Active projects count</label>
            <input
              name="active_projects_count"
              type="number"
              min="0"
              defaultValue="0"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>
        </div>

        {/* Contact info */}
        <fieldset className="border border-border rounded-md p-4">
          <legend className="text-xs font-medium text-muted-foreground px-1">Primary contact</legend>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Name</label>
              <input
                name="primary_contact_name"
                placeholder="Full name"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Role / title</label>
              <input
                name="primary_contact_role"
                placeholder="Executive Director"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <input
                name="primary_contact_email"
                type="email"
                placeholder="contact@org.org"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Last meaningful contact</label>
              <input
                name="last_meaningful_contact"
                type="date"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Next planned contact</label>
              <input
                name="next_planned_contact"
                type="date"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
              />
            </div>
          </div>
        </fieldset>

        {/* Assessment notes */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Assessment notes</label>
          <textarea
            name="notes"
            rows={4}
            placeholder="Honest assessment of relationship status, power dynamics, reciprocity, what happened since last assessment…"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
          >
            Save assessment
          </button>
          <Link
            href={`/admin/organizations/${id}`}
            className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
