import { providerTourImageApi } from "../../apis/provider/providerTourImage.api";
import type {
  TourImage,
  TourImageResponse,
  TourImageParams,
  CreateTourImageData,
  UpdateTourImageData,
} from "../../apis/provider/providerTourImage.api";

export const providerTourImageService = {
  // Get tour images with error handling
  getTourImages: async (
    params?: TourImageParams
  ): Promise<TourImageResponse> => {
    try {
      const response = await providerTourImageApi.getTourImages(params);
      console.log("Raw API response:", response.data);

      // Return the structured response
      return {
        success: response.data.success,
        data: response.data.data || [],
        pagination: response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      };
    } catch (error: any) {
      console.error("Error fetching tour images:", error);
      throw new Error(
        error?.response?.data?.message || "Failed to fetch tour images"
      );
    }
  },

  // Get tour image by ID
  getTourImageById: async (id: number): Promise<TourImage> => {
    try {
      const response = await providerTourImageApi.getTourImageById(id);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching tour image by ID:", error);
      throw new Error(
        error?.response?.data?.message || "Failed to fetch tour image"
      );
    }
  },

  // Create new tour image
  createTourImage: async (formData: FormData): Promise<TourImage> => {
    try {
      const response = await providerTourImageApi.createTourImage(formData);
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating tour image:", error);
      throw new Error(
        error?.response?.data?.message || "Failed to create tour image"
      );
    }
  },

  // Update tour image
  updateTourImage: async (
    id: number,
    formData: FormData
  ): Promise<TourImage> => {
    try {
      const response = await providerTourImageApi.updateTourImage(id, formData);
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating tour image:", error);
      throw new Error(
        error?.response?.data?.message || "Failed to update tour image"
      );
    }
  },

  // Delete tour image
  deleteTourImage: async (id: number): Promise<void> => {
    try {
      await providerTourImageApi.deleteTourImage(id);
    } catch (error: any) {
      console.error("Error deleting tour image:", error);
      throw new Error(
        error?.response?.data?.message || "Failed to delete tour image"
      );
    }
  },

  // Toggle featured status
  toggleFeatured: async (id: number): Promise<TourImage> => {
    try {
      const response = await providerTourImageApi.toggleFeatured(id);
      return response.data.data;
    } catch (error: any) {
      console.error("Error toggling featured status:", error);
      throw new Error(
        error?.response?.data?.message || "Failed to toggle featured status"
      );
    }
  },
};
