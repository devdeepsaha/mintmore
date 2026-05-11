import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import {
  getJobStatusConfig,
  type BadgeVariant,
} from "@/lib/utils/statusHelpers";
import type { JobStatus } from "@/types";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-xs font-medium leading-none transition-colors",
  {
    variants: {
      variant: {
        neutral: "bg-slate-100 text-slate-600",
        info: "bg-blue-50 text-blue-700",
        "info-pulse": "bg-blue-50 text-blue-700",
        warning: "bg-amber-50 text-amber-700",
        "warning-pulse": "bg-amber-50 text-amber-700",
        success: "bg-emerald-50 text-emerald-700",
        "success-pulse": "bg-emerald-50 text-emerald-700",
        danger: "bg-rose-50 text-rose-700",
      },
      size: {
        sm: "px-2 py-0.5",
        md: "px-2.5 py-1",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  },
);

const DOT_COLORS: Record<BadgeVariant, string> = {
  neutral: "bg-slate-400",
  info: "bg-blue-500",
  "info-pulse": "bg-blue-500 animate-pulse",
  warning: "bg-amber-500",
  "warning-pulse": "bg-amber-500 animate-pulse",
  success: "bg-emerald-500",
  "success-pulse": "bg-emerald-500 animate-pulse",
  danger: "bg-rose-500",
};

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
  dot?: BadgeVariant;
}

export const Badge = ({
  children,
  variant,
  size,
  className,
  showDot = false,
  dot,
}: BadgeProps) => {
  const dotVariant = dot ?? (variant as BadgeVariant) ?? "neutral";

  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {showDot && (
        <span
          className={cn(
            "block h-1.5 w-1.5 shrink-0 rounded-full",
            DOT_COLORS[dotVariant],
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

/**
 * Status badge — reads directly from statusHelpers config.
 * Ensures consistent display across the entire app.
 */

export const JobStatusBadge = ({ status }: { status: JobStatus }) => {
  const config = getJobStatusConfig(status);
  return (
    <Badge variant={config.variant} showDot>
      {config.label}
    </Badge>
  );
};
