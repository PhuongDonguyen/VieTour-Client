import axiosInstance from '../axiosInstance';

export interface AdminTourCategory {
  id: number;
  name: string;
  description?: string;
  image_url: string;
  is_active: boolean;
  slug: string;
  tourCount: number;
  created_at?: string;
  updated_at?: string;
  active_tour_count?: number;
}

export interface AdminTourCategoriesResponse {
  success: boolean;
  data: AdminTourCategory[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const adminTourCategoryApi = {
  // Lấy tất cả danh mục tours trong hệ thống (Admin only)
  getAllTourCategories: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    sort_by?: 'name' | 'tour_count' | 'created_at';
    sort_order?: 'asc' | 'desc';
  }): Promise<{ data: AdminTourCategoriesResponse }> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.is_active !== undefined) searchParams.set('is_active', params.is_active.toString());
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);

    return axiosInstance.get(`/api/admin/tour-categories?${searchParams.toString()}`);
  },

  // Lấy tour category theo ID (Admin only)
  getTourCategory: (id: number): Promise<{ data: { success: boolean; data: AdminTourCategory } }> => {
    return axiosInstance.get(`/api/admin/tour-categories/${id}`);
  },

  // Tạo tour category mới (Admin only)
  createTourCategory: (categoryData: {
    name: string;
    description?: string;
    image_url: string;
    is_active?: boolean;
  }): Promise<{ data: { success: boolean; data: AdminTourCategory } }> => {
    return axiosInstance.post('/api/admin/tour-categories', categoryData);
  },

  // Cập nhật tour category (Admin only)
  updateTourCategory: (id: number, categoryData: {
    name?: string;
    description?: string;
    image_url?: string;
    is_active?: boolean;
  }): Promise<{ data: { success: boolean; data: AdminTourCategory } }> => {
    return axiosInstance.put(`/api/admin/tour-categories/${id}`, categoryData);
  },

  // Xóa tour category (Admin only)
  deleteTourCategory: (id: number): Promise<{ data: { success: boolean } }> => {
    return axiosInstance.delete(`/api/admin/tour-categories/${id}`);
  },

  // Cập nhật trạng thái category (Admin only)
  updateCategoryStatus: (id: number, is_active: boolean): Promise<{ data: { success: boolean; data: AdminTourCategory } }> => {
    return axiosInstance.patch(`/api/admin/tour-categories/${id}/status`, { is_active });
  },

  // Lấy thống kê tour categories
  getTourCategoryStats: (): Promise<{ data: { 
    success: boolean; 
    data: {
      total_categories: number;
      active_categories: number;
      inactive_categories: number;
      most_popular_category: string;
      least_popular_category: string;
    }
  } }> => {
    return axiosInstance.get('/api/admin/tour-categories/stats');
  }
};
