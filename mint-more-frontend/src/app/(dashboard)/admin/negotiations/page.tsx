"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { negotiationsApi } from "@/lib/api/negotiations";
import { extractApiError } from "@/lib/api/axios";
import { formatINR, formatDate } from "@/lib/utils/formatters";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HandshakeIcon,
} from "lucide-react";
import { useState } from "react";

export default function AdminNegotiationsPage() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  const { data: deals = [], isLoading, isError } = useQuery({
    queryKey: ["admin-pending-deals"],
    queryFn: negotiationsApi.adminPendingDeals,
  });

  const approveMutation = useMutation({
    mutationFn: ({ jobId, approved, noteText }: {
      jobId: string;
      approved: boolean;
      noteText?: string;
    }) =>
      negotiationsApi.adminApproveDeal(jobId, {
        approved,
        note: noteText || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-deals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      setActionError(null);
    },
    onError: (err) => setActionError(extractApiError(err).message),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-ink"
          style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px" }}
        >
          Deal Approvals
        </h1>
        <p className="text-body-sm text-muted mt-1">
          {deals.length > 0
            ? `${deals.length} deal${deals.length !== 1 ? "s" : ""} awaiting approval`
            : "No pending deals"}
        </p>
      </div>

      {actionError && (
        <div className="px-4 py-3 bg-error/8 border border-error/20 rounded-md">
          <p className="text-body-sm text-error">{actionError}</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 bg-canvas rounded-lg border border-hairline">
            <Loader2 size={22} className="animate-spin text-muted" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-canvas rounded-lg border border-hairline gap-3">
            <AlertCircle size={24} className="text-error" />
            <p className="text-body-sm text-muted">Failed to load deals</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-canvas rounded-lg border border-hairline gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <HandshakeIcon size={22} className="text-success" />
            </div>
            <div className="text-center">
              <p className="text-title-sm text-ink">All clear!</p>
              <p className="text-body-sm text-muted mt-1">
                No deals pending approval.
              </p>
            </div>
          </div>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.negotiationId}
              className="bg-canvas rounded-lg border border-hairline overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-hairline">
                <p className="text-title-sm text-ink">{deal.jobTitle}</p>
                <p className="text-body-sm text-muted mt-0.5">
                  {deal.clientName} → {deal.freelancerName}
                </p>
              </div>

              {/* Deal info */}
              <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted">Agreed amount</p>
                  <p
                    className="text-ink font-semibold mt-0.5"
                    style={{ fontSize: "20px", letterSpacing: "-0.3px" }}
                  >
                    {formatINR(deal.agreedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Client</p>
                  <p className="text-body-sm text-ink font-medium mt-0.5">
                    {deal.clientName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Freelancer</p>
                  <p className="text-body-sm text-ink font-medium mt-0.5">
                    {deal.freelancerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Submitted</p>
                  <p className="text-body-sm text-ink mt-0.5">
                    {formatDate(deal.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-4 border-t border-hairline-soft bg-surface-soft flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-caption font-medium text-ink">
                    Note <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Add a note..."
                    className="text-input"
                    value={note[deal.negotiationId] ?? ""}
                    onChange={(e) =>
                      setNote((prev) => ({
                        ...prev,
                        [deal.negotiationId]: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      approveMutation.mutate({
                        jobId: deal.jobId,
                        approved: true,
                        noteText: note[deal.negotiationId],
                      })
                    }
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-success text-white text-button font-semibold"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Approve deal
                  </button>
                  <button
                    onClick={() =>
                      approveMutation.mutate({
                        jobId: deal.jobId,
                        approved: false,
                        noteText: note[deal.negotiationId],
                      })
                    }
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-error/10 text-error border border-error/20 text-button font-semibold"
                  >
                    <XCircle size={14} />
                    Reject deal
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}