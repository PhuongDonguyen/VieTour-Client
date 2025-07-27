import { adminTourApi } from '../../apis/admin/adminTour.api';
import type { AdminToursResponse, AdminTour } from '../../apis/admin/adminTour.api';

export const adminTourService = {
  // Lấy tất cả tours
  getAllTours: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    provider_id?: number;
    is_active?: boolean;
    sort_by?: 'title' | 'created_at' | 'price' | 'booking_count' | 'view_count';
    sort_order?: 'asc' | 'desc';
  }): Promise<AdminToursResponse> => {
    try {
      const response = await adminTourApi.getAllTours(params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin tours:', error);
      throw error;
    }
  },

  // Lấy tour theo ID
  getTour: async (id: number): Promise<AdminTour> => {
    try {
      const response = await adminTourApi.getTour(id);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch admin tour:', error);
      throw error;
    }
  },

  // Lấy tour theo ID (alias cho getTour)
  getTourById: async (id: number): Promise<AdminTour> => {
    try {
      const response = await adminTourApi.getTour(id);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch admin tour:', error);
      throw error;
    }
  },

  // Lấy thống kê tours
  getTourStats: async () => {
    try {
      const response = await adminTourApi.getTourStats();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch tour stats:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái tour
  updateTourStatus: async (id: number, is_active: boolean): Promise<AdminTour> => {
    try {
      const response = await adminTourApi.updateTourStatus(id, is_active);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update tour status:', error);
      throw error;
    }
  },

  // Xóa tour
  deleteTour: async (id: number): Promise<void> => {
    try {
      await adminTourApi.deleteTour(id);
    } catch (error) {
      console.error('Failed to delete tour:', error);
      throw error;
    }
  }
};
