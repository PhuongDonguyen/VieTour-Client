import * as adminManagerApi from "@/apis/adminManager.api";

export type { User, Provider, Pagination, GetUsersResponse, GetProvidersResponse, GetUsersParams } from "@/apis/adminManager.api";

export const getUsers = async (params?: adminManagerApi.GetUsersParams, role?: string, is_banned?: boolean): Promise<adminManagerApi.GetUsersResponse | adminManagerApi.GetProvidersResponse> => {
  try {
    const response = await adminManagerApi.getUsers(params, role, is_banned);
    return response;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
  }
};

export const getUsersSearch = async (search: string, page: number, limit: number, role?: string, is_banned?: boolean): Promise<adminManagerApi.GetUsersResponse | adminManagerApi.GetProvidersResponse> => {
  try {
    const response = await adminManagerApi.getUsersSearch(search, page, limit, role, is_banned);
    return response;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
  }
};

export const banAccountService = async (accountId: number) => {
  try {
    const response = await adminManagerApi.banAccount(accountId);
    return response;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response?.data?.message || 'Lỗi khi cấm tài khoản');
  }
};

export const unbanAccountService = async (accountId: number) => {
  try {
    const response = await adminManagerApi.unbanAccount(accountId);
    return response;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response?.data?.message || 'Lỗi khi gỡ cấm tài khoản');
  }
};
