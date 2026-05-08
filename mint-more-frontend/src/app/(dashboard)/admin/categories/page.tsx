"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/axios";
import { formatINR } from "@/lib/utils/formatters";
import {
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  marketPriceMin: number;
  marketPriceMax: number;
}

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  marketPriceMin: 0,
  marketPriceMax: 0,
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: adminApi.listCategories,
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setFormError(null);
    },
    onError: (err) => setFormError(extractApiError(err).message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryForm> }) =>
      adminApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingId(null);
      setForm(EMPTY_FORM);
      setFormError(null);
    },
    onError: (err) => setFormError(extractApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleSubmit = () => {
    if (!form.name || !form.slug || form.marketPriceMin <= 0 || form.marketPriceMax <= 0) {
      setFormError("Fill all required fields with valid values.");
      return;
    }
    if (form.marketPriceMax < form.marketPriceMin) {
      setFormError("Max price must be ≥ min price.");
      return;
    }
    setFormError(null);
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      marketPriceMin: cat.marketPriceMin ?? cat.market_price_min ?? 0,
      marketPriceMax: cat.marketPriceMax ?? cat.market_price_max ?? 0,
    });
    setShowForm(true);
    setFormError(null);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-ink"
            style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px" }}
          >
            Categories
          </h1>
          <p className="text-body-sm text-muted mt-1">
            Manage job categories and market price ranges.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
            className="btn-primary gap-2 flex-shrink-0"
          >
            <Plus size={15} />
            Add category
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-canvas rounded-lg border border-hairline p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-title-sm text-ink">
              {editingId ? "Edit category" : "New category"}
            </h2>
            <button onClick={cancelForm} className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-surface-card">
              <X size={16} />
            </button>
          </div>

          {formError && (
            <div className="px-4 py-3 bg-error/8 border border-error/20 rounded-md">
              <p className="text-body-sm text-error">{formError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-medium text-ink">
                Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Web Development"
                className="text-input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: slugify(e.target.value),
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-medium text-ink">
                Slug <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="web-development"
                className="text-input"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-caption font-medium text-ink">
                Description
              </label>
              <input
                type="text"
                placeholder="Short description of the category"
                className="text-input"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-medium text-ink">
                Min market price (₹) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                placeholder="5000"
                className="text-input"
                min={0}
                value={form.marketPriceMin || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    marketPriceMin: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-medium text-ink">
                Max market price (₹) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                placeholder="50000"
                className="text-input"
                min={0}
                value={form.marketPriceMax || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    marketPriceMax: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button onClick={cancelForm} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary gap-2"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {editingId ? "Save changes" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Categories list */}
      <div className="bg-canvas rounded-lg border border-hairline overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={22} className="animate-spin text-muted" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={24} className="text-error" />
            <p className="text-body-sm text-muted">Failed to load categories</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-body-sm text-muted">No categories yet</p>
          </div>
        ) : (
          <div className="divide-y divide-hairline-soft">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-body-sm font-semibold text-ink">
                      {cat.name}
                    </p>
                    <span className="badge-pill text-xs bg-surface-card text-muted">
                      {cat.slug}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-muted mt-0.5">{cat.description}</p>
                  )}
                  <p className="text-xs text-muted mt-1">
                    Market:{" "}
                    <span className="font-medium text-ink">
                      {formatINR(cat.marketPriceMin ?? 0)} –{" "}
                      {formatINR(cat.marketPriceMax ?? 0)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-2 rounded-md text-muted hover:text-ink hover:bg-surface-card transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${cat.name}"?`)) {
                        deleteMutation.mutate(cat.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-md text-muted hover:text-error hover:bg-error/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}