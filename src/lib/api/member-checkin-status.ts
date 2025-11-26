import axios from "axios";
import { API_BASE_URL } from "../axios-config";
import type { Member } from "../../types/index";

// Check member check-in status by member ID
export interface MemberCheckInStatusResponse {
  registered: boolean;
  member: Member;
  currentCheckInStatus?: "checked_in" | "checked_out" | null;
  currentCheckIn?: {
    id: string;
    checkInTime: string;
    status: "ALLOWED" | "DENIED";
  };
}

export const checkMemberCheckInStatus = async (
  memberId: string
): Promise<MemberCheckInStatusResponse | null> => {
  try {
    // Try with memberId as query parameter first
    const response = await axios.get(`${API_BASE_URL}/members/check-status`, {
      params: { memberId },
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = response.data._data?.data || response.data.data || response.data;
    return {
      registered: data.registered !== false,
      member: data.member || data,
      currentCheckInStatus: data.currentCheckInStatus || null,
      currentCheckIn: data.currentCheckIn || undefined,
    };
  } catch (error: any) {
    // If endpoint doesn't accept memberId, try with email (fallback)
    // But for QR scanner, we should use memberId
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

