import { adminTourImageApi } from '../../apis/admin/adminTourImage.api';
import type { AdminTourImagesResponse, AdminTourImage } from '../../apis/admin/adminTourImage.api';

export const adminTourImageService = {
  // Lấy tất cả tour images
  getAllTourImages: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
    provider_id?: number;
    is_featured?: boolean;
    sort_by?: 'created_at' | 'description';
    sort_order?: 'asc' | 'desc';
  }): Promise<AdminTourImagesResponse> => {
    try {
      const response = await adminTourImageApi.getAllTourImages(params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin tour images:', error);
      throw error;
    }
  },

  // Lấy tour image theo ID
  getTourImage: async (id: number): Promise<AdminTourImage> => {
    try {
      const response = await adminTourImageApi.getTourImage(id);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch admin tour image:', error);
      throw error;
    }
  },

  // Lấy thống kê tour images
  getTourImageStats: async () => {
    try {
      const response = await adminTourImageApi.getTourImageStats();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch tour image stats:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái featured
  updateFeaturedStatus: async (id: number, is_featured: boolean): Promise<AdminTourImage> => {
    try {
      const response = await adminTourImageApi.updateFeaturedStatus(id, is_featured);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update featured status:', error);
      throw error;
    }
  }
};
