export const queryKeys = {
  negotiations: {
    pendingApprovals: () => ["negotiations", "pending-approvals"] as const,
  },
  kyc: {
    pending: () => ["kyc", "pending"] as const,
  },
  wallet: {
    adminWithdrawals: () => ["wallet", "admin-withdrawals"] as const,
  },
};
