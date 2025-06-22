import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export function useAdminAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Store the token
      localStorage.setItem("admin_token", data.token);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("admin_token");
      queryClient.clear();
    },
  });

  const { data: admin, isLoading } = useQuery({
    queryKey: ["/api/admin/profile"],
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return null;

      try {
        const response = await fetch("/api/admin/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          localStorage.removeItem("admin_token");
          return null;
        }
        
        return await response.json();
      } catch (error) {
        localStorage.removeItem("admin_token");
        throw error;
      }
    },
    retry: false,
  });

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginPending: loginMutation.isPending,
  };
}