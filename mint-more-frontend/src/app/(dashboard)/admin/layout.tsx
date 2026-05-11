import { DashboardShell } from "@/components/layout/DashboardShell";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell sidebar={<AdminSidebar />}>{children}</DashboardShell>;
}
