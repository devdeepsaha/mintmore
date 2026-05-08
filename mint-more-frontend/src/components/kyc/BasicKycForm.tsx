"use client";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kycApi } from "@/lib/api/kyc";
import { extractApiError } from "@/lib/api/axios";
import { Loader2 } from "lucide-react";

const schema = z.object({
  fullName: z
    .string()
    .min(2, "At least 2 characters")
    .max(80, "Too long"),
  dateOfBirth: z.string().min(1, "Required"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Select a gender" }),
  }),
  profession: z.string().min(2, "At least 2 characters").max(80, "Too long"),
});

type FormData = z.infer<typeof schema>;

interface BasicKycFormProps {
  onSuccess: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-error mt-1.5">{message}</p>;
}

export function BasicKycForm({ onSuccess }: BasicKycFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      kycApi.submitBasic({
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        profession: data.profession,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
      onSuccess();
    },
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = (data: FormData) => {
    setServerError(null);
    mutation.mutate(data, {
      onError: (err) => setServerError(extractApiError(err).message),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {serverError && (
        <div className="px-4 py-3 bg-error/8 border border-error/20 rounded-md">
          <p className="text-body-sm text-error">{serverError}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-ink">
          Full name <span className="text-error">*</span>
        </label>
        <input
          type="text"
          placeholder="As per government ID"
          className="text-input"
          {...register("fullName")}
        />
        <FieldError message={errors.fullName?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-medium text-ink">
            Date of birth <span className="text-error">*</span>
          </label>
          <input
            type="date"
            className="text-input"
            max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]}
            {...register("dateOfBirth")}
          />
          <FieldError message={errors.dateOfBirth?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-medium text-ink">
            Gender <span className="text-error">*</span>
          </label>
          <select className="text-input" {...register("gender")}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <FieldError message={errors.gender?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-ink">
          Profession <span className="text-error">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Freelance Web Developer"
          className="text-input"
          {...register("profession")}
        />
        <FieldError message={errors.profession?.message} />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary gap-2"
        >
          {mutation.isPending && <Loader2 size={15} className="animate-spin" />}
          {mutation.isPending ? "Saving..." : "Save & continue"}
        </button>
      </div>
    </form>
  );
}