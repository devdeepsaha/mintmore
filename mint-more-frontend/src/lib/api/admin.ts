import { apiClient } from "./axios";
import type {
  AdminDashboardStats,
  AdminUserListItem,
  AdminUserDetail,
  AdminUpdateUserApprovalRequest,
  AdminUpdateFreelancerLevelRequest,
  AdminUserFilters,
  PaginatedResponse,
} from "@/types";
import type { FreelancerLevel } from "@/types";
import type { Category } from "@/types/jobs";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BackendUser = {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: "client" | "freelancer" | "admin";
  is_active: boolean;
  is_approved: boolean;
  approved_at?: string | null;
  kyc_status?: string | null;
  kyc_level?: string | null;
  freelancer_level?: string | null;
  created_at: string;
};

type BackendUsersResponse = {
  users: BackendUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const mapApprovalStatus = (
  user: BackendUser,
): AdminUserListItem["approvalStatus"] => {
  if (user.is_active === false) return "suspended";
  if (user.is_approved) return "approved";
  return "pending";
};

const mapKycLevel = (level?: string | null): 0 | 1 | 2 | 3 => {
  const map: Record<string, 0 | 1 | 2 | 3> = {
    none: 0,
    basic: 1,
    identity: 2,
    address: 3,
    full: 3,
  };
  return map[level ?? "none"] ?? 0;
};

const mapFreelancerLevel = (
  level?: string | null,
): FreelancerLevel | undefined => {
  if (
    level === "beginner" ||
    level === "intermediate" ||
    level === "experienced"
  ) {
    return level;
  }
  return undefined;
};

const mapUserListItem = (user: BackendUser): AdminUserListItem => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  phone: user.phone,
  role: user.role === "admin" ? "client" : user.role,
  approvalStatus: mapApprovalStatus(user),
  kycLevel: mapKycLevel(user.kyc_level),
  freelancerLevel: mapFreelancerLevel(user.freelancer_level),
  createdAt: user.created_at,
});

export const adminApi = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const res = await apiClient.get<AdminDashboardStats>("/admin/dashboard");
    return res.data;
  },

  // ── Users ──────────────────────────────────────────────────────────────────
  listUsers: async (
    filters?: AdminUserFilters,
  ): Promise<PaginatedResponse<AdminUserListItem>> => {
    const params = {
      role: filters?.role,
      search: filters?.search,
      page: filters?.page,
      limit: filters?.limit,
      is_approved:
        filters?.approvalStatus === undefined
          ? undefined
          : filters.approvalStatus === "approved"
            ? true
            : filters.approvalStatus === "pending"
              ? false
              : undefined,
    };
    const res = await apiClient.get<ApiResponse<BackendUsersResponse>>(
      "/admin/users",
      { params },
    );
    const payload = res.data.data;
    return {
      data: payload.users.map(mapUserListItem),
      total: payload.pagination.total,
      page: payload.pagination.page,
      limit: payload.pagination.limit,
      totalPages: payload.pagination.pages,
    };
  },

  getUserById: async (id: string): Promise<AdminUserDetail> => {
    const res = await apiClient.get<ApiResponse<{ user: AdminUserDetail }>>(
      `/admin/users/${id}`,
    );
    return res.data.data.user;
  },

  updateUserApproval: async (
    id: string,
    data: AdminUpdateUserApprovalRequest,
  ): Promise<AdminUserDetail> => {
    const res = await apiClient.patch<ApiResponse<{ user: AdminUserDetail }>>(
      `/admin/users/${id}/approval`,
      {
        is_approved: data.approvalStatus === "approved",
      },
    );
    return res.data.data.user;
  },

  updateFreelancerLevel: async (
    id: string,
    data: AdminUpdateFreelancerLevelRequest,
  ): Promise<AdminUserDetail> => {
    const res = await apiClient.patch<ApiResponse<{ user: AdminUserDetail }>>(
      `/admin/users/${id}/freelancer-level`,
      {
        level: data.freelancerLevel,
      },
    );
    return res.data.data.user;
  },

  // ── Categories ─────────────────────────────────────────────────────────────
  listCategories: async (): Promise<Category[]> => {
    const res =
      await apiClient.get<ApiResponse<{ categories: Category[] }>>(
        "/admin/categories",
      );
    return res.data.data.categories;
  },

  createCategory: async (
    data: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ): Promise<Category> => {
    const res = await apiClient.post<ApiResponse<{ category: Category }>>(
      "/admin/categories",
      data,
    );
    return res.data.data.category;
  },

  updateCategory: async (
    id: string,
    data: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Category> => {
    const res = await apiClient.patch<ApiResponse<{ category: Category }>>(
      `/admin/categories/${id}`,
      data,
    );
    return res.data.data.category;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },
};
