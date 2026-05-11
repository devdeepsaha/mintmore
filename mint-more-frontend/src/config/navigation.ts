import type { FeatureId } from "@/lib/features/registry";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  featureId?: FeatureId;
  badge?:
    | "unread_count"
    | "pending_deals"
    | "pending_kyc"
    | "pending_withdrawals";
  exactMatch?: boolean;
  children?: NavItem[];
}

export const CLIENT_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/client",
    icon: "LayoutDashboard",
    exactMatch: true,
  },
  {
    label: "My Jobs",
    href: "/client/jobs",
    icon: "Briefcase",
    featureId: "jobs",
    exactMatch: true,
  },
  {
    label: "AI Tools",
    href: "/client/ai-tools",
    icon: "Sparkles",
    featureId: "ai_tools",
  },
  {
    label: "Social Publishing",
    href: "/client/social",
    icon: "Share2",
    featureId: "social_publishing",
  },
  {
    label: "Wallet",
    href: "/client/wallet",
    icon: "Wallet",
    featureId: "wallet",
  },
];

export const CLIENT_NAV_BOTTOM: NavItem[] = [
  {
    label: "Settings",
    href: "/client/settings",
    icon: "Settings",
  },
];

// ── Freelancer Navigation ───────────────────────────────────────────────────

export const FREELANCER_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/freelancer",
    icon: "LayoutDashboard",
    exactMatch: true,
  },
  {
    label: "Opportunities",
    href: "/freelancer/opportunities",
    icon: "Inbox",
    featureId: "jobs",
  },
  {
    label: "Active Work",
    href: "/freelancer/active",
    icon: "PlayCircle",
    featureId: "jobs",
  },
  {
    label: "Earnings",
    href: "/freelancer/earnings",
    icon: "DollarSign",
    featureId: "wallet",
  },
  {
    label: "My Profile",
    href: "/freelancer/profile",
    icon: "User",
    featureId: "profile",
  },
  {
    label: "KYC",
    href: "/freelancer/kyc",
    icon: "ShieldCheck",
    featureId: "kyc",
  },
];

export const FREELANCER_NAV_BOTTOM: NavItem[] = [
  {
    label: "Settings",
    href: "/freelancer/settings",
    icon: "Settings",
  },
];

// ── Admin Navigation ────────────────────────────────────────────────────────

export const ADMIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard",
    exactMatch: true,
  },
  {
    label: "Deals",
    href: "/admin/deals",
    icon: "Handshake",
    featureId: "admin_deals",
    badge: "pending_deals",
  },
  {
    label: "Jobs",
    href: "/admin/jobs",
    icon: "Briefcase",
    featureId: "jobs",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "Users",
    featureId: "admin_users",
  },
  {
    label: "KYC Queue",
    href: "/admin/kyc",
    icon: "ShieldCheck",
    featureId: "admin_kyc",
    badge: "pending_kyc",
  },
  {
    label: "Wallet",
    href: "/admin/wallet",
    icon: "DollarSign",
    featureId: "admin_wallet",
  },
  {
    label: "Withdrawals",
    href: "/admin/wallet/withdrawals",
    icon: "ArrowUpRight",
    featureId: "admin_wallet",
    badge: "pending_withdrawals",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: "Tag",
    featureId: "admin_categories",
  },
  {
    label: "Price Ranges",
    href: "/admin/price-ranges",
    icon: "BarChart2",
    featureId: "admin_categories",
  },
  {
    label: "Broadcast",
    href: "/admin/notifications",
    icon: "Megaphone",
    featureId: "notifications",
  },
];

export const ADMIN_NAV_BOTTOM: NavItem[] = [
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "Settings",
  },
];

// ── Mobile nav (max 4 items — most important per role) ──────────────────────

export const CLIENT_MOBILE_NAV: NavItem[] = [
  { label: "Home", href: "/client", icon: "LayoutDashboard" },
  { label: "Jobs", href: "/client/jobs", icon: "Briefcase" },
  { label: "AI Tools", href: "/client/ai-tools", icon: "Sparkles" },
  { label: "Wallet", href: "/client/wallet", icon: "Wallet" },
];

export const FREELANCER_MOBILE_NAV: NavItem[] = [
  { label: "Home", href: "/freelancer", icon: "LayoutDashboard" },
  { label: "Opportunities", href: "/freelancer/opportunities", icon: "Inbox" },
  { label: "Active", href: "/freelancer/active", icon: "PlayCircle" },
  { label: "Earnings", href: "/freelancer/earnings", icon: "DollarSign" },
];

export const ADMIN_MOBILE_NAV: NavItem[] = [
  { label: "Home", href: "/admin", icon: "LayoutDashboard" },
  { label: "Deals", href: "/admin/deals", icon: "Handshake" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "KYC", href: "/admin/kyc", icon: "ShieldCheck" },
];
