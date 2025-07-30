import { adminTourCategoryApi } from "../../apis/admin/adminTourCategory.api";
import type {
  AdminTourCategoriesResponse,
  AdminTourCategory,
} from "../../apis/admin/adminTourCategory.api";

export const adminTourCategoryService = {
  // Lấy tất cả tour categories
  getAllTourCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    sort_by?: "name" | "tour_count" | "created_at";
    sort_order?: "asc" | "desc";
  }): Promise<AdminTourCategoriesResponse> => {
    try {
      const response = await adminTourCategoryApi.getAllTourCategories(params);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch admin tour categories:", error);
      throw error;
    }
  },

  // Lấy tour category theo ID
  getTourCategory: async (id: number): Promise<AdminTourCategory> => {
    try {
      const response = await adminTourCategoryApi.getTourCategory(id);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch admin tour category:", error);
      throw error;
    }
  },

  // Tạo tour category mới
  createTourCategory: async (categoryData: {
    name: string;
    description?: string;
    image_url: string;
    is_active?: boolean;
  }): Promise<AdminTourCategory> => {
    try {
      const response = await adminTourCategoryApi.createTourCategory(
        categoryData
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create tour category:", error);
      throw error;
    }
  },

  // Tạo tour category mới với upload ảnh
  createTourCategoryWithImage: async (
    formData: FormData
  ): Promise<AdminTourCategory> => {
    try {
      const response = await adminTourCategoryApi.createTourCategoryWithImage(
        formData
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create tour category with image:", error);
      throw error;
    }
  },
  // Cập nhật tour category
  updateTourCategory: async (
    id: number,
    categoryData: {
      name?: string;
      description?: string;
      image_url?: string;
      is_active?: boolean;
    }
  ): Promise<AdminTourCategory> => {
    try {
      const response = await adminTourCategoryApi.updateTourCategory(
        id,
        categoryData
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to update tour category:", error);
      throw error;
    }
  },
  // Cập nhật tour category với upload ảnh
  updateTourCategoryWithImage: async (
    id: number,
    formData: FormData
  ): Promise<AdminTourCategory> => {
    try {
      const response = await adminTourCategoryApi.updateTourCategoryWithImage(
        id,
        formData
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to update tour category with image:", error);
      throw error;
    }
  },
  // Xóa tour category
  deleteTourCategory: async (id: number): Promise<void> => {
    try {
      await adminTourCategoryApi.deleteTourCategory(id);
    } catch (error) {
      console.error("Failed to delete tour category:", error);
      throw error;
    }
  },

  // Toggle active status (bật/tắt trạng thái is_active)
  toggleActive: async (id: number): Promise<AdminTourCategory> => {
    try {
      const response = await adminTourCategoryApi.toggleActive(id);
      return response.data.data;
    } catch (error) {
      console.error("Failed to toggle active status:", error);
      throw error;
    }
  },

  // Lấy thống kê tour categories
  getTourCategoryStats: async () => {
    try {
      const response = await adminTourCategoryApi.getTourCategoryStats();
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch tour category stats:", error);
      throw error;
    }
  },
};
