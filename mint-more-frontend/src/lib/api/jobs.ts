import { apiClient } from "./axios";
import type {
  Job,
  JobsListResponse,
  CreateJobRequest,
  UpdateJobRequest,
  JobFilters,
  JobListItem,
  PricingMode,
} from "@/types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BackendJob = {
  id: string;
  client_id: string;
  client_name?: string;
  title: string;
  description: string;
  category_id?: string | null;
  category_name?: string | null;
  budget_type?: "fixed" | "expert" | null;
  budget_amount?: number | null;
  pricing_mode?: PricingMode | null;
  status: string;
  visibility?: "private" | "matched_only" | null;
  deadline?: string | null;
  attachments?: string[] | null;
  metadata?: unknown;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
};

type BackendJobsListResponse = {
  jobs: BackendJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const parseMetadata = (raw: unknown): Record<string, unknown> | null => {
  if (!raw) return null;
  if (typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return null;
};

const getBudgetRange = (job: BackendJob) => {
  const metadata = parseMetadata(job.metadata);
  const min = metadata?.budget_min as number | undefined;
  const max = metadata?.budget_max as number | undefined;
  const fallback = job.budget_amount ?? 0;

  return {
    budgetMin: Number.isFinite(min) ? (min as number) : fallback,
    budgetMax: Number.isFinite(max) ? (max as number) : fallback,
  };
};

const getPricingMode = (job: BackendJob): PricingMode => {
  if (job.pricing_mode) return job.pricing_mode;
  return job.budget_type === "expert" ? "expert" : "budget";
};

const mapJobListItem = (job: BackendJob): JobListItem => {
  const { budgetMin, budgetMax } = getBudgetRange(job);
  return {
    id: job.id,
    title: job.title,
    categoryName: job.category_name ?? "",
    budgetMin,
    budgetMax,
    pricingMode: getPricingMode(job),
    status: job.status as JobListItem["status"],
    createdAt: job.created_at,
    deadline: job.deadline ?? undefined,
  };
};

const mapJob = (job: BackendJob): Job => {
  const { budgetMin, budgetMax } = getBudgetRange(job);
  return {
    id: job.id,
    clientId: job.client_id,
    clientName: job.client_name ?? "",
    title: job.title,
    description: job.description,
    categoryId: job.category_id ?? "",
    categoryName: job.category_name ?? "",
    budgetMin,
    budgetMax,
    pricingMode: getPricingMode(job),
    status: job.status as Job["status"],
    visibility: (job.visibility ?? "private") as Job["visibility"],
    deadline: job.deadline ?? undefined,
    attachmentUrls: job.attachments ?? [],
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    publishedAt: job.published_at ?? undefined,
  };
};

const mapCreatePayload = (data: CreateJobRequest) => {
  const budgetType = data.pricingMode === "expert" ? "expert" : "fixed";
  return {
    category_id: data.categoryId,
    title: data.title,
    description: data.description,
    budget_type: budgetType,
    budget_amount: budgetType === "expert" ? null : data.budgetMax,
    pricing_mode: data.pricingMode,
    deadline: data.deadline,
    attachments: data.attachmentUrls ?? [],
    metadata: {
      budget_min: data.budgetMin,
      budget_max: data.budgetMax,
    },
  };
};

const mapUpdatePayload = (data: UpdateJobRequest) => {
  const payload: Record<string, unknown> = {};
  if (data.categoryId !== undefined) payload.category_id = data.categoryId;
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.deadline !== undefined) payload.deadline = data.deadline;
  if (data.attachmentUrls !== undefined) {
    payload.attachments = data.attachmentUrls;
  }

  if (data.pricingMode !== undefined) {
    const budgetType = data.pricingMode === "expert" ? "expert" : "fixed";
    payload.pricing_mode = data.pricingMode;
    payload.budget_type = budgetType;
  }

  if (data.budgetMin !== undefined || data.budgetMax !== undefined) {
    const min = data.budgetMin ?? 0;
    const max = data.budgetMax ?? min;
    payload.budget_amount = max;
    payload.metadata = {
      budget_min: min,
      budget_max: max,
    };
  }

  return payload;
};

export const jobsApi = {
  list: async (filters?: JobFilters): Promise<JobsListResponse> => {
    const params = {
      status: filters?.status,
      category_id: filters?.categoryId,
      page: filters?.page,
      limit: filters?.limit,
    };
    const res = await apiClient.get<ApiResponse<BackendJobsListResponse>>(
      "/jobs",
      { params },
    );
    const payload = res.data.data;
    return {
      jobs: payload.jobs.map(mapJobListItem),
      total: payload.pagination.total,
      page: payload.pagination.page,
      limit: payload.pagination.limit,
    };
  },

  getById: async (id: string): Promise<Job> => {
    const res = await apiClient.get<ApiResponse<BackendJob>>(`/jobs/${id}`);
    return mapJob(res.data.data);
  },

  create: async (data: CreateJobRequest): Promise<Job> => {
    const res = await apiClient.post<ApiResponse<BackendJob>>(
      "/jobs",
      mapCreatePayload(data),
    );
    return mapJob(res.data.data);
  },

  update: async (id: string, data: UpdateJobRequest): Promise<Job> => {
    const res = await apiClient.patch<ApiResponse<BackendJob>>(
      `/jobs/${id}`,
      mapUpdatePayload(data),
    );
    return mapJob(res.data.data);
  },

  publish: async (id: string): Promise<Job> => {
    const res = await apiClient.patch<ApiResponse<BackendJob>>(
      `/jobs/${id}/publish`,
    );
    return mapJob(res.data.data);
  },

  cancel: async (id: string): Promise<Job> => {
    const res = await apiClient.patch<ApiResponse<BackendJob>>(
      `/jobs/${id}/cancel`,
    );
    return mapJob(res.data.data);
  },

  // Admin: list all jobs
  adminList: async (
    filters?: import("@/types").AdminJobFilters,
  ): Promise<
    import("@/types").PaginatedResponse<import("@/types").AdminJobListItem>
  > => {
    const res = await apiClient.get<
      ApiResponse<
        import("@/types").PaginatedResponse<import("@/types").AdminJobListItem>
      >
    >("/admin/jobs", { params: filters });
    return res.data.data;
  },

  adminGetById: async (id: string): Promise<Job> => {
    const res = await apiClient.get<ApiResponse<BackendJob>>(
      `/admin/jobs/${id}`,
    );
    return mapJob(res.data.data);
  },
};
