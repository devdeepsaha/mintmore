"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { formatINR, formatRelativeTime, formatJobStatus } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { JobStatus } from "@/types";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft:       { bg: "bg-surface-card",      text: "text-muted" },
  published:   { bg: "bg-brand-accent/10",   text: "text-brand-accent" },
  matching:    { bg: "bg-badge-violet/10",   text: "text-badge-violet" },
  negotiating: { bg: "bg-badge-orange/10",   text: "text-badge-orange" },
  agreed:      { bg: "bg-success/10",        text: "text-success" },
  in_progress: { bg: "bg-success/10",        text: "text-success" },
  completed:   { bg: "bg-surface-card",      text: "text-muted" },
  cancelled:   { bg: "bg-error/10",          text: "text-error" },
  failed:      { bg: "bg-error/10",          text: "text-error" },
};

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Published", value: "published" },
  { label: "Matching", value: "matching" },
  { label: "Negotiating", value: "negotiating" },
  { label: "Agreed", value: "agreed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminJobsPage() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-jobs", statusFilter, page],
    queryFn: () =>
      jobsApi.adminList({
        ...(statusFilter ? { status: statusFilter } : {}),
        page,
        limit: LIMIT,
      }),
  });

  const jobs = (data as any)?.data ?? data?.data ?? [];
  const total = (data as any)?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-ink"
          style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px" }}
        >
          All Jobs
        </h1>
        <p className="text-body-sm text-muted mt-1">
          {total > 0 ? `${total} jobs total` : "No jobs yet"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value as any); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-body-sm font-medium transition-colors border",
              statusFilter === opt.value
                ? "bg-primary text-on-primary border-primary"
                : "bg-canvas text-muted border-hairline hover:border-surface-strong hover:text-ink"
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
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Briefcase size={24} className="text-muted" />
            <p className="text-body-sm text-muted">No jobs found</p>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_130px_120px_170px_120px_36px] gap-4 px-5 py-3 border-b border-hairline bg-surface-soft">
              <span className="text-caption text-muted font-medium">Job</span>
              <span className="text-caption text-muted font-medium">Client</span>
              <span className="text-caption text-muted font-medium">Budget</span>
              <span className="text-caption text-muted font-medium">Category</span>
              <span className="text-caption text-muted font-medium">Status</span>
              <span />
            </div>

            <div className="divide-y divide-hairline-soft">
              {jobs.map((job: any) => {
                const s = STATUS_STYLES[job.status] ?? STATUS_STYLES.draft;
                const clientName = job.clientName ?? job.client_name ?? "—";
                const categoryName = job.categoryName ?? job.category_name ?? "—";
                return (
                  <Link
                    key={job.id}
                    href={`/admin/jobs/${job.id}`}
                    className="flex flex-col md:grid md:grid-cols-[1fr_130px_120px_170px_120px_36px] gap-2 md:gap-4 md:items-center px-5 py-4 hover:bg-surface-soft transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-ink truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted mt-0.5 md:hidden">
                        {clientName} · {formatRelativeTime(job.createdAt ?? job.created_at)}
                      </p>
                    </div>
                    <p className="hidden md:block text-body-sm text-muted truncate">
                      {clientName}
                    </p>
                    <p className="text-body-sm font-medium text-ink">
                      {formatINR(job.budgetMin ?? job.budget_min)} –{" "}
                      {formatINR(job.budgetMax ?? job.budget_max)}
                    </p>
                    <p className="hidden md:block text-body-sm text-muted truncate">
                      {categoryName}
                    </p>
                    <span className={cn(
                      "badge-pill text-xs w-fit",
                      s.bg, s.text
                    )}>
                      {formatJobStatus(job.status)}
                    </span>
                    <ArrowRight size={14} className="text-muted hidden md:block" />
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-hairline">
                <p className="text-body-sm text-muted">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-md text-body-sm border border-hairline disabled:opacity-40 hover:bg-surface-soft"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-md text-body-sm border border-hairline disabled:opacity-40 hover:bg-surface-soft"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}