import { getCurrentUserProfile , updateProfile, getUserByUserId} from "../apis/userProfile.api";
import type { userProfile } from "../apis/userProfile.api";
export const fetchUserProfile = async () => {
    const res = await getCurrentUserProfile();
    if (res.data) return res.data;
    throw new Error("load user fail");
}

export const updateUserProfile = async (id: number, profile: userProfile) => {
    const res = await updateProfile(id, profile);
  if (res.data) return res.data;
  throw new Error("update user profile fail");
}

export const fetchUserById = async (id: number) => {
    const res = await getUserByUserId(id);
  if (res.data) return res.data;
  throw new Error("get user profile fail");
}
