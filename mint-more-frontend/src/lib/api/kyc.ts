import { apiClient } from "./axios";
import type {
  KycStatusResponse,
  BasicKycFormData,
  IdentityKycFormData,
  AddressKycFormData,
  AdminKycReview,
  AdminKycReviewAction,
} from "@/types";

export const kycApi = {
  getStatus: async (): Promise<KycStatusResponse> => {
    const res = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        overall_status?: string | null;
        current_level?: string | null;
        submissions?: Array<{
          id: string;
          level: "basic" | "identity" | "address";
          status: KycStatusResponse["basic"]["status"];
          admin_note?: string | null;
          created_at?: string | null;
          reviewed_at?: string | null;
        }>;
      };
    }>("/kyc/status");
    const { submissions = [], current_level } = res.data.data ?? {};

    const initialStep = {
      status: "not_started" as const,
      submittedAt: undefined,
      reviewedAt: undefined,
      rejectionReason: undefined,
    };

    const latestByLevel = new Map<string, (typeof submissions)[number]>();
    for (const submission of submissions) {
      if (!latestByLevel.has(submission.level)) {
        latestByLevel.set(submission.level, submission);
      }
    }

    const mapStep = (level: "basic" | "identity" | "address") => {
      const submission = latestByLevel.get(level);
      if (!submission) return initialStep;
      return {
        status: submission.status,
        submittedAt: submission.created_at ?? undefined,
        reviewedAt: submission.reviewed_at ?? undefined,
        rejectionReason: submission.admin_note ?? undefined,
      };
    };

    const levelMap: Record<string, 0 | 1 | 2 | 3> = {
      none: 0,
      basic: 1,
      identity: 2,
      address: 3,
      full: 3,
    };

    return {
      userId: "",
      level: levelMap[current_level ?? "none"] ?? 0,
      basic: mapStep("basic"),
      identity: mapStep("identity"),
      address: mapStep("address"),
    };
  },

  submitBasic: async (data: BasicKycFormData): Promise<void> => {
    await apiClient.post("/kyc/basic", data);
  },

  submitIdentity: async (data: IdentityKycFormData): Promise<void> => {
    await apiClient.post("/kyc/identity", data);
  },

  submitAddress: async (data: AddressKycFormData): Promise<void> => {
    await apiClient.post("/kyc/address", data);
  },

  // Admin
  adminPendingQueue: async (): Promise<AdminKycReview[]> => {
    const res = await apiClient.get<{
      success: boolean;
      message: string;
      data: { submissions: AdminKycReview[] } | AdminKycReview[];
    }>("/kyc/admin/pending");
    const payload = res.data.data;
    return Array.isArray(payload) ? payload : payload.submissions;
  },

  adminReview: async (
    id: string,
    data: AdminKycReviewAction,
  ): Promise<void> => {
    await apiClient.patch(`/kyc/admin/review/${id}`, data);
  },
};
