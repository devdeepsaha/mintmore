'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, Sparkles, Wallet, Inbox,
  PlayCircle, DollarSign, Handshake, Users, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUserRole } from '@/lib/stores/authStore';
import {
  CLIENT_MOBILE_NAV,
  FREELANCER_MOBILE_NAV,
  ADMIN_MOBILE_NAV,
} from '@/config/navigation';
import type { NavItem } from '@/config/navigation';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Briefcase, Sparkles, Wallet, Inbox,
  PlayCircle, DollarSign, Handshake, Users, ShieldCheck,
};

/**
 * Bottom navigation bar shown on mobile (< lg breakpoint).
 * Max 4 items per role — the most important entry points.
 */
export const MobileNav = () => {
  const pathname = usePathname();
  const role = useUserRole();

  const items: NavItem[] =
    role === 'admin'
      ? ADMIN_MOBILE_NAV
      : role === 'client'
      ? CLIENT_MOBILE_NAV
      : FREELANCER_MOBILE_NAV;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-slate-100 bg-white lg:hidden"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const Icon = ICON_MAP[item.icon];
        const isActive = item.exactMatch
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
              isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  'h-5 w-5',
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                )}
              />
            )}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};