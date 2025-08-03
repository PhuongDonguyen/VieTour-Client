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

export const updateProfile = (id: number, profile: userProfile) => {
  const formData = new FormData();

  formData.append("first_name", profile.firstName);
  formData.append("last_name", profile.lastName);
  formData.append("phone", profile.phone);
  formData.append("ward", profile.ward);
  formData.append("district", profile.district);
  formData.append("province", profile.province);
  formData.append("address", profile.address);

  if (profile.avatar) {
    formData.append("avatar", profile.avatar);
  }


  return axiosInstance.put(`api/user-profiles/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getUserByUserId = (id: number) => 
    axiosInstance.get(`/api/user-profiles/${id}`)

export const changePassword = (currentPassword: string, newPassword: string) =>
  axiosInstance.post(`auth/change-password`, {
    currentPassword,
    newPassword,
  });