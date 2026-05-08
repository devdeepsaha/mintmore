import {
  LayoutDashboard,
  Briefcase,
  Bell,
  User,
  ShieldCheck,
  Users,
  ClipboardList,
  GitMerge,
  FileCheck,
  Tags,
  HandshakeIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem =
  | {
      type: "link";
      key: string;
      label: string;
      href: string;
      icon: LucideIcon;
      exact?: boolean;
      badge?: number;
    }
  | {
      type: "divider";
      key: string;
      label: string;
    };

// ─── Client Nav ─────────────────────────────────────────────────────────────
export function getClientNavItems(): NavItem[] {
  return [
    {
      type: "link",
      key: "client-home",
      label: "Dashboard",
      href: "/client",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      type: "divider",
      key: "div-jobs",
      label: "Jobs",
    },
    {
      type: "link",
      key: "client-jobs",
      label: "My Jobs",
      href: "/client/jobs",
      icon: Briefcase,
      exact: true,
    },
    {
      type: "divider",
      key: "div-account",
      label: "Account",
    },
    {
      type: "link",
      key: "client-notifications",
      label: "Notifications",
      href: "/client/notifications",
      icon: Bell,
    },
  ];
}

// ─── Freelancer Nav ──────────────────────────────────────────────────────────
export function getFreelancerNavItems(): NavItem[] {
  return [
    {
      type: "link",
      key: "freelancer-home",
      label: "Dashboard",
      href: "/freelancer",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      type: "divider",
      key: "div-work",
      label: "Work",
    },
    {
      type: "link",
      key: "freelancer-jobs",
      label: "Matched Jobs",
      href: "/freelancer/jobs",
      icon: Briefcase,
    },
    {
      type: "divider",
      key: "div-profile",
      label: "Profile",
    },
    {
      type: "link",
      key: "freelancer-profile",
      label: "My Profile",
      href: "/freelancer/profile",
      icon: User,
    },
    {
      type: "link",
      key: "freelancer-kyc",
      label: "KYC Verification",
      href: "/freelancer/kyc",
      icon: ShieldCheck,
    },
    {
      type: "divider",
      key: "div-account",
      label: "Account",
    },
    {
      type: "link",
      key: "freelancer-notifications",
      label: "Notifications",
      href: "/freelancer/notifications",
      icon: Bell,
    },
  ];
}

// ─── Admin Nav ───────────────────────────────────────────────────────────────
export function getAdminNavItems(): NavItem[] {
  return [
    {
      type: "link",
      key: "admin-home",
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      type: "divider",
      key: "div-users",
      label: "Users",
    },
    {
      type: "link",
      key: "admin-users",
      label: "All Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      type: "link",
      key: "admin-kyc",
      label: "KYC Queue",
      href: "/admin/kyc",
      icon: FileCheck,
    },
    {
      type: "divider",
      key: "div-jobs",
      label: "Jobs",
    },
    {
      type: "link",
      key: "admin-jobs",
      label: "All Jobs",
      href: "/admin/jobs",
      icon: ClipboardList,
    },
    {
      type: "link",
      key: "admin-matching",
      label: "Matching",
      href: "/admin/matching",
      icon: GitMerge,
    },
    {
      type: "divider",
      key: "div-deals",
      label: "Deals",
    },
    {
      type: "link",
      key: "admin-negotiations",
      label: "Deal Approvals",
      href: "/admin/negotiations",
      icon: HandshakeIcon,
    },
    {
      type: "divider",
      key: "div-settings",
      label: "Settings",
    },
    {
      type: "link",
      key: "admin-categories",
      label: "Categories",
      href: "/admin/categories",
      icon: Tags,
    },
  ];
}
