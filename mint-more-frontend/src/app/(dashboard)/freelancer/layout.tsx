import { DashboardShell } from "@/components/layout/DashboardShell";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}