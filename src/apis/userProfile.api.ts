import axiosInstance from "./axiosInstance";

export interface userProfile {
  firstName: string;
  lastName: string;
  phone: string;
  ward: string;
  district: string;
  province: string;
  address: string;
  avatar: File | null;
  email?: string;
}

export const getCurrentUserProfile = () =>
  axiosInstance.get(`api/user-profiles/me`);

export const updateProfile = (id: number, profile: userProfile) =>
  axiosInstance.put(`api/user-profiles/${id}`, profile, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getUserByUserId = (id: number) => 
    axiosInstance.get(`/api/user-profiles/${id}`)
