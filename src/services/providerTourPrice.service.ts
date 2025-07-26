import { providerTourPriceApi, type TourPrice, type TourPricesResponse } from '../apis/providerTourPrice.api';

export const providerTourPriceService = {
  // Lấy danh sách giá tours
  getTourPrices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
  }): Promise<TourPricesResponse> => {
    try {
      const response = await providerTourPriceApi.getTourPrices(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching tour prices:', error);
      throw error;
    }
  },

  // Lấy chi tiết một giá tour
  getTourPrice: async (id: number): Promise<TourPrice> => {
    try {
      const response = await providerTourPriceApi.getTourPrice(id);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tour price:', error);
      throw error;
    }
  },

  // Tạo giá tour mới
  createTourPrice: async (data: {
    tour_id: number;
    adult_price: number;
    kid_price: number;
    note: string;
  }): Promise<TourPrice> => {
    try {
      const response = await providerTourPriceApi.createTourPrice(data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating tour price:', error);
      throw error;
    }
  },

  // Cập nhật giá tour
  updateTourPrice: async (id: number, data: {
    adult_price?: number;
    kid_price?: number;
    note?: string;
  }): Promise<TourPrice> => {
    try {
      const response = await providerTourPriceApi.updateTourPrice(id, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating tour price:', error);
      throw error;
    }
  },

  // Xóa giá tour
  deleteTourPrice: async (id: number): Promise<void> => {
    try {
      await providerTourPriceApi.deleteTourPrice(id);
    } catch (error) {
      console.error('Error deleting tour price:', error);
      throw error;
    }
  }
};
