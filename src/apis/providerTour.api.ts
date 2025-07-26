import axiosInstance from './axiosInstance';

export interface TourCategory {
  id: number;
  name: string;
}

export interface ProviderTour {
  id: number;
  title: string;
  poster_url: string;
  provider_id: number;
  capacity: number;
  transportation: string;
  accommodation: string;
  destination_intro: string;
  tour_info: string;
  view_count: string;
  slug: string;
  tour_category_id: number;
  is_active: boolean;
  total_star: number;
  review_count: number;
  live_commentary: string;
  duration: string;
  booked_count: number;
  tour_category: TourCategory;
}

export interface ProviderToursResponse {
  success: boolean;
  data: ProviderTour[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const providerTourApi = {
  // Lấy danh sách tours của provider
  getProviderTours: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<ProviderToursResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);

    return axiosInstance.get(`/api/provider/tours?${searchParams.toString()}`);
  },

  // Tạo tour mới
  createTour: (tourData: Partial<ProviderTour>) => {
    return axiosInstance.post('/api/provider/tours', tourData);
  },

  // Cập nhật tour
  updateTour: (id: number, tourData: Partial<ProviderTour>) => {
    return axiosInstance.put(`/api/provider/tours/${id}`, tourData);
  },

  // Xóa tour
  deleteTour: (id: number) => {
    return axiosInstance.delete(`/api/provider/tours/${id}`);
  },

  // Lấy chi tiết tour
  getTourById: (id: number) => {
    return axiosInstance.get(`/api/provider/tours/${id}`);
  },

  // Thay đổi trạng thái tour
  toggleTourStatus: (id: number) => {
    return axiosInstance.patch(`/api/provider/tours/${id}/toggle-status`);
  }
};
