import { FEATURE_REGISTRY, type FeatureId, type FeatureStatus } from './registry';
import type { UserRole } from '@/types';

/**
 * Check if a feature is accessible for a given role.
 * 
 * Logic:
 * - 'disabled'     → never accessible
 * - 'coming_soon'  → not accessible unless role is in betaRoles or role is admin
 * - 'beta'         → accessible only to betaRoles (admin always included)
 * - 'enabled'      → accessible to all roles (or restricted to feature.roles if set)
 */
export const isFeatureAccessible = (
  featureId: FeatureId,
  role: UserRole | null
): boolean => {
  const feature = FEATURE_REGISTRY[featureId];
  if (!feature) return false;

  // Disabled features are never accessible
  if (feature.status === 'disabled') return false;

  // Coming soon — only betaRoles or admin can bypass
  if (feature.status === 'coming_soon') {
    if (role === 'admin') return true;
    if (feature.betaRoles && role && feature.betaRoles.includes(role)) return true;
    return false;
  }

  // Beta — only betaRoles
  if (feature.status === 'beta') {
    if (role === 'admin') return true;
    if (feature.betaRoles && role && feature.betaRoles.includes(role)) return true;
    return false;
  }

  // Enabled — check role restriction
  if (feature.roles && feature.roles.length > 0) {
    if (!role) return false;
    return feature.roles.includes(role);
  }

  return true;
};

/**
 * Get the effective status of a feature for a given role.
 * Used to determine what to render (page vs coming soon vs 404).
 */
export const getFeatureStatus = (
  featureId: FeatureId,
  role: UserRole | null
): FeatureStatus => {
  const feature = FEATURE_REGISTRY[featureId];
  if (!feature) return 'disabled';
  if (role === 'admin' && feature.status !== 'disabled') return 'enabled';
  return feature.status;
};

/**
 * Filter navigation items by feature access.
 * Used in sidebar/navigation configs.
 */
export const filterNavByFeature = <T extends { featureId?: FeatureId }>(
  items: T[],
  role: UserRole | null
): T[] => {
  return items.filter((item) => {
    if (!item.featureId) return true; // No feature gate = always show
    const feature = FEATURE_REGISTRY[item.featureId];
    if (!feature) return false;
    if (feature.status === 'disabled') return false;
    // coming_soon items ARE shown in nav (they render a coming soon page)
    // Only role-restricted features are hidden
    if (feature.roles && feature.roles.length > 0) {
      if (!role) return false;
      return feature.roles.includes(role);
    }
    return true;
  });
};