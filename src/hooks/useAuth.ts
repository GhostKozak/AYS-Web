import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, setUser as setStoredUser, clearAuth as clearStoredAuth } from "../utils/auth.utils";
import { userApi } from "../api/userApi";
import type { User } from "../types";
import { useNavigate } from "react-router";
import { ROUTES } from "../constants";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, refetch } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        // Güvenlik: Cookie tabanlı oturumu kontrol et
        const userData = await userApi.getMe();
        setStoredUser(userData);
        return userData;
      } catch (error) {
        // Oturum geçersizse temizle
        clearStoredAuth();
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    initialData: () => getUser(),
    retry: false,
  });

  const updateCurrentUser = (updatedUser: Partial<User>) => {
    const currentUser = getUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      setStoredUser(newUser);
      queryClient.setQueryData(["currentUser"], newUser);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      refetch();
    }
  };

  const logout = () => {
    clearStoredAuth();
    queryClient.setQueryData(["currentUser"], null);
    navigate(ROUTES.LOGIN);
  };

  return {
    user,
    updateCurrentUser,
    logout,
    isLoggedIn: !!user,
  };
};
