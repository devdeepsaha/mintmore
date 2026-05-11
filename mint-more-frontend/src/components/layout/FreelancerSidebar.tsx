'use client';

import { SidebarNav } from './SidebarNav';
import { FREELANCER_NAV, FREELANCER_NAV_BOTTOM } from '@/config/navigation';

export const FreelancerSidebar = () => (
  <div className="flex h-full flex-col">
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-100 px-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
        <span className="text-xs font-bold text-white">M</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">Mint More</span>
    </div>
    <div className="flex-1 overflow-y-auto py-3">
      <SidebarNav items={FREELANCER_NAV} />
    </div>
    <div className="shrink-0 border-t border-slate-100 py-3">
      <SidebarNav items={FREELANCER_NAV_BOTTOM} />
    </div>
  </div>
);