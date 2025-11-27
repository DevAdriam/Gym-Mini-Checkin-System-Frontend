import axios from "axios";
import { API_BASE_URL } from "../axios-config";

// Member Login DTO
export interface MemberLoginDto {
  email: string;
  password: string;
}

// Member Login Response
export interface MemberLoginResponse {
  accessToken: string;
  member: {
    id: string;
    memberId: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
  };
}

// Member login
export const memberLogin = async (
  data: MemberLoginDto
): Promise<MemberLoginResponse> => {
  const response = await axios.post(`${API_BASE_URL}/members/login`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const responseData =
    response.data._data?.data || response.data.data || response.data;
  return {
    accessToken: responseData.accessToken || responseData.token,
    member: responseData.member || responseData,
  };
};

// Get member profile (authenticated)
export const getMemberProfile = async (): Promise<any> => {
  const token = localStorage.getItem("memberAuthToken");
  const response = await axios.get(`${API_BASE_URL}/members/profile`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = response.data._data?.data || response.data.data || response.data;
  return data.member || data;
};

// Member logout
export const memberLogout = async (): Promise<void> => {
  const token = localStorage.getItem("memberAuthToken");
  // Try to call logout endpoint if it exists (optional, won't fail if endpoint doesn't exist)
  try {
    await axios.post(
      `${API_BASE_URL}/members/logout`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    // Ignore errors - endpoint might not exist, just clear local storage
    console.log("Logout endpoint not available, clearing local storage only");
  }
  // Clear local storage
  localStorage.removeItem("memberAuthToken");
  localStorage.removeItem("gym_member_email");
  localStorage.removeItem("gym_member_checkin_status");
};

