"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils/cn";
import { getInitials } from "@/lib/utils/formatters";
import {
  getClientNavItems,
  getFreelancerNavItems,
  getAdminNavItems,
  type NavItem,
} from "./navItems";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const navItems: NavItem[] =
    user?.role === "admin"
      ? getAdminNavItems()
      : user?.role === "freelancer"
        ? getFreelancerNavItems()
        : user?.role === "client"
          ? getClientNavItems()
          : [];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-hairline flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <span className="text-on-primary text-xs font-bold">M</span>
          </div>
          <span
            className="text-ink font-semibold text-[15px]"
            style={{ letterSpacing: "-0.3px" }}
          >
            Mint More
          </span>
        </Link>
        {/* Mobile close */}
        <button
          className="lg:hidden p-1 text-muted hover:text-ink"
          onClick={onMobileClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-hairline-soft">
        <span
          className={cn(
            "badge-pill text-xs capitalize",
            user?.role === "admin"
              ? "bg-badge-violet/10 text-badge-violet"
              : user?.role === "client"
                ? "bg-brand-accent/10 text-brand-accent"
                : "bg-success/10 text-success",
          )}
        >
          {user?.role ?? "—"}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            if (item.type === "divider") {
              return (
                <div key={item.key} className="py-3">
                  <p className="px-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              );
            }

            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href!);

            const Icon = item.icon!;

            return (
              <Link
                key={item.key}
                href={item.href!}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-on-primary"
                    : "text-muted hover:text-ink hover:bg-surface-card",
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      "ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                      isActive
                        ? "bg-on-primary/20 text-on-primary"
                        : "bg-error text-white",
                    )}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User profile at bottom */}
      {user && (
        <div className="px-4 py-4 border-t border-hairline flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-card border border-hairline flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-ink">
                {getInitials(user.full_name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-caption font-semibold text-ink truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-muted truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-canvas border-r border-hairline z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-canvas border-r border-hairline z-50 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
