import { type ReactNode } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ClientSidebar } from '@/components/layout/ClientSidebar';

// This layout is ONLY for the client route group.
// Middleware has already enforced that only role=client reaches here.
export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell sidebar={<ClientSidebar />}>
      {children}
    </DashboardShell>
  );
}