"use client";

import { useNotifications } from "@/lib/hooks/useNotifications";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { CheckCheck, BellOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TYPE_COLORS: Record<string, string> = {
  job_matched:            "#3b82f6",
  negotiation_initiated:  "#8b5cf6",
  negotiation_offer:      "#8b5cf6",
  negotiation_counter:    "#fb923c",
  negotiation_accepted:   "#34d399",
  negotiation_rejected:   "#ef4444",
  deal_approved:          "#34d399",
  kyc_approved:           "#34d399",
  kyc_rejected:           "#ef4444",
  account_approved:       "#34d399",
  account_rejected:       "#ef4444",
  default:                "#6b7280",
};

export default function ClientNotificationsPage() {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } =
    useNotifications();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-ink"
            style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px" }}
          >
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-body-sm text-muted mt-1">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-body-sm text-muted hover:text-ink transition-colors"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-canvas rounded-lg border border-hairline overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin text-muted" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <BellOff size={28} className="text-surface-strong" />
            <p className="text-body-sm text-muted">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-hairline-soft">
            {notifications.map((n) => {
              const dotColor = TYPE_COLORS[n.type] ?? TYPE_COLORS.default;
              return (
                <div
                  key={n.id}
                  onClick={() => { if (!n.isRead) markRead(n.id); }}
                  className={cn(
                    "flex gap-4 px-5 py-4 cursor-pointer transition-colors",
                    n.isRead ? "hover:bg-surface-soft" : "bg-brand-accent/4 hover:bg-brand-accent/8"
                  )}
                >
                  <div className="flex-shrink-0 mt-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: n.isRead ? "#e5e7eb" : dotColor }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-body-sm leading-snug",
                      n.isRead ? "text-muted" : "text-ink font-medium"
                    )}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-soft mt-1.5">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}