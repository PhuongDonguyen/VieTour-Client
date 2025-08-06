import axiosInstance from "./axiosInstance";

// Interfaces
export interface TourDetail {
  id: number;
  tour_id: number;
  title: string;
  order: number;
  morning_description: string;
  noon_description: string;
  afternoon_description: string;
  created_at: string;
  updated_at: string;
  tour?: {
    id: number;
    title: string;
    poster_url: string;
    tour_category: {
      id: number;
      name: string;
    };
  };
}

export interface TourDetailQueryParams {
  page?: number;
  limit?: number;
  tour_id?: number;
  // search?: string; // removed
}

export interface TourDetailResponse {
  success: boolean;
  data: TourDetail[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TourDetailCreateResponse {
  success: boolean;
  data: TourDetail;
  message: string;
}

export interface TourDetailUpdateResponse {
  success: boolean;
  data: TourDetail;
  message: string;
}

export interface TourDetailDeleteResponse {
  success: boolean;
  message: string;
}

// API Functions
export const getAllTourDetails = async (
  params?: TourDetailQueryParams
): Promise<TourDetailResponse> => {
  // Remove search from params if present
  const { page, limit, tour_id } = params || {};
  const queryParams: any = {};
  if (page !== undefined) queryParams.page = page;
  if (limit !== undefined) queryParams.limit = limit;
  if (tour_id !== undefined) queryParams.tour_id = tour_id;
  const response = await axiosInstance.get("/api/tour-details", {
    params: queryParams,
  });
  return response.data;
};

export const getTourDetailById = async (id: number): Promise<TourDetail> => {
  const response = await axiosInstance.get(`/api/tour-details/${id}`);
  return response.data.data;
};

export const getTourDetailsByTourId = async (
  tour_id: number
): Promise<TourDetailResponse> => {
  const response = await axiosInstance.get(`/api/tour-details`, {
    params: { tour_id },
  });
  return response.data;
};

export const createTourDetail = async (tourDetailData: {
  tour_id: number;
  title: string;
  order: number;
  morning_description: string;
  noon_description: string;
  afternoon_description: string;
}): Promise<TourDetailCreateResponse> => {
  const response = await axiosInstance.post(
    "/api/tour-details",
    tourDetailData
  );
  return response.data;
};

export const updateTourDetail = async (
  id: number,
  tourDetailData: {
    tour_id: number;
    title: string;
    order: number;
    morning_description: string;
    noon_description: string;
    afternoon_description: string;
  }
): Promise<TourDetailUpdateResponse> => {
  const response = await axiosInstance.put(
    `/api/tour-details/${id}`,
    tourDetailData
  );
  return response.data;
};

export const deleteTourDetail = async (
  id: number
): Promise<TourDetailDeleteResponse> => {
  const response = await axiosInstance.delete(`/api/tour-details/${id}`);
  return response.data;
};

// Legacy functions for backward compatibility
export const getTourDetails = () => axiosInstance.get("/api/tour-details");

export const getTourDetailByTourId = (tour_id: number) =>
  axiosInstance.get(`/api/tour-details?tour_id=${tour_id}`);
