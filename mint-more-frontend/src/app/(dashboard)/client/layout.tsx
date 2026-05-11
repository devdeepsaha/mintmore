import { DashboardShell } from "@/components/layout/DashboardShell";
import { ClientSidebar } from "@/components/layout/ClientSidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell sidebar={<ClientSidebar />}>{children}</DashboardShell>
  );
}
