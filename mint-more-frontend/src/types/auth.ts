export type UserRole = "client" | "freelancer" | "admin";

export type FreelancerLevel = "beginner" | "intermediate" | "experienced";

export type KycLevel = "none" | "basic" | "identity" | "full";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_approved: boolean;
  is_active: boolean;
  is_available?: boolean;
  kyc_level: KycLevel;
  kyc_status?: string;
  avatar_url?: string | null;
  freelancer_level?: FreelancerLevel;
  bio?: string;
  skills?: string[];
  price_min?: string;
  price_max?: string;
  address_city?: string;       // ← add
  address_state?: string;      // ← add
  jobs_completed_count?: number; // ← add
  average_rating?: string;     // ← add
  active_jobs_count?: number;  // ← add
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: Exclude<UserRole, "admin">;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}