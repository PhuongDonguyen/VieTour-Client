import axiosInstance from "./axiosInstance";

// Interfaces
export interface TourPriceOverride {
  id: number;
  override_date?: string;
  day_of_week?: string;
  start_date?: string;
  end_date?: string;
  adult_price: number;
  kid_price: number;
  note: string;
  is_active: boolean;
  tour_price_id: number;
  override_type: "single_date" | "date_range" | "weekly";
  tour_price?: {
    id: number;
    adult_price: number;
    kid_price: number;
    note?: string;
    tour_id?: number;
    tour?: {
      id: number;
      title: string;
      poster_url: string;
      tour_category?: {
        id: number;
        name: string;
      };
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface TourPriceOverrideQueryParams {
  page?: number;
  limit?: number;
  tour_price_id?: number;
  override_type?: "single_date" | "date_range" | "weekly";
  is_active?: boolean;
  tour_id?: number;
}

export interface TourPriceOverrideResponse {
  success: boolean;
  data: TourPriceOverride[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TourPriceOverrideCreateResponse {
  success: boolean;
  data: TourPriceOverride;
  message: string;
}

export interface TourPriceOverrideUpdateResponse {
  success: boolean;
  data: TourPriceOverride;
  message: string;
}

export interface TourPriceOverrideDeleteResponse {
  success: boolean;
  message: string;
}

export interface CreateTourPriceOverrideData {
  tour_price_id: number;
  override_type: "single_date" | "date_range" | "weekly";
  override_date?: string;
  start_date?: string;
  end_date?: string;
  day_of_week?: string;
  adult_price: number;
  kid_price: number;
  note: string;
  is_active: boolean;
}

export interface UpdateTourPriceOverrideData {
  override_type?: "single_date" | "date_range" | "weekly";
  override_date?: string;
  start_date?: string;
  end_date?: string;
  day_of_week?: string;
  adult_price?: number;
  kid_price?: number;
  note?: string;
  is_active?: boolean;
}

// API Functions
export const getAllTourPriceOverrides = async (
  params?: TourPriceOverrideQueryParams
): Promise<TourPriceOverrideResponse> => {
  const response = await axiosInstance.get("/api/tour_price_overrides", {
    params,
  });
  return response.data;
};

export const getTourPriceOverrideById = async (
  id: number
): Promise<TourPriceOverride> => {
  const response = await axiosInstance.get(`/api/tour_price_overrides/${id}`);
  return response.data.data;
};

export const createTourPriceOverride = async (
  data: CreateTourPriceOverrideData
): Promise<TourPriceOverrideCreateResponse> => {
  const response = await axiosInstance.post("/api/tour_price_overrides", data);
  return response.data;
};

export const updateTourPriceOverride = async (
  id: number,
  data: UpdateTourPriceOverrideData
): Promise<TourPriceOverrideUpdateResponse> => {
  const response = await axiosInstance.put(
    `/api/tour_price_overrides/${id}`,
    data
  );
  return response.data;
};

export const deleteTourPriceOverride = async (
  id: number
): Promise<TourPriceOverrideDeleteResponse> => {
  const response = await axiosInstance.delete(
    `/api/tour_price_overrides/${id}`
  );
  return response.data;
};

export const toggleActiveTourPriceOverride = async (
  id: number
): Promise<TourPriceOverrideUpdateResponse> => {
  const response = await axiosInstance.patch(
    `/api/tour_price_overrides/${id}/toggle-active`
  );
  return response.data;
};

// Legacy functions for backward compatibility
export const getTourPriceOverrides = () =>
  axiosInstance.get("/api/tour_price_overrides");

export const getTourPriceOverridesLimit = (page: number, limit: number) =>
  axiosInstance.get(`/api/tour_price_overrides?page=${page}&limit=${limit}`);
