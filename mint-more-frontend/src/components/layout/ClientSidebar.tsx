'use client';

import Link from 'next/link';
import { SidebarNav } from './SidebarNav';
import { CLIENT_NAV, CLIENT_NAV_BOTTOM } from '@/config/navigation';

export const ClientSidebar = () => (
  <div className="flex h-full flex-col">
    {/* Brand */}
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-100 px-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
        <span className="text-xs font-bold text-white">M</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">Mint More</span>
    </div>

    {/* Primary nav */}
    <div className="flex-1 overflow-y-auto py-3">
      <SidebarNav items={CLIENT_NAV} />
    </div>

    {/* Bottom nav */}
    <div className="shrink-0 border-t border-slate-100 py-3">
      <SidebarNav items={CLIENT_NAV_BOTTOM} />
    </div>
  </div>
);