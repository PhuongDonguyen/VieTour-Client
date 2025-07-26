import axiosInstance from './axiosInstance';

export interface TourPrice {
  id: number;
  adult_price: number;
  kid_price: number;
  note: string;
  tour_id: number;
  tour: {
    id: number;
    title: string;
    poster_url: string;
    tour_category: {
      id: number;
      name: string;
    };
  };
}

export interface TourPricesResponse {
  success: boolean;
  data: TourPrice[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const providerTourPriceApi = {
  // Lấy danh sách giá tours của provider
  getTourPrices: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
  }): Promise<{ data: TourPricesResponse }> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tour_id) searchParams.set('tour_id', params.tour_id.toString());

    return axiosInstance.get(`/api/provider/tour-prices?${searchParams.toString()}`);
  },

  // Lấy chi tiết một giá tour
  getTourPrice: (id: number): Promise<{ data: { success: boolean; data: TourPrice } }> => {
    return axiosInstance.get(`/api/provider/tour-prices/${id}`);
  },

  // Tạo giá tour mới
  createTourPrice: (data: {
    tour_id: number;
    adult_price: number;
    kid_price: number;
    note: string;
  }): Promise<{ data: { success: boolean; data: TourPrice } }> => {
    return axiosInstance.post('/api/provider/tour-prices', data);
  },

  // Cập nhật giá tour
  updateTourPrice: (id: number, data: {
    adult_price?: number;
    kid_price?: number;
    note?: string;
  }): Promise<{ data: { success: boolean; data: TourPrice } }> => {
    return axiosInstance.put(`/api/provider/tour-prices/${id}`, data);
  },

  // Xóa giá tour
  deleteTourPrice: (id: number): Promise<{ data: { success: boolean; message: string } }> => {
    return axiosInstance.delete(`/api/provider/tour-prices/${id}`);
  }
};
