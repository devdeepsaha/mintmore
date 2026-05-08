import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthState } from "@/types";

interface AuthStore extends AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;

  setUser: (user: User | null, source?: string) => void;
  logout: (source?: string) => void;
  setLoading: (isLoading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

const DEBUG = true;

const log = (...args: any[]) => {
  if (DEBUG) console.log("[AuthStore]", ...args);
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      hasHydrated: false,

      // ✅ MAIN FIX IS HERE
      setUser: (user, source = "unknown") => {
        const prevUser = get().user;

        // 🚨 Prevent broken user overwriting good one
        if (user && !user.role) {
          log("❌ BLOCKED invalid user (missing role)", {
            source,
            incoming: user,
            prevUser,
          });
          return;
        }

        log("🔥 setUser", { source, user });

        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      },

      logout: (source = "unknown") => {
        log("🚪 logout", { source });

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => {
        log("⏳ setLoading", isLoading);
        set({ isLoading });
      },

      setHasHydrated: (state) => {
        log("💧 hydrated");
        set({ hasHydrated: state });
      },
    }),
    {
      name: "mint-more-auth",
      storage: createJSONStorage(() => sessionStorage),

      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        log("🔄 rehydrating...");

        if (state) {
          log("✅ restored", state.user);
          state.setHasHydrated(true);
        }
      },
    }
  )
);