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
  addressLine1: z.string().min(5, "At least 5 characters").max(120, "Too long"),
  addressLine2: z.string().max(120, "Too long").optional(),
  city:         z.string().min(2, "Required").max(60, "Too long"),
  state:        z.string().min(2, "Required").max(60, "Too long"),
  pincode:      z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country:      z.string().min(2, "Required").max(60, "Too long"),
  proofDocumentUrl: z.string().url("Enter a valid URL").min(1, "Required"),
});

type FormData = z.infer<typeof schema>;

interface AddressKycFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-error mt-1.5">{message}</p>;
}

export function AddressKycForm({ onSuccess, onBack }: AddressKycFormProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: "India" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      kycApi.submitAddress({
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || undefined,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        proofDocumentUrl: data.proofDocumentUrl,
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
          Address line 1 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          placeholder="House / Flat no., Street, Area"
          className="text-input"
          {...register("addressLine1")}
        />
        <FieldError message={errors.addressLine1?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-ink">
          Address line 2{" "}
          <span className="text-muted font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="Landmark, locality"
          className="text-input"
          {...register("addressLine2")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-medium text-ink">
            City <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="Mumbai"
            className="text-input"
            {...register("city")}
          />
          <FieldError message={errors.city?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-medium text-ink">
            State <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="Maharashtra"
            className="text-input"
            {...register("state")}
          />
          <FieldError message={errors.state?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-medium text-ink">
            Pincode <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="400001"
            maxLength={6}
            className="text-input"
            {...register("pincode")}
          />
          <FieldError message={errors.pincode?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-medium text-ink">
            Country <span className="text-error">*</span>
          </label>
          <input
            type="text"
            className="text-input"
            {...register("country")}
          />
          <FieldError message={errors.country?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-ink">
          Address proof URL <span className="text-error">*</span>
        </label>
        <input
          type="url"
          placeholder="https://your-storage.com/address-proof.jpg"
          className="text-input"
          {...register("proofDocumentUrl")}
        />
        <p className="text-xs text-muted">
          Accepted: Utility bill, bank statement, or Aadhaar card showing address.
        </p>
        <FieldError message={errors.proofDocumentUrl?.message} />
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
          {mutation.isPending ? "Submitting..." : "Submit KYC"}
        </button>
      </div>
    </form>
  );
}