"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { extractApiError } from "@/lib/api/axios";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function AdminAccessPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await authApi.login(data);
      if (res.user.role !== "admin") {
        setServerError("Access denied. Admin credentials required.");
        return;
      }
      setUser(res.user);
      router.push("/admin");
    } catch (err) {
      const apiErr = extractApiError(err);
      setServerError(apiErr.message);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="bg-canvas rounded-xl border border-hairline shadow-card p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-surface-card border border-hairline flex items-center justify-center mb-4">
            <ShieldCheck size={22} className="text-ink" />
          </div>
          <h1
            className="text-ink mb-1"
            style={{
              fontSize: "22px",
              fontWeight: 600,
              lineHeight: "1.3",
              letterSpacing: "-0.3px",
            }}
          >
            Admin access
          </h1>
          <p className="text-body-sm text-muted">
            Restricted area. Authorised personnel only.
          </p>
        </div>

        {serverError && (
          <div className="mb-5 px-4 py-3 bg-error/8 border border-error/20 rounded-md">
            <p className="text-body-sm text-error">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-caption font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="off"
              placeholder="admin@mintmore.in"
              className="text-input"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-caption font-medium text-ink">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
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
              <p className="text-xs text-error">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center gap-2 mt-2"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isSubmitting ? "Verifying..." : "Access admin panel"}
          </button>
        </form>
      </div>
    </div>
  );
}