import axios from "axios";
import { API_BASE_URL } from "../axios-config";
import type { Member } from "../../types/index";

// Check member status by email
export interface MemberStatusResponse {
  member: Member;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "EXPIRED";
  currentCheckInStatus?: "checked_in" | "checked_out" | null;
  currentCheckIn?: {
    id: string;
    checkInTime: string;
    status: "ALLOWED" | "DENIED";
  };
}

export const checkMemberStatus = async (
  email: string
): Promise<MemberStatusResponse | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/members/check-status`, {
      params: { email },
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data =
      response.data._data?.data || response.data.data || response.data;
    const memberData = data.member || data;
    
    // Handle both 'status' and 'membershipStatus' fields
    const status = 
      memberData?.status || 
      memberData?.membershipStatus || 
      data.status || 
      "PENDING";
    
    // Normalize member object to match our Member type
    const member = {
      ...memberData,
      membershipStatus: status as any, // Map status to membershipStatus
    };
    
    return {
      member,
      status: status as "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "EXPIRED",
      currentCheckInStatus: data.currentCheckInStatus || null,
      currentCheckIn: data.currentCheckIn || undefined,
    };
  } catch (error: any) {
    // If 404, member not found
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};
