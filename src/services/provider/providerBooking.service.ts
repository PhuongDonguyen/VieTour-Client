import { getAllBookings } from "../../apis/booking.api";
import type { AdminBooking } from "../../apis/booking.api";

export interface ProviderBookingsResponse {
  success: boolean;
  data: AdminBooking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const providerBookingService = {
  getProviderBookings: async (
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      tour_id?: number;
      start_date?: string;
      end_date?: string;
    },
    user?: any
  ): Promise<ProviderBookingsResponse> => {
    // Sử dụng chung API với admin, tự động thêm provider_id từ user context
    const providerId = user?.id || null;

    const response = await getAllBookings({
      page: params?.page,
      limit: params?.limit,
      status: params?.status,
      tour_id: params?.tour_id,
      start_date: params?.start_date,
      end_date: params?.end_date,
      provider_id: providerId, // Tự động thêm provider_id từ user
    });

    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },
};
