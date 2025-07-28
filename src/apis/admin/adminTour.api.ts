import axiosInstance from "../axiosInstance";

export interface AdminTour {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  slug: string;
  is_active: boolean;
  price: number;
  duration: number;
  location: string;
  max_participants: number;
  view_count: number;
  booking_count: number;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  tour_category: {
    id: number;
    name: string;
  };
  provider: {
    id: number;
    business_name: string;
    email: string;
  };
}

export interface AdminToursResponse {
  success: boolean;
  data: AdminTour[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const adminTourApi = {
  // Lấy tất cả tours trong hệ thống (Admin only)
  getAllTours: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    provider_id?: number;
    is_active?: boolean;
    sort_by?: "title" | "created_at" | "price" | "booking_count" | "view_count";
    sort_order?: "asc" | "desc";
  }): Promise<{ data: AdminToursResponse }> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category_id)
      searchParams.set("category_id", params.category_id.toString());
    if (params?.provider_id)
      searchParams.set("provider_id", params.provider_id.toString());
    if (params?.is_active !== undefined)
      searchParams.set("is_active", params.is_active.toString());
    if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params?.sort_order) searchParams.set("sort_order", params.sort_order);

    return axiosInstance.get(`/api/admin/tours?${searchParams.toString()}`);
  },

  // Lấy tour theo ID (Admin only)
  getTour: (
    id: number
  ): Promise<{ data: { success: boolean; data: AdminTour } }> => {
    return axiosInstance.get(`/api/admin/tours/${id}`);
  },

  // Lấy thống kê tours
  getTourStats: (): Promise<{
    data: {
      success: boolean;
      data: {
        total_tours: number;
        active_tours: number;
        inactive_tours: number;
        total_bookings: number;
        total_revenue: number;
        average_rating: number;
      };
    };
  }> => {
    return axiosInstance.get("/api/admin/tours/stats");
  },

  // Cập nhật trạng thái tour (Admin only)
  updateTourStatus: (
    id: number,
    is_active: boolean
  ): Promise<{ data: { success: boolean; data: AdminTour } }> => {
    return axiosInstance.patch(`/api/admin/tours/${id}/status`, { is_active });
  },

  // Xóa tour (Admin only)
  deleteTour: (id: number): Promise<{ data: { success: boolean } }> => {
    return axiosInstance.delete(`/api/admin/tours/${id}`);
  },
};
