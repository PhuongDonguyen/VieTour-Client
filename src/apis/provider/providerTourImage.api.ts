import type { AxiosResponse } from 'axios';
import axiosInstance from '../axiosInstance';

// TypeScript interfaces for Tour Image data
export interface TourImage {
  id: number;
  image_url: string;
  is_featured: boolean;
  alt_text: string;
  tour_id: number;
  tour: {
    id: number;
    title: string;
    poster_url: string;
    tour_category: {
      id: number;
      name: string;
    };
  };
}

export interface TourImageResponse {
  success: boolean;
  data: TourImage[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface TourImageParams {
  page?: number;
  limit?: number;
  search?: string;
  tour_id?: number;
  is_featured?: boolean;
}

export interface CreateTourImageData {
  image_url: string;
  is_featured: boolean;
  alt_text: string;
  tour_id: number;
}

export interface UpdateTourImageData {
  image_url?: string;
  is_featured?: boolean;
  alt_text?: string;
  tour_id?: number;
}

// API functions
export const providerTourImageApi = {
  // Get all tour images
  getTourImages: (params?: TourImageParams): Promise<AxiosResponse<TourImageResponse>> => {
    return axiosInstance.get('/api/provider/tour-images', { params });
  },

  // Get tour image by ID
  getTourImageById: (id: number): Promise<AxiosResponse<{ success: boolean; data: TourImage }>> => {
    return axiosInstance.get(`/api/provider/tour-images/${id}`);
  },

  // Create new tour image
  createTourImage: (data: CreateTourImageData): Promise<AxiosResponse<{ success: boolean; data: TourImage }>> => {
    return axiosInstance.post('/api/provider/tour-images', data);
  },

  // Update tour image
  updateTourImage: (id: number, data: UpdateTourImageData): Promise<AxiosResponse<{ success: boolean; data: TourImage }>> => {
    return axiosInstance.put(`/api/provider/tour-images/${id}`, data);
  },

  // Delete tour image
  deleteTourImage: (id: number): Promise<AxiosResponse<{ success: boolean }>> => {
    return axiosInstance.delete(`/api/provider/tour-images/${id}`);
  },

  // Toggle featured status
  toggleFeatured: (id: number): Promise<AxiosResponse<{ success: boolean; data: TourImage }>> => {
    return axiosInstance.patch(`/api/provider/tour-images/${id}/toggle-featured`);
  }
};
