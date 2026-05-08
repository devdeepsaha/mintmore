"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kycApi } from "@/lib/api/kyc";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileCheck,
} from "lucide-react";
import { useState } from "react";
import { extractApiError } from "@/lib/api/axios";

const KYC_TYPE_LABELS: Record<string, string> = {
  basic:    "Basic Info",
  identity: "Identity",
  address:  "Address",
};

const KYC_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  basic:    { bg: "bg-brand-accent/10",  text: "text-brand-accent" },
  identity: { bg: "bg-badge-violet/10",  text: "text-badge-violet" },
  address:  { bg: "bg-badge-orange/10",  text: "text-badge-orange" },
};

export default function AdminKycPage() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: queue = [], isLoading, isError } = useQuery({
    queryKey: ["admin-kyc-queue"],
    queryFn: kycApi.adminPendingQueue,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reason }: {
      id: string;
      status: "approved" | "rejected";
      reason?: string;
    }) =>
      kycApi.adminReview(id, {
        status,
        rejectionReason: reason || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      setRejectingId(null);
      setRejectionReason("");
      setActionError(null);
    },
    onError: (err) => setActionError(extractApiError(err).message),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-ink"
          style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px" }}
        >
          KYC Review Queue
        </h1>
        <p className="text-body-sm text-muted mt-1">
          {queue.length > 0
            ? `${queue.length} submission${queue.length !== 1 ? "s" : ""} pending review`
            : "All caught up"}
        </p>
      </div>

      {actionError && (
        <div className="px-4 py-3 bg-error/8 border border-error/20 rounded-md">
          <p className="text-body-sm text-error">{actionError}</p>
        </div>
      )}

      {/* Queue */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 bg-canvas rounded-lg border border-hairline">
            <Loader2 size={22} className="animate-spin text-muted" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-canvas rounded-lg border border-hairline gap-3">
            <AlertCircle size={24} className="text-error" />
            <p className="text-body-sm text-muted">Failed to load queue</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-canvas rounded-lg border border-hairline gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <FileCheck size={22} className="text-success" />
            </div>
            <div className="text-center">
              <p className="text-title-sm text-ink">All clear!</p>
              <p className="text-body-sm text-muted mt-1">
                No pending KYC submissions.
              </p>
            </div>
          </div>
        ) : (
          queue.map((item) => {
            const typeStyle = KYC_TYPE_COLORS[item.kycType] ?? KYC_TYPE_COLORS.basic;
            const isRejecting = rejectingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-canvas rounded-lg border border-hairline overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-hairline">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                      "badge-pill text-xs flex-shrink-0",
                      typeStyle.bg, typeStyle.text
                    )}>
                      {KYC_TYPE_LABELS[item.kycType]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-ink truncate">
                        {item.userFullName}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {item.userEmail}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted flex-shrink-0">
                    {formatDate(item.submittedAt)}
                  </p>
                </div>

                {/* Submitted data */}
                <div className="px-5 py-4">
                  <p className="text-caption font-medium text-muted mb-3 uppercase tracking-wide">
                    Submitted data
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(item.submittedData).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-muted capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="text-body-sm text-ink font-medium break-all">
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-4 border-t border-hairline-soft bg-surface-soft flex flex-col gap-3">
                  {isRejecting ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Rejection reason (required)"
                        className="text-input"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!rejectionReason.trim()) return;
                            reviewMutation.mutate({
                              id: item.id,
                              status: "rejected",
                              reason: rejectionReason,
                            });
                          }}
                          disabled={!rejectionReason.trim() || reviewMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 rounded-md bg-error text-white text-button font-semibold disabled:opacity-40"
                        >
                          {reviewMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <XCircle size={14} />
                          )}
                          Confirm reject
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason("");
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          reviewMutation.mutate({ id: item.id, status: "approved" })
                        }
                        disabled={reviewMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-success text-white text-button font-semibold"
                      >
                        {reviewMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingId(item.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-error/10 text-error border border-error/20 text-button font-semibold"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}