export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome</h1>
      <p className="text-muted-foreground">Select a table from the sidebar to get started.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
        {[
          { label: 'Languages', href: '/admin/languages', description: 'Browse and edit language records' },
          { label: 'Places', href: '/admin/places', description: 'Manage hierarchical place data' },
          { label: 'Organizations', href: '/admin/organizations', description: 'Partner orgs and institutions' },
          { label: 'Communities', href: '/admin/communities', description: 'Community records and relationships' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block p-4 border border-border rounded-lg hover:border-moss transition-colors"
          >
            <p className="font-medium text-ink">{item.label}</p>
            <p className="text-sm text-muted mt-1">{item.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
