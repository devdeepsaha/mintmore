"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs";
import { matchingApi } from "@/lib/api/matching";
import { extractApiError } from "@/lib/api/axios";
import { formatINR, formatDate, formatJobStatus, formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Cpu,
  Star,
  Clock,
} from "lucide-react";
import { useState } from "react";
import type { JobStatus } from "@/types";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  draft:       { bg: "bg-surface-card",     text: "text-muted",        dot: "bg-muted" },
  published:   { bg: "bg-brand-accent/10",  text: "text-brand-accent", dot: "bg-brand-accent" },
  matching:    { bg: "bg-badge-violet/10",  text: "text-badge-violet", dot: "bg-badge-violet" },
  negotiating: { bg: "bg-badge-orange/10",  text: "text-badge-orange", dot: "bg-badge-orange" },
  agreed:      { bg: "bg-success/10",       text: "text-success",      dot: "bg-success" },
  in_progress: { bg: "bg-success/10",       text: "text-success",      dot: "bg-success" },
  completed:   { bg: "bg-surface-card",     text: "text-muted",        dot: "bg-muted" },
  cancelled:   { bg: "bg-error/10",         text: "text-error",        dot: "bg-error" },
};

export default function AdminJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ["admin-job", id],
    queryFn: () => jobsApi.adminGetById(id),
    enabled: !!id,
  });

  const { data: matchResult, isLoading: matchLoading } = useQuery({
    queryKey: ["match-result", id],
    queryFn: () => matchingApi.previewMatch(id),
    enabled: !!id && !!job &&
      ["matching", "negotiating", "agreed", "in_progress"].includes(
        job.status ?? ""
      ),
    retry: false,
  });

  const runMatchMutation = useMutation({
    mutationFn: () => matchingApi.runMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-job", id] });
      queryClient.invalidateQueries({ queryKey: ["match-result", id] });
      setActionError(null);
    },
    onError: (err) => setActionError(extractApiError(err).message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <AlertCircle size={28} className="text-error" />
        <p className="text-body-sm text-muted">Job not found</p>
        <Link href="/admin/jobs" className="btn-secondary">Back</Link>
      </div>
    );
  }

  const s = STATUS_STYLES[job.status] ?? STATUS_STYLES.draft;
  const canRunMatch = job.status === "published";

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/jobs"
          className="p-2 rounded-md text-muted hover:text-ink hover:bg-surface-card transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1
              className="text-ink"
              style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.3px" }}
            >
              {job.title}
            </h1>
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-body-sm font-medium flex-shrink-0",
              s.bg, s.text
            )}>
              <span className={cn("w-2 h-2 rounded-full", s.dot)} />
              {formatJobStatus(job.status)}
            </span>
          </div>
          <p className="text-body-sm text-muted mt-1">
            Posted by {job.clientName} · {formatRelativeTime(job.createdAt)}
          </p>
        </div>
      </div>

      {actionError && (
        <div className="px-4 py-3 bg-error/8 border border-error/20 rounded-md">
          <p className="text-body-sm text-error">{actionError}</p>
        </div>
      )}

      {/* Job details */}
      <div className="bg-canvas rounded-lg border border-hairline p-6 flex flex-col gap-5">
        <h2 className="text-title-sm text-ink">Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted">Category</p>
            <p className="text-body-sm text-ink font-medium mt-0.5">{job.categoryName}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Budget</p>
            <p className="text-body-sm text-ink font-medium mt-0.5">
              {formatINR(job.budgetMin)} – {formatINR(job.budgetMax)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Mode</p>
            <p className="text-body-sm text-ink font-medium mt-0.5 capitalize">
              {job.pricingMode}
            </p>
          </div>
          {job.deadline && (
            <div>
              <p className="text-xs text-muted">Deadline</p>
              <p className="text-body-sm text-ink font-medium mt-0.5">
                {formatDate(job.deadline)}
              </p>
            </div>
          )}
        </div>
        <div className="pt-2 border-t border-hairline-soft">
          <p className="text-caption text-muted font-medium mb-2">Description</p>
          <p className="text-body-sm text-body leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      </div>

      {/* Run matching */}
      {canRunMatch && (
        <div className="bg-canvas rounded-lg border border-hairline p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-badge-violet/10 flex items-center justify-center flex-shrink-0">
              <Cpu size={18} className="text-badge-violet" />
            </div>
            <div>
              <p className="text-title-sm text-ink">Run AI Matching</p>
              <p className="text-body-sm text-muted mt-0.5">
                Find the best freelancers for this job.
              </p>
            </div>
          </div>
          <button
            onClick={() => runMatchMutation.mutate()}
            disabled={runMatchMutation.isPending}
            className="btn-primary gap-2 flex-shrink-0"
          >
            {runMatchMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Cpu size={15} />
            )}
            {runMatchMutation.isPending ? "Running..." : "Run match"}
          </button>
        </div>
      )}

      {/* Match results */}
      {matchResult && (
        <div className="bg-canvas rounded-lg border border-hairline overflow-hidden">
          <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-badge-violet" />
              <h2 className="text-title-sm text-ink">Match Results</h2>
            </div>
            <span className="text-body-sm text-muted">
              {matchResult.totalCandidates} candidates
            </span>
          </div>

          <div className="divide-y divide-hairline-soft">
            {matchResult.candidates.map((candidate, index) => (
              <div
                key={candidate.freelancerId}
                className="flex items-center gap-4 px-5 py-4"
              >
                {/* Rank */}
                <div className="w-6 flex-shrink-0 text-center">
                  {index === 0 ? (
                    <Star size={16} className="text-badge-orange mx-auto" />
                  ) : (
                    <span className="text-xs text-muted font-medium">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold"
                  style={{
                    backgroundColor: ["#fb923c", "#ec4899", "#8b5cf6", "#34d399", "#3b82f6"][
                      index % 5
                    ],
                  }}
                >
                  {candidate.freelancerName[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-ink truncate">
                    {candidate.freelancerName}
                  </p>
                  <p className="text-xs text-muted capitalize">
                    {candidate.freelancerLevel}
                  </p>
                </div>

                {/* Score bar */}
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <div className="w-24 h-1.5 bg-surface-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{ width: `${candidate.matchScore}%` }}
                    />
                  </div>
                  <span className="text-caption font-semibold text-ink w-8 text-right">
                    {candidate.matchScore}
                  </span>
                </div>

                {/* Tier */}
                <span className={cn(
                  "badge-pill text-xs flex-shrink-0",
                  candidate.tier === "instant"
                    ? "bg-success/10 text-success"
                    : candidate.tier === "tier_2"
                    ? "bg-brand-accent/10 text-brand-accent"
                    : "bg-surface-card text-muted"
                )}>
                  {candidate.tier === "instant"
                    ? "Instant"
                    : candidate.tier === "tier_2"
                    ? "+5 min"
                    : "+10 min"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}