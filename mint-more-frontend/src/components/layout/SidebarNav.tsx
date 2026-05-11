"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Share2,
  Wallet,
  Settings,
  Inbox,
  PlayCircle,
  DollarSign,
  User,
  ShieldCheck,
  Users,
  Handshake,
  Tag,
  BarChart2,
  Megaphone,
  ArrowUpRight,
  Bell,
  MessageCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { filterNavByFeature } from "@/lib/features/flags";
import { useUserRole } from "@/lib/stores/authStore";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { negotiationsApi } from "@/lib/api/negotiations";
import { kycApi } from "@/lib/api/kyc";
import { walletApi, type AdminWithdrawal } from "@/lib/api/wallet";
import type { NavItem } from "@/config/navigation";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Share2,
  Wallet,
  Settings,
  Inbox,
  PlayCircle,
  DollarSign,
  User,
  ShieldCheck,
  Users,
  Handshake,
  Tag,
  BarChart2,
  Megaphone,
  ArrowUpRight,
  Bell,
  MessageCircle,
  Zap,
};

interface SidebarNavProps {
  items: NavItem[];
  collapsed?: boolean;
}

/**
 * Role-aware sidebar navigation.
 * - Filters items by feature access
 * - Shows live badge counts from TanStack Query
 * - Highlights active route
 * - Supports collapsed (icon-only) mode on tablet
 */
export const SidebarNav = ({ items, collapsed = false }: SidebarNavProps) => {
  const pathname = usePathname();
  const role = useUserRole();
  const { unreadCount } = useNotificationStore();

  // Badge counts — only fetched by admin
  const { data: pendingDeals } = useQuery({
    queryKey: queryKeys.negotiations.pendingApprovals(),
    queryFn: () => negotiationsApi.adminPendingDeals(),
    enabled: role === "admin",
    staleTime: 30 * 1000,
    select: (data) => data.length,
  });

  const { data: pendingKyc } = useQuery({
    queryKey: queryKeys.kyc.pending(),
    queryFn: () => kycApi.adminPendingQueue(),
    enabled: role === "admin",
    staleTime: 30 * 1000,
    select: (data) => data.length,
  });

  const { data: pendingWithdrawals } = useQuery({
    queryKey: queryKeys.wallet.adminWithdrawals(),
    queryFn: () => walletApi.getAdminWithdrawals(),
    enabled: role === "admin",
    staleTime: 30 * 1000,
    select: (data: AdminWithdrawal[]) =>
      data.filter((w) => w.status === "pending").length,
  });

  const getBadgeCount = (badge?: NavItem["badge"]): number => {
    if (!badge) return 0;
    switch (badge) {
      case "unread_count":
        return unreadCount;
      case "pending_deals":
        return pendingDeals ?? 0;
      case "pending_kyc":
        return pendingKyc ?? 0;
      case "pending_withdrawals":
        return pendingWithdrawals ?? 0;
      default:
        return 0;
    }
  };

  const filteredItems = filterNavByFeature(items, role);

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {filteredItems.map((item) => {
        const Icon = ICON_MAP[item.icon];
        const isActive = item.exactMatch
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const badgeCount = getBadgeCount(item.badge);

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
              isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-slate-600",
                )}
              />
            )}
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {badgeCount > 0 && (
                  <span
                    className={cn(
                      "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5",
                      "text-xs font-semibold leading-none",
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
                    )}
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </>
            )}
            {/* Collapsed badge dot */}
            {collapsed && badgeCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
