"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { notificationsApi } from "@/lib/api/notifications";

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    isConnected,
    setNotifications,
    markRead,
    markAllRead,
  } = useNotificationStore();
  const queryClient = useQueryClient();

  const { isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await notificationsApi.list();
      // Handle both wrapped { data: [...] } and direct { notifications: [...] }
      const list = (data as any).data?.notifications
        ?? (data as any).data
        ?? data.notifications
        ?? [];
      const unread = (data as any).data?.unreadCount
        ?? data.unreadCount
        ?? list.filter((n: any) => !n.isRead && !n.is_read).length;
      setNotifications(list);
      return data;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onMutate: (id) => markRead(id),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onMutate: () => markAllRead(),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    isError,
    markRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => markAllReadMutation.mutate(),
  };
}