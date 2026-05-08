"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { formatINR, formatFreelancerLevel, formatDate } from "@/lib/utils/formatters";
import { getInitials } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";

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

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  beginner:     { bg: "bg-surface-card",       text: "text-muted" },
  intermediate: { bg: "bg-brand-accent/10",    text: "text-brand-accent" },
  experienced:  { bg: "bg-badge-violet/10",    text: "text-badge-violet" },
};

export default function FreelancerProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  const kycLevel = user.kyc_level ?? "none";
  const freelancerLevel = user.freelancer_level;
  const levelStyle = freelancerLevel
    ? LEVEL_COLORS[freelancerLevel]
    : LEVEL_COLORS.beginner;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1
          className="text-ink"
          style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px" }}
        >
          My Profile
        </h1>
        <p className="text-body-sm text-muted mt-1">
          Your profile and account details.
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-canvas rounded-lg border border-hairline p-6 flex flex-col gap-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-card border border-hairline flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-semibold text-ink">
              {getInitials(user.full_name)}
            </span>
          </div>
          <div>
            <p
              className="text-ink"
              style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.3px" }}
            >
              {user.full_name}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {freelancerLevel && (
                <span className={cn("badge-pill text-xs", levelStyle.bg, levelStyle.text)}>
                  {formatFreelancerLevel(freelancerLevel)}
                </span>
              )}
              <span className={cn("text-body-sm", KYC_LEVEL_COLORS[kycLevel])}>
                {KYC_LEVEL_LABELS[kycLevel]}
              </span>
            </div>
          </div>
        </div>

        {/* Contact info */}
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
              <p className="text-body-sm text-ink">+91 {user.phone}</p>
            </div>
          </div>
          {user.address_city && (
            <div className="flex items-center gap-3">
              <MapPin size={15} className="text-muted flex-shrink-0" />
              <div>
                <p className="text-xs text-muted">Location</p>
                <p className="text-body-sm text-ink">
                  {user.address_city}, {user.address_state}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="pt-2 border-t border-hairline-soft">
            <p className="text-caption font-medium text-muted mb-2">About</p>
            <p className="text-body-sm text-body leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="pt-2 border-t border-hairline-soft">
            <p className="text-caption font-medium text-muted mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span key={skill} className="badge-pill text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        {user.price_min && user.price_max && (
          <div className="pt-2 border-t border-hairline-soft">
            <p className="text-caption font-medium text-muted mb-2">
              Price Range
            </p>
            <p className="text-body-sm text-ink font-medium">
              {formatINR(Number(user.price_min))} –{" "}
              {formatINR(Number(user.price_max))}
            </p>
          </div>
        )}
      </div>

      {/* Account stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-canvas rounded-lg border border-hairline p-5 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-md bg-success/10 flex items-center justify-center">
            <Briefcase size={15} className="text-success" />
          </div>
          <p className="text-xl font-semibold text-ink" style={{ letterSpacing: "-0.5px" }}>
            {user.jobs_completed_count ?? 0}
          </p>
          <p className="text-body-sm text-muted">Jobs completed</p>
        </div>
        <div className="bg-canvas rounded-lg border border-hairline p-5 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-md bg-badge-orange/10 flex items-center justify-center">
            <Star size={15} className="text-badge-orange" />
          </div>
          <p className="text-xl font-semibold text-ink" style={{ letterSpacing: "-0.5px" }}>
            {user.average_rating
              ? Number(user.average_rating).toFixed(1)
              : "—"}
          </p>
          <p className="text-body-sm text-muted">Average rating</p>
        </div>
      </div>

      {/* KYC quick link */}
      <Link
        href="/freelancer/kyc"
        className="bg-canvas rounded-lg border border-hairline p-5 flex items-center gap-4 hover:bg-surface-soft transition-colors"
      >
        <div className={cn(
          "w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0",
          kycLevel === "full" ? "bg-success/10" : "bg-badge-orange/10"
        )}>
          <ShieldCheck
            size={18}
            className={kycLevel === "full" ? "text-success" : "text-badge-orange"}
          />
        </div>
        <div className="flex-1">
          <p className="text-title-sm text-ink">KYC Verification</p>
          <p className={cn("text-body-sm mt-0.5", KYC_LEVEL_COLORS[kycLevel])}>
            {KYC_LEVEL_LABELS[kycLevel]}
          </p>
        </div>
        <ArrowRight size={16} className="text-muted flex-shrink-0" />
      </Link>
    </div>
  );
}