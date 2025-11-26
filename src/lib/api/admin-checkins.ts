import {
  axiosInstance,
  normalizeQueryParams,
  API_BASE_URL,
} from "../axios-config";
import axios from "axios";
import type {
  CheckInLog,
  CheckInsQueryParams,
  PaginatedResponse,
} from "../../types/index";

// List all check-in logs with filters
export const getCheckInLogs = async (
  params?: CheckInsQueryParams
): Promise<PaginatedResponse<CheckInLog>> => {
  // Normalize params to ensure page and limit are numbers
  const normalizedParams = params ? normalizeQueryParams(params) : undefined;
  const response = await axiosInstance.get("/checkins", {
    params: normalizedParams,
  });
  // Extract data from response structure
  return response.data._data?.data || response.data.data || response.data;
};

// Get check-in logs for a specific member (public version for members)
export const getMemberCheckIns = async (
  memberId: string,
  params?: Omit<CheckInsQueryParams, "memberId">
): Promise<PaginatedResponse<CheckInLog>> => {
  // Normalize params to ensure page and limit are numbers
  const normalizedParams = params ? normalizeQueryParams(params) : undefined;
  const response = await axiosInstance.get(`/members/${memberId}/checkins`, {
    params: normalizedParams,
  });
  return response.data._data?.data || response.data.data || response.data;
};

// Get check-in logs for a specific member (public, no auth)
export const getMemberCheckInsPublic = async (
  memberId: string,
  params?: Omit<CheckInsQueryParams, "memberId">
): Promise<PaginatedResponse<CheckInLog>> => {
  if (!memberId || memberId.trim() === "") {
    // Return empty response instead of throwing to avoid unnecessary error toasts
    return {
      data: [],
      total: 0,
      page: params?.page || 1,
      limit: params?.limit || 20,
      totalPages: 0,
    };
  }
  const normalizedParams = params ? normalizeQueryParams(params) : undefined;
  const response = await axios.get(
    `${API_BASE_URL}/members/${memberId}/checkins`,
    {
      params: normalizedParams,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data._data?.data || response.data.data || response.data;
};
