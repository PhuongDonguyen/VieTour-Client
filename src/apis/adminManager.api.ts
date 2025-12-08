import axiosInstance from './axiosInstance';

export interface User {
  id: number;
  account_id?: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  ward: string | null;
  district: string | null;
  province: string | null;
  address: string | null;
  avatar: string | null;
  email: string;
  created_at: string;
  locked_until: string | null;
  is_banned?: boolean;
}

export interface Provider {
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
  email: string;
  created_at: string;
  locked_until: string | null;
  is_banned?: boolean;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  pagination: Pagination;
}

export interface GetProvidersResponse {
  success: boolean;
  data: Provider[];
  pagination: Pagination;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getUsers = async (params?: GetUsersParams, role?: string, is_banned?: boolean): Promise<GetUsersResponse | GetProvidersResponse> => {
  const path = role === "provider" ? "/api/admin-managers/providers" : "/api/admin-managers/users";
  const response = await axiosInstance.get(path, {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search,
      is_banned: is_banned,
    },
  });
  return response.data;
};

export const getUsersSearch = async (search: string, page: number, limit: number, role?: string, is_banned?: boolean): Promise<GetUsersResponse | GetProvidersResponse> => {
  const path = role === "provider" ? "/api/admin-managers/providers/search" : "/api/admin-managers/users/search";
  const response = await axiosInstance.get(path, {
    params: { search, page, limit, is_banned },
  });
  return response.data;
};

export const banAccount = async (accountId: number) => {
  const response = await axiosInstance.patch(`/api/admin-managers/account/${accountId}/ban`);
  return response.data;
}

export const unbanAccount = async (accountId: number) => {
  const response = await axiosInstance.patch(`/api/admin-managers/account/${accountId}/unban`);
  return response.data;
}