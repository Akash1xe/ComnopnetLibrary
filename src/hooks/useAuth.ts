import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, updateUser } = useAuthStore();

  const isLoggedIn = isAuthenticated;
  const tier = user?.subscription_tier ?? "free";
  const isPro = tier === "pro" || tier === "team";
  const isTeam = tier === "team";
  const isAdmin = Boolean(user?.is_superuser);

  const requireAuth = (redirectTo?: string) => {
    if (!isAuthenticated) {
      const next = redirectTo ?? `${window.location.pathname}${window.location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(next)}`);
      return false;
    }

    return true;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isLoggedIn,
    isPro,
    isTeam,
    isAdmin,
    setAuth,
    clearAuth,
    updateUser,
    requireAuth,
  };
}
