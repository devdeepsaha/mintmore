import { apiClient } from "./axios";
import type { Category } from "@/types";

type CategoryApiResponse = {
  success: boolean;
  data?: {
    categories?: Array<{
      id: string;
      name: string;
      slug: string;
      description?: string | null;
      icon_url?: string | null;
      is_active?: boolean;
      sort_order?: number;
      created_at?: string;
      updated_at?: string;
      market_price_min?: number;
      market_price_max?: number;
      marketPriceMin?: number;
      marketPriceMax?: number;
      createdAt?: string;
      updatedAt?: string;
    }>;
  };
};

function normalizeCategory(
  raw: NonNullable<CategoryApiResponse["data"]>["categories"][number],
): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? undefined,
    marketPriceMin: raw.market_price_min ?? raw.marketPriceMin,
    marketPriceMax: raw.market_price_max ?? raw.marketPriceMax,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
  };
}

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const res = await apiClient.get<CategoryApiResponse>("/categories");
    const raw = res.data?.data?.categories ?? [];
    return raw.map(normalizeCategory);
  },
};
