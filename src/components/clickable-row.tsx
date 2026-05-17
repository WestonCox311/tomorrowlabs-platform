'use client';

import { useRouter } from 'next/navigation';

interface ClickableRowProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ClickableRow({ href, children, className }: ClickableRowProps) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(href)}
      className={`cursor-pointer hover:bg-muted/30 transition-colors ${className ?? ''}`}
    >
      {children}
    </tr>
  );
}
