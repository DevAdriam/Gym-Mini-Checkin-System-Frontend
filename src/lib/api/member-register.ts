import axios from "axios";
import { API_BASE_URL } from "../axios-config";
import type { MembershipPackage } from "../../types/index";

// Payment Screenshot DTO
export interface PaymentScreenshotDto {
  imageUrl: string;
  description?: string;
}

// Member Register DTO
export interface MemberRegisterDto {
  name: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
  membershipPackageId: string;
  paymentScreenshots: PaymentScreenshotDto[];
}

// Get available membership packages (public endpoint, no auth needed)
// Use axios directly instead of axiosInstance to avoid adding auth header
export const getAvailablePackages = async (): Promise<MembershipPackage[]> => {
  const response = await axios.get(`${API_BASE_URL}/membership-packages`, {
    params: { isActive: true },
    // Explicitly don't send auth header for public endpoint
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = response.data._data?.data || response.data.data || response.data;
  return Array.isArray(data) ? data : data.data || [];
};

// Submit member registration
export const registerMember = async (data: MemberRegisterDto): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/members/register`, data);
  // Extract member ID from response if available
  const responseData =
    response.data._data?.data || response.data.data || response.data;
  return {
    ...response.data,
    memberId:
      responseData.member?.id || responseData.id || responseData.memberId,
  };
};
