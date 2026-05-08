import { create } from "zustand";
import type { Notification, NotificationState } from "@/types";

interface NotificationStore extends NotificationState {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setUnreadCount: (count: number) => void;
  setConnected: (isConnected: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  notifications: [],
  unreadCount: 0,
  isConnected: false,

  // ── Actions ────────────────────────────────────────────────────────────────
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  setConnected: (isConnected) => set({ isConnected }),
}));