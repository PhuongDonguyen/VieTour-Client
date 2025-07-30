import axiosInstance from "../axiosInstance";

export interface AdminTourPriceOverride {
  id: number;
  override_date?: string;
  day_of_week?: number;
  start_date?: string;
  end_date?: string;
  adult_price: number;
  kid_price: number;
  note?: string;
  is_active: boolean;
  tour_price_id: number;
  override_type: "single_date" | "date_range" | "weekly";
  tour_price: {
    id: number;
    adult_price: number;
    kid_price: number;
    note?: string;
    tour: {
      id: number;
      title: string;
      poster_url: string;
      provider_id: number;
      tour_category: {
        id: number;
        name: string;
      };
    };
  };
}

export interface AdminTourPriceOverridesResponse {
  success: boolean;
  data: AdminTourPriceOverride[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const adminTourPriceOverrideApi = {
  // Lấy tất cả price overrides trong hệ thống (Admin only)
  getAllTourPriceOverrides: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    override_type?: "single_date" | "date_range" | "day_of_week";
    tour_id?: number;
    sort_by?: "override_date" | "adult_price" | "created_at";
    sort_order?: "asc" | "desc";
  }): Promise<{ data: AdminTourPriceOverridesResponse }> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.tour_id) searchParams.set("tour_id", params.tour_id.toString());
    if (params?.override_type)
      searchParams.set("override_type", params.override_type);
    if (params?.is_active !== undefined)
      searchParams.set("is_active", params.is_active.toString());
    if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params?.sort_order) searchParams.set("sort_order", params.sort_order);

    return axiosInstance.get(
      `/api/admin/tour-price-overrides?${searchParams.toString()}`
    );
  },

  // Lấy price override theo ID (Admin only)
  getTourPriceOverride: (
    id: number
  ): Promise<{ data: { success: boolean; data: AdminTourPriceOverride } }> => {
    return axiosInstance.get(`/api/admin/tour-price-overrides/${id}`);
  },

  // Lấy thống kê tour price overrides
  getTourPriceOverrideStats: (): Promise<{
    data: {
      success: boolean;
      data: {
        total_overrides: number;
        active_overrides: number;
        inactive_overrides: number;
        overrides_by_type: { [key: string]: number };
        current_active_overrides: number;
        upcoming_overrides: number;
      };
    };
  }> => {
    return axiosInstance.get("/api/admin/tour-price-overrides/stats");
  },
};
