import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  admin: {
    id: number;
    username: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    lastLogin: string;
    createdAt: string;
  };
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export function useAdminAuth() {
  const queryClient = useQueryClient();

  // Get current admin profile
  const { data: admin, isLoading } = useQuery<AdminUser>({
    queryKey: ["/api/v1/admin/profile"],
    retry: false,
    enabled: !!localStorage.getItem("admin_token"),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Store the token
      localStorage.setItem("admin_token", data.token);
      // Set user data directly to avoid race condition
      queryClient.setQueryData(["/api/v1/admin/profile"], data.admin);
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/profile"] });
    },
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_remember_me");
    queryClient.setQueryData(["/api/v1/admin/profile"], null);
    queryClient.clear();
    window.location.href = "/admin/login";
  };

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login: loginMutation.mutate,
    isLoginPending: loginMutation.isPending,
    logout,
  };
}