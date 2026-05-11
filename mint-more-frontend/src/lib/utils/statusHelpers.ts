import type { JobStatus } from "@/types";

export type BadgeVariant =
  | "neutral"
  | "info"
  | "info-pulse"
  | "warning"
  | "warning-pulse"
  | "success"
  | "success-pulse"
  | "danger";

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const JOB_STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  draft: { label: "Draft", variant: "neutral" },
  published: { label: "Published", variant: "info" },
  matching: { label: "Matching", variant: "info-pulse" },
  negotiating: { label: "Negotiating", variant: "warning-pulse" },
  agreed: { label: "Agreed", variant: "success" },
  in_progress: { label: "In Progress", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  failed: { label: "Failed", variant: "danger" },
};

export const getJobStatusConfig = (status: JobStatus): StatusConfig =>
  JOB_STATUS_CONFIG[status];
