import { apiClient } from "./axios";

export interface AdminWithdrawal {
  id: string;
  status: "pending" | "approved" | "rejected" | string;
  amount?: number;
  createdAt?: string;
  userId?: string;
}

export const walletApi = {
  getAdminWithdrawals: async (): Promise<AdminWithdrawal[]> => {
    const res = await apiClient.get<AdminWithdrawal[]>(
      "/wallet/admin/withdrawals",
    );
    return res.data;
  },
};
