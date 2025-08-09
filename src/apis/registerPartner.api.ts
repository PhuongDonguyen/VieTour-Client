import axiosInstance from "./axiosInstance";

export interface RegisterPartnerRequest {
  company_name: string;
  registrant_name: string;
  email: string;
  phone: string;
  address?: string;
  ward?: string;
  district?: string;
  province?: string;
  tax_code?: string;
  licence_number?: string;
  establish_year?: number;
  avatar?: string;
  desc?: string;
}

export interface RegisterPartnerResponse {
  id: number;
  company_name: string;
  registrant_name: string;
  email: string;
  phone: string;
  address?: string;
  ward?: string;
  district?: string;
  province?: string;
  tax_code?: string;
  licence_number?: string;
  establish_year?: number;
  avatar?: string;
  desc?: string;
  status: "pending" | "accept" | "decline";
}

export interface RegisterPartnerListResponse {
  id: number;
  company_name: string;
  registrant_name: string;
  email: string;
  phone: string;
  status: "pending" | "accept" | "decline";
}

export interface RegisterPartnerUpdateRequest {
  company_name?: string;
  registrant_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  ward?: string;
  district?: string;
  province?: string;
  tax_code?: string;
  licence_number?: string;
  establish_year?: number;
  avatar?: string;
  desc?: string;
  status?: "pending" | "accept" | "decline";
}

export interface RegisterPartnerStatusRequest {
  status: "pending" | "accept" | "decline";
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RegisterPartnerListApiResponse {
  success: boolean;
  data: RegisterPartnerListResponse[];
  pagination: PaginationResponse;
}

export interface RegisterPartnerApiResponse {
  success: boolean;
  data: RegisterPartnerResponse;
}

// Tạo yêu cầu đăng ký đối tác (Public)
export const createRegisterPartner = async (
  data: RegisterPartnerRequest
): Promise<RegisterPartnerApiResponse> => {
  const response = await axiosInstance.post("/api/register-partner", data);
  return response.data;
};

// Lấy danh sách yêu cầu (Admin only)
export const getRegisterPartners = async (params?: {
  status?: "pending" | "accept" | "decline";
  page?: number;
  limit?: number;
}): Promise<RegisterPartnerListApiResponse> => {
  const response = await axiosInstance.get("/api/register-partner", { params });
  return response.data;
};

// Lấy chi tiết yêu cầu (Admin only)
export const getRegisterPartnerById = async (
  id: number
): Promise<RegisterPartnerApiResponse> => {
  const response = await axiosInstance.get(`/api/register-partner/${id}`);
  return response.data;
};

// Cập nhật yêu cầu (Admin only)
export const updateRegisterPartner = async (
  id: number,
  data: RegisterPartnerUpdateRequest
): Promise<RegisterPartnerApiResponse> => {
  const response = await axiosInstance.put(`/api/register-partner/${id}`, data);
  return response.data;
};

// Phê duyệt đăng ký (Admin only)
export const approveRegisterPartner = async (
  id: number
): Promise<RegisterPartnerApiResponse> => {
  const response = await axiosInstance.put(
    `/api/register-partner/${id}/approve`
  );
  return response.data;
};

// Từ chối đăng ký (Admin only)
export const rejectRegisterPartner = async (
  id: number,
  reason: string
): Promise<RegisterPartnerApiResponse> => {
  const response = await axiosInstance.put(
    `/api/register-partner/${id}/reject`,
    {
      reason,
    }
  );
  return response.data;
};
