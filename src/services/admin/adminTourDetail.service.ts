import { adminTourDetailApi } from '../../apis/admin/adminTourDetail.api';
import type { AdminTourDetailsResponse, AdminTourDetail } from '../../apis/admin/adminTourDetail.api';

export const adminTourDetailService = {
  // Lấy tất cả tour details
  getAllTourDetails: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
    provider_id?: number;
    order?: number;
    sort_by?: 'order' | 'title' | 'created_at';
    sort_order?: 'asc' | 'desc';
  }): Promise<AdminTourDetailsResponse> => {
    try {
      const response = await adminTourDetailApi.getAllTourDetails(params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin tour details:', error);
      throw error;
    }
  },

  // Lấy tour detail theo ID
  getTourDetail: async (id: number): Promise<AdminTourDetail> => {
    try {
      const response = await adminTourDetailApi.getTourDetail(id);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch admin tour detail:', error);
      throw error;
    }
  },

  // Lấy thống kê tour details
  getTourDetailStats: async () => {
    try {
      const response = await adminTourDetailApi.getTourDetailStats();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch tour detail stats:', error);
      throw error;
    }
  }
};
