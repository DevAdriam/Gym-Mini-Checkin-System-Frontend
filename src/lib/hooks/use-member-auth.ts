import { useAsyncMutate } from "./use-async-mutate";
import { useAsyncQuery } from "./use-async-query";
import { memberLogin, getMemberProfile, memberLogout, type MemberLoginResponse } from "../api/member-auth";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const MEMBER_EMAIL_KEY = "gym_member_email";
const MEMBER_AUTH_TOKEN_KEY = "memberAuthToken";
const MEMBER_CHECKIN_STATUS_KEY = "gym_member_checkin_status";

// Member Login Mutation
export const useMemberLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useAsyncMutate<MemberLoginResponse, Error, { email: string; password: string }>({
    mutationFn: (data) => memberLogin(data),
    successMessage: "Login successful!",
    errorMessage: "Login failed",
    onSuccess: (data) => {
      // Store token and email
      localStorage.setItem(MEMBER_AUTH_TOKEN_KEY, data.accessToken);
      localStorage.setItem(MEMBER_EMAIL_KEY, data.member.email);
      
      // Invalidate queries to refetch member data
      queryClient.invalidateQueries({ queryKey: ["member"] });
      
      // Navigate to dashboard
      navigate("/members/dashboard", {
        state: { member: data.member },
      });
    },
  });
};

// Get Member Profile Query
export const useMemberProfile = () => {
  return useAsyncQuery<any>({
    queryKey: ["member", "profile"],
    queryFn: () => getMemberProfile(),
    enabled: !!localStorage.getItem(MEMBER_AUTH_TOKEN_KEY),
  });
};

// Member Logout Mutation
export const useMemberLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useAsyncMutate<void, Error, void>({
    mutationFn: () => memberLogout(),
    successMessage: "Logged out successfully",
    errorMessage: "Logout failed",
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Navigate to login page
      navigate("/members/login");
    },
    onError: () => {
      // Even if logout fails on backend, clear local state and redirect
      localStorage.removeItem(MEMBER_AUTH_TOKEN_KEY);
      localStorage.removeItem(MEMBER_EMAIL_KEY);
      localStorage.removeItem(MEMBER_CHECKIN_STATUS_KEY);
      queryClient.clear();
      navigate("/members/login");
    },
  });
};

