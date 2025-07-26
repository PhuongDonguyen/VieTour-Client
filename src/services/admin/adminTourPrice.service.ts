import { adminTourPriceApi } from '../../apis/admin/adminTourPrice.api';
import type { AdminTourPricesResponse, AdminTourPrice } from '../../apis/admin/adminTourPrice.api';

export const adminTourPriceService = {
  // Lấy tất cả tour prices
  getAllTourPrices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
    provider_id?: number;
    category_id?: number;
    min_price?: number;
    max_price?: number;
    sort_by?: 'adult_price' | 'child_price' | 'created_at';
    sort_order?: 'asc' | 'desc';
  }): Promise<AdminTourPricesResponse> => {
    try {
      const response = await adminTourPriceApi.getAllTourPrices(params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin tour prices:', error);
      throw error;
    }
  },

  // Lấy tour price theo ID
  getTourPrice: async (id: number): Promise<AdminTourPrice> => {
    try {
      const response = await adminTourPriceApi.getTourPrice(id);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch admin tour price:', error);
      throw error;
    }
  },

  // Lấy thống kê tour prices
  getTourPriceStats: async () => {
    try {
      const response = await adminTourPriceApi.getTourPriceStats();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch tour price stats:', error);
      throw error;
    }
  }
};
