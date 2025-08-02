import {
  getAllProviderProfiles,
  getProviderProfileById,
  createProviderProfile,
  updateProviderProfile,
  deleteProviderProfile,
  toggleProviderProfileStatus,
  type ProviderProfile,
  type ProviderProfileResponse,
  type ProviderProfileArray,
  type ProviderProfileQueryParams,
} from "../apis/providerProfile.api";

// Get all provider profiles
export const fetchAllProviderProfiles = async (
  params?: ProviderProfileQueryParams
): Promise<ProviderProfileArray> => {
  const response = await getAllProviderProfiles(params);
  return response;
};

// Get provider profile by ID
export const fetchProviderProfileById = async (
  id: number
): Promise<ProviderProfile> => {
  const response = await getProviderProfileById(id);
  if (response.success) return response.data;
  throw new Error("Không tìm thấy thông tin nhà cung cấp");
};

// Create provider profile
export const createProviderProfileService = async (
  data: FormData
): Promise<{ success: boolean; data: ProviderProfile; message?: string }> => {
  const response = await createProviderProfile(data);
  return response;
};

// Update provider profile
export const updateProviderProfileService = async (
  id: number,
  data: FormData
): Promise<{ success: boolean; data: ProviderProfile; message?: string }> => {
  const response = await updateProviderProfile(id, data);
  return response;
};

// Delete provider profile
export const deleteProviderProfileService = async (
  id: number
): Promise<{ success: boolean; message?: string }> => {
  const response = await deleteProviderProfile(id);
  return response;
};

// Toggle provider profile status
export const toggleProviderProfileStatusService = async (
  id: number
): Promise<{ success: boolean; data: ProviderProfile; message?: string }> => {
  const response = await toggleProviderProfileStatus(id);
  return response;
};
