import { apiClient, saveTokens, clearTokens } from "./axios";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Normalize backend user response to frontend User type.
 * Backend may use `user_role` while frontend expects `role`.
 */
const normalizeUser = (data: any): User => ({
  ...data,
  role: data.role || data.user_role || "client", // fallback to client if missing
});

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data,
    );
    const payload = res.data.data;
    const normalizedPayload = {
      ...payload,
      user: normalizeUser(payload.user),
    };
    saveTokens(normalizedPayload.accessToken, normalizedPayload.refreshToken);
    return normalizedPayload;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data,
    );
    const payload = res.data.data;
    const normalizedPayload = {
      ...payload,
      user: normalizeUser(payload.user),
    };
    saveTokens(normalizedPayload.accessToken, normalizedPayload.refreshToken);
    return normalizedPayload;
  },

  logout: async (): Promise<void> => {
    clearTokens();
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore — tokens already cleared
    }
  },

  me: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>("/auth/me");
    return normalizeUser(res.data.data);
  },

  refresh: async (): Promise<void> => {
    // handled by axios interceptor — this is a no-op placeholder
  },
};
