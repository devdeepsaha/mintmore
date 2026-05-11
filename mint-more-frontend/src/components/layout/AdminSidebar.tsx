'use client';

import { SidebarNav } from './SidebarNav';
import { ADMIN_NAV, ADMIN_NAV_BOTTOM } from '@/config/navigation';

export const AdminSidebar = () => (
  <div className="flex h-full flex-col">
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-100 px-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600">
        <span className="text-xs font-bold text-white">A</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">Mint More</span>
      <span className="ml-auto rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600">
        Admin
      </span>
    </div>
    <div className="flex-1 overflow-y-auto py-3">
      <SidebarNav items={ADMIN_NAV} />
    </div>
    <div className="shrink-0 border-t border-slate-100 py-3">
      <SidebarNav items={ADMIN_NAV_BOTTOM} />
    </div>
  </div>
);