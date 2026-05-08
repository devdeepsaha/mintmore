"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { kycApi } from "@/lib/api/kyc";
import { useAuthStore } from "@/lib/stores/authStore";
import { KycStepper } from "@/components/kyc/KycStepper";
import { BasicKycForm } from "@/components/kyc/BasicKycForm";
import { IdentityKycForm } from "@/components/kyc/IdentityKycForm";
import { AddressKycForm } from "@/components/kyc/AddressKycForm";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type KycStepNumber = 1 | 2 | 3;

const LEVEL_MAP: Record<string, number> = {
  none:     0,
  basic:    1,
  identity: 2,
  full:     3,
};

const STATUS_INFO = {
  not_started: {
    icon: ShieldCheck,
    color: "text-muted",
    bg: "bg-surface-card",
    label: "Not submitted",
  },
  pending: {
    icon: Clock,
    color: "text-badge-orange",
    bg: "bg-badge-orange/10",
    label: "Under review",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    color: "text-error",
    bg: "bg-error/10",
    label: "Rejected",
  },
};

function StepStatusCard({
  stepNum,
  label,
  status,
  rejectionReason,
}: {
  stepNum: number;
  label: string;
  status: keyof typeof STATUS_INFO;
  rejectionReason?: string;
}) {
  const info = STATUS_INFO[status];
  const Icon = info.icon;
  return (
    <div className={cn(
      "flex items-start gap-3 px-4 py-3 rounded-lg border",
      status === "approved"
        ? "border-success/20 bg-success/5"
        : status === "rejected"
        ? "border-error/20 bg-error/5"
        : status === "pending"
        ? "border-badge-orange/20 bg-badge-orange/5"
        : "border-hairline bg-surface-soft"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        info.bg
      )}>
        <Icon size={15} className={info.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-body-sm font-medium text-ink">
            Step {stepNum}: {label}
          </p>
          <span className={cn("text-xs font-medium", info.color)}>
            {info.label}
          </span>
        </div>
        {rejectionReason && (
          <p className="text-xs text-error mt-1">{rejectionReason}</p>
        )}
      </div>
    </div>
  );
}

export default function FreelancerKycPage() {
  const { user } = useAuthStore();
  const kycLevelNum = LEVEL_MAP[user?.kyc_level ?? "none"] ?? 0;

  // Active form step — start right after completed level
  const [activeStep, setActiveStep] = useState<KycStepNumber>(
    kycLevelNum >= 3 ? 3 : ((kycLevelNum + 1) as KycStepNumber)
  );

  const { data: kycStatus, isLoading } = useQuery({
    queryKey: ["kyc-status"],
    queryFn: kycApi.getStatus,
    enabled: !!user,
  });

  const isFullyVerified = kycLevelNum >= 3;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1
          className="text-ink"
          style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px" }}
        >
          KYC Verification
        </h1>
        <p className="text-body-sm text-muted mt-1">
          Complete all 3 steps to unlock full platform access.
        </p>
      </div>

      {/* Stepper */}
      <div className="bg-canvas rounded-lg border border-hairline p-5">
        <KycStepper
          currentStep={isFullyVerified ? 3 : activeStep}
          completedLevel={kycLevelNum}
        />
      </div>

      {/* Fully verified */}
      {isFullyVerified && (
        <div className="flex flex-col items-center justify-center py-10 gap-4 bg-canvas rounded-lg border border-hairline">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
            <ShieldCheck size={28} className="text-success" />
          </div>
          <div className="text-center">
            <p
              className="text-ink"
              style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.3px" }}
            >
              KYC Complete
            </p>
            <p className="text-body-sm text-muted mt-1">
              Your identity has been fully verified. You have full platform access.
            </p>
          </div>
        </div>
      )}

      {/* Status summary */}
      {!isLoading && kycStatus && !isFullyVerified && (
        <div className="flex flex-col gap-2">
          <p className="text-caption font-medium text-muted uppercase tracking-wide">
            Verification status
          </p>
          <StepStatusCard
            stepNum={1}
            label="Basic Info"
            status={kycStatus.basic.status}
            rejectionReason={kycStatus.basic.rejectionReason}
          />
          {kycLevelNum >= 1 && (
            <StepStatusCard
              stepNum={2}
              label="Identity"
              status={kycStatus.identity.status}
              rejectionReason={kycStatus.identity.rejectionReason}
            />
          )}
          {kycLevelNum >= 2 && (
            <StepStatusCard
              stepNum={3}
              label="Address"
              status={kycStatus.address.status}
              rejectionReason={kycStatus.address.rejectionReason}
            />
          )}
        </div>
      )}

      {/* Active form — only show the next uncompleted step */}
      {!isFullyVerified && (
        <div className="bg-canvas rounded-lg border border-hairline overflow-hidden">
          {/* Form header */}
          <div className="px-6 py-4 border-b border-hairline bg-surface-soft">
            <p className="text-title-sm text-ink">
              {activeStep === 1 && "Step 1: Basic Information"}
              {activeStep === 2 && "Step 2: Identity Verification"}
              {activeStep === 3 && "Step 3: Address Verification"}
            </p>
            <p className="text-body-sm text-muted mt-0.5">
              {activeStep === 1 &&
                "Enter your personal details as per your government ID."}
              {activeStep === 2 &&
                "Upload a valid government-issued ID document."}
              {activeStep === 3 &&
                "Provide proof of your current residential address."}
            </p>
          </div>

          {/* Form body */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={22} className="animate-spin text-muted" />
              </div>
            ) : (
              <>
                {/* Step 1 — only show if not yet completed */}
                {activeStep === 1 && kycLevelNum < 1 && (
                  <BasicKycForm
                    onSuccess={() => setActiveStep(2)}
                  />
                )}

                {/* Step 1 pending */}
                {activeStep === 1 && kycLevelNum < 1 &&
                  kycStatus?.basic.status === "pending" && (
                  <div className="flex items-center gap-3 py-4">
                    <Clock size={18} className="text-badge-orange" />
                    <p className="text-body-sm text-muted">
                      Basic info submitted — awaiting admin review.
                    </p>
                  </div>
                )}

                {/* Step 2 */}
                {activeStep === 2 && kycLevelNum < 2 && (
                  <>
                    {kycStatus?.identity.status === "pending" ? (
                      <div className="flex items-center gap-3 py-4">
                        <Clock size={18} className="text-badge-orange" />
                        <p className="text-body-sm text-muted">
                          Identity submitted — awaiting admin review.
                        </p>
                      </div>
                    ) : (
                      <IdentityKycForm
                        onSuccess={() => setActiveStep(3)}
                        onBack={() => setActiveStep(1)}
                      />
                    )}
                  </>
                )}

                {/* Step 3 */}
                {activeStep === 3 && kycLevelNum < 3 && (
                  <>
                    {kycStatus?.address.status === "pending" ? (
                      <div className="flex items-center gap-3 py-4">
                        <Clock size={18} className="text-badge-orange" />
                        <p className="text-body-sm text-muted">
                          Address submitted — awaiting admin review.
                        </p>
                      </div>
                    ) : (
                      <AddressKycForm
                        onSuccess={() => {
                          // Refresh kyc status
                        }}
                        onBack={() => setActiveStep(2)}
                      />
                    )}
                  </>
                )}

                {/* Already completed this step — show move forward */}
                {activeStep <= kycLevelNum && !isFullyVerified && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <CheckCircle2 size={28} className="text-success" />
                    <p className="text-body-sm text-muted">
                      This step is complete.
                    </p>
                    <button
                      onClick={() =>
                        setActiveStep(
                          Math.min(3, activeStep + 1) as KycStepNumber
                        )
                      }
                      className="btn-primary"
                    >
                      Continue to next step
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}