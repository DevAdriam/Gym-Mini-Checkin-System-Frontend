import { axiosInstance, normalizeQueryParams } from "../axios-config";
import type { MembershipPackage } from "../../types/index";

// Query params for membership packages
export interface MembershipPackagesQueryParams {
  isActive?: boolean;
}

// Create Membership Package DTO
export interface CreateMembershipPackageDto {
  title: string;
  description?: string;
  price: number;
  durationDays: number;
  sortOrder?: number;
  isActive?: boolean;
}

// Update Membership Package DTO
export interface UpdateMembershipPackageDto {
  title?: string;
  description?: string;
  price?: number;
  durationDays?: number;
  sortOrder?: number;
}

// Update Package Status DTO
export interface UpdatePackageStatusDto {
  isActive: boolean;
}

// List all membership packages with filters
export const getMembershipPackages = async (
  params?: MembershipPackagesQueryParams
): Promise<MembershipPackage[]> => {
  const normalizedParams = params ? normalizeQueryParams(params) : undefined;
  const response = await axiosInstance.get("/membership-packages", {
    params: normalizedParams,
  });
  // Extract data from response structure
  const data = response.data._data?.data || response.data.data || response.data;
  return Array.isArray(data) ? data : data.data || [];
};

// Get single package details
export const getMembershipPackage = async (
  id: string
): Promise<MembershipPackage> => {
  const response = await axiosInstance.get(`/membership-packages/${id}`);
  return response.data._data?.data || response.data.data || response.data;
};

// Create new membership package
export const createMembershipPackage = async (
  data: CreateMembershipPackageDto
): Promise<MembershipPackage> => {
  const response = await axiosInstance.post("/membership-packages", data);
  return response.data._data?.data || response.data.data || response.data;
};

// Update membership package
export const updateMembershipPackage = async (
  id: string,
  data: UpdateMembershipPackageDto
): Promise<MembershipPackage> => {
  const response = await axiosInstance.patch(
    `/membership-packages/${id}`,
    data
  );
  return response.data._data?.data || response.data.data || response.data;
};

// Soft delete package
export const deleteMembershipPackage = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/membership-packages/${id}`);
};

// Activate/deactivate package
export const updatePackageStatus = async (
  id: string,
  data: UpdatePackageStatusDto
): Promise<MembershipPackage> => {
  const response = await axiosInstance.patch(
    `/membership-packages/${id}/status`,
    data
  );
  return response.data._data?.data || response.data.data || response.data;
};

// Restore soft-deleted package
export const restoreMembershipPackage = async (
  id: string
): Promise<MembershipPackage> => {
  const response = await axiosInstance.patch(
    `/membership-packages/${id}/restore`
  );
  return response.data._data?.data || response.data.data || response.data;
};
