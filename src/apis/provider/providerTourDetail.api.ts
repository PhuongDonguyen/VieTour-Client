import axiosInstance from '../axiosInstance';

export interface TourDetail {
  id: number;
  title: string;
  order: number;
  morning_description: string;
  noon_description: string;
  afternoon_description: string;
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

export interface TourDetailsResponse {
  success: boolean;
  data: TourDetail[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const providerTourDetailApi = {
  // Lấy danh sách tour details của provider
  getProviderTourDetails: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
  }): Promise<{ data: TourDetailsResponse }> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tour_id) searchParams.set('tour_id', params.tour_id.toString());

    return axiosInstance.get(`/api/provider/tour-details?${searchParams.toString()}`);
  },

  // Lấy chi tiết của một tour detail
  getTourDetail: (id: number): Promise<{ data: { success: boolean; data: TourDetail } }> => {
    return axiosInstance.get(`/api/provider/tour-details/${id}`);
  },

  // Cập nhật tour detail
  updateTourDetail: (id: number, data: Partial<TourDetail>): Promise<{ data: { success: boolean; data: TourDetail } }> => {
    return axiosInstance.put(`/api/provider/tour-details/${id}`, data);
  },

  // Xóa tour detail
  deleteTourDetail: (id: number): Promise<{ data: { success: boolean; message: string } }> => {
    return axiosInstance.delete(`/api/provider/tour-details/${id}`);
  },

  // Tạo tour detail mới
  createTourDetail: (data: Omit<TourDetail, 'id' | 'tour'>): Promise<{ data: { success: boolean; data: TourDetail } }> => {
    return axiosInstance.post('/api/provider/tour-details', data);
  },
};
