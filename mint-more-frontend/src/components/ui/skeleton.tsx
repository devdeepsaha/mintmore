import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn('animate-pulse rounded-md bg-slate-200', className)}
    aria-hidden="true"
  />
);

// Composable skeleton building blocks

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
      />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
    <div className="flex items-start justify-between">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <SkeletonText lines={2} />
    <div className="flex gap-2 pt-1">
      <Skeleton className="h-4 w-16 rounded-full" />
      <Skeleton className="h-4 w-20 rounded-full" />
    </div>
  </div>
);

export const SkeletonStatCard = () => (
  <div className="rounded-xl border border-slate-100 bg-white p-5">
    <Skeleton className="mb-3 h-3 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="mt-2 h-3 w-20" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-1">
    {/* Header */}
    <div className="flex gap-4 px-4 py-2">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-16 ml-auto" />
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 rounded-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="ml-auto h-5 w-20 rounded-full" />
      </div>
    ))}
  </div>
);