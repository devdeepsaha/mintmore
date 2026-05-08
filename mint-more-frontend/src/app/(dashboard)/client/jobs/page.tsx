"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs";
import { JobPostModal } from "@/components/jobs/JobPostModal";
import Link from "next/link";
import {
  PlusCircle,
  Briefcase,
  ArrowRight,
  Loader2,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import {
  formatINR,
  formatRelativeTime,
  formatJobStatus,
} from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { JobStatus, JobFilters } from "@/types";

const STATUS_OPTIONS: { label: string; value: JobStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Matching", value: "matching" },
  { label: "Negotiating", value: "negotiating" },
  { label: "Agreed", value: "agreed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0",
        s.bg,
        s.text,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", s.dot)} />
      {formatJobStatus(status)}
    </span>
  );
}

const PRICING_MODE_STYLES = {
  budget: "bg-surface-card text-muted",
  expert: "bg-badge-violet/10 text-badge-violet",
};

export default function ClientJobsPage() {
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const filters: JobFilters = {
    ...(statusFilter ? { status: statusFilter } : {}),
    page,
    limit: LIMIT,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["client-jobs", filters],
    queryFn: () => jobsApi.list(filters),
  });

  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-ink"
            style={{
              fontSize: "24px",
              fontWeight: 600,
              letterSpacing: "-0.5px",
            }}
          >
            My Jobs
          </h1>
          <p className="text-body-sm text-muted mt-1">
            {total > 0
              ? `${total} job${total !== 1 ? "s" : ""} total`
              : "No jobs yet"}
          </p>
        </div>
        <button
          onClick={() => setPostModalOpen(true)}
          className="btn-primary gap-2 flex-shrink-0"
        >
          <PlusCircle size={15} />
          Post a job
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setStatusFilter(opt.value as JobStatus | "");
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 rounded-md text-body-sm font-medium transition-colors border",
              statusFilter === opt.value
                ? "bg-primary text-on-primary border-primary"
                : "bg-canvas text-muted border-hairline hover:border-surface-strong hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-canvas rounded-lg border border-hairline overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin text-muted" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={24} className="text-error" />
            <p className="text-body-sm text-muted">Failed to load jobs</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-card flex items-center justify-center">
              <Briefcase size={22} className="text-muted" />
            </div>
            <div className="text-center">
              <p className="text-title-sm text-ink">
                {statusFilter ? "No jobs match this filter" : "No jobs yet"}
              </p>
              <p className="text-body-sm text-muted mt-1">
                {statusFilter
                  ? "Try a different status filter"
                  : "Post your first job to get started"}
              </p>
            </div>
            {!statusFilter && (
              <button
                onClick={() => setPostModalOpen(true)}
                className="btn-primary gap-2"
              >
                <PlusCircle size={14} />
                Post a job
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-[1fr_140px_160px_100px_100px_40px] gap-4 px-5 py-3 border-b border-hairline bg-surface-soft">
              <span className="text-caption text-muted font-medium">Job</span>
              <span className="text-caption text-muted font-medium">
                Category
              </span>
              <span className="text-caption text-muted font-medium">
                Budget
              </span>
              <span className="text-caption text-muted font-medium">Mode</span>
              <span className="text-caption text-muted font-medium">
                Status
              </span>
              <span />
            </div>

            <div className="divide-y divide-hairline-soft">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/client/jobs/${job.id}`}
                  className="flex flex-col md:grid md:grid-cols-[1fr_140px_160px_100px_100px_40px] gap-2 md:gap-4 md:items-center px-5 py-4 hover:bg-surface-soft transition-colors"
                >
                  {/* Title */}
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-ink truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5 md:hidden">
                      {job.categoryName} · {formatRelativeTime(job.createdAt)}
                    </p>
                  </div>

                  {/* Category — desktop only */}
                  <p className="hidden md:block text-body-sm text-muted truncate">
                    {job.categoryName}
                  </p>

                  {/* Budget */}
                  <p className="text-body-sm font-medium text-ink">
                    {formatINR(job.budgetMin)} – {formatINR(job.budgetMax)}
                  </p>

                  {/* Pricing mode */}
                  <span
                    className={cn(
                      "inline-flex px-2 py-0.5 rounded-full text-xs font-medium w-fit",
                      PRICING_MODE_STYLES[job.pricingMode],
                    )}
                  >
                    {job.pricingMode === "expert" ? "Expert" : "Budget"}
                  </span>

                  {/* Status */}
                  <StatusBadge status={job.status} />

                  {/* Arrow */}
                  <ArrowRight
                    size={14}
                    className="text-muted hidden md:block"
                  />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-hairline">
                <p className="text-body-sm text-muted">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-md text-body-sm border border-hairline disabled:opacity-40 hover:bg-surface-soft transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-md text-body-sm border border-hairline disabled:opacity-40 hover:bg-surface-soft transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <JobPostModal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
      />
    </div>
  );
}
