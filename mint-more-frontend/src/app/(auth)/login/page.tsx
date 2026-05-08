"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { extractApiError } from "@/lib/api/axios";
import type { UserRole } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const ROLE_REDIRECT: Record<UserRole, string> = {
  client: "/client",
  freelancer: "/freelancer",
  admin: "/admin",
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const res = await authApi.login(data);
      setUser(res.user);
      router.push(ROLE_REDIRECT[res.user.role]);
    } catch (err) {
      const apiErr = extractApiError(err);
      setServerError(apiErr.message);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
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
            Welcome back
          </h1>
          <p className="text-body-sm text-muted">
            Sign in to your Mint More account
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-5 px-4 py-3 bg-error/8 border border-error/20 rounded-md">
            <p className="text-body-sm text-error">{serverError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
              <p className="text-xs text-error mt-0.5">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-caption font-medium text-ink"
              >
                Password
              </label>
              <button
                type="button"
                className="text-xs text-muted hover:text-ink transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
              <p className="text-xs text-error mt-0.5">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center gap-2 mt-1"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-hairline" />
          <span className="text-xs text-muted">or</span>
          <div className="flex-1 h-px bg-hairline" />
        </div>

        {/* Register link */}
        <p className="text-body-sm text-muted text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-ink font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>

      {/* Fine print */}
      <p className="text-xs text-muted text-center mt-4">
        By signing in, you agree to our{" "}
        <Link href="#" className="hover:text-ink underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="#" className="hover:text-ink underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}