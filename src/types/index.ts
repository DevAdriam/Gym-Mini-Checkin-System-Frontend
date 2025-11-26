// User Types
export type UserRole = "admin" | "member";

// API uses uppercase, frontend can use lowercase for display
export type MembershipStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "ACTIVE";

export type CheckInStatus = "ALLOWED" | "DENIED";

// Admin Types
export interface Admin {
  id: string;
  email: string;
  name: string;
  phone?: string;
  image?: string;
  role: "admin";
}

// Admin Login DTO
export interface AdminLoginDto {
  email: string;
  password: string;
}

// Admin Login Response
export interface AdminLoginResponse {
  accessToken: string;
  admin: Admin;
}

// Payment Screenshot DTO
export interface PaymentScreenshotDto {
  imageUrl: string;
  description?: string;
}

// Member Types
export interface Member {
  id: string;
  memberId?: string; // e.g., MEM-20240101-ABC12
  name: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
  membershipStatus: MembershipStatus;
  membershipPackageId?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

// Membership Package Types
export interface MembershipPackage {
  id: string;
  title: string;
  description?: string;
  price: number;
  durationDays: number;
  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Registration Types
export interface Registration {
  id: string;
  memberId: string;
  member: Member;
  packageId: string;
  package: MembershipPackage;
  paymentScreenshot: string;
  status: MembershipStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Check-in Log Types
export interface CheckInLog {
  id: string;
  memberId: string;
  member: Member;
  checkInTime: string;
  status: CheckInStatus;
  reason?: string;
}

// API Query Parameters
export interface MembersQueryParams {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  active?: "ACTIVE" | "EXPIRED";
  search?: string;
  page?: number;
  limit?: number;
}

export interface CheckInsQueryParams {
  memberId?: string;
  status?: CheckInStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
