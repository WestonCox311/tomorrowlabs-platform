import Link from 'next/link';
import { signOut } from '@/app/actions/auth';

const navItems = [
  { href: '/admin/languages', label: 'Languages' },
  { href: '/admin/places', label: 'Places' },
  { href: '/admin/organizations', label: 'Organizations' },
  { href: '/admin/communities', label: 'Communities' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-paper-warm">
      <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-background">
        <div className="px-6 py-5 border-b border-border">
          <span className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            TomorrowLabs
          </span>
          <p className="text-xs mt-0.5 text-muted-foreground">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm rounded-md text-ink transition-colors hover:bg-moss/10 hover:text-moss"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground transition-colors hover:bg-rust/10 hover:text-rust"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
