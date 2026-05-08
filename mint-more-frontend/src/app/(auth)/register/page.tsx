"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Briefcase, Code2 } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { extractApiError } from "@/lib/api/axios";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";

const registerSchema = z
  .object({
    full_name: z  // was: full_name
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name is too long"),
    email: z.string().email("Enter a valid email address"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["client", "freelancer"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLE_REDIRECT: Record<UserRole, string> = {
  client: "/client",
  freelancer: "/freelancer",
  admin: "/admin",
};

const ROLES = [
  {
    value: "client" as const,
    label: "I'm a Client",
    description: "I want to hire freelancers",
    icon: Briefcase,
  },
  {
    value: "freelancer" as const,
    label: "I'm a Freelancer",
    description: "I want to find work",
    icon: Code2,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultRole =
    searchParams.get("role") === "freelancer" ? "freelancer" : "client";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
  setServerError(null);
  try {
    const { confirmPassword: _, ...payload } = data;
    const res = await authApi.register(payload);
    setUser(res.user);
    router.push(ROLE_REDIRECT[res.user.role]);
  } catch (err) {
    const apiErr = extractApiError(err);
    setServerError(apiErr.message);
  }
};

  return (
    <div className="w-full max-w-[460px]">
      {/* Card */}
      <div className="bg-canvas rounded-xl border border-hairline shadow-card p-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-ink mb-2"
            style={{
              fontSize: "28px",
              fontWeight: 600,
              lineHeight: "1.2",
              letterSpacing: "-0.5px",
            }}
          >
            Create your account
          </h1>
          <p className="text-body-sm text-muted">
            Join Mint More — it&apos;s free to get started
          </p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ROLES.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("role", value)}
              className={cn(
                "flex flex-col items-start gap-2 p-4 rounded-lg border text-left transition-colors",
                selectedRole === value
                  ? "border-ink bg-surface-soft"
                  : "border-hairline bg-canvas hover:border-surface-strong",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center",
                  selectedRole === value ? "bg-primary" : "bg-surface-card",
                )}
              >
                <Icon
                  size={15}
                  className={
                    selectedRole === value ? "text-on-primary" : "text-muted"
                  }
                />
              </div>
              <div>
                <p
                  className={cn(
                    "text-caption font-semibold",
                    selectedRole === value ? "text-ink" : "text-muted",
                  )}
                >
                  {label}
                </p>
                <p className="text-xs text-muted mt-0.5">{description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-5 px-4 py-3 bg-error/8 border border-error/20 rounded-md">
            <p className="text-body-sm text-error">{serverError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="full_name"
              className="text-caption font-medium text-ink"
            >
              Full name
            </label>
            <input
              id="full_name"
              type="text"
              autoComplete="name"
              placeholder="Rahul Sharma"
              className="text-input"
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className="text-xs text-error">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-caption font-medium text-ink"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="text-input"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-error">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="phone"
              className="text-caption font-medium text-ink"
            >
              Mobile number
            </label>
            <div className="flex gap-2">
              <div className="h-11 w-16 flex items-center justify-center rounded-md border border-hairline bg-surface-card text-muted flex-shrink-0 cursor-default">
                +91
              </div>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                className="text-input flex-1 min-w-0"
                maxLength={10}
                {...register("phone")}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-error">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-caption font-medium text-ink"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="text-input pr-10"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-caption font-medium text-ink"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="text-input pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center gap-2 mt-2"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Login link */}
        <p className="text-body-sm text-muted text-center mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-ink font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Fine print */}
      <p className="text-xs text-muted text-center mt-4">
        By creating an account, you agree to our{" "}
        <Link href="#" className="hover:text-ink underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="#" className="hover:text-ink underline">
          Privacy Policy
        </Link>
        . Account activation requires admin approval.
      </p>
    </div>
  );
}
