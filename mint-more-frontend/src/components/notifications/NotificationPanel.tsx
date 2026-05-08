"use client";

import { formatRelativeTime } from "@/lib/utils/formatters";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { CheckCheck, Loader2, BellOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Notification } from "@/types";

const TYPE_COLORS: Record<string, string> = {
  job_matched: "#3b82f6",
  negotiation_initiated: "#8b5cf6",
  negotiation_offer: "#8b5cf6",
  negotiation_counter: "#fb923c",
  negotiation_accepted: "#34d399",
  negotiation_rejected: "#ef4444",
  deal_approved: "#34d399",
  kyc_approved: "#34d399",
  kyc_rejected: "#ef4444",
  account_approved: "#34d399",
  account_rejected: "#ef4444",
  default: "#6b7280",
};

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const dotColor =
    TYPE_COLORS[notification.type] ?? TYPE_COLORS.default;

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 cursor-pointer transition-colors",
        notification.isRead
          ? "hover:bg-surface-soft"
          : "bg-brand-accent/4 hover:bg-brand-accent/8"
      )}
      onClick={() => {
        if (!notification.isRead) onRead(notification.id);
      }}
    >
      {/* Color dot */}
      <div className="flex-shrink-0 mt-1.5">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: notification.isRead ? "#e5e7eb" : dotColor,
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-body-sm leading-snug",
            notification.isRead ? "text-muted" : "text-ink font-medium"
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-soft mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose: _ }: NotificationPanelProps) {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } =
    useNotifications();

  return (
    <div className="absolute right-0 top-11 w-80 sm:w-96 bg-canvas rounded-xl border border-hairline shadow-card z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
        <div className="flex items-center gap-2">
          <h3 className="text-title-sm text-ink">Notifications</h3>
          {unreadCount > 0 && (
            <span className="badge-pill bg-error text-white text-xs px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-muted" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <BellOff size={28} className="text-surface-strong" />
            <p className="text-body-sm text-muted">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-hairline-soft">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={markRead} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-hairline">
          <p className="text-xs text-muted text-center">
            Showing {notifications.length} notifications
          </p>
        </div>
      )}
    </div>
  );
}