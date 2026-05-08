import { apiClient } from "./axios";
import type { MatchResult } from "@/types";

export const matchingApi = {
  runMatch: async (jobId: string): Promise<MatchResult> => {
    const res = await apiClient.post<MatchResult>(
      `/matching/jobs/${jobId}/run`
    );
    return res.data;
  },

  previewMatch: async (jobId: string): Promise<MatchResult> => {
    const res = await apiClient.get<MatchResult>(
      `/matching/jobs/${jobId}/preview`
    );
    return res.data;
  },
};