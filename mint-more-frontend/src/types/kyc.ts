export type KycStatus = "not_started" | "pending" | "approved" | "rejected";

export interface KycStatusResponse {
  userId: string;
  level: 0 | 1 | 2 | 3;
  basic: KycStepStatus;
  identity: KycStepStatus;
  address: KycStepStatus;
}

export interface KycStepStatus {
  status: KycStatus;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface BasicKycFormData {
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  profession: string;
}

export interface IdentityKycFormData {
  documentType: "aadhaar" | "pan" | "passport" | "driving_license";
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
}

export interface AddressKycFormData {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  proofDocumentUrl: string;
}

export interface AdminKycReview {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  kycType: "basic" | "identity" | "address";
  submittedData: Record<string, unknown>;
  submittedAt: string;
  status: KycStatus;
}

export interface AdminKycReviewAction {
  status: "approved" | "rejected";
  rejectionReason?: string;
}