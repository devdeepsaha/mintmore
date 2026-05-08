import { apiClient } from "./axios";
import type { NotificationListResponse, Notification } from "@/types";

export const notificationsApi = {
  list: async (): Promise<NotificationListResponse> => {
    const res = await apiClient.get<NotificationListResponse>("/notifications");
    return res.data;
  },

  markRead: async (id: string): Promise<Notification> => {
    const res = await apiClient.patch<Notification>(
      `/notifications/${id}/read`
    );
    return res.data;
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read-all");
  },

  /**
   * Returns the SSE stream URL with the access token as a query param.
   * The token is passed as a query param because EventSource doesn't
   * support custom headers.
   */
  getStreamUrl: (token: string): string => {
    const base =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
    return `${base}/notifications/stream?token=${token}`;
  },
};