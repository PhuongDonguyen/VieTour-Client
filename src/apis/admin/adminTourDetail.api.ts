import axiosInstance from '../axiosInstance';

export interface AdminTourDetail {
  id: number;
  title: string;
  order: number;
  morning_description: string;
  noon_description: string;
  afternoon_description: string;
  created_at: string;
  updated_at: string;
  tour: {
    id: number;
    title: string;
    poster_url: string;
    tour_category: {
      id: number;
      name: string;
    };
    provider: {
      id: number;
      business_name: string;
    };
  };
}

export interface AdminTourDetailsResponse {
  success: boolean;
  data: AdminTourDetail[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const adminTourDetailApi = {
  // Lấy tất cả chi tiết tours trong hệ thống (Admin only)
  getAllTourDetails: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
    provider_id?: number;
    order?: number;
    sort_by?: 'order' | 'title' | 'created_at';
    sort_order?: 'asc' | 'desc';
  }): Promise<{ data: AdminTourDetailsResponse }> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tour_id) searchParams.set('tour_id', params.tour_id.toString());
    if (params?.provider_id) searchParams.set('provider_id', params.provider_id.toString());
    if (params?.order) searchParams.set('order', params.order.toString());
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);

    return axiosInstance.get(`/api/admin/tour-details?${searchParams.toString()}`);
  },

  // Lấy tour detail theo ID (Admin only)
  getTourDetail: (id: number): Promise<{ data: { success: boolean; data: AdminTourDetail } }> => {
    return axiosInstance.get(`/api/admin/tour-details/${id}`);
  },

  // Lấy thống kê tour details
  getTourDetailStats: (): Promise<{ data: { 
    success: boolean; 
    data: {
      total_details: number;
      details_by_day: { [key: string]: number };
      tours_with_details: number;
      tours_without_details: number;
      average_details_per_tour: number;
    }
  } }> => {
    return axiosInstance.get('/api/admin/tour-details/stats');
  }
};
