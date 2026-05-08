"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs";
import { negotiationsApi } from "@/lib/api/negotiations";
import { extractApiError } from "@/lib/api/axios";
import { formatINR, formatDate, formatJobStatus, formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Calendar,
  Tag,
  IndianRupee,
  Clock,
  XCircle,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import type { JobStatus, ClientRespondRequest } from "@/types";
import { useState } from "react";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  draft:       { bg: "bg-surface-card",       text: "text-muted",        dot: "bg-muted" },
  published:   { bg: "bg-brand-accent/10",     text: "text-brand-accent", dot: "bg-brand-accent" },
  matching:    { bg: "bg-badge-violet/10",      text: "text-badge-violet", dot: "bg-badge-violet" },
  negotiating: { bg: "bg-badge-orange/10",      text: "text-badge-orange", dot: "bg-badge-orange" },
  agreed:      { bg: "bg-success/10",           text: "text-success",      dot: "bg-success" },
  in_progress: { bg: "bg-success/10",           text: "text-success",      dot: "bg-success" },
  completed:   { bg: "bg-surface-card",         text: "text-muted",        dot: "bg-muted" },
  cancelled:   { bg: "bg-error/10",             text: "text-error",        dot: "bg-error" },
  failed:      { bg: "bg-error/10",             text: "text-error",        dot: "bg-error" },
};

function StatusBadge({ status }: { status: JobStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-body-sm font-medium",
      s.bg, s.text
    )}>
      <span className={cn("w-2 h-2 rounded-full", s.dot)} />
      {formatJobStatus(status)}
    </span>
  );
}

export default function ClientJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [counterAmount, setCounterAmount] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: job, isLoading: jobLoading, isError: jobError } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
  });

  const { data: negotiation, isLoading: negLoading } = useQuery({
    queryKey: ["negotiation", id],
    queryFn: () => negotiationsApi.getByJobId(id),
    enabled: !!id && job?.status === "negotiating",
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: () => jobsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["client-jobs"] });
    },
    onError: (err) => setActionError(extractApiError(err).message),
  });

  const clientRespondMutation = useMutation({
    mutationFn: (data: ClientRespondRequest) =>
      negotiationsApi.clientRespond(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negotiation", id] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      setCounterAmount("");
      setActionError(null);
    },
    onError: (err) => setActionError(extractApiError(err).message),
  });

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <AlertCircle size={28} className="text-error" />
        <p className="text-body-sm text-muted">Job not found</p>
        <Link href="/client/jobs" className="btn-secondary">
          Back to jobs
        </Link>
      </div>
    );
  }

  const canCancel = ["draft", "published", "matching"].includes(job.status);
  const isNegotiating = job.status === "negotiating";

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/client/jobs"
          className="p-2 rounded-md text-muted hover:text-ink hover:bg-surface-card transition-colors flex-shrink-0 mt-0.5"
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
            <StatusBadge status={job.status} />
          </div>
          <p className="text-body-sm text-muted mt-1">
            Posted {formatRelativeTime(job.createdAt)}
          </p>
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="px-4 py-3 bg-error/8 border border-error/20 rounded-md">
          <p className="text-body-sm text-error">{actionError}</p>
        </div>
      )}

      {/* Job details card */}
      <div className="bg-canvas rounded-lg border border-hairline p-6 flex flex-col gap-5">
        <h2 className="text-title-sm text-ink">Job Details</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted">
              <Tag size={13} />
              <span className="text-xs font-medium">Category</span>
            </div>
            <p className="text-body-sm text-ink font-medium">{job.categoryName}</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted">
              <IndianRupee size={13} />
              <span className="text-xs font-medium">Budget</span>
            </div>
            <p className="text-body-sm text-ink font-medium">
              {formatINR(job.budgetMin)} – {formatINR(job.budgetMax)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted">
              <Clock size={13} />
              <span className="text-xs font-medium">Mode</span>
            </div>
            <p className="text-body-sm text-ink font-medium capitalize">
              {job.pricingMode}
            </p>
          </div>
          {job.deadline && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted">
                <Calendar size={13} />
                <span className="text-xs font-medium">Deadline</span>
              </div>
              <p className="text-body-sm text-ink font-medium">
                {formatDate(job.deadline)}
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-hairline-soft">
          <p className="text-caption font-medium text-muted mb-2">Description</p>
          <p className="text-body-sm text-body leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      </div>

      {/* Negotiation panel */}
      {isNegotiating && (
        <div className="bg-canvas rounded-lg border border-hairline overflow-hidden">
          <div className="px-5 py-4 border-b border-hairline flex items-center gap-2">
            <MessageSquare size={16} className="text-badge-orange" />
            <h2 className="text-title-sm text-ink">Negotiation</h2>
          </div>

          {negLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-muted" />
            </div>
          ) : negotiation ? (
            <div className="p-5 flex flex-col gap-5">
              {/* Status */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-body-sm text-muted">Negotiating with</p>
                  <p className="text-title-sm text-ink font-semibold">
                    {negotiation.freelancerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-body-sm text-muted">Round</p>
                  <p className="text-title-sm text-ink font-semibold">
                    {negotiation.round} / 2
                  </p>
                </div>
              </div>

              {/* Offer timeline */}
              <div className="flex flex-col gap-3">
                {negotiation.freelancerOffer && (
                  <div className="bg-surface-soft rounded-lg p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-caption text-muted font-medium">
                        Freelancer proposed
                      </p>
                      {negotiation.freelancerOffer.message && (
                        <p className="text-body-sm text-body mt-1">
                          {negotiation.freelancerOffer.message}
                        </p>
                      )}
                    </div>
                    <p className="text-title-sm font-semibold text-ink flex-shrink-0">
                      {formatINR(negotiation.freelancerOffer.amount)}
                    </p>
                  </div>
                )}

                {negotiation.clientCounter && (
                  <div className="bg-brand-accent/8 border border-brand-accent/20 rounded-lg p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-caption text-brand-accent font-medium">
                        Your counter offer
                      </p>
                      {negotiation.clientCounter.message && (
                        <p className="text-body-sm text-body mt-1">
                          {negotiation.clientCounter.message}
                        </p>
                      )}
                    </div>
                    <p className="text-title-sm font-semibold text-ink flex-shrink-0">
                      {formatINR(negotiation.clientCounter.amount)}
                    </p>
                  </div>
                )}

                {negotiation.agreedAmount && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" />
                      <p className="text-body-sm font-semibold text-success">
                        Deal agreed
                        {!negotiation.adminApproved && " — awaiting admin approval"}
                      </p>
                    </div>
                    <p className="text-title-sm font-semibold text-ink">
                      {formatINR(negotiation.agreedAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Client actions — only if freelancer has proposed and no counter yet */}
              {negotiation.freelancerOffer &&
                !negotiation.agreedAmount &&
                negotiation.status === "freelancer_proposed" && (
                <div className="flex flex-col gap-3 pt-2 border-t border-hairline-soft">
                  <p className="text-caption font-medium text-ink">Your response</p>

                  {/* Counter offer input */}
                  {negotiation.round < 2 && (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          placeholder="Counter amount"
                          className="text-input pl-7"
                          value={counterAmount}
                          onChange={(e) => setCounterAmount(e.target.value)}
                          min={1}
                        />
                      </div>
                      <button
                        onClick={() =>
                          clientRespondMutation.mutate({
                            action: "counter",
                            counterAmount: Number(counterAmount),
                          })
                        }
                        disabled={!counterAmount || clientRespondMutation.isPending}
                        className="btn-secondary gap-1.5 flex-shrink-0"
                      >
                        {clientRespondMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : null}
                        Counter
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        clientRespondMutation.mutate({ action: "accept" })
                      }
                      disabled={clientRespondMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-success text-white rounded-md text-button font-semibold"
                    >
                      <CheckCircle2 size={15} />
                      Accept offer
                    </button>
                    <button
                      onClick={() =>
                        clientRespondMutation.mutate({ action: "reject" })
                      }
                      disabled={clientRespondMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-error/10 text-error rounded-md text-button font-semibold"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-body-sm text-muted">
                Waiting for freelancer to initiate negotiation...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cancel action */}
      {canCancel && (
        <div className="bg-canvas rounded-lg border border-hairline p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-title-sm text-ink">Cancel this job</p>
            <p className="text-body-sm text-muted mt-0.5">
              This action cannot be undone.
            </p>
          </div>
          <button
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-error/30 text-error text-button font-semibold hover:bg-error/5 transition-colors"
          >
            {cancelMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <XCircle size={14} />
            )}
            Cancel job
          </button>
        </div>
      )}
    </div>
  );
}