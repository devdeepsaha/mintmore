import { type ReactNode } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { FreelancerSidebar } from '@/components/layout/FreelancerSidebar';

export default function FreelancerLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell sidebar={<FreelancerSidebar />}>
      {children}
    </DashboardShell>
  );
}