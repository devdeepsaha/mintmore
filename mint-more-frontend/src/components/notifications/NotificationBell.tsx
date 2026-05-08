"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { NotificationPanel } from "./NotificationPanel";
import { cn } from "@/lib/utils/cn";

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [panelOpen, setPanelOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [panelOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className={cn(
          "relative w-9 h-9 flex items-center justify-center rounded-md transition-colors",
          panelOpen
            ? "bg-surface-card text-ink"
            : "text-muted hover:text-ink hover:bg-surface-card"
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        )}
      </button>

      {panelOpen && (
        <NotificationPanel onClose={() => setPanelOpen(false)} />
      )}
    </div>
  );
}