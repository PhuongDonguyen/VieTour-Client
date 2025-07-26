import { providerTourDetailApi, type TourDetail, type TourDetailsResponse } from '../../apis/provider/providerTourDetail.api';

export const providerTourDetailService = {
  async getTourDetails(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
  }): Promise<TourDetailsResponse> {
    try {
      const response = await providerTourDetailApi.getProviderTourDetails(params);
      // Extract the actual data from axios response
      return response.data;
    } catch (error) {
      console.error('Error fetching tour details:', error);
      throw error;
    }
  },

  async getTourDetail(id: number): Promise<TourDetail> {
    try {
      const response = await providerTourDetailApi.getTourDetail(id);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tour detail:', error);
      throw error;
    }
  },

  async updateTourDetail(id: number, data: Partial<TourDetail>): Promise<TourDetail> {
    try {
      const response = await providerTourDetailApi.updateTourDetail(id, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating tour detail:', error);
      throw error;
    }
  },

  async deleteTourDetail(id: number): Promise<void> {
    try {
      await providerTourDetailApi.deleteTourDetail(id);
    } catch (error) {
      console.error('Error deleting tour detail:', error);
      throw error;
    }
  },

  async createTourDetail(data: Omit<TourDetail, 'id' | 'tour'>): Promise<TourDetail> {
    try {
      const response = await providerTourDetailApi.createTourDetail(data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating tour detail:', error);
      throw error;
    }
  },
};
