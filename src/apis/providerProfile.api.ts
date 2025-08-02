import axiosInstance from "./axiosInstance";

export interface ProviderProfile {
  id: number;
  company_name: string;
  phone: string;
  ward: string;
  district: string;
  tax_code: string;
  provice: string;
  address: string;
  avatar: string;
  lisence_number: string;
  establish_year: number;
  desc: string;
  account_id: number;
  is_verified: boolean;
}

export interface ProviderProfileResponse {
  success: boolean;
  data: ProviderProfile[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Direct array response type for GET /api/provider-profiles
export type ProviderProfileArray = ProviderProfile[];

export interface ProviderProfileQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  is_verified?: boolean;
}

// Get all provider profiles
export const getAllProviderProfiles = async (
  params?: ProviderProfileQueryParams
): Promise<ProviderProfileArray> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.is_verified !== undefined)
    queryParams.append("is_verified", params.is_verified.toString());

  const queryString = queryParams.toString();
  const url = queryString
    ? `/api/provider-profiles?${queryString}`
    : "/api/provider-profiles";

  const response = await axiosInstance.get(url);
  return response.data;
};

// Get provider profile by ID
export const getProviderProfileById = async (
  id: number
): Promise<{ success: boolean; data: ProviderProfile }> => {
  const response = await axiosInstance.get(`/api/provider-profiles/${id}`);
  return response.data;
};

// Create new provider profile
export const createProviderProfile = async (
  data: FormData
): Promise<{ success: boolean; data: ProviderProfile; message?: string }> => {
  const response = await axiosInstance.post("/api/provider-profiles", data);
  return response.data;
};

// Update provider profile
export const updateProviderProfile = async (
  id: number,
  data: FormData
): Promise<{ success: boolean; data: ProviderProfile; message?: string }> => {
  const response = await axiosInstance.put(
    `/api/provider-profiles/${id}`,
    data
  );
  return response.data;
};

// Delete provider profile
export const deleteProviderProfile = async (
  id: number
): Promise<{ success: boolean; message?: string }> => {
  const response = await axiosInstance.delete(`/api/provider-profiles/${id}`);
  return response.data;
};

// Toggle provider profile status
export const toggleProviderProfileStatus = async (
  id: number
): Promise<{ success: boolean; data: ProviderProfile; message?: string }> => {
  const response = await axiosInstance.patch(
    `/api/provider-profiles/${id}/toggle-status`
  );
  return response.data;
};
