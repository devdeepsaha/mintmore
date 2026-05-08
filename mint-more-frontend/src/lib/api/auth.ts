import { apiClient, saveTokens, clearTokens } from "./axios";
import type { LoginRequest, RegisterRequest, AuthResponse, User } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data);
    const payload = res.data.data;
    saveTokens(payload.accessToken, payload.refreshToken);
    return payload;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data);
    const payload = res.data.data;
    saveTokens(payload.accessToken, payload.refreshToken);
    return payload;
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
    return res.data.data;
  },

  refresh: async (): Promise<void> => {
    // handled by axios interceptor — this is a no-op placeholder
  },
};