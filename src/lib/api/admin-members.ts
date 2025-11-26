import { axiosInstance, normalizeQueryParams } from "../axios-config";
import type {
  Member,
  MembersQueryParams,
  PaginatedResponse,
} from "../../types/index";

// List all members with filters
export const getMembers = async (
  params?: MembersQueryParams
): Promise<PaginatedResponse<Member>> => {
  // Normalize params to ensure page and limit are numbers
  const normalizedParams = params ? normalizeQueryParams(params) : undefined;
  const response = await axiosInstance.get("/members", {
    params: normalizedParams,
  });
  // Extract data from response structure
  return response.data._data?.data || response.data.data || response.data;
};

// Get member detail
export const getMemberDetail = async (id: string): Promise<Member> => {
  const response = await axiosInstance.get(`/members/${id}`);
  return response.data._data?.data || response.data.data || response.data;
};

// Approve member registration
export const approveMember = async (id: string): Promise<Member> => {
  const response = await axiosInstance.patch(`/members/${id}/approve`);
  return response.data._data?.data || response.data.data || response.data;
};

// Reject member registration
export const rejectMember = async (id: string): Promise<Member> => {
  const response = await axiosInstance.patch(`/members/${id}/reject`);
  return response.data._data?.data || response.data.data || response.data;
};

// Soft delete member
export const deleteMember = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/members/${id}`);
};

// Restore soft-deleted member
export const restoreMember = async (id: string): Promise<Member> => {
  const response = await axiosInstance.patch(`/members/${id}/restore`);
  return response.data._data?.data || response.data.data || response.data;
};

// Get member images (profile and payment screenshots)
export interface MemberImage {
  id: string;
  imageUrl: string;
  type: "PROFILE" | "PAYMENT_SCREENSHOT";
  description?: string;
  createdAt: string;
}

export const getMemberImages = async (id: string): Promise<MemberImage[]> => {
  const response = await axiosInstance.get(`/members/${id}/images`);
  const data = response.data._data?.data || response.data.data || response.data;
  return Array.isArray(data) ? data : data.images || [];
};
