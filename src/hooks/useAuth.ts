import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, setUser as setStoredUser, clearAuth as clearStoredAuth } from "../utils/auth.utils";
import type { User } from "../types";
import { useNavigate } from "react-router";
import { ROUTES } from "../constants";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: () => getUser(),
    staleTime: 0, 
    initialData: getUser(), 
  });

  const updateCurrentUser = (updatedUser: Partial<User>) => {
    const currentUser = getUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      setStoredUser(newUser);
      queryClient.setQueryData(["currentUser"], newUser);
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
