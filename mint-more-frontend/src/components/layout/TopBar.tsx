"use client";

import { Menu, LogOut, User, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface TopBarProps {
  onMenuClick?: () => void;
}

/**
 * Top application bar.
 * Contains: hamburger (mobile), platform logo, SSE status, notification bell, user menu.
 */
export const TopBar = ({ onMenuClick }: TopBarProps) => {
  const { user } = useAuthStore();
  const { unreadCount, isConnected } = useNotificationStore();
  const { signOut } = useAuth();

  type SseStatus = "idle" | "connected";
  const sseStatus: SseStatus = isConnected ? "connected" : "idle";

  const sseIndicatorClass: Record<SseStatus, string> = {
    idle: "bg-slate-300",
    connected: "bg-emerald-500",
  };

  const sseTooltip: Record<SseStatus, string> = {
    idle: "Live updates inactive",
    connected: "Live updates active",
  };

  const notifHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "client"
        ? "/client"
        : "/freelancer";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-4">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-700 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo — visible on mobile when sidebar is hidden */}
      <Link
        href={notifHref}
        className="mr-auto flex items-center gap-2 lg:hidden"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
          <span className="text-xs font-bold text-white">M</span>
        </div>
        <span className="text-sm font-semibold text-slate-900">Mint More</span>
      </Link>

      {/* Spacer on desktop */}
      <div className="flex-1 lg:block" />

      {/* SSE status indicator */}
      <div className="relative" title={sseTooltip[sseStatus]}>
        <span
          className={cn(
            "block h-2 w-2 rounded-full",
            sseIndicatorClass[sseStatus],
          )}
          aria-label={sseTooltip[sseStatus]}
        />
      </div>

      {/* Notification bell */}
      <Link
        href={notifHref}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white"
            aria-hidden="true"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      {/* User menu */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
          {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <span className="hidden text-sm font-medium text-slate-700 sm:block">
          {user?.full_name?.split(" ")[0]}
        </span>
        <button
          onClick={signOut}
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-rose-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
