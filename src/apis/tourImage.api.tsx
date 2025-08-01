import axiosInstance from "./axiosInstance";

// Interfaces
export interface TourImage {
  id: number;
  tour_id: number;
  image_url: string;
  alt_text?: string;
  is_featured: boolean;
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

export interface TourImageQueryParams {
  page?: number;
  limit?: number;
  tour_id?: number;
  search?: string;
  is_featured?: boolean;
}

export interface TourImageResponse {
  success: boolean;
  data: TourImage[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TourImageCreateResponse {
  success: boolean;
  data: TourImage;
  message: string;
}

export interface TourImageUpdateResponse {
  success: boolean;
  data: TourImage;
  message: string;
}

export interface TourImageDeleteResponse {
  success: boolean;
  message: string;
}

// API Functions
export const getAllTourImages = async (
  params?: TourImageQueryParams
): Promise<TourImageResponse> => {
  const response = await axiosInstance.get("/api/tour_images", {
    params,
  });
  return response.data;
};

export const getTourImageById = async (id: number): Promise<TourImage> => {
  const response = await axiosInstance.get(`/api/tour_images/${id}`);
  return response.data.data;
};

export const getTourImagesByTourId = async (
  tour_id: number
): Promise<TourImageResponse> => {
  const response = await axiosInstance.get(`/api/tour_images`, {
    params: { tour_id },
  });
  return response.data;
};

export const createTourImage = async (
  formData: FormData
): Promise<TourImageCreateResponse> => {
  const response = await axiosInstance.post("/api/tour_images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateTourImage = async (
  id: number,
  formData: FormData
): Promise<TourImageUpdateResponse> => {
  const response = await axiosInstance.put(`/api/tour_images/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteTourImage = async (
  id: number
): Promise<TourImageDeleteResponse> => {
  const response = await axiosInstance.delete(`/api/tour_images/${id}`);
  return response.data;
};

export const toggleTourImageFeatured = async (
  id: number
): Promise<TourImageUpdateResponse> => {
  const response = await axiosInstance.put(
    `/api/tour_images/${id}/toggle-featured`
  );
  return response.data;
};

// Legacy functions for backward compatibility
export const getTourImages = () => axiosInstance.get("/api/tour_images");

export const getTourImagesLimit = (page: number, limit: number) =>
  axiosInstance.get(`/api/tour_images?page=${page}&limit=${limit}`);
