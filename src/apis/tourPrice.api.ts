import axiosInstance from "./axiosInstance";

export interface TourPrice {
  id: number;
  tour_id: number;
  adult_price: number;
  kid_price: number;
  note?: string;
  price_type?: string;
  created_at?: string;
  updated_at?: string;
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

export interface TourPriceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tour_id?: number;
  price_type?: string;
}

export interface TourPriceResponse {
  success: boolean;
  data: TourPrice[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface TourPriceCreateResponse {
  success: boolean;
  data: TourPrice;
  message: string;
}

export interface TourPriceUpdateResponse {
  success: boolean;
  data: TourPrice;
  message: string;
}

export interface TourPriceDeleteResponse {
  success: boolean;
  message: string;
}

// Get all tour prices with pagination and filters
export const getAllTourPrices = async (
  params: TourPriceQueryParams = {}
): Promise<TourPriceResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.tour_id) queryParams.append("tour_id", params.tour_id.toString());
  if (params.price_type) queryParams.append("price_type", params.price_type);

  const response = await axiosInstance.get(
    `/api/tour-prices?${queryParams.toString()}`
  );
  return response.data;
};

// Get tour price by ID
export const getTourPriceById = async (id: number): Promise<TourPrice> => {
  const response = await axiosInstance.get(`/api/tour-prices/${id}`);
  return response.data.data;
};

// Get tour prices by tour ID
export const getTourPricesByTourId = async (
  tourId: number
): Promise<TourPriceResponse> => {
  const response = await axiosInstance.get(
    `/api/tour-prices?tour_id=${tourId}`
  );
  return response.data;
};

// Get all sorted tour prices
export const getAllSortedTourPrices = async (): Promise<TourPriceResponse> => {
  const response = await axiosInstance.get("/api/tour-prices/sorted");
  return response.data;
};

// Create new tour price
export const createTourPrice = async (data: {
  tour_id: number;
  adult_price: number;
  kid_price: number;
  note?: string;
  price_type?: string;
}): Promise<TourPriceCreateResponse> => {
  const response = await axiosInstance.post("/api/tour-prices", data);
  return response.data;
};

// Update tour price
export const updateTourPrice = async (
  id: number,
  data: {
    adult_price: number;
    kid_price: number;
    note?: string;
    price_type?: string;
  }
): Promise<TourPriceUpdateResponse> => {
  const response = await axiosInstance.put(`/api/tour-prices/${id}`, data);
  return response.data;
};

// Delete tour price
export const deleteTourPrice = async (
  id: number
): Promise<TourPriceDeleteResponse> => {
  const response = await axiosInstance.delete(`/api/tour-prices/${id}`);
  return response.data;
};

// Legacy functions for backward compatibility
export const getTourPrices = () => getAllTourPrices();

export const getTourPricesByTourIdAndDate = (
  tourId: number,
  date: string
): Promise<TourPriceResponse> => getAllTourPrices({ tour_id: tourId });
