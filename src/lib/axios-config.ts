import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Remove auth token
export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

// API base configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Ensure page and limit are converted to numbers then to string for URL
          if (key === "page" || key === "limit") {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
              searchParams.append(key, String(numValue));
            }
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      return searchParams.toString();
    },
  },
});

// Request interceptor - Add auth token to headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      removeAuthToken();
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }

    // Transform error to match our error format
    const errorData = (error.response?.data as any) || {};
    const errorMessage =
      errorData._error?.cause ||
      errorData.message ||
      error.message ||
      "An error occurred";

    const apiError = new Error(errorMessage);
    (apiError as any).statusCode = error.response?.status || 500;
    (apiError as any).errorData = errorData;
    (apiError as any).response = error.response;

    return Promise.reject(apiError);
  }
);

// Helper to normalize query params - ensure numeric values are numbers
export const normalizeQueryParams = (
  params: Record<string, any>
): Record<string, any> => {
  const normalized: Record<string, any> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Convert page and limit to numbers explicitly
      if (key === "page" || key === "limit") {
        normalized[key] = Number(value);
      } else {
        normalized[key] = value;
      }
    }
  });
  return normalized;
};

// Helper to build query string
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
