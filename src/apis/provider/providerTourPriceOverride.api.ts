import type { AxiosResponse } from 'axios';
import axiosInstance from '../axiosInstance';

// TypeScript interfaces for Tour Price Override data
export interface TourPriceOverride {
  id: number;
  override_date: string | null;
  day_of_week: string | null;
  start_date: string | null;
  end_date: string | null;
  adult_price: number;
  kid_price: number;
  note: string;
  is_active: boolean;
  tour_price_id: number;
  override_type: 'single_date' | 'date_range' | 'day_of_week';
  tour_price: {
    id: number;
    adult_price: number;
    kid_price: number;
    note: string;
    tour: {
      id: number;
      title: string;
      poster_url: string;
      tour_category: {
        id: number;
        name: string;
      };
    };
  };
}

export interface TourPriceOverrideResponse {
  success: boolean;
  data: TourPriceOverride[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface TourPriceOverrideParams {
  page?: number;
  limit?: number;
  search?: string;
  tour_price_id?: number;
  override_type?: string;
  is_active?: boolean;
}

export interface CreateTourPriceOverrideData {
  override_date?: string;
  day_of_week?: string;
  start_date?: string;
  end_date?: string;
  adult_price: number;
  kid_price: number;
  note: string;
  is_active: boolean;
  tour_price_id: number;
  override_type: 'single_date' | 'date_range' | 'day_of_week';
}

export interface UpdateTourPriceOverrideData {
  override_date?: string;
  day_of_week?: string;
  start_date?: string;
  end_date?: string;
  adult_price?: number;
  kid_price?: number;
  note?: string;
  is_active?: boolean;
  tour_price_id?: number;
  override_type?: 'single_date' | 'date_range' | 'day_of_week';
}

// API functions
export const providerTourPriceOverrideApi = {
  // Get all tour price overrides
  getTourPriceOverrides: (params?: TourPriceOverrideParams): Promise<AxiosResponse<TourPriceOverrideResponse>> => {
    return axiosInstance.get('/api/provider/tour-price-overrides', { params });
  },

  // Get tour price override by ID
  getTourPriceOverrideById: (id: number): Promise<AxiosResponse<{ success: boolean; data: TourPriceOverride }>> => {
    return axiosInstance.get(`/api/provider/tour-price-overrides/${id}`);
  },

  // Create new tour price override
  createTourPriceOverride: (data: CreateTourPriceOverrideData): Promise<AxiosResponse<{ success: boolean; data: TourPriceOverride }>> => {
    return axiosInstance.post('/api/provider/tour-price-overrides', data);
  },

  // Update tour price override
  updateTourPriceOverride: (id: number, data: UpdateTourPriceOverrideData): Promise<AxiosResponse<{ success: boolean; data: TourPriceOverride }>> => {
    return axiosInstance.put(`/api/provider/tour-price-overrides/${id}`, data);
  },

  // Delete tour price override
  deleteTourPriceOverride: (id: number): Promise<AxiosResponse<{ success: boolean }>> => {
    return axiosInstance.delete(`/api/provider/tour-price-overrides/${id}`);
  },

  // Toggle active status
  toggleActive: (id: number): Promise<AxiosResponse<{ success: boolean; data: TourPriceOverride }>> => {
    return axiosInstance.patch(`/api/provider/tour-price-overrides/${id}/toggle-active`);
  }
};
