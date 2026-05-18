import Link from 'next/link';

// ─── Version history ────────────────────────────────────────────────────────
// Add an entry here whenever the platform changes. Most recent first.
const VERSIONS = [
  {
    version: '0.6.0',
    date: '2026-05-17',
    changes: [
      'Comprehensive filter system: replaced all admin list page filter forms with FilterBar client component (auto-applying selects, active filter chips, clear all).',
      'Languages: added Ethnologue status and Constructed/Natural filters.',
      'Tech Readiness: added language name search, Omnilingual, and IPA path filters.',
      'Communities: added Self-identified filter.',
      'Added Documentation and Sources pages to admin sidebar.',
      'Separated sidebar navigation into Data and Products sections.',
      'seed:glottolog-endangerment: fixed Code_ID column matching; now inserts 8,242 vitality_assessments rows and fills 4,170 ethnologue_status values.',
      'Fixed UNESCO P1999 label mapping (Wikidata uses "1 safe", "2 vulnerable" prefix format).',
    ],
  },
  {
    version: '0.5.0',
    date: '2026-05-16',
    changes: [
      'Added 5 bulk seed scripts: seed:wikidata, seed:wals, seed:common-voice, seed:glottolog-endangerment, seed:iso639.',
      'seed:wikidata populates wikidata_qid (~8,162 languages), speaker_populations (~1,677 global rows), orthographies (~2,055 writing systems), and vitality_assessments via UNESCO P1999.',
      'seed:wals fills wals_code for ~2,423 languages and inserts reference_identifiers rows.',
      'seed:common-voice inserts 257 audio_corpora rows (CC0) and updates tech_readiness.common_voice_hours_validated.',
      'seed:iso639 fills iso_639_1 (two-letter codes) for 127 languages.',
    ],
  },
  {
    version: '0.4.0',
    date: '2026-05-14',
    changes: [
      'Tech Readiness admin: list page with search/filter, edit page for all tech fields, pipeline integration.',
      'seed:tech-readiness script for bulk population of ~75 curated languages.',
      'Click-to-sort added to all admin list tables.',
    ],
  },
  {
    version: '0.3.0',
    date: '2026-05-10',
    changes: [
      'migration-012: cleaned Wikidata URI literals from endonyms (kept plain text values only).',
      'migration-011: marked constructed languages (Esperanto, Interlingua, etc.) via glottolog Family_ID.',
      'migration-010: fixed boolean field defaults.',
      'migration-009: added glottocode uniqueness constraint.',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-05-05',
    changes: [
      'seed:endonyms: populated ~970 endonyms from Wikidata P1705.',
      'seed:geonames: populated 244 places (countries) from GeoNames.',
      'migration-008: curated data for 33 Babagigi target languages (speaker populations, vitality, cultural dimensions, field partnerships, product assignments).',
      'Babagigi admin page added.',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-04-28',
    changes: [
      'Initial schema deployed (migrations 000–007): languages, places, organizations, communities, and all Layer 2–4 tables.',
      'seed:glottolog: populated 8,618 languages from Glottolog CLDF.',
      'Admin UI: CRUD for languages, places, organizations, communities.',
      'Search page, Supabase Auth, admin layout.',
    ],
  },
];

// ─── Glossary ────────────────────────────────────────────────────────────────
const GLOSSARY = [
  {
    term: 'AES (Agglomerated Endangerment Status)',
    definition:
      'Glottolog\'s composite endangerment scale, synthesizing multiple frameworks. Values: not endangered → threatened → shifting → moribund → nearly extinct → extinct. Used to populate vitality_assessments.',
  },
  {
    term: 'assessment_scope',
    definition:
      'Spatial scope of a vitality or transmission assessment. "global" = worldwide population; "diaspora" = speakers outside the homeland; "homeland" = speakers within the traditional territory.',
  },
  {
    term: 'audio_corpora',
    definition:
      'Table recording known audio datasets for a language (e.g. Mozilla Common Voice, FLEURS). Tracks validated hours, speaker count, license, and speech type.',
  },
  {
    term: 'BCP 47',
    definition:
      'IETF Best Current Practice 47 — the standard for language identification tags (e.g. "en", "pt-BR", "kmr"). Used by Mozilla Common Voice and web/OS APIs.',
  },
  {
    term: 'CLDF (Cross-Linguistic Data Formats)',
    definition:
      'A standardized format for linguistic datasets, used by Glottolog and WALS. Data is distributed as CSV files with a metadata JSON. The seed scripts fetch Glottolog-CLDF and WALS-CLDF directly.',
  },
  {
    term: 'communities',
    definition:
      'Spine entity representing a speech community — the social group that uses a language. Distinct from the language itself: one language may have multiple communities (diaspora, homeland, urban).',
  },
  {
    term: 'confidence (field)',
    definition:
      'How certain we are about a data point. Enum: "verified" (directly confirmed by community or primary source), "high" (strong secondary evidence), "medium" (reasonable estimate), "estimated" (modeled or inferred), "low" (weak evidence). Defaults to "medium" for bulk-seeded data.',
  },
  {
    term: 'cultural_dimensions',
    definition:
      'Table tracking cultural and sociolinguistic factors for a community: intergenerational transmission rate, urban migration rate, mixed-marriage rate, economic pressure index.',
  },
  {
    term: 'domain_usage',
    definition:
      'Table tracking which social domains a language is actively used in (home, education, commerce, religious, government, media, internet). Each row is a domain + presence level.',
  },
  {
    term: 'EGIDS (Expanded Graded Intergenerational Disruption Scale)',
    definition:
      'SIL/Ethnologue\'s 13-level scale for language vitality, from 0 (International) to 10 (Extinct). Stored as egids_level in vitality_assessments.',
  },
  {
    term: 'egids_level',
    definition:
      'Enum stored in vitality_assessments. Values: 0-international, 1-national, 2-regional, 3-trade, 4-educational, 5-written, 6a-vigorous, 6b-threatened, 7-shifting, 8a-moribund, 8b-nearly-extinct, 9-dormant, 10-extinct.',
  },
  {
    term: 'endonym',
    definition:
      'The name a speech community uses for its own language in that language (e.g. "Español" for Spanish, "中文" for Chinese). Sourced from Wikidata P1705.',
  },
  {
    term: 'ethnologue_status',
    definition:
      'Simplified vitality classification from SIL Ethnologue. Enum: International, National, Vigorous, Threatened, Shifting, Moribund. Populated from Glottolog AES mappings and migration-008 curated data.',
  },
  {
    term: 'geographic_concentrations',
    definition:
      'Table recording where speakers of a language are concentrated at sub-national level (state, province, region). Links to places via place_id.',
  },
  {
    term: 'glottocode',
    definition:
      'Glottolog\'s unique identifier for a language or dialect — 4 letters + 4 digits (e.g. "stan1288" for Standard German). The primary cross-reference key for the languages table.',
  },
  {
    term: 'granularity',
    definition:
      'The linguistic level of a languages row. Enum: macrolanguage (e.g. Arabic), language, dialect, variety, register. Most rows are "language".',
  },
  {
    term: 'institutional_support',
    definition:
      'Table tracking formal recognition and support: government official status, education rights, presence in national census, UNESCO recognition.',
  },
  {
    term: 'iso_639_1',
    definition:
      'Two-letter language code from ISO 639-1 (e.g. "en", "fr", "zh"). Only ~184 major languages have one. Sourced from ISO 639-3 SIL tab file.',
  },
  {
    term: 'iso_639_3',
    definition:
      'Three-letter language code from ISO 639-3 (e.g. "eng", "fra", "cmn"). Nearly all languages have one. Primary ISO identifier in our schema.',
  },
  {
    term: 'languages',
    definition:
      'Core spine entity. One row per language/dialect/variety. 8,600+ rows seeded from Glottolog CLDF. The anchor for all Layer 2 observational data.',
  },
  {
    term: 'Layer 1 — Spine',
    definition:
      'The four core entities: languages, places, organizations, communities. Stable reference data that rarely changes.',
  },
  {
    term: 'Layer 2 — Observational',
    definition:
      'Time-series, append-only tables recording measurements about languages and communities: vitality_assessments, speaker_populations, transmission_assessments, domain_usage, cultural_dimensions, institutional_support, documentation_status, revitalization_programs, orthographies, geographic_concentrations, audio_corpora, funding_landscape.',
  },
  {
    term: 'Layer 3 — Operational',
    definition:
      'Tables managing TomorrowLabs\' own work: field_partnerships, product_status, tech_readiness, community_positions, reference_identifiers.',
  },
  {
    term: 'Layer 4 — Decision Support',
    definition:
      'Tables supporting strategic decision-making: consent_records, consent_audit_chain, access_control_policies, decision_log, sources.',
  },
  {
    term: 'organizations',
    definition:
      'Spine entity representing any organization relevant to language preservation: universities, NGOs, government agencies, funding bodies, tech companies.',
  },
  {
    term: 'orthographies',
    definition:
      'Table recording writing systems for a language: script name, ISO 15924 script code (e.g. "Latn", "Arab"), whether it\'s the primary script, font rendering notes.',
  },
  {
    term: 'places',
    definition:
      'Spine entity representing geographic locations: countries (ISO 3166-1 alpha-2 codes), regions, cities. 244 countries seeded from GeoNames.',
  },
  {
    term: 'product_status',
    definition:
      'Tracks which TomorrowLabs products are planned/active/launched for a given language. Phase enum: research, planning, development, soft-launch, launched, paused, deprecated.',
  },
  {
    term: 'reference_identifiers',
    definition:
      'Cross-reference table mapping our language IDs to external system identifiers: WALS codes, PHOIBLE IDs, ELP IDs, OLAC records, etc.',
  },
  {
    term: 'reliability_rating',
    definition:
      'How trustworthy a source is. Enum: "high" (authoritative primary source), "medium" (secondary source, reasonable quality), "low" (rough estimate or anecdotal). Every source has one.',
  },
  {
    term: 'source_id',
    definition:
      'Foreign key on most observational tables pointing to the sources table. Required — no fact may be inserted without provenance.',
  },
  {
    term: 'speaker_populations',
    definition:
      'Time-series table of speaker count estimates for a language, segmented by region, age cohort, and fluency level. Multiple rows per language from different sources are expected.',
  },
  {
    term: 'tech_readiness',
    definition:
      'One row per language tracking the technical infrastructure available: keyboard/IME support, TTS/ASR/NLP model availability, Wikipedia presence, Common Voice hours, Unicode support.',
  },
  {
    term: 'transmission_assessments',
    definition:
      'Table recording intergenerational language transmission: what % of children learn the language at home, whether use is increasing/stable/declining, trajectory over time.',
  },
  {
    term: 'UNESCO vitality',
    definition:
      'UNESCO\'s 6-level classification from the Atlas of the World\'s Languages in Danger. Stored as unesco_vitality in vitality_assessments. Values: safe, vulnerable, definitely-endangered, severely-endangered, critically-endangered, extinct.',
  },
  {
    term: 'vitality_assessments',
    definition:
      'Append-only table recording endangerment assessments for a language: EGIDS level, UNESCO vitality, assessment scope, source, date, and confidence. Multiple rows per language from different sources. 8,200+ rows seeded from Glottolog AES.',
  },
  {
    term: 'wals_code',
    definition:
      'The World Atlas of Language Structures identifier for a language (e.g. "eng", "tur"). WALS covers ~2,600 languages with typological feature data.',
  },
  {
    term: 'wikidata_qid',
    definition:
      'The Wikidata entity ID for a language (e.g. "Q1860" for English). Used as a cross-reference and to fetch additional data via SPARQL queries.',
  },
];

// ─── Tables reference ────────────────────────────────────────────────────────
const TABLES = [
  // Layer 1
  { layer: 1, name: 'languages', description: 'Core language/dialect registry. Primary spine entity. ~8,600 rows from Glottolog CLDF.' },
  { layer: 1, name: 'places', description: 'Countries and geographic locations. 244 countries from GeoNames.' },
  { layer: 1, name: 'organizations', description: 'Universities, NGOs, government agencies, funders relevant to language preservation.' },
  { layer: 1, name: 'communities', description: 'Speech communities — social groups using a language, distinct from the language itself.' },
  // Layer 2
  { layer: 2, name: 'vitality_assessments', description: 'Append-only endangerment assessments (EGIDS, UNESCO vitality). 8,200+ rows from Glottolog AES.' },
  { layer: 2, name: 'speaker_populations', description: 'Time-series speaker count estimates by region, age, and fluency.' },
  { layer: 2, name: 'transmission_assessments', description: 'Intergenerational transmission rates and trajectory.' },
  { layer: 2, name: 'domain_usage', description: 'Which social domains (home, education, commerce, etc.) a language is active in.' },
  { layer: 2, name: 'cultural_dimensions', description: 'Sociolinguistic factors: urban migration, mixed-marriage rates, economic pressure.' },
  { layer: 2, name: 'institutional_support', description: 'Government recognition, education rights, census presence.' },
  { layer: 2, name: 'documentation_status', description: 'Whether a grammar, dictionary, or audio corpus exists.' },
  { layer: 2, name: 'revitalization_programs', description: 'Language nests, immersion schools, community programs.' },
  { layer: 2, name: 'orthographies', description: 'Writing systems and script codes. ~2,000+ rows from Wikidata P282.' },
  { layer: 2, name: 'geographic_concentrations', description: 'Sub-national speaker concentration data.' },
  { layer: 2, name: 'audio_corpora', description: 'Known audio datasets (Common Voice, FLEURS, etc.). 257+ rows.' },
  { layer: 2, name: 'funding_landscape', description: 'Grant-makers and funders active in language preservation.' },
  // Layer 3
  { layer: 3, name: 'field_partnerships', description: 'TomorrowLabs partner organizations per language.' },
  { layer: 3, name: 'product_status', description: 'Which TomorrowLabs products are planned/active for a language.' },
  { layer: 3, name: 'tech_readiness', description: 'Technical infrastructure scores: keyboards, TTS/ASR, Wikipedia, Common Voice, NLP.' },
  { layer: 3, name: 'community_positions', description: 'Where community classification differs from Glottolog.' },
  { layer: 3, name: 'reference_identifiers', description: 'Cross-refs to WALS, PHOIBLE, ELP, OLAC. 2,400+ WALS rows.' },
  // Layer 4
  { layer: 4, name: 'consent_records', description: 'Community consent for data collection and use.' },
  { layer: 4, name: 'consent_audit_chain', description: 'Immutable audit log of all consent events.' },
  { layer: 4, name: 'access_control_policies', description: 'Who may query what data under which conditions.' },
  { layer: 4, name: 'decision_log', description: 'Strategic decisions with rationale and outcomes.' },
  { layer: 4, name: 'sources', description: 'Canonical source registry. Every fact requires a source_id.' },
];

const LAYER_LABELS: Record<number, string> = {
  1: 'Layer 1 — Spine',
  2: 'Layer 2 — Observational',
  3: 'Layer 3 — Operational',
  4: 'Layer 4 — Decision Support',
};

const LAYER_COLORS: Record<number, string> = {
  1: 'bg-blue-50 text-blue-800 border-blue-200',
  2: 'bg-green-50 text-green-800 border-green-200',
  3: 'bg-amber-50 text-amber-800 border-amber-200',
  4: 'bg-purple-50 text-purple-800 border-purple-200',
};

export default function DocumentationPage() {
  const layerGroups = [1, 2, 3, 4].map((layer) => ({
    layer,
    tables: TABLES.filter((t) => t.layer === layer),
  }));

  return (
    <div className="flex gap-8 px-8 py-8 max-w-6xl">
      {/* Sticky TOC */}
      <aside className="w-48 shrink-0 hidden lg:block">
        <nav className="sticky top-8 space-y-1 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Contents</p>
          {[
            ['#overview', 'Overview'],
            ['#architecture', 'Architecture'],
            ['#tables', 'Tables'],
            ['#glossary', 'Glossary'],
            ['#changelog', 'Changelog'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="block py-1 text-muted-foreground hover:text-ink transition-colors">
              {label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-12">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Documentation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform reference — updated with each release.{' '}
            <span className="font-medium text-ink">Current version: {VERSIONS[0]?.version}</span>
          </p>
        </div>

        {/* Overview */}
        <section id="overview">
          <h2 className="text-lg font-semibold text-ink mb-3">Overview</h2>
          <div className="prose prose-sm max-w-none text-ink/80 space-y-3">
            <p>
              TomorrowLabs Platform is the data infrastructure for language preservation work. It stores
              structured data about the world&apos;s languages — their vitality, documentation, speaker
              populations, technical readiness, and cultural dimensions — in a way that treats community
              data with research-grade seriousness.
            </p>
            <p>
              The admin UI (this interface) is the internal tool for browsing, editing, and quality-checking
              the data. It is not community-facing. Public and community-facing features are deliberately
              deferred pending community co-design.
            </p>
            <p>
              The platform serves two TomorrowLabs products:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Babagigi</strong> — a bilingual storybook platform helping diaspora grandparents
                record stories in heritage languages. Currently serves 33 target languages.
              </li>
              <li>
                <strong>Little Digital Library (LDL)</strong> — an offline-first educational platform for
                partner communities. In planning.
              </li>
            </ul>
          </div>
        </section>

        {/* Architecture */}
        <section id="architecture">
          <h2 className="text-lg font-semibold text-ink mb-3">Data Architecture</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The schema is organized into four layers with distinct purposes and access patterns.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((layer) => (
              <div
                key={layer}
                className={`rounded-lg border p-4 ${LAYER_COLORS[layer]}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-1">{LAYER_LABELS[layer]}</p>
                <p className="text-xs leading-relaxed">
                  {layer === 1 && 'Stable reference entities: languages, places, organizations, communities. The anchor for everything else.'}
                  {layer === 2 && 'Append-only time-series observations: vitality, populations, transmission, orthographies, audio corpora. Never overwrite — always add new rows.'}
                  {layer === 3 && 'TomorrowLabs operational data: partnerships, product status, tech readiness, cross-references. Tracks our own work.'}
                  {layer === 4 && 'Governance infrastructure: consent records, audit chains, access policies, decision log, source registry.'}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg border border-border bg-background text-sm space-y-2">
            <p className="font-medium text-ink">Critical invariants</p>
            <ul className="text-muted-foreground space-y-1 text-xs list-disc list-inside ml-2">
              <li>Every fact must have a <code className="text-xs bg-muted px-1 rounded">source_id</code>. No unsourced data.</li>
              <li>Layer 2 tables are append-only. Corrections add new rows, never UPDATE.</li>
              <li>Every <code className="text-xs bg-muted px-1 rounded">confidence_level</code> must be populated honestly. "estimated" beats dishonest "high".</li>
              <li>Consent infrastructure sits above operational logic. Nothing accesses community data without checking <code className="text-xs bg-muted px-1 rounded">consent_records</code>.</li>
              <li>Schema extensions are additive only — new migration files, never modifying existing ones, never DROP without explicit approval.</li>
            </ul>
          </div>
        </section>

        {/* Tables */}
        <section id="tables">
          <h2 className="text-lg font-semibold text-ink mb-3">Tables</h2>
          <div className="space-y-6">
            {layerGroups.map(({ layer, tables }) => (
              <div key={layer}>
                <p className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded border inline-block mb-3 ${LAYER_COLORS[layer]}`}>
                  {LAYER_LABELS[layer]}
                </p>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground w-48">Table</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {tables.map((t) => (
                        <tr key={t.name} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-ink">{t.name}</code>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{t.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Glossary */}
        <section id="glossary">
          <h2 className="text-lg font-semibold text-ink mb-3">Glossary</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Key terms, column names, and enum values used across the platform.
          </p>
          <dl className="space-y-0 border border-border rounded-lg overflow-hidden divide-y divide-border">
            {GLOSSARY.map((entry) => (
              <div key={entry.term} className="px-4 py-3 hover:bg-muted/20">
                <dt className="text-sm font-medium text-ink">{entry.term}</dt>
                <dd className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Changelog */}
        <section id="changelog">
          <h2 className="text-lg font-semibold text-ink mb-3">Changelog</h2>
          <div className="space-y-4">
            {VERSIONS.map((v, i) => (
              <div key={v.version} className="flex gap-4">
                <div className="shrink-0 w-24 text-right">
                  <span className={`text-xs font-mono font-semibold ${i === 0 ? 'text-moss' : 'text-muted-foreground'}`}>
                    v{v.version}
                  </span>
                  <p className="text-xs text-muted-foreground">{v.date}</p>
                </div>
                <div className="flex-1 min-w-0 border-l border-border pl-4 pb-4">
                  <ul className="space-y-1">
                    {v.changes.map((c, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-border mt-0.5 shrink-0">—</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
