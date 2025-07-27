import { adminTourPriceOverrideApi } from '../../apis/admin/adminTourPriceOverride.api';
import type { AdminTourPriceOverridesResponse, AdminTourPriceOverride } from '../../apis/admin/adminTourPriceOverride.api';

export const adminTourPriceOverrideService = {
  // Lấy tất cả tour price overrides
  getAllTourPriceOverrides: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    override_type?: 'single_date' | 'date_range' | 'day_of_week';
    tour_id?: number;
    sort_by?: 'override_date' | 'adult_price' | 'created_at';
    sort_order?: 'asc' | 'desc';
  }): Promise<AdminTourPriceOverridesResponse> => {
    try {
      const response = await adminTourPriceOverrideApi.getAllTourPriceOverrides(params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin tour price overrides:', error);
      throw error;
    }
  },

  // Lấy tour price override theo ID
  getTourPriceOverride: async (id: number): Promise<AdminTourPriceOverride> => {
    try {
      const response = await adminTourPriceOverrideApi.getTourPriceOverride(id);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch admin tour price override:', error);
      throw error;
    }
  },

  // Lấy thống kê tour price overrides
  getTourPriceOverrideStats: async () => {
    try {
      const response = await adminTourPriceOverrideApi.getTourPriceOverrideStats();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch tour price override stats:', error);
      throw error;
    }
  }
};
