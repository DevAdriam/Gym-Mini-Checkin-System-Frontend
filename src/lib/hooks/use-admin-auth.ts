import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAsyncQuery } from "./use-async-query";
import { useAsyncMutate } from "./use-async-mutate";
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from "../api";
import type { AdminLoginDto, Admin } from "../../types/index";

// Admin Login Mutation
export const useAdminLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useAsyncMutate({
    mutationFn: (data: AdminLoginDto) => adminLogin(data),
    successMessage: "Login successful!",
    invalidateQueries: [["admin", "profile"]],
    onSuccess: () => {
      navigate("/admin/members");
    },
  });
};

// Admin Logout Mutation
export const useAdminLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useAsyncMutate({
    mutationFn: () => adminLogout(),
    successMessage: "Logged out successfully",
    onSuccess: () => {
      queryClient.clear();
      navigate("/admin/login");
    },
    onError: () => {
      // Even if logout fails on backend, clear local state
      queryClient.clear();
      navigate("/admin/login");
    },
  });
};

// Get Admin Profile Query
export const useAdminProfile = () => {
  return useAsyncQuery<Admin>({
    queryKey: ["admin", "profile"],
    queryFn: getAdminProfile,
  });
};

// Update Admin Profile Mutation
export const useUpdateAdminProfile = () => {
  return useAsyncMutate({
    mutationFn: (data: { name?: string; phone?: string; image?: string }) =>
      updateAdminProfile(data),
    successMessage: "Profile updated successfully",
    invalidateQueries: [["admin", "profile"]],
  });
};

// Update Admin Password Mutation
export const useUpdateAdminPassword = () => {
  return useAsyncMutate({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      updateAdminPassword(data),
    successMessage: "Password updated successfully",
  });
};
