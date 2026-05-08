"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs";
import { negotiationsApi } from "@/lib/api/negotiations";
import { extractApiError } from "@/lib/api/axios";
import {
  formatINR,
  formatDate,
  formatJobStatus,
  formatRelativeTime,
} from "@/lib/utils/formatters";
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
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
} from "lucide-react";
import type { JobStatus, FreelancerRespondRequest } from "@/types";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  published:   { bg: "bg-brand-accent/10",  text: "text-brand-accent", dot: "bg-brand-accent" },
  negotiating: { bg: "bg-badge-orange/10",  text: "text-badge-orange", dot: "bg-badge-orange" },
  agreed:      { bg: "bg-success/10",       text: "text-success",      dot: "bg-success" },
  in_progress: { bg: "bg-success/10",       text: "text-success",      dot: "bg-success" },
  completed:   { bg: "bg-surface-card",     text: "text-muted",        dot: "bg-muted" },
  cancelled:   { bg: "bg-error/10",         text: "text-error",        dot: "bg-error" },
};

function StatusBadge({ status }: { status: JobStatus }) {
  const s = STATUS_STYLES[status] ?? { bg: "bg-surface-card", text: "text-muted", dot: "bg-muted" };
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

export default function FreelancerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [proposedAmount, setProposedAmount] = useState("");
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: job, isLoading: jobLoading, isError: jobError } = useQuery({
    queryKey: ["freelancer-job", id],
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
  });

  const { data: negotiation, isLoading: negLoading } = useQuery({
    queryKey: ["negotiation", id],
    queryFn: () => negotiationsApi.getByJobId(id),
    enabled: !!id && !!job && ["negotiating", "agreed"].includes(job.status ?? ""),
    retry: false,
  });

  const initiateMutation = useMutation({
    mutationFn: () =>
      negotiationsApi.initiate(id, { message: message || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negotiation", id] });
      queryClient.invalidateQueries({ queryKey: ["freelancer-job", id] });
      setMessage("");
      setActionError(null);
    },
    onError: (err) => setActionError(extractApiError(err).message),
  });

  const respondMutation = useMutation({
    mutationFn: (data: FreelancerRespondRequest) =>
      negotiationsApi.freelancerRespond(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["negotiation", id] });
      queryClient.invalidateQueries({ queryKey: ["freelancer-job", id] });
      setProposedAmount("");
      setMessage("");
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
        <Link href="/freelancer/jobs" className="btn-secondary">
          Back to jobs
        </Link>
      </div>
    );
  }

  const canInitiate = job.status === "published";
  const isNegotiating = job.status === "negotiating";
  const isAgreed = job.status === "agreed";

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/freelancer/jobs"
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
            Matched {formatRelativeTime(job.createdAt)}
          </p>
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="px-4 py-3 bg-error/8 border border-error/20 rounded-md">
          <p className="text-body-sm text-error">{actionError}</p>
        </div>
      )}

      {/* Job details */}
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

      {/* Initiate negotiation */}
      {canInitiate && (
        <div className="bg-canvas rounded-lg border border-hairline overflow-hidden">
          <div className="px-5 py-4 border-b border-hairline flex items-center gap-2">
            <MessageSquare size={16} className="text-brand-accent" />
            <h2 className="text-title-sm text-ink">Start Negotiation</h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <p className="text-body-sm text-muted">
              Initiating negotiation will lock this job to you. You'll have up
              to 2 rounds to agree on a price with the client.
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-medium text-ink">
                Opening message{" "}
                <span className="text-muted font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Introduce yourself and express your interest..."
                className="text-input h-auto resize-none py-3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button
              onClick={() => initiateMutation.mutate()}
              disabled={initiateMutation.isPending}
              className="btn-primary gap-2 self-start"
            >
              {initiateMutation.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              {initiateMutation.isPending
                ? "Initiating..."
                : "Initiate negotiation"}
            </button>
          </div>
        </div>
      )}

      {/* Active negotiation panel */}
      {(isNegotiating || isAgreed) && (
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
              {/* Overview */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-body-sm text-muted">Negotiating with</p>
                  <p className="text-title-sm text-ink font-semibold">
                    {negotiation.clientName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-body-sm text-muted">Round</p>
                  <p className="text-title-sm text-ink font-semibold">
                    {negotiation.round} / 2
                  </p>
                </div>
              </div>

              {/* Offer history */}
              <div className="flex flex-col gap-3">
                {/* Client's budget as reference */}
                <div className="bg-surface-soft rounded-lg p-4 flex items-center justify-between gap-3">
                  <p className="text-caption text-muted font-medium">
                    Client budget range
                  </p>
                  <p className="text-body-sm font-semibold text-ink">
                    {formatINR(job.budgetMin)} – {formatINR(job.budgetMax)}
                  </p>
                </div>

                {negotiation.freelancerOffer && (
                  <div className="bg-badge-orange/8 border border-badge-orange/20 rounded-lg p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-caption text-badge-orange font-medium">
                        Your proposal
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
                        Client counter offer
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
                        {!negotiation.adminApproved &&
                          " — awaiting admin approval"}
                      </p>
                    </div>
                    <p className="text-title-sm font-semibold text-ink">
                      {formatINR(negotiation.agreedAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Freelancer actions */}
              {/* Case 1: No proposal yet — show propose form */}
              {!negotiation.freelancerOffer &&
                negotiation.status === "initiated" && (
                  <div className="flex flex-col gap-3 pt-2 border-t border-hairline-soft">
                    <p className="text-caption font-medium text-ink">
                      Make your proposal
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          placeholder="Proposed amount"
                          className="text-input pl-7"
                          value={proposedAmount}
                          onChange={(e) => setProposedAmount(e.target.value)}
                          min={1}
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Add a note with your proposal (optional)..."
                      className="text-input h-auto resize-none py-2.5"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                      onClick={() =>
                        respondMutation.mutate({
                          action: "propose",
                          proposedAmount: Number(proposedAmount),
                          message: message || undefined,
                        })
                      }
                      disabled={
                        !proposedAmount || respondMutation.isPending
                      }
                      className="btn-primary gap-2 self-start"
                    >
                      {respondMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Send proposal
                    </button>
                  </div>
                )}

              {/* Case 2: Client countered — accept or reject */}
              {negotiation.clientCounter &&
                !negotiation.agreedAmount &&
                negotiation.status === "client_countered" && (
                  <div className="flex flex-col gap-3 pt-2 border-t border-hairline-soft">
                    <p className="text-caption font-medium text-ink">
                      Client countered at{" "}
                      <span className="text-ink font-semibold">
                        {formatINR(negotiation.clientCounter.amount)}
                      </span>
                      . Your response:
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          respondMutation.mutate({ action: "accept" })
                        }
                        disabled={respondMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-success text-white rounded-md text-button font-semibold"
                      >
                        <CheckCircle2 size={15} />
                        Accept counter
                      </button>
                      <button
                        onClick={() =>
                          respondMutation.mutate({ action: "reject" })
                        }
                        disabled={respondMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-error/10 text-error rounded-md text-button font-semibold"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

              {/* Case 3: Waiting for client response */}
              {negotiation.freelancerOffer &&
                !negotiation.clientCounter &&
                !negotiation.agreedAmount && (
                  <div className="flex items-center gap-2 pt-2 border-t border-hairline-soft">
                    <Loader2 size={14} className="animate-spin text-muted" />
                    <p className="text-body-sm text-muted">
                      Waiting for client to respond...
                    </p>
                  </div>
                )}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-body-sm text-muted">
                Negotiation data unavailable.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}