"use client";

import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs";
import Link from "next/link";
import { Loader2, AlertCircle, Cpu, ArrowRight } from "lucide-react";
import { formatINR, formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export default function AdminMatchingPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-jobs-for-matching"],
    queryFn: () =>
      jobsApi.adminList({ status: "published", limit: 50 }),
  });

  const jobs = (data as any)?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-ink"
          style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px" }}
        >
          Matching
        </h1>
        <p className="text-body-sm text-muted mt-1">
          Published jobs ready for AI matching.
        </p>
      </div>

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
            <div className="w-12 h-12 rounded-full bg-badge-violet/10 flex items-center justify-center">
              <Cpu size={22} className="text-badge-violet" />
            </div>
            <div className="text-center">
              <p className="text-title-sm text-ink">No jobs to match</p>
              <p className="text-body-sm text-muted mt-1">
                Published jobs will appear here for matching.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-hairline-soft">
            {jobs.map((job: any) => (
              <Link
                key={job.id}
                href={`/admin/jobs/${job.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-soft transition-colors"
              >
                <div className="w-9 h-9 rounded-md bg-badge-violet/10 flex items-center justify-center flex-shrink-0">
                  <Cpu size={16} className="text-badge-violet" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-ink truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {job.clientName ?? job.client_name} ·{" "}
                    {formatINR(job.budgetMin ?? job.budget_min)} –{" "}
                    {formatINR(job.budgetMax ?? job.budget_max)} ·{" "}
                    {formatRelativeTime(job.createdAt ?? job.created_at)}
                  </p>
                </div>
                <span className={cn(
                  "badge-pill text-xs flex-shrink-0",
                  job.pricingMode === "expert"
                    ? "bg-badge-violet/10 text-badge-violet"
                    : "bg-surface-card text-muted"
                )}>
                  {job.pricingMode === "expert" ? "Expert" : "Budget"}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-body-sm text-brand-accent font-medium hidden sm:block">
                    Run match
                  </span>
                  <ArrowRight size={14} className="text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}