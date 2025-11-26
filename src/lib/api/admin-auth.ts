import axios from "axios";
import { setAuthToken } from "../api-client";
import { removeAuthToken, API_BASE_URL, axiosInstance } from "../axios-config";
import type {
  Admin,
  AdminLoginDto,
  AdminLoginResponse,
} from "../../types/index";

// Admin Login
export const adminLogin = async (
  data: AdminLoginDto
): Promise<AdminLoginResponse> => {
  // Login endpoint doesn't require auth token, so we use axios without the instance
  const response = await axios.post(`${API_BASE_URL}/admin/login`, data);

  const result = response.data;

  // Extract token from nested response structure: _data.data.accessToken
  const token =
    result._data?.data?.accessToken ||
    result.data?.accessToken ||
    result.accessToken;

  // Save token to localStorage if present
  if (token) {
    setAuthToken(token);
  }

  return result;
};

// Admin Logout
export const adminLogout = async (): Promise<void> => {
  await axiosInstance.post("/admin/logout");
  removeAuthToken();
};

// Get Admin Profile
export const getAdminProfile = async (): Promise<Admin> => {
  const response = await axiosInstance.get("/admin/profile");
  // Extract admin from response structure
  return (
    response.data._data?.data?.admin ||
    response.data.data?.admin ||
    response.data.admin ||
    response.data
  );
};

// Update Admin Profile
export const updateAdminProfile = async (data: {
  name?: string;
  phone?: string;
  image?: string;
}): Promise<Admin> => {
  const response = await axiosInstance.patch("/admin/profile", data);
  return (
    response.data._data?.data?.admin ||
    response.data.data?.admin ||
    response.data.admin ||
    response.data
  );
};

// Update Admin Password
export const updateAdminPassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await axiosInstance.patch("/admin/password", data);
};
