import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUser,
  setUser as setStoredUser,
  clearAuth as clearStoredAuth,
} from "../utils/auth.utils";
import { userApi } from "../api/userApi";
import { authApi } from "../api/authApi";
import type { User } from "../types";
import { useNavigate } from "react-router";
import { ROUTES } from "../constants";
import { disconnectSocket } from "../utils/socket";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        // Validates session via HttpOnly cookie — returns the current user
        const userData = await userApi.getMe();
        setStoredUser(userData);
        return userData;
      } catch {
        // Session invalid or expired — clear local state
        clearStoredAuth();
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,   // Re-use cached user for 5 min
    gcTime: 1000 * 60 * 10,     // Keep in memory for 10 min
    initialData: () => getUser(), // Hydrate instantly from localStorage
    retry: false,                 // Don't retry on 401 — it's not a network error
  });

  /**
   * Merges a partial update into the cached user without triggering a
   * network request. Useful after profile edits.
   */
  const updateCurrentUser = (updatedUser: Partial<User>) => {
    const currentUser = getUser();
    if (!currentUser) return;
    const newUser = { ...currentUser, ...updatedUser };
    setStoredUser(newUser);
    // Update cache synchronously — no background refetch needed
    queryClient.setQueryData(["currentUser"], newUser);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // client-side cleanup will run regardless
    } finally {
      clearStoredAuth();
      queryClient.setQueryData(["currentUser"], null);
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      disconnectSocket();
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  return {
    user: user ?? null,
    updateCurrentUser,
    logout,
    isLoggedIn: !!user,
    isLoading,
  };
};
