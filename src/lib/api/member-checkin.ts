import axios from "axios";
import { API_BASE_URL } from "../axios-config";

// Member Check-in DTO
export interface MemberCheckInDto {
  memberId: string;
}

// Check-in Response
export interface CheckInResponse {
  success: boolean;
  status: "ALLOWED" | "DENIED";
  message?: string;
  reason?: string;
  member?: {
    id: string;
    memberId?: string;
    name: string;
    email?: string;
    phone?: string;
    endDate?: string;
    startDate?: string;
    membershipStatus?: string;
  };
}

// Member check-in (public endpoint)
export const memberCheckIn = async (
  memberId: string
): Promise<CheckInResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/checkin`,
    { memberId },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data = response.data._data?.data || response.data.data || response.data;
  return {
    success: data.success !== false,
    status: data.status || (data.success ? "ALLOWED" : "DENIED"),
    message: data.message,
    reason: data.reason,
    member: data.member,
  };
};

