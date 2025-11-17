import * as adminManagerApi from "@/apis/adminManager.api";

export type { User, Provider, Pagination, GetUsersResponse, GetProvidersResponse, GetUsersParams } from "@/apis/adminManager.api";

export const getUsers = async (params?: adminManagerApi.GetUsersParams, role?: string): Promise<adminManagerApi.GetUsersResponse | adminManagerApi.GetProvidersResponse> => {
  try {
    const response = await adminManagerApi.getUsers(params, role);
    return response;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
  }
};


export const lockUserAccount = async (accountId: number, lockedUntil: string) => {
  try {
    const response = await adminManagerApi.lockUserAccount(accountId, lockedUntil);
    return response;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response?.data?.message || 'Lỗi khi khóa tài khoản người dùng');
  }
};

export const getUsersSearch = async (search: string, page: number, limit: number, role?: string): Promise<adminManagerApi.GetUsersResponse | adminManagerApi.GetProvidersResponse> => {
  try {
    const response = await adminManagerApi.getUsersSearch(search, page, limit, role);
    return response;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
  }
};