'use client';

import { useState, type ReactNode } from 'react';
import { useIsHydrated } from '@/lib/stores/authStore';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/utils/cn';

interface DashboardShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * Root dashboard shell.
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────┐
 * │ TopBar (h-14, full width)                       │
 * ├──────────┬──────────────────────────────────────┤
 * │ Sidebar  │ Main content                         │
 * │ (240px)  │ (scrollable)                         │
 * │          │                                      │
 * │ hidden   │                                      │
 * │ on < lg  │                                      │
 * └──────────┴──────────────────────────────────────┘
 * │ MobileNav (56px, fixed bottom, < lg only)      │
 * 
 * Hydration: renders skeleton until Zustand is hydrated from localStorage.
 * This prevents the flash where the sidebar shows wrong role nav.
 */
export const DashboardShell = ({ sidebar, children }: DashboardShellProps) => {
  const isHydrated = useIsHydrated();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent layout flash during Zustand hydration
  if (!isHydrated) {
    return (
      <div className="flex h-screen w-full animate-pulse flex-col bg-slate-50">
        <div className="h-14 w-full bg-white border-b border-slate-100" />
        <div className="flex flex-1">
          <div className="hidden w-60 border-r border-slate-100 bg-white lg:block" />
          <div className="flex-1 p-6">
            <div className="h-8 w-48 rounded-lg bg-slate-200 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-slate-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50">
      <TopBar onMenuClick={() => setMobileOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-100 bg-white lg:flex">
          {sidebar}
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-slate-100 bg-white shadow-xl lg:hidden">
              {sidebar}
              <button
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </aside>
          </>
        )}

        {/* Main content — scrollable */}
        <main
          className="flex-1 overflow-y-auto pb-16 lg:pb-0"
          id="main-content"
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
};