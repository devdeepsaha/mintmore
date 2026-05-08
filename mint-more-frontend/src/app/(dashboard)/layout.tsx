"use client";

import { useEffect } from "react";
import { Providers } from "@/app/providers";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSSE } from "@/lib/hooks/useSSE";
import { getAccessToken } from "@/lib/api/axios";

function SSEWirer() {
  const { isAuthenticated } = useAuthStore();
  const token = isAuthenticated ? getAccessToken() : null;
  useSSE(token);
  return null;
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SSEWirer />
      {children}
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Providers>
  );
}