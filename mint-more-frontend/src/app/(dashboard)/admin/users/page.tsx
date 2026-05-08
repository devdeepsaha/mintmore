"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import Link from "next/link";
import {
  Search,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { formatDate, formatFreelancerLevel } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { AdminUserFilters } from "@/types";

// ApprovalStatus is not exported from the shared types in this project,
// declare the union here to match the approval states used in this file.
type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended";

const APPROVAL_STYLES: Record<ApprovalStatus, { bg: string; text: string; label: string }> = {
  pending:   { bg: "bg-badge-orange/10", text: "text-badge-orange", label: "Pending" },
  approved:  { bg: "bg-success/10",      text: "text-success",      label: "Approved" },
  rejected:  { bg: "bg-error/10",        text: "text-error",        label: "Rejected" },
  suspended: { bg: "bg-surface-card",    text: "text-muted",        label: "Suspended" },
};

const KYC_LEVEL_LABELS: Record<string, string> = {
  none:     "None",
  basic:    "Basic",
  identity: "Identity",
  full:     "Full",
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "client" | "freelancer">("");
  const [statusFilter, setStatusFilter] = useState<"" | ApprovalStatus>("");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const filters: AdminUserFilters = {
    ...(search ? { search } : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(statusFilter ? { approvalStatus: statusFilter as ApprovalStatus } : {}),
    page,
    limit: LIMIT,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => adminApi.listUsers(filters),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApprovalStatus }) =>
      adminApi.updateUserApproval(id, { approvalStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
  });

  const users = (data as any)?.data ?? data?.data ?? [];
  const total = (data as any)?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-ink"
          style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px" }}
        >
          Users
        </h1>
        <p className="text-body-sm text-muted mt-1">
          {total > 0 ? `${total} users total` : "No users yet"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="text-input pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Role filter */}
        <select
          className="text-input w-full sm:w-36"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as any); setPage(1); }}
        >
          <option value="">All roles</option>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        {/* Status filter */}
        <select
          className="text-input w-full sm:w-40"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
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
            <p className="text-body-sm text-muted">Failed to load users</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-body-sm text-muted">No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden lg:grid grid-cols-[1fr_100px_80px_120px_140px_80px] gap-4 px-5 py-3 border-b border-hairline bg-surface-soft">
              <span className="text-caption text-muted font-medium">User</span>
              <span className="text-caption text-muted font-medium">Role</span>
              <span className="text-caption text-muted font-medium">KYC</span>
              <span className="text-caption text-muted font-medium">Joined</span>
              <span className="text-caption text-muted font-medium">Status</span>
              <span className="text-caption text-muted font-medium">Actions</span>
            </div>

            <div className="divide-y divide-hairline-soft">
              {users.map((user: any) => {
                const s = APPROVAL_STYLES[user.approvalStatus as ApprovalStatus] ?? APPROVAL_STYLES.pending;
                return (
                  <div
                    key={user.id}
                    className="flex flex-col lg:grid lg:grid-cols-[1fr_100px_80px_120px_140px_80px] gap-2 lg:gap-4 lg:items-center px-5 py-4"
                  >
                    {/* Name + email */}
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-ink truncate">
                        {user.fullName ?? user.full_name}
                      </p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>

                    {/* Role */}
                    <span className={cn(
                      "badge-pill text-xs w-fit capitalize",
                      user.role === "client"
                        ? "bg-brand-accent/10 text-brand-accent"
                        : "bg-success/10 text-success"
                    )}>
                      {user.role}
                    </span>

                    {/* KYC */}
                    <span className="text-body-sm text-muted">
                      {KYC_LEVEL_LABELS[user.kycLevel ?? user.kyc_level] ?? "None"}
                    </span>

                    {/* Joined */}
                    <span className="text-body-sm text-muted">
                      {formatDate(user.createdAt ?? user.created_at)}
                    </span>

                    {/* Status badge */}
                    <span className={cn(
                      "badge-pill text-xs w-fit",
                      s.bg, s.text
                    )}>
                      {s.label}
                    </span>

                    {/* Quick approve/reject */}
                    <div className="flex items-center gap-1">
                      {user.approvalStatus === "pending" || user.approval_status === "pending" ? (
                        <>
                          <button
                            onClick={() => approveMutation.mutate({
                              id: user.id,
                              status: "approved",
                            })}
                            disabled={approveMutation.isPending}
                            className="p-1.5 rounded-md text-success hover:bg-success/10 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() => approveMutation.mutate({
                              id: user.id,
                              status: "rejected",
                            })}
                            disabled={approveMutation.isPending}
                            className="p-1.5 rounded-md text-error hover:bg-error/10 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      ) : (
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-surface-card transition-colors"
                        >
                          <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
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