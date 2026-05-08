import { apiClient } from "./axios";
import type {
  Negotiation,
  InitiateNegotiationRequest,
  FreelancerRespondRequest,
  ClientRespondRequest,
  AdminApproveDealRequest,
  AdminPendingDeal,
} from "@/types";

export const negotiationsApi = {
  getByJobId: async (jobId: string): Promise<Negotiation> => {
    const res = await apiClient.get<Negotiation>(
      `/negotiations/jobs/${jobId}`
    );
    return res.data;
  },

  initiate: async (
    jobId: string,
    data: InitiateNegotiationRequest
  ): Promise<Negotiation> => {
    const res = await apiClient.post<Negotiation>(
      `/negotiations/jobs/${jobId}/initiate`,
      data
    );
    return res.data;
  },

  freelancerRespond: async (
    jobId: string,
    data: FreelancerRespondRequest
  ): Promise<Negotiation> => {
    const res = await apiClient.patch<Negotiation>(
      `/negotiations/jobs/${jobId}/freelancer-respond`,
      data
    );
    return res.data;
  },

  clientRespond: async (
    jobId: string,
    data: ClientRespondRequest
  ): Promise<Negotiation> => {
    const res = await apiClient.patch<Negotiation>(
      `/negotiations/jobs/${jobId}/client-respond`,
      data
    );
    return res.data;
  },

  adminApproveDeal: async (
    jobId: string,
    data: AdminApproveDealRequest
  ): Promise<Negotiation> => {
    const res = await apiClient.post<Negotiation>(
      `/negotiations/admin/jobs/${jobId}/approve-deal`,
      data
    );
    return res.data;
  },

  adminPendingDeals: async (): Promise<AdminPendingDeal[]> => {
    const res = await apiClient.get<AdminPendingDeal[]>(
      "/negotiations/admin/pending"
    );
    return res.data;
  },
};