import axiosInstance from './axiosInstance';

// Tour interfaces
export interface Tour {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  slug: string;
  tour_category_id: number;
  originalPrice: number;
  discountedPrice?: number;
  duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  view_count?: number;
  totalStar?: number;
  totalReview?: number;
}

export interface TourQueryParams {
  tour_category_id?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  slug?: string;
}

export interface TourResponse {
  success: boolean;
  data: Tour[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TourDetailResponse {
  data: Tour;
}

// API Functions

/**
 * Get all tours with optional filters
 */
export const getAllTours = async (params?: TourQueryParams): Promise<TourResponse> => {
  const response = await axiosInstance.get('/api/tours', { params });
  return response.data;
};

/**
 * Get tour by ID
 */
export const getTourById = async (id: number): Promise<TourDetailResponse> => {
  const response = await axiosInstance.get(`/api/tours/${id}`);
  return response.data;
};

// Legacy functions for backward compatibility
export const getTourBySlug = (slug: string) =>
  axiosInstance.get(`/api/tours?slug=${slug}`);

export const getTourDetail = (tour_id: number) =>
  axiosInstance.get(`/api/tour_details?tour_id=${tour_id}`);

export const getTourImages = (tour_id: number) =>
  axiosInstance.get(`/api/tour_images?tour_id=${tour_id}`);

export const getTopBookedTours = (limit: number) =>
  axiosInstance.get(`/api/tours/top-booked?limit=${limit}`);

export const getTours = (page: number, limit: number) =>
  axiosInstance.get(`/api/tours?page=${page}&limit=${limit}&is_active=true`);

export const getToursByCatId = (catId: number) =>
  axiosInstance.get(`/api/tours?tour_category_id=${catId}`);

export const getToursByIsActive = (active: boolean) =>
  axiosInstance.get(`/api/tours?is_active=${active}`);

export const incrementTourViewCount = (id: number) =>
  axiosInstance.patch(`/api/tours/${id}/increment-view`);