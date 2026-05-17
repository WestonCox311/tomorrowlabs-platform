'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navSections = [
  {
    label: 'Data',
    items: [
      { href: '/admin/languages', label: 'Languages' },
      { href: '/admin/places', label: 'Places' },
      { href: '/admin/organizations', label: 'Organizations' },
      { href: '/admin/communities', label: 'Communities' },
      { href: '/admin/tech-readiness', label: 'Tech Readiness' },
    ],
  },
  {
    label: 'Products',
    items: [
      { href: '/admin/babagigi', label: 'Babagigi' },
    ],
  },
];

const utilityLinks = [
  { href: '/admin/documentation', label: 'Documentation' },
  { href: '/admin/sources', label: 'Sources' },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
        isActive
          ? 'bg-moss/15 text-moss font-medium'
          : 'text-ink hover:bg-moss/10 hover:text-moss'
      }`}
    >
      {label}
    </Link>
  );
}

export function SidebarNav() {
  return (
    <div className="space-y-4">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} label={item.label} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function SidebarUtilityLinks() {
  return (
    <div className="px-3 pb-2">
      <ul className="space-y-1">
        {utilityLinks.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href} label={item.label} />
          </li>
        ))}
      </ul>
    </div>
  );
}
