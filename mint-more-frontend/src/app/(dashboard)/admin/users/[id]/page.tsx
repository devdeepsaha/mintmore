"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/axios";
import { formatDate, formatFreelancerLevel, formatINR } from "@/lib/utils/formatters";
import { getInitials } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";
import { useState } from "react";
import type { FreelancerLevel } from "@/types";

type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended";

const APPROVAL_STYLES: Record<ApprovalStatus, { bg: string; text: string }> = {
  pending:   { bg: "bg-badge-orange/10", text: "text-badge-orange" },
  approved:  { bg: "bg-success/10",      text: "text-success" },
  rejected:  { bg: "bg-error/10",        text: "text-error" },
  suspended: { bg: "bg-surface-card",    text: "text-muted" },
};

const LEVEL_OPTIONS: FreelancerLevel[] = ["beginner", "intermediate", "experienced"];

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminApi.getUserById(id),
    enabled: !!id,
  });

  const approvalMutation = useMutation({
    mutationFn: (status: ApprovalStatus) =>
      adminApi.updateUserApproval(id, { approvalStatus: status, note: note || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      setNote("");
      setActionError(null);
    },
    onError: (err) => setActionError(extractApiError(err).message),
  });

  const levelMutation = useMutation({
    mutationFn: (level: FreelancerLevel) =>
      adminApi.updateFreelancerLevel(id, { freelancerLevel: level }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
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

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <AlertCircle size={28} className="text-error" />
        <p className="text-body-sm text-muted">User not found</p>
        <Link href="/admin/users" className="btn-secondary">Back</Link>
      </div>
    );
  }

  const approvalStatus = (user as any).approvalStatus ?? (user as any).approval_status ?? "pending";
  const fullName = (user as any).fullName ?? (user as any).full_name ?? "";
  const kycLevel = (user as any).kycLevel ?? (user as any).kyc_level ?? "none";
  const freelancerLevel = (user as any).freelancerLevel ?? (user as any).freelancer_level;
  const s = APPROVAL_STYLES[approvalStatus as ApprovalStatus] ?? APPROVAL_STYLES.pending;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="p-2 rounded-md text-muted hover:text-ink hover:bg-surface-card transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1
          className="text-ink"
          style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.3px" }}
        >
          User Detail
        </h1>
      </div>

      {actionError && (
        <div className="px-4 py-3 bg-error/8 border border-error/20 rounded-md">
          <p className="text-body-sm text-error">{actionError}</p>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-canvas rounded-lg border border-hairline p-6 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-card border border-hairline flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-semibold text-ink">
              {getInitials(fullName)}
            </span>
          </div>
          <div>
            <p className="text-title-md text-ink font-semibold">{fullName}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={cn(
                "badge-pill text-xs capitalize",
                user.role === "client"
                  ? "bg-brand-accent/10 text-brand-accent"
                  : "bg-success/10 text-success"
              )}>
                {user.role}
              </span>
              <span className={cn("badge-pill text-xs", s.bg, s.text)}>
                {approvalStatus}
              </span>
              <span className="badge-pill text-xs bg-surface-card text-muted">
                KYC: {kycLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-hairline-soft">
          <div className="flex items-center gap-3">
            <Mail size={15} className="text-muted flex-shrink-0" />
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-body-sm text-ink">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={15} className="text-muted flex-shrink-0" />
            <div>
              <p className="text-xs text-muted">Phone</p>
              <p className="text-body-sm text-ink">{user.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={15} className="text-muted flex-shrink-0" />
            <div>
              <p className="text-xs text-muted">Joined</p>
              <p className="text-body-sm text-ink">
                {formatDate((user as any).createdAt ?? (user as any).created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {(user as any).bio && (
          <div className="pt-2 border-t border-hairline-soft">
            <p className="text-caption font-medium text-muted mb-1">Bio</p>
            <p className="text-body-sm text-body">{(user as any).bio}</p>
          </div>
        )}

        {/* Skills */}
        {(user as any).categoryNames?.length > 0 && (
          <div className="pt-2 border-t border-hairline-soft">
            <p className="text-caption font-medium text-muted mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {(user as any).categoryNames.map((cat: string) => (
                <span key={cat} className="badge-pill text-xs">{cat}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Approval action */}
      <div className="bg-canvas rounded-lg border border-hairline p-5 flex flex-col gap-4">
        <h2 className="text-title-sm text-ink">Approval</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-medium text-ink">
            Note <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Reason for approval or rejection..."
            className="text-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => approvalMutation.mutate("approved")}
            disabled={approvalMutation.isPending || approvalStatus === "approved"}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-success text-white text-button font-semibold disabled:opacity-40"
          >
            {approvalMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            Approve
          </button>
          <button
            onClick={() => approvalMutation.mutate("rejected")}
            disabled={approvalMutation.isPending || approvalStatus === "rejected"}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-error/10 text-error text-button font-semibold border border-error/20 disabled:opacity-40"
          >
            <XCircle size={14} />
            Reject
          </button>
          <button
            onClick={() => approvalMutation.mutate("suspended")}
            disabled={approvalMutation.isPending || approvalStatus === "suspended"}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-card text-muted text-button font-semibold border border-hairline disabled:opacity-40"
          >
            Suspend
          </button>
        </div>
      </div>

      {/* Freelancer level — only for freelancers */}
      {user.role === "freelancer" && (
        <div className="bg-canvas rounded-lg border border-hairline p-5 flex flex-col gap-4">
          <h2 className="text-title-sm text-ink">Freelancer Level</h2>
          <p className="text-body-sm text-muted">
            Current level:{" "}
            <span className="font-semibold text-ink">
              {freelancerLevel
                ? formatFreelancerLevel(freelancerLevel)
                : "Not set"}
            </span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {LEVEL_OPTIONS.map((level) => (
              <button
                key={level}
                onClick={() => levelMutation.mutate(level)}
                disabled={levelMutation.isPending || freelancerLevel === level}
                className={cn(
                  "px-4 py-2 rounded-md text-button font-semibold border transition-colors disabled:opacity-40",
                  freelancerLevel === level
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-canvas text-muted border-hairline hover:border-surface-strong hover:text-ink"
                )}
              >
                {formatFreelancerLevel(level)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}