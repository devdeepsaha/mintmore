export type NotificationType =
  | "job_matched"
  | "negotiation_initiated"
  | "negotiation_offer"
  | "negotiation_counter"
  | "negotiation_accepted"
  | "negotiation_rejected"
  | "deal_approved"
  | "assignment_created"
  | "kyc_approved"
  | "kyc_rejected"
  | "account_approved"
  | "account_rejected"
  | "job_status_changed"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  readAt?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface SSENotificationEvent {
  type: "notification" | "ping" | "connected";
  data?: Notification;
  unreadCount?: number;
  timestamp: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
}