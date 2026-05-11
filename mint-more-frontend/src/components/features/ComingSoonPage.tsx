'use client';

import { useRouter } from 'next/navigation';
import { FEATURE_REGISTRY, type FeatureId } from '@/lib/features/registry';
import { useUserRole } from '@/lib/stores/authStore';
import { getRoleDashboard } from '@/lib/utils/roleHelpers';
import { cn } from '@/lib/utils/cn';

// Dynamic icon loader — avoids importing all of lucide at bundle level
import {
  Sparkles,
  Share2,
  PenLine,
  Palette,
  Video,
  RefreshCw,
  Hash,
  ArrowLeft,
  Clock,
  Zap,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Share2,
  PenLine,
  Palette,
  Video,
  RefreshCw,
  Hash,
  Zap,
};

interface ComingSoonPageProps {
  featureId: FeatureId;
}

/**
 * Polished coming soon page.
 * Reads feature metadata from the registry — no hardcoded content.
 * Feels intentional and premium, not broken.
 */
export const ComingSoonPage = ({ featureId }: ComingSoonPageProps) => {
  const router = useRouter();
  const role = useUserRole();
  const feature = FEATURE_REGISTRY[featureId];
  const dashboard = getRoleDashboard(role);

  if (!feature) return null;

  const Icon = ICON_MAP[feature.icon] ?? Sparkles;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Icon container */}
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50">
          <Icon className="h-8 w-8 text-indigo-600" />
        </div>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400">
          <Clock className="h-3 w-3 text-white" />
        </span>
      </div>

      {/* Status pill */}
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Coming Soon
        {feature.eta && (
          <span className="ml-1 text-amber-500">· {feature.eta}</span>
        )}
      </div>

      {/* Feature name */}
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {feature.label}
      </h1>

      {/* Pitch */}
      <p className="mb-8 max-w-md text-base leading-relaxed text-slate-500">
        {feature.pitch || feature.description}
      </p>

      {/* Divider */}
      <div className="mb-8 flex w-full max-w-xs items-center gap-3">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-xs text-slate-400">We're building this next</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      {/* What's coming preview — only if pitch is detailed enough */}
      {feature.pitch && (
        <div className="mb-8 flex max-w-sm flex-col items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            What to expect
          </p>
          <p className="text-sm leading-relaxed text-slate-600">{feature.pitch}</p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => router.push(dashboard)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5',
          'text-sm font-medium text-slate-700 shadow-sm transition-all',
          'hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>
    </div>
  );
};