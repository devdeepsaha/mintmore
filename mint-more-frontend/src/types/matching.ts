export type MatchTier = "instant" | "tier_2" | "tier_3";

export interface MatchCandidate {
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerLevel: "beginner" | "intermediate" | "experienced";
  avatarUrl?: string;
  matchScore: number;
  skillScore: number;
  availabilityScore: number;
  ratingScore: number;
  tier: MatchTier;
  notifiedAt?: string;
  categoryNames: string[];
}

export interface MatchResult {
  jobId: string;
  jobTitle: string;
  runAt: string;
  totalCandidates: number;
  primaryFreelancer?: MatchCandidate;
  backupFreelancer?: MatchCandidate;
  candidates: MatchCandidate[];
}

export interface RunMatchRequest {
  jobId: string;
}