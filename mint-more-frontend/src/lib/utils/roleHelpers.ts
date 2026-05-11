import type { UserRole } from "@/types";

const ROLE_DASHBOARD: Record<UserRole, string> = {
  client: "/client",
  freelancer: "/freelancer",
  admin: "/admin",
};

export const getRoleDashboard = (role?: UserRole | null): string => {
  if (!role) return "/login";
  return ROLE_DASHBOARD[role];
};
