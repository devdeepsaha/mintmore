export type NegotiationStatus =
  | "idle"
  | "initiated"
  | "freelancer_proposed"
  | "client_countered"
  | "agreed"
  | "rejected"
  | "expired"
  | "failed";

export type NegotiationRound = 1 | 2;

export type FreelancerResponseAction = "propose" | "accept" | "reject";
export type ClientResponseAction = "accept" | "counter" | "reject";

export interface NegotiationOffer {
  amount: number;
  message?: string;
  proposedAt: string;
}

export interface Negotiation {
  id: string;
  jobId: string;
  jobTitle: string;
  freelancerId: string;
  freelancerName: string;
  clientId: string;
  clientName: string;
  status: NegotiationStatus;
  round: NegotiationRound;
  freelancerOffer?: NegotiationOffer;
  clientCounter?: NegotiationOffer;
  agreedAmount?: number;
  initiatedAt: string;
  updatedAt: string;
  expiresAt?: string;
  adminApproved: boolean;
  adminApprovedAt?: string;
}

export interface InitiateNegotiationRequest {
  message?: string;
}

export interface FreelancerRespondRequest {
  action: FreelancerResponseAction;
  proposedAmount?: number;
  message?: string;
}

export interface ClientRespondRequest {
  action: ClientResponseAction;
  counterAmount?: number;
  message?: string;
}

export interface AdminApproveDealRequest {
  approved: boolean;
  note?: string;
}