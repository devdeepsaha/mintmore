"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import Link from "next/link";
import {
  Users,
  Briefcase,
  FileCheck,
  HandshakeIcon,
  ArrowRight,
  Loader2,
  TrendingUp,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { formatINR, formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: adminApi.getDashboardStats,
    enabled: !!user,
    refetchInterval: 30_000, // refresh every 30s
  });

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      sub: `${stats?.pendingApprovals ?? 0} pending approval`,
      icon: Users,
      color: "text-brand-accent",
      bg: "bg-brand-accent/10",
      href: "/admin/users",
      urgent: (stats?.pendingApprovals ?? 0) > 0,
    },
    {
      label: "Total Jobs",
      value: stats?.totalJobs ?? 0,
      sub: "All time",
      icon: Briefcase,
      color: "text-badge-violet",
      bg: "bg-badge-violet/10",
      href: "/admin/jobs",
      urgent: false,
    },
    {
      label: "Pending KYC",
      value: stats?.pendingKyc ?? 0,
      sub: "Awaiting review",
      icon: FileCheck,
      color: (stats?.pendingKyc ?? 0) > 0 ? "text-badge-orange" : "text-success",
      bg: (stats?.pendingKyc ?? 0) > 0 ? "bg-badge-orange/10" : "bg-success/10",
      href: "/admin/kyc",
      urgent: (stats?.pendingKyc ?? 0) > 0,
    },
    {
      label: "Pending Deals",
      value: stats?.pendingDeals ?? 0,
      sub: "Awaiting approval",
      icon: HandshakeIcon,
      color: (stats?.pendingDeals ?? 0) > 0 ? "text-badge-orange" : "text-success",
      bg: (stats?.pendingDeals ?? 0) > 0 ? "bg-badge-orange/10" : "bg-success/10",
      href: "/admin/negotiations",
      urgent: (stats?.pendingDeals ?? 0) > 0,
    },
  ];

  const revenueCards = [
    {
      label: "Total Revenue",
      value: formatINR(stats?.totalRevenue ?? 0),
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "This Month",
      value: formatINR(stats?.monthlyRevenue ?? 0),
      icon: Clock,
      color: "text-brand-accent",
      bg: "bg-brand-accent/10",
    },
    {
      label: "Active Negotiations",
      value: stats?.activeNegotiations ?? 0,
      icon: ShieldAlert,
      color: "text-badge-violet",
      bg: "bg-badge-violet/10",
    },
  ];

  const quickActions = [
    { label: "Review KYC Queue", href: "/admin/kyc", icon: FileCheck, badge: stats?.pendingKyc },
    { label: "Approve Deals", href: "/admin/negotiations", icon: HandshakeIcon, badge: stats?.pendingDeals },
    { label: "Manage Users", href: "/admin/users", icon: Users, badge: stats?.pendingApprovals },
    { label: "All Jobs", href: "/admin/jobs", icon: Briefcase, badge: null },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1
          className="text-ink"
          style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.5px", lineHeight: "1.2" }}
        >
          Admin Dashboard
        </h1>
        <p className="text-body-sm text-muted mt-1">
          Platform overview and pending actions.
        </p>
      </div>

      {/* Urgent alerts */}
      {!isLoading && ((stats?.pendingApprovals ?? 0) > 0 || (stats?.pendingDeals ?? 0) > 0 || (stats?.pendingKyc ?? 0) > 0) && (
        <div className="bg-badge-orange/8 border border-badge-orange/20 rounded-lg px-5 py-4 flex items-start gap-3">
          <ShieldAlert size={18} className="text-badge-orange flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-body-sm font-semibold text-ink">Action required</p>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {(stats?.pendingApprovals ?? 0) > 0 && (
                <Link href="/admin/users" className="text-body-sm text-badge-orange hover:underline">
                  {stats!.pendingApprovals} user{stats!.pendingApprovals !== 1 ? "s" : ""} pending approval
                </Link>
              )}
              {(stats?.pendingKyc ?? 0) > 0 && (
                <Link href="/admin/kyc" className="text-body-sm text-badge-orange hover:underline">
                  {stats!.pendingKyc} KYC review{stats!.pendingKyc !== 1 ? "s" : ""} pending
                </Link>
              )}
              {(stats?.pendingDeals ?? 0) > 0 && (
                <Link href="/admin/negotiations" className="text-body-sm text-badge-orange hover:underline">
                  {stats!.pendingDeals} deal{stats!.pendingDeals !== 1 ? "s" : ""} awaiting approval
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, bg, href, urgent }) => (
          <Link
            key={label}
            href={href}
            className="bg-canvas rounded-lg border border-hairline p-5 flex flex-col gap-3 hover:border-surface-strong transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className={cn("w-9 h-9 rounded-md flex items-center justify-center", bg)}>
                <Icon size={17} className={color} />
              </div>
              {urgent && (
                <span className="w-2 h-2 rounded-full bg-error" />
              )}
            </div>
            <div>
              <p className="text-2xl font-semibold text-ink" style={{ letterSpacing: "-0.5px" }}>
                {isLoading ? "—" : value}
              </p>
              <p className="text-body-sm text-muted mt-0.5">{label}</p>
              <p className="text-xs text-muted mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue + secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {revenueCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-canvas rounded-lg border border-hairline p-5 flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0", bg)}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-title-sm text-ink font-semibold">
                {isLoading ? "—" : value}
              </p>
              <p className="text-body-sm text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-canvas rounded-lg border border-hairline">
        <div className="px-5 py-4 border-b border-hairline">
          <h2 className="text-title-sm text-ink">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-hairline-soft">
          {quickActions.map(({ label, href, icon: Icon, badge }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-4 px-5 py-4 hover:bg-surface-soft transition-colors"
            >
              <div className="w-9 h-9 rounded-md bg-surface-card border border-hairline flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-ink" />
              </div>
              <span className="text-body-sm font-medium text-ink flex-1">{label}</span>
              {badge !== null && badge !== undefined && badge > 0 && (
                <span className="text-xs font-semibold bg-error text-white px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
              <ArrowRight size={14} className="text-muted flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}