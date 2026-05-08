export type JobStatus =
  | "draft"
  | "published"
  | "matching"
  | "negotiating"
  | "agreed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "failed";

export type PricingMode = "budget" | "expert";

export type JobVisibility = "private" | "matched_only";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  marketPriceMin?: number;
  marketPriceMax?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  budgetMin: number;
  budgetMax: number;
  pricingMode: PricingMode;
  status: JobStatus;
  visibility: JobVisibility;
  deadline?: string;
  attachmentUrls: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface JobListItem {
  id: string;
  title: string;
  categoryName: string;
  budgetMin: number;
  budgetMax: number;
  pricingMode: PricingMode;
  status: JobStatus;
  createdAt: string;
  deadline?: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  categoryId: string;
  budgetMin: number;
  budgetMax: number;
  pricingMode: PricingMode;
  deadline?: string;
  attachmentUrls?: string[];
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {}

export interface JobsListResponse {
  jobs: JobListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface JobFilters {
  status?: JobStatus;
  categoryId?: string;
  pricingMode?: PricingMode;
  page?: number;
  limit?: number;
}
