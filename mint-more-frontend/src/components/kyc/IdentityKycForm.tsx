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
  documentType: z.enum(
    ["aadhaar", "pan", "passport", "driving_license"],
    { errorMap: () => ({ message: "Select a document type" }) }
  ),
  documentNumber: z
    .string()
    .min(4, "Enter a valid document number")
    .max(30, "Too long"),
  documentFrontUrl: z
    .string()
    .url("Enter a valid URL")
    .min(1, "Required"),
  documentBackUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

const DOC_LABELS: Record<string, string> = {
  aadhaar:         "Aadhaar Card",
  pan:             "PAN Card",
  passport:        "Passport",
  driving_license: "Driving Licence",
};

interface IdentityKycFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-error mt-1.5">{message}</p>;
}

export function IdentityKycForm({ onSuccess, onBack }: IdentityKycFormProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const docType = watch("documentType");

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      kycApi.submitIdentity({
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        documentFrontUrl: data.documentFrontUrl,
        documentBackUrl: data.documentBackUrl || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
      onSuccess();
    },
    onError: (err) => setServerError(extractApiError(err).message),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        setServerError(null);
        mutation.mutate(data);
      })}
      className="flex flex-col gap-5"
    >
      {serverError && (
        <div className="px-4 py-3 bg-error/8 border border-error/20 rounded-md">
          <p className="text-body-sm text-error">{serverError}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-ink">
          Document type <span className="text-error">*</span>
        </label>
        <select className="text-input" {...register("documentType")}>
          <option value="">Select document</option>
          {Object.entries(DOC_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <FieldError message={errors.documentType?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-ink">
          Document number <span className="text-error">*</span>
        </label>
        <input
          type="text"
          placeholder={
            docType === "aadhaar"
              ? "XXXX XXXX XXXX"
              : docType === "pan"
              ? "ABCDE1234F"
              : "Enter document number"
          }
          className="text-input"
          {...register("documentNumber")}
        />
        <FieldError message={errors.documentNumber?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-ink">
          Front side URL <span className="text-error">*</span>
        </label>
        <input
          type="url"
          placeholder="https://your-storage.com/doc-front.jpg"
          className="text-input"
          {...register("documentFrontUrl")}
        />
        <p className="text-xs text-muted">
          Upload your document to a storage service and paste the URL here.
        </p>
        <FieldError message={errors.documentFrontUrl?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-ink">
          Back side URL{" "}
          <span className="text-muted font-normal">(optional)</span>
        </label>
        <input
          type="url"
          placeholder="https://your-storage.com/doc-back.jpg"
          className="text-input"
          {...register("documentBackUrl")}
        />
        <FieldError message={errors.documentBackUrl?.message} />
      </div>

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack} className="btn-secondary">
          Back
        </button>
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