import axiosInstance from '../axiosInstance';

export interface AdminTourPrice {
  id: number;
  adult_price: number;
  child_price: number;
  note: string;
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

export interface AdminTourPricesResponse {
  success: boolean;
  data: AdminTourPrice[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const adminTourPriceApi = {
  // Lấy tất cả giá tours trong hệ thống (Admin only)
  getAllTourPrices: (params?: {
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
  }): Promise<{ data: AdminTourPricesResponse }> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tour_id) searchParams.set('tour_id', params.tour_id.toString());
    if (params?.provider_id) searchParams.set('provider_id', params.provider_id.toString());
    if (params?.category_id) searchParams.set('category_id', params.category_id.toString());
    if (params?.min_price) searchParams.set('min_price', params.min_price.toString());
    if (params?.max_price) searchParams.set('max_price', params.max_price.toString());
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);

    return axiosInstance.get(`/api/admin/tour-prices?${searchParams.toString()}`);
  },

  // Lấy tour price theo ID (Admin only)
  getTourPrice: (id: number): Promise<{ data: { success: boolean; data: AdminTourPrice } }> => {
    return axiosInstance.get(`/api/admin/tour-prices/${id}`);
  },

  // Lấy thống kê tour prices
  getTourPriceStats: (): Promise<{ data: { 
    success: boolean; 
    data: {
      total_price_entries: number;
      average_adult_price: number;
      average_child_price: number;
      min_adult_price: number;
      max_adult_price: number;
      min_child_price: number;
      max_child_price: number;
    }
  } }> => {
    return axiosInstance.get('/api/admin/tour-prices/stats');
  }
};
