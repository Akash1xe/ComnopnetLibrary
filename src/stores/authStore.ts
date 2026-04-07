import { create } from "zustand";
import { getMe } from "../api/auth";
import type { User } from "../types";
import { clearStoredAuth, getStoredAccessToken, getStoredRefreshToken, getStoredUser, storeAuth } from "../lib/tokens";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<User>) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  accessToken: getStoredAccessToken(),
  refreshToken: getStoredRefreshToken(),
  isAuthenticated: Boolean(getStoredAccessToken()),
  isLoading: false,
  setAuth: (user, accessToken, refreshToken) => {
    storeAuth({ user, access_token: accessToken, refresh_token: refreshToken });
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },
  clearAuth: () => {
    clearStoredAuth();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  },
  updateUser: (partial) => {
    const currentUser = get().user;
    if (!currentUser) {
      return;
    }

    const updated = { ...currentUser, ...partial };
    const accessToken = get().accessToken;
    const refreshToken = get().refreshToken;
    if (accessToken && refreshToken) {
      storeAuth({ user: updated, access_token: accessToken, refresh_token: refreshToken });
    }
    set({ user: updated });
  },
  initialize: async () => {
    const accessToken = getStoredAccessToken();
    const refreshToken = getStoredRefreshToken();
    const cachedUser = getStoredUser();

    if (!accessToken || !refreshToken) {
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({
      user: cachedUser,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: true,
    });

    try {
      const user = await getMe();
      storeAuth({ user, access_token: accessToken, refresh_token: refreshToken });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearStoredAuth();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
