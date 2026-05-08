"use client";

import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { getInitials } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

export function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 bg-canvas border-b border-hairline flex-shrink-0 flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden p-2 -ml-2 text-muted hover:text-ink transition-colors"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Page title area — left side */}
      <div className="flex-1" />

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <NotificationBell />

        {/* Avatar */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-card border border-hairline flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-ink">
                {user ? getInitials(user.full_name) : ""}
              </span>
            </div>
            <span className="hidden sm:block text-body-sm font-medium text-ink">
              {user?.full_name?.split(" ")[0] ?? ""}
            </span>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={signOut}
          className="p-2 text-muted hover:text-ink transition-colors rounded-md hover:bg-surface-card"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}