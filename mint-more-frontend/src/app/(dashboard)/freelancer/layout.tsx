import { DashboardShell } from "@/components/layout/DashboardShell";
import { FreelancerSidebar } from "@/components/layout/FreelancerSidebar";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell sidebar={<FreelancerSidebar />}>{children}</DashboardShell>
  );
}
