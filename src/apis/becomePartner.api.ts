import axiosInstance from "./axiosInstance";

export interface BecomePartnerRequest {
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

export interface BecomePartnerResponse {
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
  status: "pending" | "approved" | "rejected";
}

export interface BecomePartnerListResponse {
  id: number;
  company_name: string;
  registrant_name: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
}

export interface BecomePartnerUpdateRequest {
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
  status?: "pending" | "approved" | "rejected";
}

export interface BecomePartnerStatusRequest {
  status: "pending" | "approved" | "rejected";
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface BecomePartnerListApiResponse {
  success: boolean;
  data: BecomePartnerListResponse[];
  pagination: PaginationResponse;
}

export interface BecomePartnerApiResponse {
  success: boolean;
  data: BecomePartnerResponse;
}

// Tạo yêu cầu trở thành đối tác (Public)
export const createBecomePartner = async (
  data: BecomePartnerRequest
): Promise<BecomePartnerApiResponse> => {
  const response = await axiosInstance.post("/api/become-partners", data);
  return response.data;
};

// Lấy danh sách yêu cầu (Admin only)
export const getBecomePartners = async (params?: {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  limit?: number;
}): Promise<BecomePartnerListApiResponse> => {
  const response = await axiosInstance.get("/api/become-partners", { params });
  return response.data;
};

// Lấy chi tiết yêu cầu (Admin only)
export const getBecomePartnerById = async (
  id: number
): Promise<BecomePartnerApiResponse> => {
  const response = await axiosInstance.get(`/api/become-partners/${id}`);
  return response.data;
};

// Cập nhật yêu cầu (Admin only)
export const updateBecomePartner = async (
  id: number,
  data: BecomePartnerUpdateRequest
): Promise<BecomePartnerApiResponse> => {
  const response = await axiosInstance.put(`/api/become-partners/${id}`, data);
  return response.data;
};

// Cập nhật status (Admin only)
export const updateBecomePartnerStatus = async (
  id: number,
  data: BecomePartnerStatusRequest
): Promise<BecomePartnerApiResponse> => {
  const response = await axiosInstance.patch(
    `/api/become-partners/${id}/status`,
    data
  );
  return response.data;
};
