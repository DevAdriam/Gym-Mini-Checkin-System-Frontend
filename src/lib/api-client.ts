// API base configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Set auth token
export const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

// Remove auth token
export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

// API client setup
export const apiClient = async (endpoint: string, options?: RequestInit) => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  // Add authorization header if token exists
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      // handleUnauthorized();
    }

    const errorData = await response.json().catch(() => ({
      message: response.statusText,
    }));

    // Handle backend error response format
    // Backend returns: { success: false, _error: { cause: "message" }, _metaData: {...} }
    const errorMessage =
      errorData._error?.cause ||
      errorData.message ||
      errorData.error ||
      response.statusText;

    const apiError = new Error(errorMessage);
    (apiError as any).statusCode =
      errorData._metaData?.statusCode || response.status;
    (apiError as any).errorData = errorData;
    throw apiError;
  }

  return response.json();
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
