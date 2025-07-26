import { providerTourPriceOverrideApi } from '../../apis/provider/providerTourPriceOverride.api';
import type { 
  TourPriceOverride, 
  TourPriceOverrideResponse, 
  TourPriceOverrideParams, 
  CreateTourPriceOverrideData, 
  UpdateTourPriceOverrideData 
} from '../../apis/provider/providerTourPriceOverride.api';

export const providerTourPriceOverrideService = {
  // Get tour price overrides with error handling
  getTourPriceOverrides: async (params?: TourPriceOverrideParams): Promise<TourPriceOverrideResponse> => {
    try {
      const response = await providerTourPriceOverrideApi.getTourPriceOverrides(params);
      console.log('Raw API response:', response.data);
      
      // Return the structured response
      return {
        success: response.data.success,
        data: response.data.data || [],
        pagination: response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10
        }
      };
    } catch (error: any) {
      console.error('Error fetching tour price overrides:', error);
      throw new Error(error?.response?.data?.message || 'Failed to fetch tour price overrides');
    }
  },

  // Get tour price override by ID
  getTourPriceOverrideById: async (id: number): Promise<TourPriceOverride> => {
    try {
      const response = await providerTourPriceOverrideApi.getTourPriceOverrideById(id);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching tour price override by ID:', error);
      throw new Error(error?.response?.data?.message || 'Failed to fetch tour price override');
    }
  },

  // Create new tour price override
  createTourPriceOverride: async (data: CreateTourPriceOverrideData): Promise<TourPriceOverride> => {
    try {
      const response = await providerTourPriceOverrideApi.createTourPriceOverride(data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating tour price override:', error);
      throw new Error(error?.response?.data?.message || 'Failed to create tour price override');
    }
  },

  // Update tour price override
  updateTourPriceOverride: async (id: number, data: UpdateTourPriceOverrideData): Promise<TourPriceOverride> => {
    try {
      const response = await providerTourPriceOverrideApi.updateTourPriceOverride(id, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating tour price override:', error);
      throw new Error(error?.response?.data?.message || 'Failed to update tour price override');
    }
  },

  // Delete tour price override
  deleteTourPriceOverride: async (id: number): Promise<void> => {
    try {
      await providerTourPriceOverrideApi.deleteTourPriceOverride(id);
    } catch (error: any) {
      console.error('Error deleting tour price override:', error);
      throw new Error(error?.response?.data?.message || 'Failed to delete tour price override');
    }
  },

  // Toggle active status
  toggleActive: async (id: number): Promise<TourPriceOverride> => {
    try {
      const response = await providerTourPriceOverrideApi.toggleActive(id);
      return response.data.data;
    } catch (error: any) {
      console.error('Error toggling active status:', error);
      throw new Error(error?.response?.data?.message || 'Failed to toggle active status');
    }
  }
};
