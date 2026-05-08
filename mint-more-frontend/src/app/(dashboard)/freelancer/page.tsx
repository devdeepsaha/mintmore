"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs";
import { kycApi } from "@/lib/api/kyc";
import Link from "next/link";
import {
  Briefcase,
  ShieldCheck,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { formatINR, formatRelativeTime, formatJobStatus, formatFreelancerLevel } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { JobStatus } from "@/types";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  published:   { bg: "bg-brand-accent/10",  text: "text-brand-accent" },
  negotiating: { bg: "bg-badge-orange/10",  text: "text-badge-orange" },
  agreed:      { bg: "bg-success/10",       text: "text-success" },
  in_progress: { bg: "bg-success/10",       text: "text-success" },
  completed:   { bg: "bg-surface-card",     text: "text-muted" },
  cancelled:   { bg: "bg-error/10",         text: "text-error" },
};

const KYC_LEVEL_LABELS: Record<string, string> = {
  none:     "Not started",
  basic:    "Basic verified",
  identity: "Identity verified",
  full:     "Fully verified",
};

const KYC_LEVEL_COLORS: Record<string, string> = {
  none:     "text-error",
  basic:    "text-badge-orange",
  identity: "text-brand-accent",
  full:     "text-success",
};

export default function FreelancerDashboardPage() {
  const { user } = useAuthStore();

  const { data: jobsData, isLoading: jobsLoading, isError: jobsError } = useQuery({
    queryKey: ["freelancer-matched-jobs"],
    queryFn: () => jobsApi.list({ limit: 5 }),
    enabled: !!user,
  });

  const { data: kycStatus } = useQuery({
    queryKey: ["kyc-status"],
    queryFn: kycApi.getStatus,
    enabled: !!user,
  });

  const jobs = jobsData?.jobs ?? [];
  const kycLevel = user?.kyc_level ?? "none";
  const isFullyVerified = kycLevel === "full";
  const freelancerLevel = user?.freelancer_level;

  const stats = [
    {
      label: "Matched Jobs",
      value: jobsData?.total ?? 0,
      icon: Briefcase,
      color: "text-brand-accent",
      bg: "bg-brand-accent/10",
    },
    {
      label: "In Progress",
      value: jobs.filter((j) => j.status === "in_progress").length,
      icon: Clock,
      color: "text-badge-orange",
      bg: "bg-badge-orange/10",
    },
    {
      label: "Completed",
      value: jobs.filter((j) => j.status === "completed").length,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "KYC Level",
      value: kycLevel.toUpperCase(),
      icon: ShieldCheck,
      color: isFullyVerified ? "text-success" : "text-badge-orange",
      bg: isFullyVerified ? "bg-success/10" : "bg-badge-orange/10",
      isText: true,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-ink"
            style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.5px", lineHeight: "1.2" }}
          >
            Welcome back, {user?.full_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-body-sm text-muted">Your matched jobs and profile status.</p>
            {freelancerLevel && (
              <span className={cn(
                "badge-pill text-xs",
                freelancerLevel === "experienced"
                  ? "bg-badge-violet/10 text-badge-violet"
                  : freelancerLevel === "intermediate"
                  ? "bg-brand-accent/10 text-brand-accent"
                  : "bg-surface-card text-muted"
              )}>
                {formatFreelancerLevel(freelancerLevel)}
              </span>
            )}
          </div>
        </div>
        <Link href="/freelancer/jobs" className="btn-primary gap-2 flex-shrink-0">
          <Briefcase size={15} />
          View matched jobs
        </Link>
      </div>

      {/* KYC alert if not fully verified */}
      {kycLevel !== "full" && (
        <div className="bg-badge-orange/8 border border-badge-orange/20 rounded-lg px-5 py-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-badge-orange flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-body-sm font-semibold text-ink">
              Complete your KYC verification
            </p>
            <p className="text-body-sm text-muted mt-0.5">
              Your current level is <strong>{KYC_LEVEL_LABELS[kycLevel]}</strong>.
              Complete verification to access more job opportunities.
            </p>
          </div>
          <Link href="/freelancer/kyc" className="btn-secondary text-xs flex-shrink-0">
            Complete KYC
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, isText }) => (
          <div key={label} className="bg-canvas rounded-lg border border-hairline p-5 flex flex-col gap-3">
            <div className={cn("w-9 h-9 rounded-md flex items-center justify-center", bg)}>
              <Icon size={17} className={color} />
            </div>
            <div>
              <p
                className={cn("font-semibold text-ink", isText ? "text-base" : "text-2xl")}
                style={!isText ? { letterSpacing: "-0.5px" } : {}}
              >
                {jobsLoading && !isText ? "—" : value}
              </p>
              <p className="text-body-sm text-muted mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Matched jobs */}
      <div className="bg-canvas rounded-lg border border-hairline">
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
          <h2 className="text-title-sm text-ink">Your Matched Jobs</h2>
          <Link
            href="/freelancer/jobs"
            className="text-body-sm text-muted hover:text-ink transition-colors flex items-center gap-1"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {jobsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={22} className="animate-spin text-muted" />
          </div>
        ) : jobsError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={24} className="text-error" />
            <p className="text-body-sm text-muted">Failed to load jobs</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-card flex items-center justify-center">
              <Briefcase size={22} className="text-muted" />
            </div>
            <div className="text-center">
              <p className="text-title-sm text-ink">No matched jobs yet</p>
              <p className="text-body-sm text-muted mt-1">
                Complete your KYC and profile to start receiving matches
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-hairline-soft">
            {jobs.map((job) => {
              const s = STATUS_STYLES[job.status] ?? STATUS_STYLES.completed;
              return (
                <Link
                  key={job.id}
                  href={`/freelancer/jobs/${job.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-soft transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-ink truncate">{job.title}</p>
                    <p className="text-xs text-muted mt-0.5">{job.categoryName}</p>
                  </div>
                  <div className="hidden sm:block flex-shrink-0">
                    <p className="text-body-sm font-medium text-ink">
                      {formatINR(job.budgetMin)} – {formatINR(job.budgetMax)}
                    </p>
                  </div>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0",
                    s.bg, s.text
                  )}>
                    {formatJobStatus(job.status)}
                  </span>
                  <span className="text-xs text-muted flex-shrink-0 hidden md:block">
                    {formatRelativeTime(job.createdAt)}
                  </span>
                  <ArrowRight size={14} className="text-muted flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/freelancer/kyc"
          className="bg-surface-card rounded-lg p-5 flex items-center gap-4 hover:bg-surface-strong transition-colors"
        >
          <div className={cn(
            "w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0",
            isFullyVerified ? "bg-success/10" : "bg-badge-orange/10"
          )}>
            <ShieldCheck size={18} className={isFullyVerified ? "text-success" : "text-badge-orange"} />
          </div>
          <div>
            <p className="text-title-sm text-ink">KYC Verification</p>
            <p className={cn("text-body-sm mt-0.5", KYC_LEVEL_COLORS[kycLevel])}>
              {KYC_LEVEL_LABELS[kycLevel]}
            </p>
          </div>
          <ArrowRight size={16} className="text-muted ml-auto flex-shrink-0" />
        </Link>
        <Link
          href="/freelancer/profile"
          className="bg-surface-card rounded-lg p-5 flex items-center gap-4 hover:bg-surface-strong transition-colors"
        >
          <div className="w-10 h-10 rounded-md bg-canvas border border-hairline flex items-center justify-center flex-shrink-0">
            <Star size={18} className="text-ink" />
          </div>
          <div>
            <p className="text-title-sm text-ink">My Profile</p>
            <p className="text-body-sm text-muted mt-0.5">Update skills and availability</p>
          </div>
          <ArrowRight size={16} className="text-muted ml-auto flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}