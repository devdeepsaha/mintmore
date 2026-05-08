"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/api/auth";
import type { UserRole } from "@/types";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } =
    useAuthStore();
  const router = useRouter();

  // ── Bootstrap: verify session on mount ────────────────────────────────────
  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, [setUser, setLoading]);

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear local state regardless
    } finally {
      logout();
      router.push("/login");
    }
  }, [logout, router]);

  // ── Role helpers ───────────────────────────────────────────────────────────
  const isRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user]
  );

  const dashboardPath = useCallback((): string => {
    if (!user) return "/login";
    const paths: Record<UserRole, string> = {
      client: "/client",
      freelancer: "/freelancer",
      admin: "/admin",
    };
    return paths[user.role];
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isClient: isRole("client"),
    isFreelancer: isRole("freelancer"),
    isAdmin: isRole("admin"),
    dashboardPath,
    bootstrap,
    signOut,
  };
}