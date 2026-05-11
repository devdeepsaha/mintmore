"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs";
import { JobPostModal } from "@/components/jobs/JobPostModal";
import Link from "next/link";
import {
  Briefcase,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  formatINR,
  formatRelativeTime,
  formatJobStatus,
} from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { JobStatus } from "@/types";
import { useState } from "react";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    draft: { bg: "bg-surface-card", text: "text-muted", dot: "bg-muted" },
    published: {
      bg: "bg-brand-accent/10",
      text: "text-brand-accent",
      dot: "bg-brand-accent",
    },
    matching: {
      bg: "bg-badge-violet/10",
      text: "text-badge-violet",
      dot: "bg-badge-violet",
    },
    negotiating: {
      bg: "bg-badge-orange/10",
      text: "text-badge-orange",
      dot: "bg-badge-orange",
    },
    agreed: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
    in_progress: {
      bg: "bg-success/10",
      text: "text-success",
      dot: "bg-success",
    },
    completed: { bg: "bg-surface-card", text: "text-muted", dot: "bg-muted" },
    cancelled: { bg: "bg-error/10", text: "text-error", dot: "bg-error" },
    failed: { bg: "bg-error/10", text: "text-error", dot: "bg-error" },
  };

function StatusBadge({ status }: { status: JobStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        s.bg,
        s.text,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
      {formatJobStatus(status)}
    </span>
  );
}

export default function ClientDashboardPage() {
  const [postModalOpen, setPostModalOpen] = useState(false);
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["client-jobs"],
    queryFn: () => jobsApi.list({ limit: 5 }),
    enabled: !!user?.is_approved,
  });

  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;

  const stats = [
    {
      label: "Total Jobs",
      value: total,
      icon: Briefcase,
      color: "text-brand-accent",
      bg: "bg-brand-accent/10",
    },
    {
      label: "Active",
      value: jobs.filter((j) =>
        ["published", "matching", "negotiating", "in_progress"].includes(
          j.status,
        ),
      ).length,
      icon: Clock,
      color: "text-badge-orange",
      bg: "bg-badge-orange/10",
    },
    {
      label: "Completed",
      value: jobs.filter((j) => j.status === "completed").length,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Cancelled",
      value: jobs.filter((j) => j.status === "cancelled").length,
      icon: XCircle,
      color: "text-error",
      bg: "bg-error/10",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-ink"
            style={{
              fontSize: "28px",
              fontWeight: 600,
              letterSpacing: "-0.5px",
              lineHeight: "1.2",
            }}
          >
            Welcome back, {user?.full_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-body-sm text-muted mt-1">
            Here's what's happening with your jobs today.
          </p>
        </div>
        <button
          onClick={() => setPostModalOpen(true)}
          className="btn-primary gap-2"
        >
          <PlusCircle size={15} />
          Post a job
        </button>
      </div>

      {!user?.is_approved && (
        <div className="bg-canvas rounded-lg border border-hairline p-5">
          <p className="text-title-sm text-ink">Account pending approval</p>
          <p className="text-body-sm text-muted mt-1">
            Complete KYC and wait for approval to access jobs and wallet data.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-canvas rounded-lg border border-hairline p-5 flex flex-col gap-3"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-md flex items-center justify-center",
                bg,
              )}
            >
              <Icon size={17} className={color} />
            </div>
            <div>
              <p
                className="text-2xl font-semibold text-ink"
                style={{ letterSpacing: "-0.5px" }}
              >
                {isLoading ? "—" : value}
              </p>
              <p className="text-body-sm text-muted mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent jobs */}
      <div className="bg-canvas rounded-lg border border-hairline">
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
          <h2 className="text-title-sm text-ink">Recent Jobs</h2>
          <Link
            href="/client/jobs"
            className="text-body-sm text-muted hover:text-ink transition-colors flex items-center gap-1"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={22} className="animate-spin text-muted" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={24} className="text-error" />
            <p className="text-body-sm text-muted">Failed to load jobs</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-card flex items-center justify-center">
              <Briefcase size={22} className="text-muted" />
            </div>
            <div className="text-center">
              <p className="text-title-sm text-ink">No jobs yet</p>
              <p className="text-body-sm text-muted mt-1">
                Post your first job to get started
              </p>
            </div>
            <button
              onClick={() => setPostModalOpen(true)}
              className="btn-primary gap-2"
            >
              <PlusCircle size={14} />
              Post a job
            </button>
          </div>
        ) : (
          <div className="divide-y divide-hairline-soft">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/client/jobs/${job.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-soft transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-ink truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {job.categoryName}
                  </p>
                </div>
                <div className="hidden sm:block flex-shrink-0">
                  <p className="text-body-sm font-medium text-ink">
                    {formatINR(job.budgetMin)} – {formatINR(job.budgetMax)}
                  </p>
                </div>
                <StatusBadge status={job.status} />
                <span className="text-xs text-muted flex-shrink-0 hidden md:block">
                  {formatRelativeTime(job.createdAt)}
                </span>
                <ArrowRight size={14} className="text-muted flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setPostModalOpen(true)}
          className="btn-primary gap-2"
        >
          <PlusCircle size={15} />
          Post a job
        </button>
        <Link
          href="/client/jobs"
          className="bg-surface-card rounded-lg p-5 flex items-center gap-4 hover:bg-surface-strong transition-colors"
        >
          <div className="w-10 h-10 rounded-md bg-canvas border border-hairline flex items-center justify-center flex-shrink-0">
            <Briefcase size={18} className="text-ink" />
          </div>
          <div>
            <p className="text-title-sm text-ink">Manage jobs</p>
            <p className="text-body-sm text-muted mt-0.5">
              Track and manage all your jobs
            </p>
          </div>
          <ArrowRight size={16} className="text-muted ml-auto flex-shrink-0" />
        </Link>
      </div>
      <JobPostModal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
      />
    </div>
  );
}
