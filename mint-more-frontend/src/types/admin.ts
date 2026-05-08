import type { User, ApprovalStatus, FreelancerLevel } from "./auth";
import type { Job, JobStatus } from "./jobs";
import type { Negotiation } from "./negotiations";

export interface AdminDashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  totalJobs: number;
  activeNegotiations: number;
  pendingDeals: number;
  pendingKyc: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "client" | "freelancer";
  approvalStatus: ApprovalStatus;
  kycLevel: 0 | 1 | 2 | 3;
  freelancerLevel?: FreelancerLevel;
  createdAt: string;
}

export interface AdminUserDetail extends User {
  freelancerLevel?: FreelancerLevel;
  categoryNames?: string[];
  bio?: string;
  totalJobs?: number;
  totalNegotiations?: number;
}

export interface AdminUpdateUserApprovalRequest {
  approvalStatus: ApprovalStatus;
  note?: string;
}

export interface AdminUpdateFreelancerLevelRequest {
  freelancerLevel: FreelancerLevel;
}

export interface AdminUserFilters {
  role?: "client" | "freelancer";
  approvalStatus?: ApprovalStatus;
  kycLevel?: 0 | 1 | 2 | 3;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminJobListItem {
  id: string;
  title: string;
  clientName: string;
  categoryName: string;
  status: JobStatus;
  pricingMode: "budget" | "expert";
  budgetMin: number;
  budgetMax: number;
  createdAt: string;
}

export interface AdminJobFilters {
  status?: JobStatus;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminPendingDeal {
  negotiationId: string;
  jobId: string;
  jobTitle: string;
  clientName: string;
  freelancerName: string;
  agreedAmount: number;
  submittedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}