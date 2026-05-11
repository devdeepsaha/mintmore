'use client';

import { useUserRole } from '@/lib/stores/authStore';
import { isFeatureAccessible, getFeatureStatus } from './flags';
import type { FeatureId } from './registry';

/**
 * Hook to check feature access in components.
 * 
 * Usage:
 *   const { accessible, status } = useFeatureAccess('ai_tools');
 *   if (!accessible) return <ComingSoonPage featureId="ai_tools" />;
 */
export const useFeatureAccess = (featureId: FeatureId) => {
  const role = useUserRole();

  return {
    accessible: isFeatureAccessible(featureId, role),
    status: getFeatureStatus(featureId, role),
    role,
  };
};