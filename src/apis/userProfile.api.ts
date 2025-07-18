import axiosInstance from "./axiosInstance";

export interface userProfile {
    firstName: string;
    lastName: string;
    phone: string;
    ward: string;
    district: string;
    province: string;
    address: string;
}

export const getCurrentUserProfile = () => 
    axiosInstance.get(`api/user-profiles/me`);

export const updateProfile = (id: number, profile: userProfile) => 
    axiosInstance.put(`api/user-profiles/${id}`, profile)

