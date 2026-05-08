"use client";

import { useEffect, useRef, useCallback } from "react";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { notificationsApi } from "@/lib/api/notifications";
import type { SSENotificationEvent } from "@/types";

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useSSE(token: string | null) {
  const { addNotification, setUnreadCount, setConnected } =
    useNotificationStore();

  const esRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!token || !isMounted.current) return;

    cleanup();

    const url = notificationsApi.getStreamUrl(token);
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.onopen = () => {
      if (!isMounted.current) return;
      reconnectAttempts.current = 0;
      setConnected(true);
    };

    es.onmessage = (event: MessageEvent) => {
      if (!isMounted.current) return;
      try {
        const parsed = JSON.parse(event.data as string) as SSENotificationEvent;

        if (parsed.type === "notification" && parsed.data) {
          addNotification(parsed.data);
        }

        if (parsed.unreadCount !== undefined) {
          setUnreadCount(parsed.unreadCount);
        }
      } catch {
        // Malformed SSE event — ignore
      }
    };

    es.onerror = () => {
      if (!isMounted.current) return;
      setConnected(false);
      es.close();
      esRef.current = null;

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };
  }, [token, cleanup, addNotification, setUnreadCount, setConnected]);

  useEffect(() => {
    isMounted.current = true;

    if (token) {
      connect();
    }

    return () => {
      isMounted.current = false;
      cleanup();
      setConnected(false);
    };
  }, [token, connect, cleanup, setConnected]);
}