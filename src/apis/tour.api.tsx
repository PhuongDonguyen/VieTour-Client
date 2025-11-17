import axiosInstance from "./axiosInstance";

// ============================================================================
// TOUR API ENDPOINTS SUMMARY
// ============================================================================
//
// CRUD Operations:
// - GET    /api/tours                    - Get all tours with filters
// - GET    /api/tours/{id}               - Get tour by ID
// - POST   /api/tours                    - Create new tour
// - PUT    /api/tours/{id}               - Update tour
// - DELETE /api/tours/{id}               - Delete tour
// - PATCH  /api/tours/{id}/toggle-status - Toggle tour status
// - PATCH  /api/tours/{id}/increment-view - Increment view count
//
// Query Parameters:
// - include=tour_category    - Include category data
// - page={number}           - Page number for pagination
// - limit={number}          - Items per page
// - search={string}         - Search by title
// - tour_category_id={id}   - Filter by category
// - is_active={boolean}     - Filter by status
// - provider_id={id}        - Filter by provider
// - slug={string}           - Get tour by slug
//
// Legacy Endpoints:
// - GET /api/tour-details?tour_id={id}   - Get tour details
// - GET /api/tour-images?tour_id={id}    - Get tour images
// - GET /api/tours/top-booked?limit={n}  - Get top booked tours
// ============================================================================

// Tour interfaces
export interface Tour {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  slug: string;
  tour_category_id: number;
  price: number;
  discountedPrice?: number;
  duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  view_count?: number;
  total_star?: number; // Changed from totalStar
  review_count?: number; // Changed from totalReview
  // Additional properties for tour management
  capacity?: number;
  transportation?: string;
  accommodation?: string;
  destination_intro?: string;
  tour_info?: string;
  live_commentary?: string;
  location?: string; // Địa điểm tour
  booked_count?: number;
  tour_category?: {
    id: number;
    name: string;
  };
}

export interface TourQueryParams {
  tour_category_id?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  slug?: string;
  provider_id?: number;
  sortBy?: string;
  sortOrder?: string;
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

export interface TourCreateResponse {
  success: boolean;
  data: Tour;
  message?: string;
}

export interface TourUpdateResponse {
  success: boolean;
  data: Tour;
  message?: string;
}

export interface TourDeleteResponse {
  success: boolean;
  message?: string;
}

export interface TourToggleResponse {
  success: boolean;
  data: Tour;
  message?: string;
}

// Interface for similar tour result
export interface SimilarTour {
  tour_id: number;
  name: string;
  description: string;
  location: string;
  duration: string;
  price: number;
  poster_url: string;
  slug: string;
  similarity: number;
}

export interface SearchSimilarToursRequest {
  tourInfo: string;
}

export interface SearchSimilarToursResponse {
  success: boolean;
  tours: SimilarTour[];
}

/**
 * Get all tours with optional filters
 */
export const getAllTours = async (
  params?: TourQueryParams
): Promise<TourResponse> => {
  const queryParams = {
    ...params,
    // Only include tour_category if not filtering by tour_category_id
    ...(params?.tour_category_id ? {} : { include: "tour_category" }),
  };
  const response = await axiosInstance.get("/api/tours", {
    params: queryParams,
  });
  return response.data;
};

/**
 * Get tour by ID
 */
export const getTourById = async (id: number): Promise<TourDetailResponse> => {
  const response = await axiosInstance.get(
    `/api/tours/${id}?include=tour_category`
  );
  return response.data;
};

/**
 * Create new tour
 */
export const createTour = async (
  tourData: FormData
): Promise<TourCreateResponse> => {
  const response = await axiosInstance.post("/api/tours", tourData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Update tour
 */
export const updateTour = async (
  id: number,
  tourData: FormData
): Promise<TourUpdateResponse> => {
  const response = await axiosInstance.put(`/api/tours/${id}`, tourData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Delete tour
 */
export const deleteTour = async (id: number): Promise<TourDeleteResponse> => {
  const response = await axiosInstance.delete(`/api/tours/${id}`);
  return response.data;
};

/**
 * Toggle tour status (active/inactive)
 */
export const toggleTourStatus = async (
  id: number
): Promise<TourToggleResponse> => {
  const response = await axiosInstance.patch(`/api/tours/${id}/toggle-status`);
  return response.data;
};

/**
 * Increment tour view count
 */
export const incrementTourViewCount = (id: number) =>
  axiosInstance.patch(`/api/tours/${id}/increment-view`);

/**
 * Search for tours similar to the provided tour information using vector embedding and semantic similarity
 * POST /tours/similar-tour
 */
export const searchSimilarTours = async (
  data: SearchSimilarToursRequest
): Promise<SearchSimilarToursResponse> => {
  const response = await axiosInstance.post("/api/tours/similar-tour", data);
  return response.data;
};

// Legacy functions for backward compatibility
export const getTourBySlug = (slug: string) =>
  axiosInstance.get(`/api/tours?slug=${slug}`);

export const getTourDetail = (tour_id: number) =>
  axiosInstance.get(`/api/tour-details?tour_id=${tour_id}`);

export const getTourImages = (tour_id: number) =>
  axiosInstance.get(`/api/tour-images?tour_id=${tour_id}`);

export const getTopBookedTours = (limit: number) =>
  axiosInstance.get(`/api/tours/top-booked?limit=${limit}`);

export const getTours = (page: number, limit: number) =>
  axiosInstance.get(`/api/tours?page=${page}&limit=${limit}&is_active=true`);

export const getToursByCatId = (catId: number) =>
  axiosInstance.get(`/api/tours?tour_category_id=${catId}`);

export const getToursByIsActive = (active: boolean) =>
  axiosInstance.get(`/api/tours?is_active=${active}`);

export const getAllToursByProviderId = (providerId: number | null, page?: number, limit?: number) => {
  const params = new URLSearchParams();
  params.append('provider_id', providerId?.toString() || '');
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  return axiosInstance.get(`/api/tours?${params.toString()}`);
};

export const getTouridsByProviderId = () =>
  axiosInstance.get(`/api/tours/tour-provider`);