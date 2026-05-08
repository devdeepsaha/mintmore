"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs";
import { categoriesApi } from "@/lib/api/categories";
import { extractApiError } from "@/lib/api/axios";
import { formatINR } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import {
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
  Info,
  Briefcase,
} from "lucide-react";
import type { PricingMode } from "@/types";

// ── Schema ────────────────────────────────────────────────────────────────────
const jobSchema = z
  .object({
    title: z.string().min(5, "At least 5 characters").max(120, "Too long"),
    description: z
      .string()
      .min(20, "At least 20 characters")
      .max(3000, "Too long"),
    categoryId: z.string().min(1, "Pick a category"),
    budgetMin: z
      .number({ invalid_type_error: "Enter an amount" })
      .min(100, "Min ₹100"),
    budgetMax: z
      .number({ invalid_type_error: "Enter an amount" })
      .min(100, "Min ₹100"),
    pricingMode: z.enum(["budget", "expert"]),
    deadline: z.string().optional(),
  })
  .refine((d) => d.budgetMax >= d.budgetMin, {
    message: "Max must be ≥ min",
    path: ["budgetMax"],
  });

type JobFormData = z.infer<typeof jobSchema>;

// ── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
  { id: "basics", label: "Describe the job" },
  { id: "category", label: "Pick a category" },
  { id: "budget", label: "Set your budget" },
  { id: "confirm", label: "Review & post" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

interface JobPostModalProps {
  open: boolean;
  onClose: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-error mt-1.5">{message}</p>;
}

export function JobPostModal({ open, onClose }: JobPostModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<StepId>("basics");
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    enabled: open,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { pricingMode: "budget" },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const hasMarketRange = (min?: number, max?: number) =>
    Number.isFinite(min) && Number.isFinite(max);
  const budgetMin = watch("budgetMin");
  const budgetMax = watch("budgetMax");
  const pricingMode = watch("pricingMode");
  const title = watch("title");
  const description = watch("description");

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        reset();
        setStep("basics");
        setServerError(null);
        setDone(false);
      }, 200);
    }
  }, [open, reset]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const createMutation = useMutation({
    mutationFn: jobsApi.create,
    onSuccess: async (job) => {
      try {
        await jobsApi.publish(job.id);
      } catch {
        /* ignore */
      }
      queryClient.invalidateQueries({ queryKey: ["client-jobs"] });
      setDone(true);
    },
    onError: (err) => setServerError(extractApiError(err).message),
  });

  // ── Step navigation ───────────────────────────────────────────────────────
  const STEP_FIELDS: Record<StepId, (keyof JobFormData)[]> = {
    basics: ["title", "description", "deadline"],
    category: ["categoryId"],
    budget: ["budgetMin", "budgetMax", "pricingMode"],
    confirm: [],
  };

  const nextStep = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  };

  const prevStep = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  const onSubmit = (data: JobFormData) => {
    setServerError(null);
    const { deadline, ...rest } = data;
    createMutation.mutate({ ...rest, ...(deadline ? { deadline } : {}) });
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-canvas w-full sm:max-w-lg sm:rounded-xl rounded-t-xl shadow-card overflow-hidden flex flex-col max-h-[92vh]">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Briefcase size={14} className="text-on-primary" />
            </div>
            <div>
              <p className="text-title-sm text-ink">Post a Job</p>
              <p className="text-xs text-muted">
                Step {stepIndex + 1} of {STEPS.length} —{" "}
                {STEPS[stepIndex].label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-muted hover:text-ink hover:bg-surface-card transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div className="h-1 bg-surface-card flex-shrink-0">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          {done ? (
            // ── Success state ──
            <div className="flex flex-col items-center justify-center py-14 px-6 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-success" />
              </div>
              <div>
                <p
                  className="text-ink"
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    letterSpacing: "-0.3px",
                  }}
                >
                  Job posted!
                </p>
                <p className="text-body-sm text-muted mt-1">
                  Your job is live. We'll notify you when matches are found.
                </p>
              </div>
              <button onClick={onClose} className="btn-primary mt-2">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-6 py-6 flex flex-col gap-5">
                {/* ── Step: Basics ── */}
                {step === "basics" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-caption font-medium text-ink">
                        What do you need done?{" "}
                        <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Build a React Native mobile app for my store"
                        className="text-input"
                        autoFocus
                        {...register("title")}
                      />
                      <FieldError message={errors.title?.message} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-caption font-medium text-ink">
                        Describe it in detail{" "}
                        <span className="text-error">*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Include requirements, deliverables, timeline expectations, and any specific skills needed..."
                        className="text-input h-auto resize-none py-3"
                        {...register("description")}
                      />
                      <FieldError message={errors.description?.message} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-caption font-medium text-ink">
                        Deadline{" "}
                        <span className="text-muted font-normal">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="date"
                        className="text-input"
                        min={new Date().toISOString().split("T")[0]}
                        {...register("deadline")}
                      />
                    </div>
                  </>
                )}

                {/* ── Step: Category ── */}
                {step === "category" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-caption font-medium text-ink">
                        Which category fits best?{" "}
                        <span className="text-error">*</span>
                      </label>

                      {catsLoading ? (
                        <div className="flex flex-col gap-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-12 rounded-lg bg-surface-card animate-pulse"
                            />
                          ))}
                        </div>
                      ) : (
                        <Controller
                          control={control}
                          name="categoryId"
                          render={({ field }) => (
                            <div className="flex flex-col gap-2">
                              {categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => field.onChange(cat.id)}
                                  className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors",
                                    field.value === cat.id
                                      ? "border-ink bg-surface-soft"
                                      : "border-hairline hover:border-surface-strong",
                                  )}
                                >
                                  <div>
                                    <p className="text-body-sm font-medium text-ink">
                                      {cat.name}
                                    </p>
                                    {cat.description && (
                                      <p className="text-xs text-muted mt-0.5">
                                        {cat.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex-shrink-0 ml-3 text-right">
                                    {hasMarketRange(
                                      cat.marketPriceMin,
                                      cat.marketPriceMax,
                                    ) && (
                                      <p className="text-xs text-muted">
                                        {formatINR(cat.marketPriceMin!)} –{" "}
                                        {formatINR(cat.marketPriceMax!)}
                                      </p>
                                    )}
                                    {field.value === cat.id && (
                                      <CheckCircle2
                                        size={16}
                                        className="text-success ml-auto mt-1"
                                      />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        />
                      )}
                      <FieldError message={errors.categoryId?.message} />
                    </div>

                    {/* Market price hint */}
                    {selectedCategory &&
                      hasMarketRange(
                        selectedCategory.marketPriceMin,
                        selectedCategory.marketPriceMax,
                      ) && (
                        <div className="flex items-start gap-2.5 bg-brand-accent/8 border border-brand-accent/20 rounded-lg px-4 py-3">
                          <Info
                            size={14}
                            className="text-brand-accent flex-shrink-0 mt-0.5"
                          />
                          <p className="text-body-sm text-muted">
                            Market rate for{" "}
                            <span className="font-medium text-ink">
                              {selectedCategory.name}
                            </span>{" "}
                            is{" "}
                            <span className="font-medium text-ink">
                              {formatINR(selectedCategory.marketPriceMin!)} –{" "}
                              {formatINR(selectedCategory.marketPriceMax!)}
                            </span>
                          </p>
                        </div>
                      )}
                  </>
                )}

                {/* ── Step: Budget ── */}
                {step === "budget" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-caption font-medium text-ink">
                          Min budget (₹) <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <IndianRupee
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                          />
                          <input
                            type="number"
                            placeholder="5000"
                            className="text-input pl-7"
                            min={100}
                            {...register("budgetMin", { valueAsNumber: true })}
                          />
                        </div>
                        <FieldError message={errors.budgetMin?.message} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-caption font-medium text-ink">
                          Max budget (₹) <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <IndianRupee
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                          />
                          <input
                            type="number"
                            placeholder="15000"
                            className="text-input pl-7"
                            min={100}
                            {...register("budgetMax", { valueAsNumber: true })}
                          />
                        </div>
                        <FieldError message={errors.budgetMax?.message} />
                      </div>
                    </div>

                    {budgetMin > 0 &&
                      budgetMax > 0 &&
                      budgetMax >= budgetMin && (
                        <div className="bg-surface-card rounded-lg px-4 py-3">
                          <p className="text-body-sm text-muted">
                            Your budget range:{" "}
                            <span className="font-semibold text-ink">
                              {formatINR(budgetMin)} – {formatINR(budgetMax)}
                            </span>
                          </p>
                        </div>
                      )}

                    <div className="flex flex-col gap-3">
                      <label className="text-caption font-medium text-ink">
                        Who should we match you with?
                      </label>
                      <Controller
                        control={control}
                        name="pricingMode"
                        render={({ field }) => (
                          <div className="grid grid-cols-2 gap-3">
                            {(["budget", "expert"] as PricingMode[]).map(
                              (mode) => (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => field.onChange(mode)}
                                  className={cn(
                                    "flex flex-col gap-1.5 p-4 rounded-lg border text-left transition-colors",
                                    field.value === mode
                                      ? "border-ink bg-surface-soft"
                                      : "border-hairline hover:border-surface-strong",
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-title-sm text-ink capitalize">
                                      {mode}
                                    </span>
                                    <div
                                      className={cn(
                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                        field.value === mode
                                          ? "border-ink"
                                          : "border-surface-strong",
                                      )}
                                    >
                                      {field.value === mode && (
                                        <div className="w-2 h-2 rounded-full bg-ink" />
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted">
                                    {mode === "budget"
                                      ? "Beginner & intermediate freelancers"
                                      : "Experienced freelancers only"}
                                  </p>
                                </button>
                              ),
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* ── Step: Confirm ── */}
                {step === "confirm" && (
                  <div className="flex flex-col gap-4">
                    <p className="text-body-sm text-muted">
                      Review your job before posting.
                    </p>

                    <div className="bg-surface-card rounded-lg p-4 flex flex-col gap-3">
                      <div>
                        <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">
                          Title
                        </p>
                        <p className="text-body-sm font-semibold text-ink">
                          {title}
                        </p>
                      </div>
                      <div className="border-t border-hairline-soft pt-3">
                        <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">
                          Description
                        </p>
                        <p className="text-body-sm text-body line-clamp-3">
                          {description}
                        </p>
                      </div>
                      <div className="border-t border-hairline-soft pt-3 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">
                            Category
                          </p>
                          <p className="text-body-sm text-ink font-medium">
                            {selectedCategory?.name ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">
                            Budget
                          </p>
                          <p className="text-body-sm text-ink font-medium">
                            {budgetMin && budgetMax
                              ? `${formatINR(budgetMin)} – ${formatINR(budgetMax)}`
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">
                            Mode
                          </p>
                          <p className="text-body-sm text-ink font-medium capitalize">
                            {pricingMode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {serverError && (
                      <div className="px-4 py-3 bg-error/8 border border-error/20 rounded-lg">
                        <p className="text-body-sm text-error">{serverError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-hairline flex-shrink-0">
                <button
                  type="button"
                  onClick={stepIndex === 0 ? onClose : prevStep}
                  className="btn-secondary gap-2"
                >
                  {stepIndex === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft size={14} />
                      Back
                    </>
                  )}
                </button>

                {step === "confirm" ? (
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="btn-primary gap-2"
                  >
                    {createMutation.isPending && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    {createMutation.isPending ? "Posting..." : "Post job"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary gap-2"
                  >
                    Continue
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
