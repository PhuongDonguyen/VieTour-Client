import axiosInstance from "../axiosInstance";

export interface AdminTourImage {
  id: number;
  image_url: string;
  description: string;
  is_featured: boolean;
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

export interface AdminTourImagesResponse {
  success: boolean;
  data: AdminTourImage[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const adminTourImageApi = {
  // Lấy tất cả hình ảnh tours trong hệ thống (Admin only)
  getAllTourImages: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
    provider_id?: number;
    is_featured?: boolean;
    sort_by?: "created_at" | "description";
    sort_order?: "asc" | "desc";
  }): Promise<{ data: AdminTourImagesResponse }> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.tour_id) searchParams.set("tour_id", params.tour_id.toString());
    if (params?.provider_id)
      searchParams.set("provider_id", params.provider_id.toString());
    if (params?.is_featured !== undefined)
      searchParams.set("is_featured", params.is_featured.toString());
    if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params?.sort_order) searchParams.set("sort_order", params.sort_order);

    return axiosInstance.get(
      `/api/admin/tour-images?${searchParams.toString()}`
    );
  },

  // Lấy tour image theo ID (Admin only)
  getTourImage: (
    id: number
  ): Promise<{ data: { success: boolean; data: AdminTourImage } }> => {
    return axiosInstance.get(`/api/admin/tour-images/${id}`);
  },

  // Lấy thống kê tour images
  getTourImageStats: (): Promise<{
    data: {
      success: boolean;
      data: {
        total_images: number;
        featured_images: number;
        regular_images: number;
        images_by_tour: { [key: string]: number };
      };
    };
  }> => {
    return axiosInstance.get("/api/admin/tour-images/stats");
  },
};
