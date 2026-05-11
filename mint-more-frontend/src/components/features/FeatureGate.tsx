'use client';

import type { ReactNode } from 'react';
import { useFeatureAccess } from '@/lib/features/useFeatureAccess';
import { ComingSoonPage } from './ComingSoonPage';
import type { FeatureId } from '@/lib/features/registry';

interface FeatureGateProps {
  featureId: FeatureId;
  children: ReactNode;
  /**
   * Override the fallback. If not provided:
   * - coming_soon → renders ComingSoonPage
   * - disabled    → renders null
   */
  fallback?: ReactNode;
}

/**
 * Wraps a page or section with feature access control.
 * 
 * Usage:
 *   <FeatureGate featureId="ai_tools">
 *     <AIToolsPage />
 *   </FeatureGate>
 */
export const FeatureGate = ({ featureId, children, fallback }: FeatureGateProps) => {
  const { accessible, status } = useFeatureAccess(featureId);

  if (accessible) return <>{children}</>;

  if (fallback !== undefined) return <>{fallback}</>;

  if (status === 'coming_soon') {
    return <ComingSoonPage featureId={featureId} />;
  }

  // disabled — render nothing (nav item is already hidden)
  return null;
};